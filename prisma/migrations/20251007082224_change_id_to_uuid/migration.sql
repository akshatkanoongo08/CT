/*
  Warnings:

  - The primary key for the `ClientCompany` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ClientUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CompanyUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ClientCompany" DROP CONSTRAINT "ClientCompany_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClientCompany" DROP CONSTRAINT "ClientCompany_modifiedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClientUser" DROP CONSTRAINT "ClientUser_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_assignedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_assignedToId_fkey";

-- AlterTable
ALTER TABLE "ClientCompany" DROP CONSTRAINT "ClientCompany_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "modifiedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "ClientCompany_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ClientCompany_id_seq";

-- AlterTable
ALTER TABLE "ClientUser" DROP CONSTRAINT "ClientUser_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "clientId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ClientUser_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ClientUser_id_seq";

-- AlterTable
ALTER TABLE "CompanyUser" DROP CONSTRAINT "CompanyUser_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CompanyUser_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CompanyUser_id_seq";

-- DropTable
DROP TABLE "public"."Product";

-- CreateTable
CREATE TABLE "CameraTrap" (
    "id" TEXT NOT NULL,
    "batchId" TEXT,
    "productId" TEXT,
    "assignedToId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "assignedById" TEXT,
    "productType" TEXT,
    "validTill" TIMESTAMP(3),
    "gps" TEXT,
    "imei" TEXT,
    "sim" TEXT,
    "simNumber" TEXT,
    "location" TEXT,

    CONSTRAINT "CameraTrap_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClientCompany" ADD CONSTRAINT "ClientCompany_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CompanyUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCompany" ADD CONSTRAINT "ClientCompany_modifiedById_fkey" FOREIGN KEY ("modifiedById") REFERENCES "CompanyUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientUser" ADD CONSTRAINT "ClientUser_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CameraTrap" ADD CONSTRAINT "CameraTrap_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "ClientCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CameraTrap" ADD CONSTRAINT "CameraTrap_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "CompanyUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
