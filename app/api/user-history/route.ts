import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DEFAULT_LOGOUT_REDIRECT } from "@/routes";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
   const user = await auth();

   if (!user) {
      redirect(DEFAULT_LOGOUT_REDIRECT);
   }

   const users = await getUserHistory();

   return Response.json(users);
}

export type getUserHistoryResponseType = Awaited<
   ReturnType<typeof getUserHistory>
>;

async function getUserHistory() {
   const users = await prisma.user.findMany({
      orderBy: {
         createdAt: "desc",
      },
      select: {
         name: true,
         lastName: true,
         email: true,
         emailVerified: true,
         role: true,
         createdAt: true,
         _count: {
            select: {
               invoices: true,
            },
         },
      },
   });

   return users;
}
