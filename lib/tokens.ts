import { getVerificationTokenByEmail } from "@/utils/verificationToken";
import { v4 as uuid } from "uuid";
import prisma from "@/lib/prisma";
import { getPasswordResetTokenByEmail } from "@/utils/passwordResetToken";

export const generateVerificationToken = async (email: string) => {
   const token = uuid();

   const expires = new Date(new Date().getTime() + 3600 * 1000); // GENERIRAJ TOKEN KOJI ISTIČE ZA 1H

   const existingToken = await getVerificationTokenByEmail(email);

   if (existingToken) {
      await prisma.verificationToken.delete({
         where: {
            id: existingToken.id,
         },
      });
   }

   const verificationToken = await prisma.verificationToken.create({
      data: {
         email,
         token,
         expires,
      },
   });

   return verificationToken;
};

export const generatePasswordResetToken = async (email: string) => {
   const token = uuid();

   const expires = new Date(new Date().getTime() + 3600 * 1000); // GENERIRAJ TOKEN KOJI ISTIČE ZA 1H

   const existingToken = await getPasswordResetTokenByEmail(email);

   if (existingToken) {
      await prisma.passwordResetToken.delete({
         where: {
            id: existingToken.id,
         },
      });
   }

   const passwordResetToken = await prisma.passwordResetToken.create({
      data: {
         email,
         token,
         expires,
      },
   });

   return passwordResetToken;
};
