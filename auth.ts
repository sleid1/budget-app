import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import prisma from "./lib/prisma";
import authConfig from "./auth.config";
import { getUserById } from "@/utils/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
   callbacks: {
      async signIn({ user }) {
         const existingUser = await getUserById(user.id);

         // KORISNIK KOJI NIJE POTVRDIO EMAIL SE NE MOŽE LOGIRATI
         if (!existingUser?.emailVerified) return false;

         //TODO: ADD 2 FA CHECK

         return true;
      },

      async session({ token, session }) {
         console.log({ sessionToken: token });
         if (token.sub && session.user) {
            session.user.id = token.sub;
         }

         if (token.role && session.user) {
            session.user.role = token.role;
         }

         if (token.lastName && session.user) {
            session.user.lastName = token.lastName;
         }

         return session;
      },
      async jwt({ token }) {
         if (!token.sub) return token;
         const existingUser = await getUserById(token.sub);

         if (!existingUser) return token;
         token.role = existingUser.role;
         token.lastName = existingUser.lastName;

         return token;
      },
   },
   adapter: PrismaAdapter(prisma),
   session: { strategy: "jwt" },
   ...authConfig,
});
