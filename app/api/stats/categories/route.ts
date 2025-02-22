import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DEFAULT_LOGOUT_REDIRECT } from "@/routes";
import { OverviewQuerySchema } from "@/schemas/overview";
import { adjustToStartOfDayUTC } from "@/utils/helpers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
   const user = await auth();

   if (!user) {
      redirect(DEFAULT_LOGOUT_REDIRECT);
   }

   const { searchParams } = new URL(request.url);

   const from = searchParams.get("from");
   const to = searchParams.get("to");

   const queryParams = OverviewQuerySchema.safeParse({ from, to });

   if (!queryParams.success) {
      throw new Error(queryParams.error.message);
   }

   const stats = await getCategoriesStats(
      queryParams.data.from,
      queryParams.data.to
   );

   return Response.json(stats);
}

export type GetCategoriesStatsResponseType = Awaited<
   ReturnType<typeof getCategoriesStats>
>;

async function getCategoriesStats(from: Date, to: Date) {
   const fromDate = adjustToStartOfDayUTC(new Date(from));
   const toDate = adjustToStartOfDayUTC(new Date(to));

   const groupedInvoices = await prisma.invoice.groupBy({
      by: ["type", "categoryId"],
      where: {
         dateIssued: {
            gte: fromDate.toISOString(),
            lte: toDate.toISOString(),
         },
      },
      _sum: {
         grossAmount: true,
      },
      orderBy: {
         _sum: {
            grossAmount: "desc",
         },
      },
   });

   // Fetch related category data for each categoryId
   const stats = await Promise.all(
      groupedInvoices.map(async (group) => {
         const category = group.categoryId
            ? await prisma.category.findUnique({
                 where: { id: group.categoryId },
                 select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    icon: true,
                 },
              })
            : null;

         return {
            ...group,
            category,
         };
      })
   );

   return stats;
}
