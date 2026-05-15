const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { GoogleGenAI } = require('@google/genai');
const { processTranscription } = require('./services/aiTranscriptionService');
const { initCronJobs, syncDataLake } = require('./services/dataLakeSync');
const { validate, schemas } = require('./validators');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
const PORT = process.env.PORT || 5000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutos

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==========================================
// SEGURIDAD — MIDDLEWARES GLOBALES
// ==========================================

app.use(helmet());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Rate limit general
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones desde esta IP.' },
});
app.use('/api', limiter);

// Rate limit estricto para login/registro (anti brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de acceso. Intenta en 15 minutos.' },
  skipSuccessfulRequests: true,
});

// ==========================================
// MIDDLEWARE DE AUTENTICACIÓN JWT
// ==========================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token de acceso requerido.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

// ==========================================
// HELPERS DE TOKEN
// ==========================================

const createAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });

const createRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ==========================================
// RUTAS DE AUTENTICACIÓN (Sin JWT)
// ==========================================

// REGISTRO
app.post('/api/auth/register', authLimiter, validate(schemas.register), async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: { firstName, lastName, email, passwordHash }
    });

    const token = createAccessToken(newUser.id);
    const refreshToken = createRefreshToken(newUser.id);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ message: 'Usuario creado exitosamente', token, userId: newUser.id });
  } catch (error) {
    console.error('[Register]', error.message);
    res.status(500).json({ error: 'Error del servidor al registrar usuario.' });
  }
});

// LOGIN
app.post('/api/auth/login', authLimiter, validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Verificar bloqueo por intentos fallidos
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil - new Date()) / 60000);
      return res.status(423).json({
        error: `Cuenta bloqueada. Intenta en ${minutesLeft} minuto${minutesLeft !== 1 ? 's' : ''}.`
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      const newAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          ...(shouldLock ? { lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS) } : {})
        }
      });
      const msg = shouldLock
        ? 'Cuenta bloqueada 30 min por múltiples intentos fallidos.'
        : 'Credenciales inválidas.';
      return res.status(401).json({ error: msg });
    }

    // Éxito: resetear contadores de seguridad
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() }
    });

    const token = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);
    setRefreshCookie(res, refreshToken);

    res.json({ message: 'Login exitoso', token, userId: user.id });
  } catch (error) {
    console.error('[Login]', error.message);
    res.status(500).json({ error: 'Error del servidor al iniciar sesión.' });
  }
});

// REFRESH TOKEN
app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token requerido.' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'Usuario no válido.' });
    }
    const newToken = createAccessToken(decoded.userId);
    res.json({ token: newToken });
  } catch {
    res.status(403).json({ error: 'Refresh token inválido o expirado. Inicia sesión de nuevo.' });
  }
});

// LOGOUT
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Sesión cerrada exitosamente.' });
});

// ONBOARDING (protegido con JWT)
app.post('/api/auth/onboarding', authenticateToken, validate(schemas.onboarding), async (req, res) => {
  try {
    const userId = req.userId; // Siempre del JWT, no del body
    const {
      specialty, licenseNumber, specialtyLicense,
      university, clinicName, clinicAddress, phoneNumber, logoBase64
    } = req.body;

    let specialtyRecord = await prisma.specialty.findUnique({ where: { name: specialty } });
    if (!specialtyRecord) specialtyRecord = await prisma.specialty.create({ data: { name: specialty } });

    let universityRecord = await prisma.university.findUnique({ where: { name: university } });
    if (!universityRecord) universityRecord = await prisma.university.create({ data: { name: university } });

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
        logoUrl: logoBase64
      }
    });

    res.status(201).json({ message: 'Perfil configurado exitosamente', profile });
  } catch (error) {
    console.error('[Onboarding]', error.message);
    res.status(500).json({ error: 'Error del servidor al configurar perfil.' });
  }
});

// ==========================================
// MÓDULO DE PACIENTES (Protegido)
// ==========================================

app.post('/api/patients', authenticateToken, validate(schemas.patient), async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, dateOfBirth, gender, phone, email, bloodType, allergies, chronicDiseases } = req.body;
    if (!firstName || !lastName || !dateOfBirth) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }
    const newPatient = await prisma.patient.create({
      data: {
        doctorId: userId,
        firstName, lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender, phone, email, bloodType,
        allergies: allergies ? [allergies] : [],
        chronicDiseases: chronicDiseases ? [chronicDiseases] : []
      }
    });
    res.status(201).json(newPatient);
  } catch (error) {
    console.error('[Patients POST]', error.message);
    res.status(500).json({ error: 'Error al crear paciente.' });
  }
});

