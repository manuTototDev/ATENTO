const { z } = require('zod');

// Middleware generico para validar cualquier esquema
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ 
      error: 'Datos inválidos', 
      details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
    });
  }
};

const registerSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

const onboardingSchema = z.object({
  specialty: z.string().min(2, "Especialidad es requerida"),
  licenseNumber: z.string().min(3, "Cédula profesional es requerida"),
  specialtyLicense: z.string().optional().nullable(),
  university: z.string().min(2, "Universidad es requerida"),
  clinicName: z.string().min(2, "Nombre de clínica es requerido"),
  clinicAddress: z.string().min(5, "Dirección de clínica es requerida"),
  phoneNumber: z.string().min(10, "Número de teléfono inválido"),
  logoBase64: z.string().optional().nullable(),
});

const patientSchema = z.object({
  firstName: z.string().min(2, "El nombre es requerido"),
  lastName: z.string().min(2, "El apellido es requerido"),
  dateOfBirth: z.string().datetime({ offset: true }).or(z.string()), // Acepta ISO o similar
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal('')),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
});

const consultationSchema = z.object({
  patientId: z.string().uuid("ID de paciente inválido"),
  soap: z.object({
    subjective: z.string().optional(),
    objective: z.string().optional(),
    assessment: z.string().optional(),
    icd10Code: z.string().optional(),
    plan: z.string().optional()
  }).optional(),
  treatments: z.array(z.any()).optional(),
  indications: z.array(z.any()).optional(),
  rawTranscriptionTexto: z.string().optional(),
  patientHistoryUpdates: z.any().optional(),
  audioBase64: z.string().optional()
});

const inventorySchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  description: z.string().optional(),
  stock: z.union([z.string(), z.number()]).transform(val => parseInt(val)).refine(val => !isNaN(val) && val >= 0, "Stock inválido"),
  price: z.union([z.string(), z.number()]).transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= 0, "Precio inválido"),
});

const appointmentSchema = z.object({
  patientName: z.string().min(2, "El nombre del paciente es requerido"),
  reason: z.string().min(2, "El motivo es requerido"),
  startTime: z.string().datetime({ offset: true }).or(z.string()),
  endTime: z.string().datetime({ offset: true }).or(z.string()),
});

module.exports = {
  validate,
  schemas: {
    register: registerSchema,
    login: loginSchema,
    onboarding: onboardingSchema,
    patient: patientSchema,
    consultation: consultationSchema,
    inventory: inventorySchema,
    appointment: appointmentSchema
  }
};
