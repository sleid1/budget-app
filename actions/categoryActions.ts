"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DEFAULT_LOGOUT_REDIRECT } from "@/routes";
import {
   CreateCategorySchema,
   CreateCategorySchemaType,
   DeleteCategorySchema,
   DeleteCategorySchemaType,
   UpdateCategorySchema,
   UpdateCategorySchemaType,
} from "@/schemas/categories";
import { redirect } from "next/navigation";

export async function createCategory(form: CreateCategorySchemaType) {
   const parsedBody = CreateCategorySchema.safeParse(form);

   if (!parsedBody.success) {
      console.error(
         "Validacija nije uspjela. Neispravan request:",
         parsedBody.error
      );
      throw new Error("Neispravan request");
   }

   const user = await auth();

   if (!user) {
      console.error("Korisnik nije prijavljen");
      redirect(DEFAULT_LOGOUT_REDIRECT);
      return { success: false, message: "Korisnik nije prijavljen" };
   }

   const { name, icon, type, description } = parsedBody.data;

   try {
      // Check if the category already exists
      const existingCategory = await prisma.category.findUnique({
         where: {
            name_type: {
               name,
               type,
            },
         },
      });

      if (existingCategory) {
         console.error(
            "Kategorija s istim imenom i vrstom računa već postoji:",
            { name, type }
         );
         return {
            success: false,
            data: existingCategory,
            message: "Kategorija s istim imenom i vrstom računa već postoji.",
         };
      }

      // Create the new category
      const newCategory = await prisma.category.create({
         data: {
            name,
            icon,
            type,
            description,
            userId: user?.user?.id,
            userOriginal: `${user?.user?.name} ${user?.user?.lastName}`,
         },
      });

      return {
         success: true,
         data: newCategory,
         message: "Kategorija uspješno kreirana.",
      };
   } catch (error) {
      console.error("Neuspjelo kreiranje kategorije:", error);
      return {
         success: false,
         message: "Došlo je do pogreške prilikom kreiranja kategorije.",
      };
   }
}

export async function updateCategory(form: UpdateCategorySchemaType) {
   const parsedBody = UpdateCategorySchema.safeParse(form);

   if (!parsedBody.success) {
      console.error(
         "Validacija nije uspjela. Neispravan request:",
         parsedBody.error
      );
      throw new Error("Neispravan request");
   }

   const user = await auth();

   if (!user) {
      console.error("Korisnik nije prijavljen");
      redirect(DEFAULT_LOGOUT_REDIRECT);
      return { success: false, message: "Korisnik nije prijavljen" };
   }

   const { id, name, icon, type, description } = parsedBody.data;

   try {
      // Check if the category with that name already exists
      const existingCategory = await prisma.category.findUnique({
         where: {
            name_type: {
               name,
               type,
            },
         },
      });

      if (existingCategory) {
         console.error(
            "Kategorija s istim imenom i vrstom računa već postoji:",
            { name, type }
         );
         return {
            success: false,
            data: existingCategory,
            message: "Kategorija s istim imenom i vrstom računa već postoji.",
         };
      }

      const updatedCategory = await prisma.category.update({
         where: {
            id,
         },
         data: {
            name,
            icon,
            type,
            description,
         },
      });

      return {
         success: true,
         data: updatedCategory,
         message: "Kategorija uspješno ažurirana.",
      };
   } catch (error) {
      console.error("Neuspjelo ažuriranje kategorije:", error);
      return { success: false, message: "Došlo je do pogreške." };
   }
}

export async function deleteCategory(form: DeleteCategorySchemaType) {
   const parsedBody = DeleteCategorySchema.safeParse(form);

   if (!parsedBody.success) {
      console.error(
         "Validacija nije uspjela. Neispravan request:",
         parsedBody.error
      );
      return {
         success: false,
         message: "Validacija nije uspjela. Neispravan request.",
      };
   }

   const user = await auth();

   if (!user) {
      console.error("Korisnik nije prijavljen");
      redirect(DEFAULT_LOGOUT_REDIRECT);
      return { success: false, message: "Korisnik nije prijavljen" };
   }

   const { oldCategoryId, newCategoryId, name, type } = parsedBody.data;

   try {
      // Step 1: Update invoices if a new category is provided
      if (newCategoryId) {
         console.log(
            `Ažuriranje računa iz stare kategorije (${oldCategoryId}) u novu kategoriju (${newCategoryId})`
         );
         await prisma.invoice.updateMany({
            where: { categoryId: oldCategoryId },
            data: { categoryId: newCategoryId },
         });
      }

      // Step 2: Delete the category
      console.log(`Brisanje kategorije s imenom: ${name} i vrstom: ${type}`);
      const deletedCategory = await prisma.category.delete({
         where: {
            id: oldCategoryId,
         },
      });

      return {
         success: true,
         data: deletedCategory,
         message: `Kategorija ${deletedCategory.name} je uspješno obrisana`,
      };
   } catch (error) {
      console.error("Neuspjelo brisanje kategorije:", error);
      let errorMessage = "Došlo je do greške pri brisanju kategorije.";
      if (error instanceof Error) {
         errorMessage = error.message;
      }

      return {
         success: false,
         message: errorMessage,
      };
   }
}
