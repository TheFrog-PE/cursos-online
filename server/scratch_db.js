import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('--- USERS ---');
  console.log(JSON.stringify(users, null, 2));

  const payments = await prisma.payment.findMany();
  console.log('--- PAYMENTS ---');
  console.log(JSON.stringify(payments, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
