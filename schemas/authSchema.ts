import * as z from "zod";

export const NewPasswordSchema = z.object({
   password: z.string().min(6, {
      message: "Lozinka mora sadržavati minimalno 6 znakova",
   }),
});

export const ResetSchema = z.object({
   email: z.string().email({
      message: "Ovo polje je obavezno",
   }),
});

export const LoginSchema = z.object({
   email: z.string().email({
      message: "Ovo polje je obavezno",
   }),
   password: z.string().min(6, {
      message: "Lozinka mora sadržavati minimalno 6 znakova",
   }),
});

export const RegisterSchema = z.object({
   name: z.string().min(1, {
      message: "Ovo polje je obavezno",
   }),
   lastName: z.string().min(1, {
      message: "Ovo polje je obavezno",
   }),
   email: z.string().email({
      message: "Ovo polje je obavezno",
   }),
   password: z
      .string()
      .min(6, {
         message: "Lozinka mora sadržavati minimalno 6 znakova",
      })
      .nullable()
      .optional(),
   image: z.string().url().nullable().optional(),
});

export const confirmAccountSchema = z.object({
   password: z.string().min(6, {
      message: "Lozinka mora sadržavati minimalno 6 znakova",
   }),
   token: z.string(),
});
