import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@financeapp.com' },
    update: {},
    create: {
      email: 'admin@financeapp.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
    },
  });

  console.log('✅ Test user created:', user.email);

  const categories = [
    { name: 'Food & Dining', color: '#ef4444', icon: '🍔' },
    { name: 'Transportation', color: '#3b82f6', icon: '🚗' },
    { name: 'Shopping', color: '#ec4899', icon: '🛍️' },
    { name: 'Entertainment', color: '#8b5cf6', icon: '🎬' },
    { name: 'Bills & Utilities', color: '#f59e0b', icon: '💡' },
    { name: 'Healthcare', color: '#10b981', icon: '⚕️' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: category.name,
        },
      },
      update: {},
      create: {
        ...category,
        userId: user.id,
      },
    });
  }

  console.log('✅ Categories created');

  const accounts = [
    {
      name: 'Main Checking',
      type: 'BANK',
      balance: 5000,
      currency: 'USD',
      bank: 'Chase Bank',
      accountNumber: '1234567890',
    },
    {
      name: 'PayPal',
      type: 'MOBILE_FINANCE',
      balance: 1200,
      currency: 'USD',
    },
    {
      name: 'Visa Card',
      type: 'CREDIT_CARD',
      balance: 3000,
      currency: 'USD',
      bank: 'Bank of America',
      accountNumber: '9876543210',
    },
  ];

  for (const account of accounts) {
    await prisma.account.create({
      data: {
        ...account,
        type: account.type as any,
        userId: user.id,
      },
    });
  }

  console.log('✅ Accounts created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('   Admin: admin@financeapp.com / admin123');
  console.log('   User:  user@example.com / user123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
