import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Period, Timeframe } from "@/lib/types";
import { DEFAULT_LOGOUT_REDIRECT } from "@/routes";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import { z } from "zod";

const getHistoryDataSchema = z.object({
   timeFrame: z.enum(["month", "year"]),
   month: z.coerce.number().min(0).max(11).default(0),
   year: z.coerce.number().min(2020).max(3000),
});

export async function GET(request: Request) {
   const user = await auth();

   if (!user) {
      redirect(DEFAULT_LOGOUT_REDIRECT);
   }

   const { searchParams } = new URL(request.url);
   const timeFrame = searchParams.get("timeframe");
   const month = searchParams.get("month");
   const year = searchParams.get("year");

   const queryParams = getHistoryDataSchema.safeParse({
      timeFrame,
      month,
      year,
   });

   if (!queryParams.success) {
      return Response.json("Pogrešan request", {
         status: 401,
      });
   }

   const data = await getHistoryData(queryParams.data.timeFrame, {
      month: queryParams.data.month,
      year: queryParams.data.year,
   });

   return Response.json(data);
}

export type GetHistoryDataResponseType = Awaited<
   ReturnType<typeof getHistoryData>
>;

async function getHistoryData(timeframe: Timeframe, period: Period) {
   switch (timeframe) {
      case "year":
         return await getYearHistoryData(period.year);
      case "month":
         return await getMonthHistoryData(period.year, period.month);
   }
}

type HistoryData = {
   income: number;
   expense: number;
   vatBalance: number;
   year: number;
   month: number;
   day?: number;
};

async function getYearHistoryData(year: number) {
   // Fetch and group data by month from the Invoice model
   const result = await prisma.invoice.groupBy({
      by: ["type", "dateIssued"],
      where: {
         dateIssued: {
            gte: new Date(year, 0, 1), // Start of the year
            lt: new Date(year + 1, 0, 1), // Start of the next year
         },
      },
      _sum: {
         grossAmount: true,
         vatAmount: true,
         netAmount: true,
      },
   });

   if (!result || result.length === 0) return [];

   // Initialize an array for 12 months
   const history: HistoryData[] = [];

   for (let i = 0; i < 12; i++) {
      let income = 0;
      let expense = 0;
      let vatBalance = 0;
      // let netIncome = 0;
      // let netExpense = 0;

      // Find rows for the current month
      for (const row of result) {
         const rowMonth = new Date(row.dateIssued).getUTCMonth();

         if (rowMonth === i) {
            if (row.type === "IZLAZNI_RACUN") {
               income += row._sum.grossAmount || 0;
               // netIncome += row._sum.netAmount || 0;
               vatBalance -= row._sum.vatAmount || 0;
            } else if (row.type === "ULAZNI_RACUN") {
               expense += row._sum.grossAmount || 0;
               // netExpense += row._sum.netAmount || 0;
               vatBalance += row._sum.vatAmount || 0;
            }
         }
      }

      // Add the month's data to the history array
      history.push({
         year,
         month: i,
         income,
         expense,
         vatBalance,
         // netIncome,
         // netExpense,
      });
   }

   return history;
}

async function getMonthHistoryData(year: number, month: number) {
   // Fetch and group data by day from the Invoice model
   const result = await prisma.invoice.groupBy({
      by: ["type", "dateIssued"],
      where: {
         dateIssued: {
            gte: new Date(year, month, 1), // Start of the month
            lt: new Date(year, month + 1, 1), // Start of the next month
         },
      },
      _sum: {
         grossAmount: true,
         vatAmount: true,
         netAmount: true,
      },
   });

   if (!result || result.length === 0) return [];

   // Calculate the number of days in the given month
   const daysInMonth = getDaysInMonth(new Date(year, month));

   // Initialize an array for all days in the month
   const history: HistoryData[] = [];

   for (let day = 1; day <= daysInMonth; day++) {
      let income = 0;
      let expense = 0;
      let vatBalance = 0;
      // let netIncome = 0; // Net income for the day
      // let netExpense = 0; // Net expense for the day

      // Find rows for the current day
      for (const row of result) {
         const rowDate = new Date(row.dateIssued);
         const rowDay = rowDate.getUTCDate();

         if (rowDay === day) {
            if (row.type === "IZLAZNI_RACUN") {
               income += row._sum.grossAmount || 0;
               // netIncome += row._sum.netAmount || 0;
               vatBalance -= row._sum.vatAmount || 0;
            } else if (row.type === "ULAZNI_RACUN") {
               expense += row._sum.grossAmount || 0;
               // netExpense += row._sum.netAmount || 0;
               vatBalance += row._sum.vatAmount || 0;
            }
         }
      }

      // Add the day's data to the history array
      history.push({
         year,
         month,
         day,
         income,
         expense,
         vatBalance,
         // netIncome,
         // netExpense,
      });
   }

   return history;
}
