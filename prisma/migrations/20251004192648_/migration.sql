-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INACTIVE', 'ACTIVE');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'GENERAL');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('STANDARD', 'PREMIUM', 'ENTERPRISE');

-- CreateTable
CREATE TABLE "CompanyUser" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "mobile" VARCHAR(10),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "userType" "UserType" NOT NULL DEFAULT 'GENERAL',
    "lastModified" TIMESTAMP(3),

    CONSTRAINT "CompanyUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientCompany" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" VARCHAR(10) NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "validTill" TIMESTAMP(3),
    "clientType" "ClientType" DEFAULT 'STANDARD',
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedById" INTEGER,
    "modifiedAt" TIMESTAMP(3),
    "numProductsAssigned" INTEGER DEFAULT 0,
    "numProductsInUse" INTEGER DEFAULT 0,
    "credits" INTEGER DEFAULT 0,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "broadcastEnabled" BOOLEAN NOT NULL DEFAULT false,
    "alarmEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ClientCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientUser" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" VARCHAR(10) NOT NULL,
    "password" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3),
    "userType" "UserType" NOT NULL DEFAULT 'GENERAL',

    CONSTRAINT "ClientUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "batchId" TEXT,
    "productId" TEXT,
    "assignedToId" INTEGER,
    "assignedAt" TIMESTAMP(3),
    "assignedById" INTEGER,
    "productType" TEXT,
    "validTill" TIMESTAMP(3),
    "gps" TEXT,
    "imei" TEXT,
    "sim" TEXT,
    "simNumber" TEXT,
    "location" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyUser_username_key" ON "CompanyUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyUser_email_key" ON "CompanyUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClientCompany_email_key" ON "ClientCompany"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClientCompany_mobile_key" ON "ClientCompany"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "ClientUser_email_key" ON "ClientUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClientUser_mobile_key" ON "ClientUser"("mobile");

-- AddForeignKey
ALTER TABLE "ClientCompany" ADD CONSTRAINT "ClientCompany_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CompanyUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCompany" ADD CONSTRAINT "ClientCompany_modifiedById_fkey" FOREIGN KEY ("modifiedById") REFERENCES "CompanyUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientUser" ADD CONSTRAINT "ClientUser_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "ClientCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "CompanyUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
