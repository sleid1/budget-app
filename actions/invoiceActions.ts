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

   console.log(parsedBody.data);

   // const {
   //    invoiceNumber,
   //    netAmount,
   //    vatAmount,
   //    vatRate,
   //    grossAmount,
   //    type,
   //    description,
   //    date,
   //    datePaid,
   //    status,
   //    category,
   //    categoryIcon,
   // } = parsedBody.data;

   // const invoice = prisma.invoice.create({
   //    data: {
   //       invoiceNumber,
   //       netAmount,
   //       vatAmount,
   //       vatRate,
   //       grossAmount,
   //       type,
   //       description,
   //       date,
   //       datePaid,
   //       status,
   //       category: categoryRow.name,
   //       categoryIcon: categoryRow.icon,
   //       userId: user.user.id,
   //    },
   // });
}
