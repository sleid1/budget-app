"use client";

import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { InvoiceType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
   CreateInvoiceSchema,
   CreateInvoiceSchemaType,
} from "@/schemas/invoice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import CategoryPicker from "./CategoryPicker";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2, Pencil } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { hr } from "date-fns/locale";
import { useState, useEffect, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInvoice } from "@/actions/invoiceActions";
import { toast } from "sonner";

interface Props {
   type: InvoiceType;
}

const CreateInvoiceForm = ({ type }: Props) => {
   const [isVatEditable, setIsVatEditable] = useState(false);

   const form = useForm<CreateInvoiceSchemaType>({
      resolver: zodResolver(CreateInvoiceSchema),
      defaultValues: {
         date: new Date(),
         vatRate: 25,
         netAmount: 0,
         grossAmount: 0,
         vatAmount: 0,
         status: "NEPLACENO",
         type,
      },
   });

   const { watch, setValue, formState } = form;
   const { errors } = formState;

   // Watch fields
   const status = watch("status");
   const netAmount = parseFloat(watch("netAmount"));
   const vatRate = parseFloat(watch("vatRate"));
   const vatAmount = parseFloat(watch("vatAmount"));

   useEffect(() => {
      console.log(status);
      if (status === "NEPLACENO") {
         setValue("datePaid", undefined);
      }

      // Early return for invalid netAmount
      if (isNaN(netAmount)) {
         setValue("vatAmount", 0);
         setValue("grossAmount", 0);
         return;
      }

      if (isVatEditable) {
         // When VAT is editable, calculate grossAmount as netAmount + vatAmount
         const grossAmount = parseFloat((netAmount + vatAmount).toFixed(2));
         setValue("grossAmount", grossAmount);
      } else {
         // When VAT is not editable, calculate vatAmount and grossAmount
         const calculatedVat =
            vatRate > 0
               ? parseFloat(((netAmount * vatRate) / 100).toFixed(2))
               : 0;
         const grossAmount = parseFloat((netAmount + calculatedVat).toFixed(2));

         console.log(calculatedVat);
         setValue("vatAmount", calculatedVat);
         setValue("grossAmount", grossAmount);
      }
   }, [status, netAmount, vatRate, vatAmount, isVatEditable, setValue]);

   const handleCategoryChange = useCallback(
      (value: string) => {
         form.setValue("category", value);
         form.setValue("categoryId", value);
      },
      [form]
   );

   const queryClient = useQueryClient();

   const { mutate, isPending } = useMutation({
      mutationFn: createInvoice,
      onSuccess: () => {
         toast.success("Račun je uspješno kreiran", {
            id: "create-invoice",
         });

         form.reset({
            type,
            invoiceNumber,
            category,
            date,
            status,
            datePaid,
            netAmount,
            vatRate,
         });

         //NAKON ŠTO SMO KREIRALI RAČUN, TREBAMO REVALIDIRATI STRANICU PREGLEDA ŠTO ĆE REFETCHATI PODATKE

         queryClient.invalidateQueries({
            queryKey: ["overview"],
         });
      },
      onError: (error) => {
         console.error("Mutation failed:", error);
         toast.error("Greška pri kreiranju računa");
      },
   });

   const onSubmit = useCallback(
      (values: CreateInvoiceSchemaType) => {
         console.log("submitting");
         toast.loading("Unosimo novi račun...", {
            id: "create-invoice",
         });

         mutate({
            ...values,
         });
      },
      [mutate]
   );

   console.log("Form errors:", formState.errors);

   return (
      <Card>
         <CardHeader>
            <div className="flex items-center justify-between">
               <CardTitle className="text-3xl font-bold">
                  Kreiraj
                  <span
                     className={cn(
                        "mx-2 tracking-widest font-bold",
                        type === "IZLAZNI_RACUN"
                           ? "text-emerald-500"
                           : "text-red-500"
                     )}
                  >
                     {type === "IZLAZNI_RACUN" ? "IZLAZNI" : "ULAZNI"}
                  </span>
                  račun
               </CardTitle>
            </div>
         </CardHeader>
         <CardContent>
            <Form {...form}>
               <form
                  className="space-y-10"
                  onSubmit={form.handleSubmit(onSubmit)}
               >
                  <div className="grid md:grid-cols-4 gap-4">
                     <FormField
                        control={form.control}
                        name="invoiceNumber"
                        render={({ field }) => (
                           <FormItem className="md:col-span-2">
                              <FormLabel>Broj računa</FormLabel>
                              <FormControl>
                                 <div className="flex">
                                    <span className="px-3 border border-r-0 rounded-l-md bg-muted flex items-center">
                                       #
                                    </span>
                                    <Input
                                       className="rounded-l-none"
                                       {...field}
                                       value={field.value?.toString() || ""}
                                    />
                                 </div>
                              </FormControl>
                           </FormItem>
                        )}
                     />
                     <div className="flex items-center justify-between gap-2">
                        <FormField
                           control={form.control}
                           name="category"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>Kategorija</FormLabel>
                                 <FormControl>
                                    <CategoryPicker
                                       type={type}
                                       onChange={handleCategoryChange}
                                    />
                                 </FormControl>
                              </FormItem>
                           )}
                        />
                     </div>
                  </div>
                  <Separator />
                  <p>Podaci o računu</p>
                  <div className="grid md:grid-cols-3 gap-4">
                     <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => {
                           const [isOpen, setIsOpen] = useState(false);
                           return (
                              <FormItem>
                                 <FormLabel>Datum izdavanja</FormLabel>
                                 <Popover
                                    open={isOpen}
                                    onOpenChange={setIsOpen}
                                 >
                                    <PopoverTrigger asChild>
                                       <FormControl>
                                          <Button
                                             variant="outline"
                                             className={cn(
                                                "w-full font-normal flex justify-between items-center",
                                                !field.value &&
                                                   "text-muted-foreground"
                                             )}
                                          >
                                             {field.value ? (
                                                format(
                                                   field.value,
                                                   "d.M.yyyy. (EEEE)",
                                                   {
                                                      locale: hr,
                                                   }
                                                )
                                             ) : (
                                                <span>Odaberi datum</span>
                                             )}
                                             <CalendarIcon />
                                          </Button>
                                       </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                       <Calendar
                                          mode="single"
                                          selected={field.value}
                                          onSelect={(date) => {
                                             field.onChange(date);
                                             setIsOpen((prev) => !prev);
                                          }}
                                          initialFocus
                                       />
                                    </PopoverContent>
                                 </Popover>
                              </FormItem>
                           );
                        }}
                     />
                     <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Status računa</FormLabel>
                              <FormControl>
                                 <Select
                                    value={field.value}
                                    onValueChange={(value) =>
                                       field.onChange(value)
                                    }
                                 >
                                    <SelectTrigger>
                                       <SelectValue placeholder="" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="NEPLACENO">
                                          Neplaćeno
                                       </SelectItem>
                                       <SelectItem value="PLACENO">
                                          Plaćeno
                                       </SelectItem>
                                       <SelectItem value="KASNJENJE">
                                          Kašnjenje
                                       </SelectItem>
                                       <SelectItem value="STORNIRANO">
                                          Stornirano
                                       </SelectItem>
                                    </SelectContent>
                                 </Select>
                              </FormControl>
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="datePaid"
                        render={({ field }) => {
                           const [isOpen, setIsOpen] = useState(false);

                           return (
                              <FormItem>
                                 <FormLabel>Datum uplate</FormLabel>
                                 <Popover
                                    open={isOpen}
                                    onOpenChange={setIsOpen}
                                 >
                                    <PopoverTrigger asChild>
                                       <FormControl>
                                          <Button
                                             variant="outline"
                                             className={cn(
                                                "w-full font-normal flex justify-between items-center",
                                                "disabled:cursor-not-allowed",
                                                !field.value &&
                                                   "text-muted-foreground"
                                             )}
                                             disabled={status !== "PLACENO"}
                                          >
                                             {field.value ? (
                                                format(
                                                   field.value,
                                                   "d.M.yyyy. (EEEE)",
                                                   {
                                                      locale: hr,
                                                   }
                                                )
                                             ) : (
                                                <span>Odaberi datum</span>
                                             )}
                                             <CalendarIcon />
                                          </Button>
                                       </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                       <Calendar
                                          mode="single"
                                          selected={field.value}
                                          onSelect={(date) => {
                                             field.onChange(date);
                                             setIsOpen((prev) => !prev);
                                          }}
                                          initialFocus
                                       />
                                    </PopoverContent>
                                 </Popover>
                              </FormItem>
                           );
                        }}
                     />
                  </div>

                  <Separator />
                  <p>Iznos</p>
                  <div className="grid md:grid-cols-4 gap-4">
                     <FormField
                        control={form.control}
                        name="netAmount"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Neto iznos</FormLabel>
                              <FormControl>
                                 <Input
                                    type="text"
                                    {...field}
                                    value={field.value === 0 ? "" : field.value}
                                 />
                              </FormControl>
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="vatRate"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Stopa poreza</FormLabel>
                              <FormControl>
                                 <Select
                                    value={field.value?.toString()}
                                    onValueChange={(value) =>
                                       field.onChange(Number(value))
                                    }
                                 >
                                    <SelectTrigger>
                                       <SelectValue placeholder="" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="0">0 %</SelectItem>
                                       <SelectItem value="5">5 %</SelectItem>
                                       <SelectItem value="13">13 %</SelectItem>
                                       <SelectItem value="25">25 %</SelectItem>
                                    </SelectContent>
                                 </Select>
                              </FormControl>
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="vatAmount"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Iznos poreza</FormLabel>
                              <FormControl>
                                 <div className="flex items-center relative">
                                    <Input
                                       type="text"
                                       {...field}
                                       disabled={!isVatEditable}
                                       className={cn(
                                          "flex-1 pr-12",
                                          !isVatEditable &&
                                             "bg-gray-200 cursor-not-allowed",
                                          "transition-colors"
                                       )}
                                    />
                                    <div
                                       className="absolute right-2 flex items-center justify-center bg-blue-100 rounded-full w-8 h-8 cursor-pointer"
                                       onClick={() =>
                                          setIsVatEditable((prev) => !prev)
                                       }
                                    >
                                       <Pencil size={16} />
                                    </div>
                                 </div>
                              </FormControl>
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="grossAmount"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Ukupno</FormLabel>
                              <FormControl>
                                 <Input type="text" {...field} disabled />
                              </FormControl>
                           </FormItem>
                        )}
                     />
                  </div>

                  <FormMessage />

                  {/* <Button
                     type="button"
                     onClick={() => {
                        const values = form.getValues();
                        console.log("Form Values:", values);
                     }}
                     className="!disabled:cursor-not-allowed"
                  >
                     Console log form values
                  </Button> */}
               </form>
            </Form>

            <div className="flex gap-2">
               <Button
                  type="button"
                  variant="secondary"
                  onClick={() => form.reset()}
               >
                  Otkaži
               </Button>
               <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isPending}
                  type="submit"
               >
                  {!isPending ? (
                     "Kreiraj račun"
                  ) : (
                     <Loader2 className="animate-spin" />
                  )}
               </Button>
            </div>
         </CardContent>
      </Card>
   );
};

export default CreateInvoiceForm;
