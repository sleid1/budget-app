"use client";

import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import {
   Form,
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InvoiceType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
   CreateInvoiceSchema,
   CreateInvoiceSchemaType,
} from "@/schemas/invoice";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import CategoryPicker from "./CategoryPicker";

interface Props {
   trigger: ReactNode;
   type: InvoiceType;
}

const CreateinvoiceDialog = ({ trigger, type }: Props) => {
   const form = useForm<CreateInvoiceSchemaType>({
      resolver: zodResolver(CreateInvoiceSchema),
      defaultValues: {
         type,
         date: new Date(),
         vat: 25,
         status: "NEPLACENO",
      },
   });

   return (
      <Dialog>
         <DialogTrigger asChild>{trigger}</DialogTrigger>
         <DialogContent className="max-w-6xl">
            <DialogHeader>
               <DialogTitle>
                  Kreiraj novi
                  <span
                     className={cn(
                        "m-1",
                        type === "IZLAZNI_RACUN"
                           ? "text-emerald-500"
                           : "text-red-500"
                     )}
                  >
                     {type === "IZLAZNI_RACUN"
                        ? "IZLAZNI račun"
                        : "ULAZNI račun"}
                  </span>
               </DialogTitle>
            </DialogHeader>
            <Form {...form}>
               <form className="space-y-4">
                  <FormField
                     control={form.control}
                     name="invoiceNumber"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Broj računa</FormLabel>
                           <FormControl>
                              <Input {...field}></Input>
                           </FormControl>
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="date"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Datum izdavanja</FormLabel>
                           <FormControl>
                              <Input type="date" {...field}></Input>
                           </FormControl>
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={form.control}
                     name="netAmount"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Neto iznos</FormLabel>
                           <FormControl>
                              <Input type="number" {...field}></Input>
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
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
};

export default CreateinvoiceDialog;
