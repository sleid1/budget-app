import { z } from "zod";

export const CreateInvoiceSchema = z.object({
   id: z.string().uuid("ID mora biti valjani UUID"),
   invoiceNumber: z.string().min(1, "Broj računa je obavezan"),
   netAmount: z.coerce
      .number()
      .positive("Neto iznos mora biti pozitivan broj")
      .multipleOf(0.01),
   vatAmount: z.coerce
      .number()
      .positive("PDV mora biti nula ili pozitivan broj")
      .multipleOf(0.01),
   vatRate: z
      .number()
      .min(0, "Stopa PDV-a mora biti najmanje 0%")
      .max(25, "Stopa PDV-a ne smije prelaziti 25%"),

   grossAmount: z.coerce
      .number()
      .positive("Bruto iznos mora biti pozitivan broj")
      .multipleOf(0.01),

   type: z.enum(["ULAZNI_RACUN", "IZLAZNI_RACUN"], {
      required_error: "Vrsta računa je obavezna",
   }),
   description: z.string().optional(),
   date: z.coerce.date({
      required_error: "Datum je obavezan",
      invalid_type_error: "Datum mora biti valjani datum",
   }),
   datePaid: z.coerce.date().optional(),
   status: z.enum(["NEPLACENO", "PLACENO", "KASNJENJE", "STORNIRANO"], {
      required_error: "Status računa je obavezan",
   }),
   category: z.string().min(1, "Kategorija je obavezna"),
   categoryIcon: z.string().optional(),
   categoryId: z
      .number()
      .int()
      .positive("ID kategorije mora biti pozitivan cijeli broj"),
   // departmentId: z.string().uuid("ID odjela mora biti valjani UUID"),
   // userId: z.string().uuid("ID korisnika mora biti valjani UUID"),
});

export type CreateInvoiceSchemaType = z.infer<typeof CreateInvoiceSchema>;
