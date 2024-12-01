-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('ULAZNI_RACUN', 'IZLAZNI_RACUN');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('NEPLACENO', 'PLACENO', 'KASNJENJE', 'STORNIRANO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "InvoiceType" NOT NULL,
    "userId" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "vat" DOUBLE PRECISION NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    "type" "InvoiceType" NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "datePaid" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL DEFAULT 'NEPLACENO',
    "category" TEXT NOT NULL,
    "categoryIcon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthHistory" (
    "day" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "income" DOUBLE PRECISION NOT NULL,
    "expense" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MonthHistory_pkey" PRIMARY KEY ("day","month","year")
);

-- CreateTable
CREATE TABLE "YearHistory" (
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "income" DOUBLE PRECISION NOT NULL,
    "expense" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "YearHistory_pkey" PRIMARY KEY ("month","year")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceId" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_type_key" ON "Category"("name", "type");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
