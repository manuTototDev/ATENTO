require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando el script de Seed para la base de datos de Atentia...');

  // 1. Obtener al primer doctor de la base de datos
  const doctor = await prisma.user.findFirst({
    where: { role: 'DOCTOR' }
  });

  if (!doctor) {
    console.error('⚠️ No se encontró ningún doctor en la base de datos. Crea un usuario primero desde la app.');
    return;
  }

  const doctorId = doctor.id;
  console.log(`Usando al doctor con ID: ${doctorId} y correo: ${doctor.email}`);

  // 2. Limpiar datos existentes (Opcional, pero recomendado para evitar duplicados en pruebas)
  // await prisma.consultation.deleteMany({ where: { doctorId } });
  // await prisma.appointment.deleteMany({ where: { doctorId } });
  // await prisma.patient.deleteMany({ where: { doctorId } });
  // await prisma.inventoryItem.deleteMany({ where: { doctorId } });

  // 3. Crear 20 Pacientes Falsos
  const fakePatients = [
    { firstName: 'Juan', lastName: 'Pérez García', gender: 'M', bloodType: 'O+', allergies: ['Polen'], chronicDiseases: ['Hipertensión'] },
    { firstName: 'María', lastName: 'López Gómez', gender: 'F', bloodType: 'A+', allergies: ['Penicilina', 'Sulfa'], chronicDiseases: ['Asma Leve'] },
    { firstName: 'Carlos', lastName: 'Ramírez Soto', gender: 'M', bloodType: 'B-', allergies: [], chronicDiseases: [] },
    { firstName: 'Ana', lastName: 'Silva Cruz', gender: 'F', bloodType: 'O-', allergies: ['Mariscos'], chronicDiseases: ['Diabetes Tipo 2'] },
    { firstName: 'Luis', lastName: 'Fernández Ruiz', gender: 'M', bloodType: 'AB+', allergies: [], chronicDiseases: [] },
    { firstName: 'Elena', lastName: 'Torres Flores', gender: 'F', bloodType: 'A-', allergies: ['Ibuprofeno'], chronicDiseases: ['Hipotiroidismo'] },
    { firstName: 'Roberto', lastName: 'Gómez Sánchez', gender: 'M', bloodType: 'O+', allergies: [], chronicDiseases: [] },
    { firstName: 'Laura', lastName: 'Díaz Morales', gender: 'F', bloodType: 'A+', allergies: ['Látex'], chronicDiseases: [] },
    { firstName: 'Jorge', lastName: 'Ortiz Reyes', gender: 'M', bloodType: 'B+', allergies: [], chronicDiseases: ['Artritis Reumatoide'] },
    { firstName: 'Patricia', lastName: 'Ramos Vargas', gender: 'F', bloodType: 'O+', allergies: [], chronicDiseases: [] },
    { firstName: 'Miguel', lastName: 'Castro Medina', gender: 'M', bloodType: 'O-', allergies: ['Ácaros'], chronicDiseases: [] },
    { firstName: 'Sofia', lastName: 'Herrera Guzmán', gender: 'F', bloodType: 'AB-', allergies: [], chronicDiseases: ['Ansiedad'] },
    { firstName: 'Ricardo', lastName: 'Mendoza Aguilar', gender: 'M', bloodType: 'A+', allergies: ['Nueces'], chronicDiseases: [] },
    { firstName: 'Teresa', lastName: 'Jiménez Vega', gender: 'F', bloodType: 'O+', allergies: [], chronicDiseases: ['Osteoporosis'] },
    { firstName: 'Fernando', lastName: 'Ruiz Silva', gender: 'M', bloodType: 'B-', allergies: [], chronicDiseases: [] },
    { firstName: 'Carmen', lastName: 'Vargas Romero', gender: 'F', bloodType: 'A-', allergies: [], chronicDiseases: [] },
    { firstName: 'Alejandro', lastName: 'Rojas Peña', gender: 'M', bloodType: 'O+', allergies: ['Polvo'], chronicDiseases: [] },
    { firstName: 'Isabel', lastName: 'Navarro Soto', gender: 'F', bloodType: 'A+', allergies: [], chronicDiseases: [] },
    { firstName: 'Daniel', lastName: 'Morales Cruz', gender: 'M', bloodType: 'AB+', allergies: [], chronicDiseases: [] },
    { firstName: 'Rosa', lastName: 'Gutiérrez Luna', gender: 'F', bloodType: 'O+', allergies: ['Aspirina'], chronicDiseases: [] }
  ];

  console.log('Creando 20 pacientes...');
  const createdPatients = [];
  for (let i = 0; i < fakePatients.length; i++) {
    const p = fakePatients[i];
    // Generar fecha de nacimiento aleatoria entre 1950 y 2005
    const year = Math.floor(Math.random() * (2005 - 1950 + 1)) + 1950;
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    
    const newPatient = await prisma.patient.create({
      data: {
        doctorId,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: new Date(year, month, day),
        gender: p.gender,
        phone: `55 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
        email: `${p.firstName.toLowerCase()}.${p.lastName.split(' ')[0].toLowerCase()}@correo.com`,
        bloodType: p.bloodType,
        allergies: p.allergies,
        chronicDiseases: p.chronicDiseases
      }
    });
    createdPatients.push(newPatient);
  }

  // 4. Crear Consultas Pasadas para Analíticas
  console.log('Creando consultas históricas...');
  const reasons = ['Dolor de cabeza', 'Fiebre', 'Chequeo general', 'Dolor abdominal', 'Infección respiratoria'];
  
  for (let i = 0; i < 30; i++) {
    const randomPatient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
    // Fecha aleatoria en los últimos 3 meses
    const randomDaysAgo = Math.floor(Math.random() * 90);
    const consultDate = new Date();
    consultDate.setDate(consultDate.getDate() - randomDaysAgo);

    await prisma.consultation.create({
      data: {
        doctorId,
        patientId: randomPatient.id,
        subjective: reasons[Math.floor(Math.random() * reasons.length)],
        objective: 'Paciente consciente, orientado, signos vitales estables.',
        assessment: 'Diagnóstico preliminar.',
        plan: 'Reposo y medicación.',
        cost: Math.floor(500 + Math.random() * 500), // Costo entre 500 y 1000
        createdAt: consultDate
      }
    });
  }

  // 5. Crear Citas Agendadas
  console.log('Creando citas en la agenda...');
  for (let i = 0; i < 15; i++) {
    const randomPatient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
    // Fecha aleatoria en los próximos 15 días
    const randomDaysAhead = Math.floor(Math.random() * 15);
    const hour = Math.floor(8 + Math.random() * 10); // 8 AM a 6 PM
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + randomDaysAhead);
    startDate.setHours(hour, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(hour + 1);

    await prisma.appointment.create({
      data: {
        doctorId,
        patientId: randomPatient.id,
        patientName: `${randomPatient.firstName} ${randomPatient.lastName}`,
        reason: 'Revisión de seguimiento',
        startTime: startDate,
        endTime: endDate,
        status: 'SCHEDULED'
      }
    });
  }

  // 6. Crear Ítems de Inventario
  console.log('Creando inventario...');
  const inventoryItems = [
    { name: 'Paracetamol 500mg', description: 'Caja con 20 tabletas', stock: 50, price: 50 },
    { name: 'Amoxicilina 500mg', description: 'Caja con 12 cápsulas', stock: 3, price: 120 }, // Low stock
    { name: 'Ibuprofeno 400mg', description: 'Caja con 10 grageas', stock: 25, price: 80 },
    { name: 'Loratadina 10mg', description: 'Caja con 10 tabletas', stock: 4, price: 45 }, // Low stock
    { name: 'Jeringas 5ml', description: 'Caja con 100 unidades', stock: 200, price: 5 }
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({
      data: {
        doctorId,
        name: item.name,
        description: item.description,
        stock: item.stock,
        price: item.price
      }
    });
  }

  console.log('✅ Base de datos poblada exitosamente con datos falsos para pruebas.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
