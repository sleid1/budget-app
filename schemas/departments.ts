import { z } from "zod";

export const CreateDepartmentSchema = z.object({
   name: z
      .string()
      .min(3, {
         message: "Ime kategorije mora imati minimalno 3 slova",
      })
      .max(20, {
         message: "Ime kategorije može imati maksimalno 20 slova",
      }),
   description: z
      .string()
      .max(200, {
         message: "Opis može imati maksimalno 200 znakova",
      })
      .optional(),
});

export type CreateDepartmentSchemaType = z.infer<typeof CreateDepartmentSchema>;
