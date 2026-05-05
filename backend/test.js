const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    await pool.query(`ALTER TABLE "Consultation" ADD COLUMN IF NOT EXISTS "rawTranscription" JSONB;`);
    console.log("Columna agregada exitosamente.");
  } catch (error) {
    console.error("ERROR CAUGHT:");
    console.error(error);
  } finally {
    await pool.end();
  }
}
main();
