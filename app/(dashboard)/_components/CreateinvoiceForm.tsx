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
import { CalendarIcon, Pencil } from "lucide-react"; // Added Pencil for edit icon
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { hr } from "date-fns/locale";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";

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
         status: "NEPLACENO",
      },
   });

   const { watch, setValue } = form;

   // Watch fields
   const status = watch("status");
   const netAmount = watch("netAmount") || "0"; // Default to "0"
   const vatRate = watch("vatRate") || 25; // Default to 25
   const vatAmount = watch("vatAmount") || 0; // Default to 0

   // Recalculate VAT and Gross Amount Dynamically
   useEffect(() => {
      const parsedNetAmount = parseFloat(netAmount?.toString()) || 0;
      const parsedVatRate = parseFloat(vatRate?.toString()) || 0;
      const parsedVat = parseFloat(vatAmount?.toString()) || 0;

      if (isVatEditable) {
         const grossAmount = parseFloat(
            (parsedNetAmount + parsedVat).toFixed(2)
         );
         setValue("grossAmount", grossAmount);
      } else if (!isNaN(parsedNetAmount) && !isNaN(parsedVatRate)) {
         const calculatedVat = parseFloat(
            ((parsedNetAmount * parsedVatRate) / 100).toFixed(2)
         );
         const grossAmount = parseFloat(
            (parsedNetAmount + calculatedVat).toFixed(2)
         );

         setValue("vatAmount", calculatedVat);
         setValue("grossAmount", grossAmount);
      } else {
         setValue("vatAmount", 0); // Default to 0
         setValue("grossAmount", 0); // Default to 0
      }
   }, [netAmount, vatRate, vatAmount, isVatEditable, setValue]);

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
               <form className="space-y-8">
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
                                    <CategoryPicker type={type} />
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
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Datum izdavanja</FormLabel>
                              <Popover>
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
                                             format(field.value, "PPPP", {
                                                locale: hr,
                                             })
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
                                       onSelect={field.onChange}
                                       initialFocus
                                    />
                                 </PopoverContent>
                              </Popover>
                           </FormItem>
                        )}
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
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Datum uplate</FormLabel>
                              <Popover>
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
                                             format(field.value, "PPPP", {
                                                locale: hr,
                                             })
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
                                       onSelect={field.onChange}
                                       initialFocus
                                    />
                                 </PopoverContent>
                              </Popover>
                           </FormItem>
                        )}
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
                                    value={field.value?.toString() || ""}
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
                                    value={field.value?.toString() || ""}
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
                                       value={field.value?.toString() || ""}
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
                                 <Input
                                    type="text"
                                    {...field}
                                    disabled
                                    value={field.value?.toString() || ""}
                                 />
                              </FormControl>
                           </FormItem>
                        )}
                     />
                  </div>

                  <Button
                     type="button"
                     onClick={() => {
                        const values = form.getValues();
                        console.log("Form Values:", values);
                     }}
                     className="!disabled:cursor-not-allowed"
                  >
                     Console log form values
                  </Button>
               </form>
            </Form>
         </CardContent>
      </Card>
   );
};

export default CreateInvoiceForm;
