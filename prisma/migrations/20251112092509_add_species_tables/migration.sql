-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "SupportedSpecies" (
    "id" SERIAL NOT NULL,
    "specieId" TEXT NOT NULL,
    "specieName" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportedSpecies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeciesOfInterest" (
    "id" SERIAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "specieId" TEXT NOT NULL,
    "specieName" TEXT NOT NULL,
    "severityLevel" "SeverityLevel" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeciesOfInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupportedSpecies_specieId_key" ON "SupportedSpecies"("specieId");

-- CreateIndex
CREATE UNIQUE INDEX "SpeciesOfInterest_clientId_specieId_key" ON "SpeciesOfInterest"("clientId", "specieId");

-- AddForeignKey
ALTER TABLE "SpeciesOfInterest" ADD CONSTRAINT "SpeciesOfInterest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeciesOfInterest" ADD CONSTRAINT "SpeciesOfInterest_specieId_fkey" FOREIGN KEY ("specieId") REFERENCES "SupportedSpecies"("specieId") ON DELETE RESTRICT ON UPDATE CASCADE;
