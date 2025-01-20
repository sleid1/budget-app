import bcrypt from "bcryptjs";

import type { NextAuthConfig } from "next-auth";

import Credentials from "next-auth/providers/credentials";

import { LoginSchema } from "./schemas/authSchema";
import { getUserByEmail, getUserById } from "./utils/user";

export default {
   providers: [
      Credentials({
         async authorize(credentials) {
            const validatedFields = LoginSchema.safeParse(credentials);

            if (validatedFields.success) {
               const { email, password } = validatedFields.data;

               const user = await getUserByEmail(email);

               if (!user || !user.password) return null;

               const passwordsMatch = await bcrypt.compare(
                  password,
                  user.password
               );

               if (passwordsMatch) return user;
            }

            return null;
         },
      }),
   ],
   callbacks: {
      async signIn({ user }) {
         const existingUser = await getUserById(user.id);

         // KORISNIK KOJI NIJE POTVRDIO EMAIL SE NE MOŽE LOGIRATI
         if (!existingUser?.emailVerified) return false;

         //TODO: ADD 2 FA CHECK

         return true;
      },

      async session({ token, session }) {
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
} satisfies NextAuthConfig;
