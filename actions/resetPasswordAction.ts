"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/tokens";
import { NewPasswordSchema, ResetSchema } from "@/schemas/authSchema";
import { getPasswordResetTokenByToken } from "@/utils/passwordResetToken";
import { getUserByEmail } from "@/utils/user";
import prisma from "@/lib/prisma";

export const resetPasswordAction = async (
   values: z.infer<typeof ResetSchema>
) => {
   const validatedFields = ResetSchema.safeParse(values);

   if (!validatedFields.success) {
      return { error: "Pogrešan email" };
   }

   const { email } = validatedFields.data;

   const existingUser = await getUserByEmail(email);

   if (!existingUser) {
      return {
         error: "Korisnik s ovim emailom nije pronađen",
      };
   }

   const passwordResetToken = await generatePasswordResetToken(email);
   await sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token
   );

   return {
      success: "Poslan je email za resetiranje lozinke",
   };
};

export const setNewPasswordAction = async (
   values: z.infer<typeof NewPasswordSchema>,
   token?: String | null
) => {
   if (!token) {
      return {
         error: "Token nedostaje !",
      };
   }

   const validatedFields = NewPasswordSchema.safeParse(values);

   if (!validatedFields.success) {
      return {
         error: "Molimo unesite lozinku",
      };
   }

   const { password } = validatedFields.data;

   const existingToken = await getPasswordResetTokenByToken(token);

   if (!existingToken) {
      return {
         error: "Token nije važeći",
      };
   }

   const hasExpired = new Date(existingToken.expires) < new Date();

   if (hasExpired) {
      return {
         error: "Token je istekao !",
      };
   }

   const existingUser = await getUserByEmail(existingToken.email);

   if (!existingUser) {
      return {
         error: "Korisnik s ovim emailom ne postoji !",
      };
   }

   const hashedPassword = await bcrypt.hash(password, 10);

   await prisma.user.update({
      where: {
         id: existingUser.id,
      },
      data: {
         password: hashedPassword,
      },
   });

   await prisma.passwordResetToken.delete({
      where: { id: existingToken.id },
   });

   return {
      success: "Nova je lozinka uspješno postavljena !",
   };
};
