import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import prisma from "./lib/prisma";
import authConfig from "./auth.config";
import { getUserById } from "@/utils/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
   callbacks: {
      async session({ token, session }) {
         console.log({ sessionToken: token });
         if (token.sub && session.user) {
            session.user.id = token.sub;
         }

         if (token.role && session.user) {
            session.user.role = token.role;
         }

         if (token.firstName && session.user) {
            session.user.firstName = token.firstName;
         }

         if (token.imageUrl && session.user) {
            session.user.imageUrl = token.imageUrl;
         }

         return session;
      },
      async jwt({ token }) {
         if (!token.sub) return token;
         const existingUser = await getUserById(token.sub);

         if (!existingUser) return token;
         token.role = existingUser.role;
         token.firstName = existingUser.firstName;
         token.imageUrl = existingUser.imageUrl;
         return token;
      },
   },
   adapter: PrismaAdapter(prisma),
   session: { strategy: "jwt" },
   ...authConfig,
});
