import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DEFAULT_LOGOUT_REDIRECT } from "@/routes";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
   const user = await auth();

   if (!user) {
      redirect(DEFAULT_LOGOUT_REDIRECT);
   }

   const departments = await prisma.department.findMany({
      orderBy: {
         name: "asc",
      },
   });

   return Response.json(departments);
}
