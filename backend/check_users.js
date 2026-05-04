const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkUsers() {
  try {
    const usersCount = await prisma.user.count();
    const users = await prisma.user.findMany({ take: 5, select: { id: true, email: true, firstName: true, lastName: true } });
    console.log(`Total usuarios: ${usersCount}`);
    if (usersCount > 0) {
      console.log('Usuarios encontrados (primeros 5):', users);
    } else {
      console.log('No hay usuarios registrados en la base de datos.');
    }
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkUsers();
