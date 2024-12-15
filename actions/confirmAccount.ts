"use server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { getUserByEmail } from "@/utils/user";
import { getVerificationTokenByToken } from "@/utils/verificationToken";
import { confirmAccountSchema } from "@/schemas/authSchema";

export const confirmAccount = async (previousState, formData) => {
   const token = formData.get("token");
   const password = formData.get("password");

   const validatedFields = confirmAccountSchema.safeParse({ token, password });

   if (!validatedFields.success) {
      return {
         error: "Molimo unesite lozinku",
      };
   }

   const existingToken = await getVerificationTokenByToken(token);

   if (!existingToken) {
      return {
         error: "Token ne postoji",
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
         error: "Email ne postoji",
      };
   }

   const hashedPassword = await bcrypt.hash(password, 10);

   await prisma.user.update({
      where: {
         id: existingUser.id,
      },

      data: {
         password: hashedPassword,
         emailVerified: new Date(),
         email: existingToken.email,
      },
   });

   return {
      success: "Račun je uspješno potvrđen !",
   };
};
