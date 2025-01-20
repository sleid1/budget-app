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
      return Response.json(queryParams.error.message, {
         status: 400,
      });
   }

   const stats = await getBalanceStats(
      queryParams.data.from,
      queryParams.data.to
   );

   return Response.json(stats);
}

export type GetBalanceStatsResponseType = Awaited<
   ReturnType<typeof getBalanceStats>
>;

async function getBalanceStats(from: Date, to: Date) {
   const fromDate = adjustToStartOfDayUTC(new Date(from));
   const toDate = adjustToStartOfDayUTC(new Date(to));

   const totals = await prisma.invoice.groupBy({
      by: ["type"],
      where: {
         dateIssued: {
            gte: fromDate.toISOString(),
            lte: toDate.toISOString(),
         },
      },
      _sum: {
         netAmount: true,
         vatAmount: true,
         grossAmount: true,
      },
   });

   return {
      income:
         totals.find((total) => total.type === "IZLAZNI_RACUN")?._sum
            .grossAmount || 0,
      expense:
         totals.find((total) => total.type === "ULAZNI_RACUN")?._sum
            .grossAmount || 0,

      vatPaid:
         totals.find((total) => total.type === "ULAZNI_RACUN")?._sum
            .vatAmount || 0,
      vatOwed:
         totals.find((total) => total.type === "IZLAZNI_RACUN")?._sum
            .vatAmount || 0,

      // // Calculate VAT Balance
      // vatBalance:
      //    (totals.find((total) => total.type === "ULAZNI_RACUN")?._sum
      //       .vatAmount || 0) -
      //    (totals.find((total) => total.type === "IZLAZNI_RACUN")?._sum
      //       .vatAmount || 0),
   };
}
