import React, { useState, useEffect } from 'react';
import { Download, Printer, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api';

const PrescriptionView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { patient: statePatient, treatments, indications, soap } = location.state || {};
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [patient, setPatient] = useState(statePatient || null);

  const calculateAge = (dobString) => {
    if (!dobString) return '--';
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return '--';
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const profileRes = await apiFetch('/api/profile');
        if (!cancelled && profileRes.ok) {
          setDoctorProfile(await profileRes.json());
        }
      } catch (err) {
        console.error('Error fetching profile', err);
      }

      // Solo buscar al paciente si no llegó por location.state y el id es un registro real
      if (!statePatient && id && id !== 'new') {
        try {
          const patientRes = await apiFetch(`/api/patients/${id}`);
          if (!cancelled && patientRes.ok) {
            setPatient(await patientRes.json());
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fieldLabelStyle = { color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.2rem' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface-alt)' }}>

      {/* HEADER / ACTIONS (No se imprime) */}
      <div className="no-print" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-5) clamp(1.25rem, 4vw, 3rem)',
        backgroundColor: 'var(--bg-color)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}>
        <button onClick={() => navigate('/dashboard')} className="btn-ghost" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Volver al Inicio
        </button>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button onClick={() => window.print()} className="btn-secondary" style={{ width: 'auto' }}>
            <Download size={18} /> Descargar PDF
          </button>
          <button onClick={() => window.print()} className="btn-primary" style={{ width: 'auto' }}>
            <Printer size={18} /> Imprimir
          </button>
        </div>
      </div>

      {/* DOCUMENTO RECETA MÉDICA (Formato A4 aprox) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(1.25rem, 4vw, 3rem) clamp(1rem, 3vw, 1.5rem)' }}
      >
        <div
          className="printable-prescription"
          style={{
            background: 'var(--card-bg)',
            minHeight: '1050px',
            padding: '3rem',
            position: 'relative',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)'
          }}
        >

          {/* Header Doctor */}
          <div style={{ borderBottom: '2px solid var(--text-dark)', paddingBottom: 'var(--space-5)', marginBottom: 'var(--space-6)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.03em', margin: '0 0 0.25rem 0', lineHeight: 1 }}>
                Dr. {doctorProfile?.firstName || ''} {doctorProfile?.lastName || ''}
              </h1>
              <p style={{ color: 'var(--text-dark)', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>
                {doctorProfile?.profile?.specialty?.name || ''}
              </p>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                {doctorProfile?.profile?.university?.name || doctorProfile?.profile?.university || ''}
                {(doctorProfile?.profile?.university?.name || doctorProfile?.profile?.university) && <br />}
                {doctorProfile?.profile?.licenseNumber
                  ? <>Céd. Prof. {doctorProfile.profile.licenseNumber}</>
                  : null}
                {doctorProfile?.profile?.specialtyLicense ? ` | Céd. Esp. ${doctorProfile.profile.specialtyLicense}` : ''}
              </div>
              {!doctorProfile?.profile?.licenseNumber && (
                <div className="no-print" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                  marginTop: 'var(--space-2)', padding: '0.35rem 0.75rem',
                  background: 'var(--error-bg)', color: 'var(--error)',
                  borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700
                }}>
                  <AlertTriangle size={14} /> Falta cédula profesional — completa tu perfil antes de imprimir
                </div>
              )}
            </div>
            <div style={{ width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
              {doctorProfile?.profile?.logoUrl ? (
                <img src={doctorProfile.profile.logoUrl} alt="Logo de la clínica" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center', textTransform: 'uppercase' }}>
                  Logo
                </div>
              )}
            </div>
          </div>

          {/* Datos Paciente */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', fontSize: '0.875rem', marginBottom: 'var(--space-6)' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <strong style={fieldLabelStyle}>Paciente</strong>
              <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{patient ? `${patient.firstName || patient.name || ''} ${patient.lastName || ''}`.trim() : 'Cargando...'}</div>
            </div>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border)' }}>
              <strong style={fieldLabelStyle}>Fecha</strong>
              <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{new Date().toLocaleDateString('es-MX')}</div>
            </div>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <strong style={fieldLabelStyle}>Fecha de Nacimiento</strong>
              <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                {patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('es-MX', { timeZone: 'UTC' }) : (patient?.dob || '--')}
              </div>
            </div>
            <div style={{ padding: 'var(--space-4)' }}>
              <strong style={fieldLabelStyle}>Edad</strong>
              <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                {patient?.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} años` : (patient?.dob ? `${calculateAge(patient.dob.split('/').reverse().join('-'))} años` : '--')}
              </div>
            </div>
            <div style={{ padding: 'var(--space-4)', gridColumn: '1 / -1', borderTop: '1px solid var(--border)' }}>
              <strong style={fieldLabelStyle}>Diagnóstico</strong>
              <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{soap?.assessment || 'No especificado'}</div>
            </div>
          </div>

          {/* Medicamentos */}
          <div style={{ minHeight: '200px', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 'var(--space-5)', letterSpacing: '-0.05em', lineHeight: 1 }}>
              Rx.
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {treatments && treatments.length > 0 ? treatments.map((t, i) => (
                <div key={i} style={{ paddingLeft: 'var(--space-4)', borderLeft: '3px solid var(--text-dark)' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>{t.medication}</div>
                  <div style={{ color: 'var(--text-dark)', fontSize: '0.875rem' }}>
                    Tomar <span style={{ fontWeight: 600 }}>{t.dose}</span> cada <span style={{ fontWeight: 600 }}>{t.frequencyNumber} {t.frequencyUnit}</span> por <span style={{ fontWeight: 600 }}>{t.durationNumber} {t.durationUnit}</span>.
                  </div>
                </div>
              )) : (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>Sin prescripción farmacológica.</div>
              )}
            </div>
          </div>

          {/* Indicaciones Generales */}
          {indications && indications.length > 0 && (
            <div style={{ minHeight: '100px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-2)' }}>
                Indicaciones Generales
              </h2>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', color: 'var(--text-dark)', fontSize: '0.875rem' }}>
                {indications.map((ind, i) => (
                  <li key={i}>
                    <strong style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', marginRight: 'var(--space-2)', color: 'var(--text-muted)' }}>[{ind.type}]</strong> {ind.instruction}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Firmas */}
          <div style={{ position: 'absolute', bottom: '3rem', left: '3rem', right: '3rem', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-5)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text-dark)', fontSize: '0.875rem', textTransform: 'uppercase' }}>{doctorProfile?.profile?.clinicName || 'Clínica / Consultorio'}</strong><br />
              {doctorProfile?.profile?.clinicAddress || 'Dirección no registrada'}<br />
              Tel: {doctorProfile?.profile?.phoneNumber || 'No registrado'}
            </div>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ borderBottom: '1px solid var(--text-dark)', height: '50px', marginBottom: 'var(--space-2)' }}></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Firma del Médico</div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default PrescriptionView;
