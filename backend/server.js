const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==========================================
// MÁXIMA SEGURIDAD DESDE EL DÍA 1
// ==========================================

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Incrementado para permitir subida de Base64 (Logo)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Demasiadas peticiones desde esta IP.',
});
app.use('/api', limiter);

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

// REGISTRO DE USUARIO
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Verificar si existe el usuario
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // Hashear contraseña (Salt rounds = 12 para alta seguridad médica)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario en BD
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash
      }
    });

    // Crear token para auto-login tras registrarse
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ message: 'Usuario creado exitosamente', token, userId: newUser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor al registrar usuario.' });
  }
});

// ONBOARDING DEL DOCTOR (Datos de Receta)
app.post('/api/auth/onboarding', async (req, res) => {
  try {
    const { 
      userId, specialty, licenseNumber, specialtyLicense, 
      university, clinicName, clinicAddress, phoneNumber, logoBase64 
    } = req.body;

    // Buscar o crear la especialidad y universidad en las tablas catálogo
    let specialtyRecord = await prisma.specialty.findUnique({ where: { name: specialty } });
    if (!specialtyRecord) {
      specialtyRecord = await prisma.specialty.create({ data: { name: specialty } });
    }

    let universityRecord = await prisma.university.findUnique({ where: { name: university } });
    if (!universityRecord) {
      universityRecord = await prisma.university.create({ data: { name: university } });
    }

    // Crear perfil del doctor vinculado al usuario
    const profile = await prisma.doctorProfile.create({
      data: {
        userId,
        specialtyId: specialtyRecord.id,
        licenseNumber,
        specialtyLicense,
        universityId: universityRecord.id,
        clinicName,
        clinicAddress,
        phoneNumber,
        logoUrl: logoBase64 // Se guarda en Base64 según requerimiento
      }
    });

    res.status(201).json({ message: 'Perfil configurado exitosamente', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor al configurar perfil.' });
  }
});

// ==========================================
// MÓDULO DE INVENTARIO
// ==========================================

app.get('/api/inventory', async (req, res) => {
  try {
    const { userId } = req.query; // En producción, esto vendría del JWT
    if (!userId) return res.status(400).json({ error: 'userId es requerido' });

    const items = await prisma.inventoryItem.findMany({
      where: { doctorId: userId },
      orderBy: { name: 'asc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener inventario.' });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const { userId, name, description, stock, price } = req.body;
    
    const newItem = await prisma.inventoryItem.create({
      data: {
        doctorId: userId,
        name,
        description,
        stock: parseInt(stock),
        price: parseFloat(price)
      }
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear item de inventario.' });
  }
});

// ==========================================
// MÓDULO DE AGENDA (CITAS)
// ==========================================

app.get('/api/appointments', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId es requerido' });

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: userId },
      orderBy: { startTime: 'asc' }
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener citas.' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const { userId, patientName, reason, startTime, endTime } = req.body;
    
    const newAppointment = await prisma.appointment.create({
      data: {
        doctorId: userId,
        patientName,
        reason,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    });
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: 'Error al agendar cita.' });
  }
});

// ==========================================
// MÓDULO DE REPORTES (ANALYTICS)
// ==========================================

app.get('/api/analytics', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId es requerido' });

    // Simulando agregaciones complejas por ahora (MVP)
    // En el futuro: agrupar Consultations por fecha, sumar 'cost'.
    const totalPatients = await prisma.patient.count({ where: { doctorId: userId } });
    const totalAppointments = await prisma.appointment.count({ where: { doctorId: userId } });
    const totalConsultations = await prisma.consultation.count({ where: { doctorId: userId } });
    
    // Obtener ingresos totales (Suma de cost de todas las consultas)
    const consultations = await prisma.consultation.findMany({
      where: { doctorId: userId },
      select: { cost: true }
    });
    const totalEarnings = consultations.reduce((acc, curr) => acc + curr.cost, 0);

    res.json({
      totalPatients,
      totalAppointments,
      totalConsultations,
      totalEarnings,
      // Datos mock para las gráficas
      monthlyRevenue: [
        { name: 'Ene', value: 4000 },
        { name: 'Feb', value: 3000 },
        { name: 'Mar', value: 2000 },
        { name: 'Abr', value: 2780 },
        { name: 'May', value: totalEarnings },
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reportes.' });
  }
});

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`[Backend Seguro] Servidor Atento corriendo en puerto ${PORT}`);
});
