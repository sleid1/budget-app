import { z } from "zod";

export const CreateCategorySchema = z.object({
   name: z
      .string()
      .min(3, {
         message: "Ime kategorije mora imati minimalno 3 slova",
      })
      .max(20, {
         message: "Ime kategorije može imati maksimalno 20 slova",
      }),
   icon: z.string().max(20),
   type: z.enum(["IZLAZNI_RACUN", "ULAZNI_RACUN"]),
   description: z
      .string()
      .max(200, {
         message: "Opis može imati maksimalno 200 znakova",
      })
      .optional(),
});

export type CreateCategorySchemaType = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = z.object({
   id: z
      .number({
         required_error: "ID kategorije je obavezan",
         invalid_type_error: "ID kategorije mora biti broj",
      })
      .positive("ID kategorije mora biti pozitivan"),
   name: z
      .string()
      .min(3, {
         message: "Ime kategorije mora imati minimalno 3 slova",
      })
      .max(20, {
         message: "Ime kategorije može imati maksimalno 20 slova",
      }),
   icon: z.string().max(20),
   type: z.enum(["IZLAZNI_RACUN", "ULAZNI_RACUN"]),
   description: z
      .string()
      .max(200, {
         message: "Opis može imati maksimalno 200 znakova",
      })
      .optional(),
});

export type UpdateCategorySchemaType = z.infer<typeof UpdateCategorySchema>;

export const DeleteCategorySchema = z.object({
   name: z
      .string()
      .min(3, {
         message: "Ime kategorije mora imati minimalno 3 slova",
      })
      .max(20, {
         message: "Ime kategorije može imati maksimalno 20 slova",
      }),
   type: z.enum(["IZLAZNI_RACUN", "ULAZNI_RACUN"]),
   oldCategoryId: z
      .number({
         required_error: "Stari ID kategorije je obavezan",
         invalid_type_error: "Stari ID kategorije mora biti broj",
      })
      .positive("Stari ID kategorije mora biti pozitivan"),
   newCategoryId: z
      .number({
         invalid_type_error: "Novi ID kategorije mora biti broj",
      })
      .positive("Novi ID kategorije mora biti pozitivan")
      .nullable()
      .optional(),
});

export type DeleteCategorySchemaType = z.infer<typeof DeleteCategorySchema>;
