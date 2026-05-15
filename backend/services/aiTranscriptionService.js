const { GoogleGenAI } = require('@google/genai');
const { z } = require('zod');

// Inicializar el cliente de Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. Definimos nuestro esquema usando las mejores prácticas de Zod
// Esto sirve como nuestra "fuente de verdad" para la estructura de datos
const ConsultationSchema = z.object({
  soap: z.object({
    subjective: z.string().describe("Síntomas, motivo de consulta, y lo que refiere el paciente."),
    objective: z.string().describe("Signos vitales, exploración física y observaciones clínicas."),
    assessment: z.string().describe("Diagnóstico o evaluación clínica en texto libre."),
    icd10Code: z.string().optional().describe("Código oficial internacional CIE-10 (ICD-10) que mejor clasifique el diagnóstico principal."),
    plan: z.string().describe("Tratamiento a seguir, medicamentos recetados y próximas citas."),
  }).optional(),
  treatments: z.array(z.object({
    activePrinciple: z.string().describe("El ingrediente o principio activo principal del medicamento (ej. Paracetamol, Amoxicilina)."),
    medication: z.string().describe("El nombre comercial o recetado."),
    dose: z.coerce.string(),
    frequencyNumber: z.coerce.string(),
    frequencyUnit: z.enum(['horas', 'días']).or(z.string()),
    durationNumber: z.coerce.string(),
    durationUnit: z.enum(['días', 'semanas', 'meses']).or(z.string())
  })).optional().describe("Lista de medicamentos recetados."),
  indications: z.array(z.object({
    type: z.enum(['General', 'Dieta', 'Reposo', 'Cuidados', 'Signos de Alarma']).or(z.string()),
    instruction: z.coerce.string()
  })).optional().describe("Indicaciones generales no farmacológicas."),
  patientHistoryUpdates: z.object({
    bloodType: z.string().nullable().optional(),
    allergies: z.array(z.string()).optional(),
    chronicDiseases: z.array(z.string()).optional(),
    currentTreatments: z.array(z.string()).optional()
  }).optional().describe("Nuevos datos clínicos extraídos que deben agregarse al expediente histórico del paciente.")
});

/**
 * Procesa una transcripción cruda usando Gemini, y valida la salida con Zod
 * @param {string} rawTranscriptionTexto - El texto crudo de lo hablado en la consulta
 * @returns {Promise<z.infer<typeof ConsultationSchema>>} Objeto validado
 */
async function processTranscription(rawTranscriptionTexto) {
  try {
    const prompt = `
      Eres un asistente médico experto. Analiza la siguiente transcripción cruda de una consulta médica.
      Tu objetivo es estructurar la información en el estándar médico SOAP (Subjective, Objective, Assessment, Plan).
      También extrae los tratamientos médicos ("treatments") y las indicaciones no farmacológicas ("indications").
      Además, extrae cualquier información relevante que deba agregarse al historial clínico persistente del paciente (como alergias, enfermedades crónicas, o tipo de sangre).
      
      Debes responder estrictamente en formato JSON válido que cumpla con la siguiente estructura:
      {
        "soap": {
          "subjective": "...",
          "objective": "...",
          "assessment": "...",
          "icd10Code": "A09.9",
          "plan": "..."
        },
        "treatments": [
          { "activePrinciple": "Ibuprofeno", "medication": "Advil 400mg", "dose": "1 tableta", "frequencyNumber": "8", "frequencyUnit": "horas", "durationNumber": "5", "durationUnit": "días" }
        ],
        "indications": [
          { "type": "Dieta", "instruction": "Descripción" }
        ],
        "patientHistoryUpdates": {
          "bloodType": "...", 
          "allergies": ["..."], 
          "chronicDiseases": ["..."], 
          "currentTreatments": ["..."] 
        }
      }
      (Nota: Si algún dato de patientHistoryUpdates no se menciona, omítelo o déjalo vacío).

      Transcripción:
      """
      ${rawTranscriptionTexto}
      """
    `;

    // 2. Llamada a Gemini usando "JSON Mode" para garantizar la sintaxis JSON
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Recomendado para extracción compleja
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsedJson = JSON.parse(response.text);

    // 3. Validación y Casteo con Zod (Práctica robusta de Data Engineering)
    // Esto asegura que los datos están listos y seguros para insertarse en la DB
    const validatedData = ConsultationSchema.parse(parsedJson);

    return validatedData;

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Error de validación (Zod): El JSON de Gemini no cumplió el esquema.", JSON.stringify(error.errors, null, 2));
      throw new Error("El formato de los datos extraídos de la transcripción es inválido.");
    }
    console.error("Error procesando la transcripción con Gemini:", error);
    throw error;
  }
}

module.exports = {
  ConsultationSchema,
  processTranscription
};
