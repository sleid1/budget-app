"use server";

import bcrypt from "bcrypt";
import { z } from "zod";
import { LoginSchema, RegisterSchema } from "@/schemas/authSchema";
import prisma from "@/lib/prisma";
import { getUserByEmail } from "@/utils/user";
import {
   DEFAULT_LOGIN_REDIRECT,
   DEFAULT_LOGOUT_REDIRECT,
} from "@/authRoutesSettings";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export const loginAction = async (formData: z.infer<typeof LoginSchema>) => {
   await new Promise((resolve) => setTimeout(resolve, 1000));

   const validatedFields = LoginSchema.safeParse(formData);

   if (!validatedFields.success) {
      return {
         error: "Molimo unesite sva polja ispravno !",
      };
   }

   const { email, password } = validatedFields.data;

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
   await new Promise((resolve) => setTimeout(resolve, 2000));

   const validatedFields = RegisterSchema.safeParse(formData);

   const { email, firstName, lastName, password } = validatedFields.data;

   const doesUserExist = await getUserByEmail(email);

   if (doesUserExist) {
      return {
         error: "Korisnik s ovim emailom već postoji",
      };
   }

   const hashedPassword = await bcrypt.hash(password, 10);

   await prisma.user.create({
      data: {
         email,
         firstName,
         lastName,
         password: hashedPassword,
      },
   });

   //TODO: SEND VERIFICATION TOKEN EMAIL
   return {
      success: "Korisnik je kreiran !",
   };
};

export const signOutAction = async () => {
   await signOut({
      redirectTo: DEFAULT_LOGOUT_REDIRECT,
   });
};
