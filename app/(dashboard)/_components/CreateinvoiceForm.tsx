"use client";
import { createInvoice } from "@/actions/invoiceActions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import {
   CreateInvoiceSchema,
   CreateInvoiceSchemaType,
} from "@/schemas/invoice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Department } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { hr } from "date-fns/locale";
import { CalendarIcon, Loader2, Lock, LockOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CategoryPicker from "./CategoryPicker";
import DepartmentPicker from "./DepartmentPicker";

interface Props {
   type: InvoiceType;
}

const CreateInvoiceForm = ({ type }: Props) => {
   const [isVatEditable, setIsVatEditable] = useState(false);

   //STATE FOR CONTROLING CALENDAR VISIBILITIES
   const [dateIssuedPopoverOpen, setDateIssuedPopoverOpen] = useState(false);
   const [datePaidPopoverOpen, setDatePaidPopoverOpen] = useState(false);

   const router = useRouter();

   const form = useForm<CreateInvoiceSchemaType>({
      resolver: zodResolver(CreateInvoiceSchema),
      defaultValues: {
         invoiceNumber: "",
         categoryId: undefined,
         departmentId: undefined,
         vatRate: 25,
         netAmount: 0,
         grossAmount: 0,
         vatAmount: 0,
         dateIssued: undefined,
         datePaid: undefined,
         status: "NEPLACENO",
         type,
      },
   });

   const {
      watch,
      setValue,
      formState: { errors },
   } = form;

   // Watch fields
   const status = watch("status");
   const netAmount = parseFloat(watch("netAmount"));
   const vatRate = parseFloat(watch("vatRate"));
   const vatAmount = parseFloat(watch("vatAmount"));

   useEffect(() => {
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

         setValue("vatAmount", calculatedVat);
         setValue("grossAmount", grossAmount);
      }
   }, [status, netAmount, vatRate, vatAmount, isVatEditable, setValue]);

   const handleCategoryChange = useCallback(
      (category: Category) => {
         form.setValue("categoryId", category.id);
      },
      [form]
   );

   const handleDepartmentChange = useCallback(
      (department: Department) => {
         form.setValue("departmentId", department.id);
      },
      [form]
   );

   const queryClient = useQueryClient();

   const { mutate, isPending } = useMutation({
      mutationFn: createInvoice,
      onSuccess: async (response) => {
         if (response.success) {
            toast.success(response.message || "Račun je uspješno kreiran", {
               id: "create-invoice",
            });

            // Refresh overview page data
            await queryClient.invalidateQueries({
               queryKey: ["overview"],
            });

            router.push(DEFAULT_LOGIN_REDIRECT);
         } else {
            toast.error(response.message || "Došlo je do pogreške", {
               id: "create-invoice",
            });
         }
      },
      onError: (error) => {
         console.error("Greška pri kreiranju računa", error);
         toast.error("Greška pri kreiranju računa");
      },
   });

   const onSubmit = useCallback(
      (values: CreateInvoiceSchemaType) => {
         toast.loading("Unosimo novi račun...", {
            id: "create-invoice",
         });

         mutate({
            ...values,
         });
      },
      [mutate]
   );

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
                              <FormMessage>
                                 {errors.invoiceNumber?.message}
                              </FormMessage>
                           </FormItem>
                        )}
                     />

                     <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                           <FormItem className="md:col-span-2">
                              <FormLabel>Kategorija</FormLabel>
                              <FormControl>
                                 <CategoryPicker
                                    type={type}
                                    onChange={handleCategoryChange}
                                 />
                              </FormControl>
                              <FormMessage>
                                 {errors.categoryId?.message}
                              </FormMessage>
                           </FormItem>
                        )}
                     />
                  </div>

                  <Separator />
                  <p>Odjel</p>

                  <div className="grid md:grid-cols-4 gap-4">
                     <FormField
                        control={form.control}
                        name="departmentId"
                        render={({ field }) => (
                           <FormItem className="md:col-span-2">
                              <FormLabel>Odjel</FormLabel>
                              <FormControl>
                                 <DepartmentPicker
                                    onChange={handleDepartmentChange}
                                 />
                              </FormControl>
                              <FormMessage>
                                 {errors.departmentId?.message}
                              </FormMessage>
                           </FormItem>
                        )}
                     />
                  </div>

                  <Separator />
                  <p>Podaci o računu</p>
                  <div className="grid md:grid-cols-3 gap-4">
                     <FormField
                        control={form.control}
                        name="dateIssued"
                        render={({ field }) => {
                           return (
                              <FormItem>
                                 <FormLabel>Datum izdavanja</FormLabel>
                                 <Popover
                                    open={dateIssuedPopoverOpen}
                                    onOpenChange={setDateIssuedPopoverOpen}
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
                                          onSelect={(value) => {
                                             if (!value) return;
                                             field.onChange(value);
                                             setDateIssuedPopoverOpen(false);
                                          }}
                                          initialFocus
                                          locale={hr}
                                       />
                                    </PopoverContent>
                                 </Popover>
                                 <FormMessage>
                                    {errors.dateIssued?.message}
                                 </FormMessage>
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
                              <FormMessage>
                                 {errors.status?.message}
                              </FormMessage>
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="datePaid"
                        render={({ field }) => {
                           return (
                              <FormItem>
                                 <FormLabel>Datum uplate</FormLabel>
                                 <Popover
                                    open={datePaidPopoverOpen}
                                    onOpenChange={setDatePaidPopoverOpen}
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
                                          onSelect={(value) => {
                                             if (!value) return;
                                             field.onChange(value);
                                             setDatePaidPopoverOpen(false);
                                          }}
                                          initialFocus
                                          locale={hr}
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
                                    type="number"
                                    {...field}
                                    value={field.value === 0 ? "" : field.value}
                                 />
                              </FormControl>
                              <FormMessage>
                                 {errors.netAmount?.message}
                              </FormMessage>
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
                                       type="number"
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
                                       {isVatEditable ? (
                                          <LockOpen size={16} />
                                       ) : (
                                          <Lock size={16} />
                                       )}
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
                                 <Input type="number" {...field} disabled />
                              </FormControl>
                              <FormMessage>
                                 {errors.grossAmount?.message}
                              </FormMessage>
                           </FormItem>
                        )}
                     />
                  </div>
                  <Separator />
                  <p>Dodatne informacije</p>
                  <FormField
                     control={form.control}
                     name="description"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Opis računa</FormLabel>
                           <FormControl>
                              <Textarea
                                 placeholder="Unesite opis računa"
                                 {...field}
                                 value={field.value || ""}
                                 onChange={(e) =>
                                    form.setValue("description", e.target.value)
                                 }
                              />
                           </FormControl>
                           <FormMessage>
                              {errors.description?.message}
                           </FormMessage>
                        </FormItem>
                     )}
                  />

                  <div className="flex gap-2">
                     <Button asChild variant="secondary">
                        <Link href="/pregled">Otkaži</Link>
                     </Button>
                     <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                           form.reset();
                        }}
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
               </form>
            </Form>
         </CardContent>
      </Card>
   );
};

export default CreateInvoiceForm;
