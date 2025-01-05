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

   const paramType = searchParams.get("type");

   const validator = z.enum(["ULAZNI_RACUN", "IZLAZNI_RACUN"]).nullable();

   const queryParams = validator.safeParse(paramType);

   if (!queryParams.success) {
      return Response.json(
         'Parametar može biti ili "ULAZNI_RACUN" ili "IZLAZNI_RACUN"',
         {
            status: 400,
         }
      );
   }

   const type = queryParams.data;

   const categories = await prisma.category.findMany({
      where: {
         // userId: user.id, //UKOLIKO ŽELIMO PRIKAZATI KORISNIKU SAMO KATEGORIJE KOJE JE ON KREIRAO
         ...(type && { type }),
      },
      orderBy: {
         name: "asc",
      },
   });

   return Response.json(categories);
}
