import * as z from "zod";

export const LoginSchema = z.object({
   email: z.string().email({
      message: "Ovo polje je obavezno",
   }),
   password: z.string().min(1, {
      message: "Lozinka mora sadržavati minimalno 6 znakova",
   }),
});

export const RegisterSchema = z.object({
   firstName: z.string().min(1, {
      message: "Ovo polje je obavezno",
   }),
   lastName: z.string().min(1, {
      message: "Ovo polje je obavezno",
   }),
   email: z.string().email({
      message: "Ovo polje je obavezno",
   }),
   password: z.string().min(6, {
      message: "Lozinka mora sadržavati minimalno 6 znakova",
   }),
   imageUrl: z.string().url().nullable().optional(),
});
