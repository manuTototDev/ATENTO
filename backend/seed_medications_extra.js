const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });

const extraMeds = [
  // Antihistamínicos y Alergias
  { id: '101', name: 'Desloratadina', activePrinciple: 'Desloratadina', presentation: 'Tabletas 5mg' },
  { id: '102', name: 'Clorfenamina', activePrinciple: 'Clorfenamina maleato', presentation: 'Tabletas 4mg' },
  { id: '103', name: 'Montelukast', activePrinciple: 'Montelukast sódico', presentation: 'Tabletas 10mg' },
  // Analgésicos y Antiinflamatorios
  { id: '104', name: 'Meloxicam', activePrinciple: 'Meloxicam', presentation: 'Tabletas 15mg' },
  { id: '105', name: 'Celecoxib', activePrinciple: 'Celecoxib', presentation: 'Cápsulas 200mg' },
  { id: '106', name: 'Tramadol', activePrinciple: 'Tramadol clorhidrato', presentation: 'Cápsulas 50mg' },
  { id: '107', name: 'Clonixinato de lisina', activePrinciple: 'Clonixinato de lisina', presentation: 'Tabletas 250mg' },
  // Antibióticos
  { id: '108', name: 'Cefalexina', activePrinciple: 'Cefalexina', presentation: 'Cápsulas 500mg' },
  { id: '109', name: 'Levofloxacino', activePrinciple: 'Levofloxacino', presentation: 'Tabletas 500mg' },
  { id: '110', name: 'Clindamicina', activePrinciple: 'Clindamicina', presentation: 'Cápsulas 300mg' },
  { id: '111', name: 'Trimetoprima/Sulfametoxazol', activePrinciple: 'TMP/SMX', presentation: 'Tabletas 160mg/800mg' },
  // Gastrointestinales
  { id: '112', name: 'Pantoprazol', activePrinciple: 'Pantoprazol', presentation: 'Tabletas 40mg' },
  { id: '113', name: 'Ranitidina', activePrinciple: 'Ranitidina', presentation: 'Tabletas 150mg' },
  { id: '114', name: 'Butilhioscina', activePrinciple: 'Butilbromuro de hioscina', presentation: 'Grageas 10mg' },
  { id: '115', name: 'Loperamida', activePrinciple: 'Loperamida', presentation: 'Tabletas 2mg' },
  { id: '116', name: 'Metoclopramida', activePrinciple: 'Metoclopramida', presentation: 'Tabletas 10mg' },
  // Cardiovasculares y Metabólicos
  { id: '117', name: 'Amlodipino', activePrinciple: 'Amlodipino', presentation: 'Tabletas 5mg' },
  { id: '118', name: 'Enalapril', activePrinciple: 'Enalapril', presentation: 'Tabletas 10mg' },
  { id: '119', name: 'Atorvastatina', activePrinciple: 'Atorvastatina', presentation: 'Tabletas 20mg' },
  { id: '120', name: 'Glibenclamida', activePrinciple: 'Glibenclamida', presentation: 'Tabletas 5mg' },
  { id: '121', name: 'Linagliptina', activePrinciple: 'Linagliptina', presentation: 'Tabletas 5mg' },
  // Sistema Nervioso
  { id: '122', name: 'Clonazepam', activePrinciple: 'Clonazepam', presentation: 'Tabletas 2mg' },
  { id: '123', name: 'Sertralina', activePrinciple: 'Sertralina', presentation: 'Tabletas 50mg' },
  { id: '124', name: 'Fluoxetina', activePrinciple: 'Fluoxetina', presentation: 'Cápsulas 20mg' },
  { id: '125', name: 'Pregabalina', activePrinciple: 'Pregabalina', presentation: 'Cápsulas 75mg' }
];

async function run() {
  try {
    for (const med of extraMeds) {
      await pool.query(
        'INSERT INTO "Medication" (id, name, "activePrinciple", presentation, "updatedAt") VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT DO NOTHING',
        [med.id, med.name, med.activePrinciple, med.presentation]
      );
    }
    console.log('25 medicamentos adicionales insertados en la base de datos.');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
