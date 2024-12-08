import type { UserRole } from "@prisma/client";
import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt";

import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
   interface Session {
      user: {
         id: string;
         role?: UserRole;
         firstName?: string;
         imageUrl?: string;
      } & DefaultSession["user"];
   }

   interface User {
      role?: UserRole;
      firstName?: string;
      imageUrl?: string;
   }
}

declare module "next-auth/jwt" {
   interface JWT {
      sub?: string;
      role?: UserRole;
      firstName?: string;
      imageUrl?: string | null;
   }
}