app.delete('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Verificar que el paciente pertenece al doctor autenticado
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient || patient.doctorId !== req.userId) {
      return res.status(403).json({ error: 'Acceso no autorizado a este paciente.' });
    }
    await prisma.consultation.deleteMany({ where: { patientId: id } });
    await prisma.appointment.deleteMany({ where: { patientId: id } });
    await prisma.patient.delete({ where: { id } });
    res.json({ message: 'Paciente eliminado' });
  } catch (error) {
    console.error('[Patients DELETE]', error.message);
    res.status(500).json({ error: 'Error al eliminar paciente.' });
  }
});

app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const patients = await prisma.patient.findMany({
      where: { doctorId: userId },
      orderBy: { firstName: 'asc' },
      include: { consultations: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    const formatDate = (d) => {
      if (!d) return 'N/A';
      const date = new Date(d);
      return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
    };
    const formatted = patients.map(p => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      dob: formatDate(p.dateOfBirth),
      phone: p.phone || 'N/A',
      lastVisit: p.consultations.length > 0 ? formatDate(p.consultations[0].createdAt) : 'Sin visitas'
    }));
    res.json(formatted);
  } catch (error) {
    console.error('[Patients GET]', error.message);
    res.status(500).json({ error: 'Error al obtener pacientes.' });
  }
});

app.get('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { consultations: { orderBy: { createdAt: 'desc' } } }
    });
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado.' });
    if (patient.doctorId !== req.userId) {
      return res.status(403).json({ error: 'Acceso no autorizado a este paciente.' });
    }
    res.json(patient);
  } catch (error) {
    console.error('[Patient GET]', error.message);
    res.status(500).json({ error: 'Error al obtener detalles del paciente.' });
  }
});

// ==========================================
// MÓDULO DE IA (Protegido)
// ==========================================

app.post('/api/ai/parse-consultation', authenticateToken, async (req, res) => {
  try {
    const { transcription } = req.body;
    if (!transcription) return res.status(400).json({ error: 'Falta transcripción' });
    const parsedData = await processTranscription(transcription);
    res.json(parsedData);
  } catch (error) {
    console.error('[AI]', error.message);
    res.status(500).json({ error: 'Fallo al procesar con IA' });
  }
});

// ==========================================
// MÓDULO DE CONSULTAS (Protegido)
// ==========================================

app.post('/api/consultations', authenticateToken, validate(schemas.consultation), async (req, res) => {
  try {
    const doctorId = req.userId;
    const { patientId, soap, treatments, indications, rawTranscriptionTexto, patientHistoryUpdates, audioBase64 } = req.body;
    if (!patientId) return res.status(400).json({ error: 'Falta patientId' });

    // Verificar que el paciente pertenece al doctor autenticado
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient || patient.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Acceso no autorizado a este paciente.' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      if (patientHistoryUpdates) {
        const p = await tx.patient.findUnique({ where: { id: patientId } });
        if (p) {
          await tx.patient.update({
            where: { id: patientId },
            data: {
              allergies: Array.from(new Set([...p.allergies, ...(patientHistoryUpdates.allergies || [])])),
              chronicDiseases: Array.from(new Set([...p.chronicDiseases, ...(patientHistoryUpdates.chronicDiseases || [])])),
              currentTreatments: Array.from(new Set([...p.currentTreatments, ...(patientHistoryUpdates.currentTreatments || [])])),
              ...(patientHistoryUpdates.bloodType ? { bloodType: patientHistoryUpdates.bloodType } : {})
            }
          });
        }
      }

      const profile = await tx.doctorProfile.findUnique({ where: { userId: doctorId } });
      let consultationCost = profile?.basePrice || 800;
      let isVariable = false;

      if (profile) {
        const now = new Date();
        const day = now.getDay();
        const currentHourStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        if (day === 0) { consultationCost = profile.sundayPrice || 1500; isVariable = true; }
        else if (day === 6) { consultationCost = profile.saturdayPrice || 1000; isVariable = true; }
        else if (profile.nightTime && currentHourStr >= profile.nightTime) { consultationCost = profile.nightPrice || 1200; isVariable = true; }
      }

      const planText = soap.plan || JSON.stringify({ treatments, indications });
      return tx.consultation.create({
        data: {
          patientId, doctorId,
          subjective: soap.subjective,
          objective: soap.objective,
          assessment: soap.assessment,
          icd10Code: soap.icd10Code, // Estandarización Internacional
          plan: planText,
          rawTranscription: rawTranscriptionTexto ? { text: rawTranscriptionTexto, source: 'audio' } : null,
          cost: consultationCost,
          hasVariableCost: isVariable,
          ...(audioBase64 ? { audio: { create: { audioBase64 } } } : {}) // Guardamos audio si existe
        }
      });
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error('[Consultations POST]', error.message);
    res.status(500).json({ error: 'Error al guardar la consulta médica.' });
  }
});

