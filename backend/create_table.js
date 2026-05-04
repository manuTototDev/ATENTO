const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Medication" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "activePrinciple" TEXT,
        "presentation" TEXT,
        "registrationNo" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('Tabla Medication creada.');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
