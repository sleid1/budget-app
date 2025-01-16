import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

export async function GET(request: Request) {
   const user = await auth();

   if (!user) {
      return Response.json("NOT LOGGED IN", {
         status: 400,
      });
   }

   const { searchParams } = new URL(request.url);

   // Validate the "type" parameter
   const paramType = searchParams.get("type");
   const typeValidator = z.enum(["ULAZNI_RACUN", "IZLAZNI_RACUN"]).nullable();
   const queryParams = typeValidator.safeParse(paramType);

   if (!queryParams.success) {
      return Response.json(
         'Parametar može biti ili "ULAZNI_RACUN" ili "IZLAZNI_RACUN"',
         {
            status: 400,
         }
      );
   }

   const type = queryParams.data;

   // Check for the optional "categoryId" parameter
   const paramCategoryId = searchParams.get("categoryId");
   const categoryIdValidator = z.string().nullable();
   const categoryIdParams = categoryIdValidator.safeParse(paramCategoryId);

   if (!categoryIdParams.success) {
      return Response.json("Invalid categoryId parameter.", {
         status: 400,
      });
   }

   const categoryId = categoryIdParams.data
      ? parseInt(paramCategoryId!, 10)
      : null;

   // Fetch categories or a specific category with invoice count
   if (categoryId) {
      // Fetch a single category with its invoice count
      const categoryWithCount = await prisma.category.findUnique({
         where: {
            id: categoryId,
         },
         include: {
            _count: {
               select: { invoices: true },
            },
         },
      });

      if (!categoryWithCount) {
         return Response.json("Kategorija nije pronađena.", {
            status: 404,
         });
      }

      return Response.json({
         ...categoryWithCount,
         invoiceCount: categoryWithCount._count.invoices,
      });
   } else {
      // Fetch all categories with optional filtering by "type"
      const categories = await prisma.category.findMany({
         where: {
            ...(type && { type }),
         },
         include: {
            _count: {
               select: { invoices: true },
            },
         },
         orderBy: {
            name: "asc",
         },
      });

      return Response.json(
         categories.map((category) => ({
            ...category,
            invoiceCount: category._count.invoices,
         }))
      );
   }
}