// ==========================================
// MÓDULO DE INVENTARIO Y MEDICAMENTOS (Protegido)
// ==========================================

app.get('/api/medications', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) return res.json([]);
    const meds = await prisma.medication.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { activePrinciple: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10
    });
    res.json(meds);
  } catch (error) {
    console.error('[Medications]', error.message);
    res.status(500).json({ error: 'Error al buscar medicamentos.' });
  }
});

app.get('/api/inventory', authenticateToken, async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: { doctorId: req.userId },
      orderBy: { name: 'asc' }
    });
    res.json(items);
  } catch (error) {
    console.error('[Inventory GET]', error.message);
    res.status(500).json({ error: 'Error al obtener inventario.' });
  }
});

app.post('/api/inventory', authenticateToken, validate(schemas.inventory), async (req, res) => {
  try {
    const { name, description, stock, price } = req.body;
    const newItem = await prisma.inventoryItem.create({
      data: {
        doctorId: req.userId,
        name, description,
        stock: parseInt(stock),
        price: parseFloat(price)
      }
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error('[Inventory POST]', error.message);
    res.status(500).json({ error: 'Error al crear item de inventario.' });
  }
});

// ==========================================
// MÓDULO DE AGENDA (Protegido)
// ==========================================

app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: req.userId },
      orderBy: { startTime: 'asc' }
    });
    res.json(appointments);
  } catch (error) {
    console.error('[Appointments GET]', error.message);
    res.status(500).json({ error: 'Error al obtener citas.' });
  }
});

app.post('/api/appointments', authenticateToken, validate(schemas.appointment), async (req, res) => {
  try {
    const { patientName, reason, startTime, endTime } = req.body;
    const newAppointment = await prisma.appointment.create({
      data: {
        doctorId: req.userId,
        patientName, reason,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    });
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('[Appointments POST]', error.message);
    res.status(500).json({ error: 'Error al agendar cita.' });
  }
});

app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment || appointment.doctorId !== req.userId) {
      return res.status(403).json({ error: 'Acceso no autorizado a esta cita.' });
    }
    await prisma.appointment.delete({ where: { id } });
    res.json({ message: 'Cita eliminada exitosamente' });
  } catch (error) {
    console.error('[Appointments DELETE]', error.message);
    res.status(500).json({ error: 'Error al eliminar cita.' });
  }
});

// ==========================================
// MÓDULO ADMINISTRATIVO (Data Lake)
// ==========================================

app.post('/api/admin/sync-datalake', authenticateToken, async (req, res) => {
  // Nota: En producción esto debe validar que el req.userId pertenezca a un ADMIN.
  // Por ahora lo dejamos accesible para pruebas/demo.
  try {
    // Se ejecuta en background para no bloquear la petición
    syncDataLake(); 
    res.json({ message: 'Sincronización ETL del Data Lake iniciada en segundo plano.' });
  } catch (error) {
    res.status(500).json({ error: 'Fallo al iniciar sincronización' });
  }
});

// ==========================================
// MÓDULO DE ANALYTICS (Protegido)
// ==========================================

app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const [totalPatients, totalAppointments, totalConsultations, consultations] = await Promise.all([
      prisma.patient.count({ where: { doctorId: userId } }),
      prisma.appointment.count({ where: { doctorId: userId } }),
      prisma.consultation.count({ where: { doctorId: userId } }),
      prisma.consultation.findMany({ where: { doctorId: userId }, select: { cost: true } })
    ]);
    const totalEarnings = consultations.reduce((acc, curr) => acc + curr.cost, 0);
    res.json({
      totalPatients, totalAppointments, totalConsultations, totalEarnings,
      monthlyRevenue: [
        { name: 'Ene', value: 4000 }, { name: 'Feb', value: 3000 },
        { name: 'Mar', value: 2000 }, { name: 'Abr', value: 2780 },
        { name: 'May', value: totalEarnings },
      ]
    });
  } catch (error) {
    console.error('[Analytics]', error.message);
    res.status(500).json({ error: 'Error al obtener reportes.' });
  }
});

