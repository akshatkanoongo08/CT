import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const email = 'superadmin@company.com';
    const password = 'SuperAdmin@123';
    const name = 'Super Admin';
    const mobile = '9999999999';
    const username = 'superadmin';

    // Check if super admin already exists
    const existingUser = await prisma.companyUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('❌ Super admin already exists with email:', email);
      await prisma.$disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin
    const superAdmin = await prisma.companyUser.create({
      data: {
        name,
        email,
        mobile,
        username,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        userType: 'COMPANY_USER', // Important: set userType
      },
    });

    console.log('✅ Super Admin created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Username:', username);
    console.log('🆔 ID:', superAdmin.id);
    console.log('\n⚠️  Please change the password after first login!');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createSuperAdmin();