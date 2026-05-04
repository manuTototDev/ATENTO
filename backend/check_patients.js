const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkPatientsDoctorId() {
  try {
    const user = await prisma.user.findFirst();
    console.log(`ID de usuario manu@totot.mx: ${user.id}`);

    const samplePatient = await prisma.patient.findFirst({ select: { doctorId: true, firstName: true } });
    console.log('Ejemplo de paciente con doctorId:', samplePatient);

    const matchCount = await prisma.patient.count({ where: { doctorId: user.id } });
    console.log(`Pacientes asignados a manu@totot.mx: ${matchCount}`);

  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkPatientsDoctorId();
