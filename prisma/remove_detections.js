// File: backend/scripts/clearDetections.js
// Usage: node scripts/clearDetections.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Deleting IncidentSpecies rows...');
  await prisma.incidentSpecies.deleteMany({});
  console.log('Deleting Incident rows...');
  await prisma.incident.deleteMany({});
  console.log('Reset complete.');
}

main()
  .catch((e) => {
    console.error('Error clearing detection data:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });