"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DEFAULT_LOGOUT_REDIRECT } from "@/routes";
import {
   CreateCategorySchema,
   CreateCategorySchemaType,
   DeleteCategorySchema,
   DeleteCategorySchemaType,
} from "@/schemas/categories";
import { redirect } from "next/navigation";

export async function createCategory(form: CreateCategorySchemaType) {
   const parsedBody = CreateCategorySchema.safeParse(form);

   if (!parsedBody.success) {
      throw new Error("Neispravan request");
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

export async function DeleteCategory(form: DeleteCategorySchemaType) {
   const parsedBody = DeleteCategorySchema.safeParse(form);

   if (!parsedBody.success) {
      return {
         success: false,
         error: "Neispravan request",
      };
   }

   const user = await auth();

   if (!user) {
      redirect(DEFAULT_LOGOUT_REDIRECT);
   }

   try {
      // Attempt to delete the category in the database
      const deletedCategory = await prisma.category.delete({
         where: {
            name_type: {
               name: parsedBody.data.name,
               type: parsedBody.data.type,
            },
         },
      });

      // Return the deleted category for frontend confirmation
      return {
         success: true,
         name: deletedCategory.name,
         type: deletedCategory.type,
      };
   } catch (error) {
      let errorMessage = "Došlo je do greške pri brisanju kategorije.";
      if (error instanceof Error) {
         errorMessage = error.message; // Use the message from the Error instance
      }

      // Return an error object
      return {
         success: false,
         error: errorMessage,
      };
   }
}
