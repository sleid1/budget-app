"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DEFAULT_LOGOUT_REDIRECT } from "@/routes";

import {
   CreateDepartmentSchema,
   CreateDepartmentSchemaType,
} from "@/schemas/departments";
import { redirect } from "next/navigation";

export async function CreateDepartment(form: CreateDepartmentSchemaType) {
   const parsedBody = CreateDepartmentSchema.safeParse(form);

   if (!parsedBody.success) {
      throw new Error("Neispravan request");
   }

   const user = await auth();

   if (!user) {
      redirect(DEFAULT_LOGOUT_REDIRECT);
   }

   const { name, description } = parsedBody.data;

   return await prisma.department.create({
      data: {
         name,
         description,
         userId: user?.user?.id,
         userOriginal: `${user?.user?.name} ${user?.user?.lastName}`,
      },
   });
}
