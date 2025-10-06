/*
  Warnings:

  - The values [SUPER_ADMIN,ADMIN,GENERAL] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'GENERAL');

-- AlterEnum
BEGIN;
CREATE TYPE "UserType_new" AS ENUM ('COMPANY_USER', 'CLIENT_USER');
ALTER TABLE "public"."ClientUser" ALTER COLUMN "userType" DROP DEFAULT;
ALTER TABLE "public"."CompanyUser" ALTER COLUMN "userType" DROP DEFAULT;
ALTER TABLE "CompanyUser" ALTER COLUMN "userType" TYPE "UserType_new" USING ("userType"::text::"UserType_new");
ALTER TABLE "ClientUser" ALTER COLUMN "userType" TYPE "UserType_new" USING ("userType"::text::"UserType_new");
ALTER TYPE "UserType" RENAME TO "UserType_old";
ALTER TYPE "UserType_new" RENAME TO "UserType";
DROP TYPE "public"."UserType_old";
ALTER TABLE "ClientUser" ALTER COLUMN "userType" SET DEFAULT 'CLIENT_USER';
ALTER TABLE "CompanyUser" ALTER COLUMN "userType" SET DEFAULT 'COMPANY_USER';
COMMIT;

-- AlterTable
ALTER TABLE "ClientUser" ADD COLUMN     "role" "ROLE" NOT NULL DEFAULT 'GENERAL',
ALTER COLUMN "userType" SET DEFAULT 'CLIENT_USER';

-- AlterTable
ALTER TABLE "CompanyUser" ADD COLUMN     "role" "ROLE" NOT NULL DEFAULT 'GENERAL',
ALTER COLUMN "userType" SET DEFAULT 'COMPANY_USER';
