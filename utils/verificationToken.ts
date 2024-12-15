import prisma from "@/lib/prisma";

export const getVerificationTokenByToken = async (token: string) => {
   try {
      // Obrisati sve tokene koji su istekli
      await prisma.verificationToken.deleteMany({
         where: {
            expires: {
               lte: new Date(),
            },
         },
      });

      const verificationToken = await prisma.verificationToken.findUnique({
         where: {
            token,
         },
      });

      return verificationToken;
   } catch (error) {
      throw error;
   }
};

export const getVerificationTokenByEmail = async (email: string) => {
   try {
      const verificationToken = await prisma.verificationToken.findFirst({
         where: {
            email,
         },
      });

      return verificationToken;
   } catch (error) {
      throw error;
   }
};
