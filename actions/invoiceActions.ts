"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DEFAULT_LOGOUT_REDIRECT } from "@/routes";
import {
   CreateInvoiceSchema,
   CreateInvoiceSchemaType,
} from "@/schemas/invoice";
import { redirect } from "next/navigation";

export async function createInvoice(form: CreateInvoiceSchemaType) {
   const parsedBody = CreateInvoiceSchema.safeParse(form);

   if (!parsedBody.success) {
      throw new Error("Došlo je do pogreške");
   }

   const user = await auth();

   if (!user) {
      redirect(DEFAULT_LOGOUT_REDIRECT);
   }

   const {
      invoiceNumber,
      netAmount,
      vatAmount,
      vatRate,
      grossAmount,
      type,
      description,
      dateIssued,
      datePaid,
      status,
      categoryOriginal,
      categoryId,
      categoryIcon,
   } = parsedBody.data;

   console.log("Data for Invoice Creation:", {
      invoiceNumber,
      netAmount,
      vatAmount,
      vatRate,
      grossAmount,
      type,
      dateIssued,
      datePaid,
      status,
      categoryOriginal,
      categoryId,
      categoryIcon: categoryIcon || "",
      description: description || "",
      userId: user?.user?.id,
   });

   console.log("Data for Month History Upsert:", {
      where: {
         day_month_year: {
            day: dateIssued.getUTCDate(),
            month: dateIssued.getUTCMonth(),
            year: dateIssued.getUTCFullYear(),
         },
      },
      create: {
         day: dateIssued.getUTCDate(),
         month: dateIssued.getUTCMonth(),
         year: dateIssued.getUTCFullYear(),
         expense: type === "ULAZNI_RACUN" ? grossAmount : 0,
         income: type === "IZLAZNI_RACUN" ? grossAmount : 0,
         vatPaid: type === "ULAZNI_RACUN" ? vatAmount : 0,
         vatOwed: type === "IZLAZNI_RACUN" ? vatAmount : 0,
         vatBalance:
            type === "IZLAZNI_RACUN"
               ? -vatAmount
               : type === "ULAZNI_RACUN"
               ? vatAmount
               : 0,
      },
      update: {
         expense: {
            increment: type === "ULAZNI_RACUN" ? grossAmount : 0,
         },
         income: {
            increment: type === "IZLAZNI_RACUN" ? grossAmount : 0,
         },
         vatPaid: {
            increment: type === "ULAZNI_RACUN" ? vatAmount : 0,
         },
         vatOwed: {
            increment: type === "IZLAZNI_RACUN" ? vatAmount : 0,
         },
         vatBalance: {
            increment:
               type === "IZLAZNI_RACUN"
                  ? -vatAmount
                  : type === "ULAZNI_RACUN"
                  ? vatAmount
                  : 0,
         },
      },
   });

   try {
      await prisma.$transaction([
         prisma.invoice.create({
            data: {
               invoiceNumber,
               netAmount,
               vatAmount,
               vatRate,
               grossAmount,
               type,
               dateIssued,
               datePaid,
               status,
               categoryOriginal,
               categoryId,
               categoryIcon: categoryIcon || "",
               description: description || "",
               userId: user?.user?.id,
            },
         }),

         prisma.monthHistory.upsert({
            where: {
               day_month_year: {
                  day: dateIssued.getUTCDate(),
                  month: dateIssued.getUTCMonth() + 1,
                  year: dateIssued.getUTCFullYear(),
               },
            },
            create: {
               day: dateIssued.getUTCDate(),
               month: dateIssued.getUTCMonth() + 1,
               year: dateIssued.getUTCFullYear(),
               expense: type === "ULAZNI_RACUN" ? grossAmount : 0,
               income: type === "IZLAZNI_RACUN" ? grossAmount : 0,
               vatPaid: type === "ULAZNI_RACUN" ? vatAmount : 0,
               vatOwed: type === "IZLAZNI_RACUN" ? vatAmount : 0,
               vatBalance:
                  type === "IZLAZNI_RACUN"
                     ? -vatAmount
                     : type === "ULAZNI_RACUN"
                     ? vatAmount
                     : 0,
            },
            update: {
               expense: {
                  increment: type === "ULAZNI_RACUN" ? grossAmount : 0,
               },
               income: {
                  increment: type === "IZLAZNI_RACUN" ? grossAmount : 0,
               },
               vatPaid: { increment: type === "ULAZNI_RACUN" ? vatAmount : 0 },
               vatOwed: { increment: type === "IZLAZNI_RACUN" ? vatAmount : 0 },
               vatBalance: {
                  increment:
                     type === "IZLAZNI_RACUN"
                        ? -vatAmount
                        : type === "ULAZNI_RACUN"
                        ? vatAmount
                        : 0,
               },
            },
         }),

         prisma.yearHistory.upsert({
            where: {
               month_year: {
                  month: dateIssued.getUTCMonth() + 1,
                  year: dateIssued.getUTCFullYear(),
               },
            },
            create: {
               month: dateIssued.getUTCMonth() + 1,
               year: dateIssued.getUTCFullYear(),
               expense: type === "ULAZNI_RACUN" ? grossAmount : 0,
               income: type === "IZLAZNI_RACUN" ? grossAmount : 0,
               vatPaid: type === "ULAZNI_RACUN" ? vatAmount : 0,
               vatOwed: type === "IZLAZNI_RACUN" ? vatAmount : 0,
               vatBalance:
                  type === "IZLAZNI_RACUN"
                     ? -vatAmount
                     : type === "ULAZNI_RACUN"
                     ? vatAmount
                     : 0,
            },
            update: {
               expense: {
                  increment: type === "ULAZNI_RACUN" ? grossAmount : 0,
               },
               income: {
                  increment: type === "IZLAZNI_RACUN" ? grossAmount : 0,
               },
               vatPaid: { increment: type === "ULAZNI_RACUN" ? vatAmount : 0 },
               vatOwed: { increment: type === "IZLAZNI_RACUN" ? vatAmount : 0 },
               vatBalance: {
                  increment:
                     type === "IZLAZNI_RACUN"
                        ? -vatAmount
                        : type === "ULAZNI_RACUN"
                        ? vatAmount
                        : 0,
               },
            },
         }),
      ]);
   } catch (error) {
      console.log("Transaction failed:", error);
      throw error;
   }
}
