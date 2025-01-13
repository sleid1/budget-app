import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DEFAULT_LOGOUT_REDIRECT } from "@/routes";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
   const user = await auth();

   if (!user) {
      redirect(DEFAULT_LOGOUT_REDIRECT);
   }

   const periods = await getHistoryPeriods();
   return Response.json(periods);
}

export type GetHistoryPeriodsResponseType = Awaited<
   ReturnType<typeof getHistoryPeriods>
>;

async function getHistoryPeriods() {
   const years = await prisma.invoice.findMany({
      select: {
         dateIssued: true,
      },
      distinct: ["dateIssued"],
      orderBy: {
         dateIssued: "asc",
      },
   });

   // EKSTRAKTIRAJ SAMO UNIQUE GODINE
   const distinctYears = [
      ...new Set(
         years.map((invoice) => new Date(invoice.dateIssued).getFullYear())
      ),
   ];

   //VRATI TRENUTNU GODINU
   if (distinctYears.length === 0) {
      return [new Date().getFullYear()];
   }

   return distinctYears;
}
