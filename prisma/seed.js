const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Hash passwords
  const hashedAjay = await bcrypt.hash('Adminaj@2025', 10);
  const hashedPurva = await bcrypt.hash('Purva@123', 10);
  const hashedSatya = await bcrypt.hash('Satya@123', 10);
  const hashedKrunal = await bcrypt.hash('Krunal@123', 10);

  // Create users
  const ajay = await prisma.user.upsert({
    where: { username: 'ajay' },
    update: {},
    create: {
      username: 'ajay',
      password: hashedAjay,
      role: 'ADMIN',
    },
  });

  const purva = await prisma.user.upsert({
    where: { username: 'purva' },
    update: {},
    create: {
      username: 'purva',
      password: hashedPurva,
      role: 'USER',
    },
  });

  const satya = await prisma.user.upsert({
    where: { username: 'satya' },
    update: {},
    create: {
      username: 'satya',
      password: hashedSatya,
      role: 'USER',
    },
  });

  const krunal = await prisma.user.upsert({
    where: { username: 'krunal' },
    update: {},
    create: {
      username: 'krunal',
      password: hashedKrunal,
      role: 'USER',
    },
  });

  console.log('Seeded users:', { ajay, purva, satya, krunal });
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
