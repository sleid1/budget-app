import prisma from "@/lib/prisma";

export const getPasswordResetTokenByToken = async (token: String) => {
   try {
      // Obrisati sve tokene koji su istekli
      await prisma.passwordResetToken.deleteMany({
         where: {
            expires: {
               lte: new Date(),
            },
         },
      });
      const passwordResetToken = await prisma.passwordResetToken.findUnique({
         where: {
            token,
         },
      });

      return passwordResetToken;
   } catch (error) {
      return null;
   }
};

export const getPasswordResetTokenByEmail = async (email: String) => {
   try {
      const passwordResetToken = await prisma.passwordResetToken.findFirst({
         where: {
            email,
         },
      });

      return passwordResetToken;
   } catch (error) {
      return null;
   }
};
