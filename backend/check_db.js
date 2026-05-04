const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkDatabase() {
  try {
    const profileCount = await prisma.doctorProfile.count();
    const patientCount = await prisma.patient.count();
    const consultationCount = await prisma.consultation.count();
    const appointmentCount = await prisma.appointment.count();
    const inventoryCount = await prisma.inventoryItem.count();

    const summary = {
      'Perfiles de Doctor': profileCount,
      'Pacientes': patientCount,
      'Consultas': consultationCount,
      'Citas': appointmentCount,
      'Ítems de Inventario': inventoryCount,
    };

    console.log('--- Resumen de la Base de Datos ---');
    console.table(summary);

    if (patientCount > 0) {
      const patients = await prisma.patient.findMany({ take: 3, select: { firstName: true, lastName: true } });
      console.log('Ejemplo de pacientes:', patients);
    }
    
    if (profileCount > 0) {
      const profiles = await prisma.doctorProfile.findMany({ take: 3, select: { clinicName: true, specialty: { select: { name: true } } } });
      console.log('Ejemplo de perfiles:', JSON.stringify(profiles, null, 2));
    }

  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkDatabase();
