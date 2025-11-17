-- CreateEnum
CREATE TYPE "AlertPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "IncidentSpecies" ADD COLUMN     "priority" "AlertPriority" NOT NULL DEFAULT 'LOW';
