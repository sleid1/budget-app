import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DEFAULT_LOGOUT_REDIRECT } from "@/routes";
import { OverviewQuerySchema } from "@/schemas/overview";
import { adjustToStartOfDayUTC, formatToCurrency } from "@/utils/helpers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
   const user = await auth();

   if (!user) {
      redirect(DEFAULT_LOGOUT_REDIRECT);
   }

   const { searchParams } = new URL(request.url);
   const from = searchParams.get("from");
   const to = searchParams.get("to");

   console.log(from, to);

   const queryParams = OverviewQuerySchema.safeParse({ from, to });

   if (!queryParams.success) {
      return Response.json(queryParams.error.message, {
         status: 400,
      });
   }

   const invoices = await getInvoiceHistory(
      queryParams.data.from,
      queryParams.data.to
   );

   return Response.json(invoices);
}

export type getInvoiceHistoryResponseType = Awaited<
   ReturnType<typeof getInvoiceHistory>
>;

async function getInvoiceHistory(from: Date, to: Date) {
   const formatter = formatToCurrency();

   const fromDate = adjustToStartOfDayUTC(new Date(from));
   const toDate = adjustToStartOfDayUTC(new Date(to));

   console.log("LOGGED OBJECT", {
      where: {
         dateIssued: {
            gte: fromDate.toISOString(),
            lte: toDate.toISOString(),
         },
      },
      orderBy: {
         dateIssued: "desc",
      },
      include: {
         categoryRel: {
            select: {
               name: true,
               icon: true,
            },
         },
         departmentRel: {
            select: {
               name: true,
            },
         },
         userRel: {
            select: {
               name: true,
               lastName: true,
            },
         },
      },
   });

   const invoices = await prisma.invoice.findMany({
      where: {
         dateIssued: {
            gte: fromDate.toISOString(),
            lte: toDate.toISOString(),
         },
      },
      orderBy: {
         createdAt: "desc",
      },
      include: {
         categoryRel: {
            select: {
               name: true,
               icon: true,
            },
         },
         departmentRel: {
            select: {
               name: true,
            },
         },
         userRel: {
            select: {
               id: true,
               name: true,
               lastName: true,
            },
         },
      },
   });

   return invoices.map((invoice) => ({
      ...invoice,
      // FORMATIRAMO IZNOS RAČUNA S VALUTOM
      formattedAmount: formatter.format(invoice.grossAmount),
   }));
}