// ==========================================
// PERFIL DEL DOCTOR (Protegido)
// ==========================================

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { profile: { include: { specialty: true, university: true } } }
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    console.error('[Profile GET]', error.message);
    res.status(500).json({ error: 'Error al obtener el perfil.' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const {
      fullName, specialty, licenseNumber, specialtyLicense,
      university, clinicName, zipCode, state, city, neighborhood, street, phoneNumber, logoBase64,
      basePrice, nightPrice, nightTime, saturdayPrice, sundayPrice
    } = req.body;

    if (fullName) {
      const nameParts = fullName.split(' ');
      await prisma.user.update({
        where: { id: userId },
        data: { firstName: nameParts[0], lastName: nameParts.slice(1).join(' ') || '' }
      });
    }

    let specialtyRecordId = null;
    let universityRecordId = null;

    if (specialty) {
      let s = await prisma.specialty.findUnique({ where: { name: specialty } });
      if (!s) s = await prisma.specialty.create({ data: { name: specialty } });
      specialtyRecordId = s.id;
    }

    if (university) {
      let u = await prisma.university.findUnique({ where: { name: university } });
      if (!u) u = await prisma.university.create({ data: { name: university } });
      universityRecordId = u.id;
    }

    const existingProfile = await prisma.doctorProfile.findUnique({ where: { userId } });
    let clinicAddress = existingProfile?.clinicAddress || '';
    if (street && city && state) {
      clinicAddress = `${street}, ${neighborhood || ''}, ${city}, ${state}, CP ${zipCode || ''}`;
    } else if (req.body.clinicAddress) {
      clinicAddress = req.body.clinicAddress;
    }

    const profile = await prisma.doctorProfile.upsert({
      where: { userId },
      update: {
        ...(specialtyRecordId && { specialtyId: specialtyRecordId }),
        ...(licenseNumber && { licenseNumber }),
        ...(specialtyLicense && { specialtyLicense }),
        ...(universityRecordId && { universityId: universityRecordId }),
        ...(clinicName && { clinicName }),
        ...(clinicAddress && { clinicAddress }),
        ...(phoneNumber && { phoneNumber }),
        ...(logoBase64 && { logoUrl: logoBase64 }),
        ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }),
        ...(nightPrice !== undefined && { nightPrice: parseFloat(nightPrice) }),
        ...(nightTime !== undefined && { nightTime }),
        ...(saturdayPrice !== undefined && { saturdayPrice: parseFloat(saturdayPrice) }),
        ...(sundayPrice !== undefined && { sundayPrice: parseFloat(sundayPrice) })
      },
      create: {
        userId,
        specialtyId: specialtyRecordId,
        licenseNumber: licenseNumber || '',
        specialtyLicense: specialtyLicense || '',
        universityId: universityRecordId,
        clinicName: clinicName || '',
        clinicAddress: clinicAddress || '',
        phoneNumber: phoneNumber || '',
        logoUrl: logoBase64 || '',
        basePrice: basePrice !== undefined ? parseFloat(basePrice) : 800,
        nightPrice: nightPrice !== undefined ? parseFloat(nightPrice) : 1200,
        nightTime: nightTime || '20:00',
        saturdayPrice: saturdayPrice !== undefined ? parseFloat(saturdayPrice) : 1000,
        sundayPrice: sundayPrice !== undefined ? parseFloat(sundayPrice) : 1500
      }
    });

    res.json({ message: 'Perfil actualizado exitosamente', profile });
  } catch (error) {
    console.error('[Profile PUT]', error.message);
    res.status(500).json({ error: 'Error del servidor al actualizar perfil.' });
  }
});

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
initCronJobs(); // Iniciar tareas programadas (ETL Data Lake)

app.listen(PORT, () => {
  console.log(`[Latento — Totot Estudio] Servidor corriendo en puerto ${PORT} · Modo: ${process.env.NODE_ENV}`);
});
