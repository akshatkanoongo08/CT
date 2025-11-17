-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "trapId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "captureTime" TIMESTAMP(3) NOT NULL,
    "processingTime" TIMESTAMP(3) NOT NULL,
    "processingDelaySeconds" INTEGER,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "totalDetections" INTEGER NOT NULL DEFAULT 0,
    "gps" TEXT,
    "temperature" TEXT,
    "warnings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentSpecies" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "detectorConfidence" DOUBLE PRECISION,
    "bbox" JSONB,
    "label" TEXT,
    "maskUrl" TEXT,
    "topk" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentSpecies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IncidentSpecies" ADD CONSTRAINT "IncidentSpecies_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
