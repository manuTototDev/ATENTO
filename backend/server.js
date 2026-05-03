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
// INICIO DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`[Backend Seguro] Servidor Atento corriendo en puerto ${PORT}`);
});
