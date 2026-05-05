require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({connectionString: process.env.DATABASE_URL});
pool.query('SELECT id, "firstName", "dateOfBirth" FROM "Patient"').then(r=>console.log(r.rows)).catch(console.error).finally(()=>pool.end());
