require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing database...');
  await prisma.inventoryItem.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.consultation.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.doctorProfile.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Database cleared completely!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
