const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const medications = [
  { name: 'Paracetamol', activePrinciple: 'Paracetamol', presentation: 'Tabletas 500mg' },
  { name: 'Ibuprofeno', activePrinciple: 'Ibuprofeno', presentation: 'Cápsulas 400mg' },
  { name: 'Amoxicilina', activePrinciple: 'Amoxicilina', presentation: 'Cápsulas 500mg' },
  { name: 'Amoxicilina / Ácido Clavulánico', activePrinciple: 'Amoxicilina / Ácido Clavulánico', presentation: 'Tabletas 875mg/125mg' },
  { name: 'Diclofenaco', activePrinciple: 'Diclofenaco sódico', presentation: 'Grageas 100mg' },
  { name: 'Omeprazol', activePrinciple: 'Omeprazol', presentation: 'Cápsulas 20mg' },
  { name: 'Loratadina', activePrinciple: 'Loratadina', presentation: 'Tabletas 10mg' },
  { name: 'Metformina', activePrinciple: 'Metformina', presentation: 'Tabletas 850mg' },
  { name: 'Losartán', activePrinciple: 'Losartán potásico', presentation: 'Tabletas 50mg' },
  { name: 'Ciprofloxacino', activePrinciple: 'Ciprofloxacino', presentation: 'Tabletas 500mg' },
  { name: 'Ketorolaco', activePrinciple: 'Ketorolaco trometamina', presentation: 'Tabletas 10mg' },
  { name: 'Dexametasona', activePrinciple: 'Dexametasona', presentation: 'Solución Inyectable 8mg/2ml' },
  { name: 'Salbutamol', activePrinciple: 'Salbutamol', presentation: 'Aerosol 100mcg/dosis' },
  { name: 'Azitromicina', activePrinciple: 'Azitromicina', presentation: 'Tabletas 500mg' },
  { name: 'Naproxeno', activePrinciple: 'Naproxeno sódico', presentation: 'Tabletas 550mg' }
];

async function seed() {
  try {
    for (const med of medications) {
      await prisma.medication.create({ data: med });
    }
    console.log('Medicamentos insertados con éxito.');
  } catch (err) {
    console.error('Error insertando medicamentos:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seed();
