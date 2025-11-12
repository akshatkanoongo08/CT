import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding supported species...');

  // Create supported species
  const species = [
    { specieId: 'cow', specieName: 'Cow' },
    { specieId: 'dog', specieName: 'Dog' },
    { specieId: 'cat', specieName: 'Cat' },
    { specieId: 'human', specieName: 'Human' },
  ];

  for (const specie of species) {
    await prisma.supportedSpecies.upsert({
      where: { specieId: specie.specieId },
      update: {},
      create: specie,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
