// scripts/createSuperAdmin.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);

    // Create Super Admin
    const superAdmin = await prisma.companyUser.create({
      data: {
        name: 'Demo Super Admin',
        username: 'superadmin',
        password: hashedPassword,
        email: 'superadmin@example.com',
        mobile: '9876543210',
        status: 'ACTIVE',
        userType: 'SUPER_ADMIN',
      },
    });

    console.log('✅ Super Admin created successfully:');
    console.log(superAdmin);
  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
