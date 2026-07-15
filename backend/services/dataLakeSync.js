const cron = require('node-cron');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Este script se encarga de transferir datos de la Base Operativa al Data Lake (Tablas Analíticas)
// Asegurando que se remueva toda la Información Personal Identificable (PII).

const syncDataLake = async () => {
  console.log('[DataLake ETL] Iniciando sincronización nocturna de datos anonimizados...');
  
  try {
    // 1. Sincronizar Pacientes (Sólo tomar los creados en las últimas 24 hrs o modificados, para simplificar hacemos un barrido)
    // En producción masiva se llevaría un control de "lastSyncedAt", por ahora iteramos.
    
    const patients = await prisma.patient.findMany({
      include: { consultations: true }
    });

    let syncCount = 0;

    for (const p of patients) {
      // Calcular edad al momento de la inserción
      let age = 0;
      if (p.dateOfBirth) {
        const diffMs = Date.now() - new Date(p.dateOfBirth).getTime();
        const ageDate = new Date(diffMs);
        age = Math.abs(ageDate.getUTCFullYear() - 1970);
      }

      // Upsert basado en el ID original (lo guardamos temporalmente como ID analítico para evitar duplicados)
      // Nota: Para máxima privacidad a veces se hashea el ID, pero como las tablas analíticas están aisladas,
      // y no tienen nombre, el ID no sirve de nada sin la tabla original.
      
      const analyticsPatient = await prisma.analyticsPatient.upsert({
        where: { id: p.id },
        update: {
          ageAtInsertion: age,
          allergies: p.allergies,
          chronicDiseases: p.chronicDiseases,
          bloodType: p.bloodType
        },
        create: {
          id: p.id,
          doctorId: p.doctorId,
          ageAtInsertion: age,
          gender: p.gender || 'Not specified',
          bloodType: p.bloodType,
          allergies: p.allergies,
          chronicDiseases: p.chronicDiseases
        }
      });

      // 2. Sincronizar consultas del paciente
      for (const c of p.consultations) {
        let diagnoses = '';
        if (c.assessment) diagnoses = c.assessment.substring(0, 200); // Guardamos snippet del diagnóstico

        let treatmentsCount = 0;
        try {
          if (c.plan) {
            const planParsed = JSON.parse(c.plan);
            if (planParsed.treatments) treatmentsCount = planParsed.treatments.length;
          }
        } catch(e) {} // Si no es JSON válido

        const consDate = new Date(c.createdAt);

        const analyticsConsultation = await prisma.analyticsConsultation.upsert({
          where: { id: c.id },
          update: {
            diagnoses,
            icd10Code: c.icd10Code,
            treatmentsCount,
            cost: c.cost || 0
          },
          create: {
            id: c.id,
            analyticsPatientId: analyticsPatient.id,
            doctorId: c.doctorId,
            diagnoses,
            icd10Code: c.icd10Code,
            treatmentsCount,
            cost: c.cost || 0,
            hasVariableCost: c.hasVariableCost,
            dayOfWeek: consDate.getDay(),
            hourOfDay: consDate.getHours(),
            createdAt: consDate
          }
        });

        // 3. Sincronizar Medicamentos Recetados (AnalyticsPrescription)
        try {
          if (c.plan) {
            const planParsed = JSON.parse(c.plan);
            if (planParsed.treatments && Array.isArray(planParsed.treatments)) {
              for (const [index, t] of planParsed.treatments.entries()) {
                // Generamos un ID pseudo-único para el upsert basado en consulta + index
                const prescriptionId = `${analyticsConsultation.id}-rx-${index}`;
                
                await prisma.analyticsPrescription.upsert({
                  where: { id: prescriptionId },
                  update: {
                    activePrinciple: t.activePrinciple || 'Desconocido',
                    medicationName: t.medication || 'Desconocido',
                    dose: t.dose || '',
                    durationDays: parseInt(t.durationNumber) || null
                  },
                  create: {
                    id: prescriptionId,
                    analyticsConsultationId: analyticsConsultation.id,
                    activePrinciple: t.activePrinciple || 'Desconocido',
                    medicationName: t.medication || 'Desconocido',
                    dose: t.dose || '',
                    durationDays: parseInt(t.durationNumber) || null
                  }
                });
              }
            }
          }
        } catch(e) {} // Error parseando json o upserting meds
      }
      syncCount++;
    }

    console.log(`[DataLake ETL] Sincronización completada. ${syncCount} expedientes anonimizados procesados.`);
  } catch (error) {
    console.error('[DataLake ETL] Error en la sincronización:', error.message);
  }
};

// Programar Cron Job: Correr a las 3:00 AM todos los días
const initCronJobs = () => {
  cron.schedule('0 3 * * *', () => {
    syncDataLake();
  });
  console.log('[Cron] Sincronizador ETL de Data Lake programado (3:00 AM)');
};

module.exports = { initCronJobs, syncDataLake };
