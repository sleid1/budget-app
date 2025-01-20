"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DEFAULT_LOGOUT_REDIRECT } from "@/routes";
import {
   CreateInvoiceSchema,
   CreateInvoiceSchemaType,
} from "@/schemas/invoice";
import { adjustToStartOfDayUTC } from "@/utils/helpers";
import { redirect } from "next/navigation";

export async function createInvoice(form: CreateInvoiceSchemaType) {
   const parsedBody = CreateInvoiceSchema.safeParse(form);

   if (!parsedBody.success) {
      console.error("Validation error:", parsedBody.error);
      return { success: false, message: "Neispravan request" };
   }

   const user = await auth();

   if (!user) {
      console.error("Potrebna prijava. Korisnik nije prijavljen.");
      redirect(DEFAULT_LOGOUT_REDIRECT);
      return {
         success: false,
         message: "Potrebna prijava. Korisnik nije prijavljen.",
      };
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
      categoryId,
      departmentId,
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
      categoryId,
      departmentId,
      description: description || "",
      userId: user?.user?.id,
      userOriginal: `${user?.user?.name} ${user?.user?.lastName}`,
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
      const existingInvoice = await prisma.invoice.findFirst({
         where: {
            invoiceNumber,
            categoryId,
            departmentId,
         },
      });

      if (existingInvoice) {
         console.error("Broj računa već postoji u istoj kategoriji i odjelu.");
         return {
            success: false,
            message: "Broj računa već postoji u istoj kategoriji i odjelu.",
         };
      }

      await prisma.$transaction([
         prisma.invoice.create({
            data: {
               invoiceNumber,
               netAmount,
               vatAmount,
               vatRate,
               grossAmount,
               type,
               description: description || null,
               dateIssued: adjustToStartOfDayUTC(dateIssued),
               datePaid: datePaid ? adjustToStartOfDayUTC(datePaid) : null,
               status,
               categoryId,
               departmentId,
               userId: user?.user?.id,
               userOriginal: `${user?.user?.name} ${user?.user?.lastName}`,
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

      return { success: true, message: "Račun je uspješno kreiran." };
   } catch (error) {
      console.error("Transakcija nije uspjela:", error);
      return { success: false, message: "Došlo je do pogreške." };
   }
}

export async function deleteInvoice(invoiceId: string) {
   const user = await auth();

   if (!user) {
      redirect(DEFAULT_LOGOUT_REDIRECT);
      return {
         success: false,
         message: "Potrebna prijava. Korisnik nije prijavljen.",
      };
   }

   try {
      const invoice = await prisma.invoice.findUnique({
         where: { id: invoiceId },
      });

      if (!invoice) {
         return {
            success: false,
            message: "Račun nije pronađen.",
         };
      }

      const deletedInvoice = await prisma.invoice.delete({
         where: { id: invoiceId },
      });

      return {
         success: true,
         message: `Račun ${deletedInvoice.invoiceNumber} je uspješno obrisan`,
      };
   } catch (error) {
      console.error("Greška tijekom brisanja računa:", error);
      return {
         success: false,
         message: "Došlo je do pogreške tijekom brisanja računa.",
      };
   }
}
