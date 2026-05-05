const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { GoogleGenAI } = require('@google/genai');
const { processTranscription } = require('./services/aiTranscriptionService');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

// LOGIN DE USUARIO
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Crear token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: 'Login exitoso', token, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor al iniciar sesión.' });
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
// MÓDULO DE PACIENTES
// ==========================================

// Crear paciente
app.post('/api/patients', async (req, res) => {
  try {
    const { userId, firstName, lastName, dateOfBirth, gender, phone, email, bloodType, allergies, chronicDiseases } = req.body;
    if (!userId || !firstName || !lastName || !dateOfBirth) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    const newPatient = await prisma.patient.create({
      data: {
        doctorId: userId,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phone,
        email,
        bloodType,
        allergies: allergies ? [allergies] : [],
        chronicDiseases: chronicDiseases ? [chronicDiseases] : []
      }
    });

    res.status(201).json(newPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear paciente.' });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Opcional: borrar consultas relacionadas antes, si no hay cascade
    await prisma.consultation.deleteMany({ where: { patientId: id } });
    await prisma.appointment.deleteMany({ where: { patientId: id } });
    await prisma.patient.delete({ where: { id } });
    res.json({ message: 'Paciente eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar paciente.' });
  }
});

app.get('/api/patients', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId es requerido' });

    const patients = await prisma.patient.findMany({
      where: { doctorId: userId },
      orderBy: { firstName: 'asc' },
      include: { consultations: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    
    // Formateamos para el frontend
    const formatted = patients.map(p => {
      const formatDate = (d) => {
        if (!d) return 'N/A';
        const date = new Date(d);
        // Ajuste manual para evitar zonas horarias y mostrar DD/MM/YYYY
        return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
      };

      return {
        id: p.id,
        name: `${p.firstName} ${p.lastName}`,
        dob: formatDate(p.dateOfBirth),
        phone: p.phone || 'N/A',
        lastVisit: p.consultations.length > 0 ? formatDate(p.consultations[0].createdAt) : 'Sin visitas'
      };
    });
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pacientes.' });
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        consultations: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Paciente no encontrado.' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    res.status(500).json({ error: 'Error al obtener detalles del paciente.' });
  }
});

// ==========================================
// MÓDULO DE IA (GEMINI)
// ==========================================

app.post('/api/ai/parse-consultation', async (req, res) => {
  try {
    const { transcription } = req.body;
    if (!transcription) return res.status(400).json({ error: 'Falta transcripción' });

    // 1. Usar el nuevo servicio validado con Zod
    const parsedData = await processTranscription(transcription);
    
    // Devolvemos el JSON estructurado al Frontend
    res.json(parsedData);
  } catch (error) {
    console.error('Error de IA:', error);
    res.status(500).json({ error: 'Fallo al procesar con IA' });
  }
});

// ==========================================
// MÓDULO DE CONSULTAS (GUARDADO FINAL)
// ==========================================

app.post('/api/consultations', async (req, res) => {
  try {
    const { patientId, doctorId, soap, treatments, indications, rawTranscriptionTexto, patientHistoryUpdates } = req.body;
    
    if (!patientId || !doctorId) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      // A) Actualizar Historial Clínico del Paciente
      if (patientHistoryUpdates) {
        // En Prisma, los arreglos de String[] se sobrescriben o se debe hacer un fetch previo.
        // Lo más seguro es obtener el paciente y concatenar, o simplemente dejar que el frontend
        // nos mande lo que ya tenía más lo nuevo. Si confiamos en patientHistoryUpdates, agregamos.
        const patient = await tx.patient.findUnique({ where: { id: patientId } });
        if (patient) {
          const newAllergies = Array.from(new Set([...patient.allergies, ...(patientHistoryUpdates.allergies || [])]));
          const newDiseases = Array.from(new Set([...patient.chronicDiseases, ...(patientHistoryUpdates.chronicDiseases || [])]));
          const newTreatments = Array.from(new Set([...patient.currentTreatments, ...(patientHistoryUpdates.currentTreatments || [])]));
          
          await tx.patient.update({
            where: { id: patientId },
            data: {
              allergies: newAllergies,
              chronicDiseases: newDiseases,
              currentTreatments: newTreatments,
              ...(patientHistoryUpdates.bloodType ? { bloodType: patientHistoryUpdates.bloodType } : {})
            }
          });
        }
      }

      // B) Guardar la Consulta y la Transcripción Cruda
      // Como Prisma Schema guardará el plan médico, concatenamos treatments e indications en el 'plan' si no vienen como campos separados.
      const planText = soap.plan || JSON.stringify({ treatments, indications });

      const nuevaConsulta = await tx.consultation.create({
        data: {
          patientId,
          doctorId,
          subjective: soap.subjective,
          objective: soap.objective,
          assessment: soap.assessment,
          plan: planText,
          rawTranscription: rawTranscriptionTexto ? { text: rawTranscriptionTexto, source: "audio" } : null
        }
      });
      return nuevaConsulta;
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error('Error al guardar consulta:', error);
    res.status(500).json({ error: 'Error al guardar la consulta médica.' });
  }
});

// ==========================================
// MÓDULO DE INVENTARIO Y MEDICAMENTOS
// ==========================================

app.get('/api/medications', async (req, res) => {
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
    console.error(error);
    res.status(500).json({ error: 'Error al buscar medicamentos.' });
  }
});

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

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id } });
    res.json({ message: 'Cita eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cita.' });
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
// GET DOCTOR PROFILE
// ==========================================
app.get('/api/profile', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Falta userId' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        profile: {
          include: { specialty: true }
        } 
      }
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el perfil.' });
  }
});

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`[Backend Seguro] Servidor Atento corriendo en puerto ${PORT}`);
});
