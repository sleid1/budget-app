"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DEFAULT_LOGOUT_REDIRECT } from "@/routes";
import {
   CreateCategorySchema,
   CreateCategorySchemaType,
} from "@/schemas/categories";
import { redirect } from "next/navigation";

export async function createCategory(form: CreateCategorySchemaType) {
   const parsedBody = CreateCategorySchema.safeParse(form);

   if (!parsedBody.success) {
      throw new Error("Došlo je do pogreške. Molimo pokušajte ponovno");
   }

   const user = await auth();

   if (!user) {
      redirect(DEFAULT_LOGOUT_REDIRECT);
   }

   const { name, icon, type, description } = parsedBody.data;

   const existingCategory = await prisma.category.findUnique({
      where: {
         name_type: {
            name,
            type,
         },
      },
   });

   if (existingCategory) {
      throw new Error("Kategorija s istim imenom i vrstom računa već postoji.");
   }

   return await prisma.category.create({
      data: {
         name,
         icon,
         type,
         description,
         userId: user?.user?.id,
         userOriginal: `${user?.user?.name} ${user?.user?.lastName}`,
      },
   });
}
