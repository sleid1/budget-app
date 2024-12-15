"use server";

import bcrypt from "bcrypt";
import { z } from "zod";
import { LoginSchema, RegisterSchema } from "@/schemas/authSchema";
import prisma from "@/lib/prisma";
import { getUserByEmail } from "@/utils/user";
import { DEFAULT_LOGIN_REDIRECT, DEFAULT_LOGOUT_REDIRECT } from "@/routes";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const loginAction = async (formData: z.infer<typeof LoginSchema>) => {
   const validatedFields = LoginSchema.safeParse(formData);

   if (!validatedFields.success) {
      return {
         error: "Molimo unesite sva polja ispravno !",
      };
   }

   const { email, password } = validatedFields.data;

   const existingUser = await getUserByEmail(email);

   if (!existingUser || !existingUser.email) {
      return {
         error: "Korisnik s ovim podacima ne postoji. Molimo provjerite podatke.",
      };
   }

   if (!existingUser.emailVerified || !existingUser.password) {
      const verificationToken = await generateVerificationToken(
         existingUser.email
      );

      await sendVerificationEmail(
         verificationToken.email,
         verificationToken.token
      );

      return {
         success:
            "Niste potvrdili email adresu. Na Vašu je email adresu poslan email za verifikaciju računa",
      };
   }

   try {
      await signIn("credentials", {
         email,
         password,
         redirectTo: DEFAULT_LOGIN_REDIRECT,
      });
   } catch (error) {
      if (error instanceof AuthError) {
         switch (error.type) {
            case "CredentialsSignin":
               return { error: "Pogrešan email ili lozinka" };

            default:
               return { error: "Došlo je do pogreške" };
         }
      }

      throw error;
   }
};

export const registerAction = async (
   formData: z.infer<typeof RegisterSchema>
) => {
   const validatedFields = RegisterSchema.safeParse(formData);

   const { email, name, lastName, password } = validatedFields.data;

   const doesUserExist = await getUserByEmail(email);

   if (doesUserExist) {
      return {
         error: "Korisnik s ovim emailom već postoji",
      };
   }

   // const hashedPassword = await bcrypt.hash(password, 10);

   await prisma.user.create({
      data: {
         email,
         name,
         lastName,
         // password: hashedPassword,
      },
   });

   const verificationToken = await generateVerificationToken(email);

   await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
   );

   return {
      success: "Korisnik je uspješno kreiran ! Molimo potvrdite email adresu",
   };
};

export const signOutAction = async () => {
   await signOut({
      redirectTo: DEFAULT_LOGOUT_REDIRECT,
   });
};
