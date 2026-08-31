import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

const PatientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await apiFetch(`/api/patients/${id}`);
        if (!res.ok) throw new Error('Error al obtener datos del paciente');
        const data = await res.json();
        setPatient(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="patient-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-6)' }}>
          <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-lg)' }} />
        </div>
        <style>{`@media (max-width: 860px) { .patient-detail-grid { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <button onClick={() => navigate('/patients')} className="btn-ghost" style={{ marginBottom: 'var(--space-5)', paddingLeft: 0 }}>
          <ArrowLeft size={18} /> Volver al Directorio
        </button>
        <div className="empty-state" style={{ color: 'var(--error)' }}>
          <strong>{error}</strong>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ padding: '2rem' }}>
        <button onClick={() => navigate('/patients')} className="btn-ghost" style={{ marginBottom: 'var(--space-5)', paddingLeft: 0 }}>
          <ArrowLeft size={18} /> Volver al Directorio
        </button>
        <div className="empty-state">
          <User size={32} />
          <strong style={{ color: 'var(--text-dark)' }}>Paciente no encontrado</strong>
        </div>
      </div>
    );
  }

  // Calcular edad (diferencia real de años, ajustando si aún no cumple años este año)
  const dob = new Date(patient.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getUTCFullYear();
  const hasBirthdayPassed =
    today.getMonth() > dob.getUTCMonth() ||
    (today.getMonth() === dob.getUTCMonth() && today.getDate() >= dob.getUTCDate());
  if (!hasBirthdayPassed) age -= 1;

  const formatDate = (d) => {
    const date = new Date(d);
    return `${date.getUTCDate().toString().padStart(2, '0')} de ${['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/patients')} className="btn-ghost" style={{ marginBottom: 'var(--space-5)', paddingLeft: 0 }}>
        <ArrowLeft size={18} /> Volver al Directorio
      </button>

      <div className="patient-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-6)', alignItems: 'start' }}>

        {/* Perfil del Paciente */}
        <motion.div
          className="dashboard-panel"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-full)', background: 'var(--input-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
              <User size={32} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>{patient.firstName} {patient.lastName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{age} años · {patient.gender}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sangre</span>
              <span style={{ fontWeight: 600, color: 'var(--error)' }}>{patient.bloodType || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Teléfono</span>
              <span style={{ fontWeight: 600, textAlign: 'right' }}>{patient.phone || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Alergias</span>
              <span style={{ fontWeight: 600, color: 'var(--error)', textAlign: 'right' }}>
                {patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'Ninguna registrada'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Enf. Crónicas</span>
              <span style={{ fontWeight: 600, textAlign: 'right' }}>
                {patient.chronicDiseases?.length > 0 ? patient.chronicDiseases.join(', ') : 'Ninguna registrada'}
              </span>
            </div>
          </div>

          <motion.button
            className="btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-6)' }}
            onClick={() => navigate(`/consultation/${id}`)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            Iniciar Consulta
          </motion.button>
        </motion.div>

        {/* Historial Clínico */}
        <motion.div
          className="dashboard-panel"
          custom={0.06}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <h2 className="panel-title" style={{ marginBottom: 'var(--space-5)' }}>Historial Clínico</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {patient.consultations && patient.consultations.length > 0 ? (
              patient.consultations.map(consult => (
                <div key={consult.id} style={{ padding: 'var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--input-bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: 'var(--space-2)' }}>
                    <strong style={{ color: 'var(--primary)' }}>{formatDate(consult.createdAt)}</strong>
                    <span className="status-badge status-completed">Completada</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: 'var(--space-2)' }}>
                    <strong>Motivo:</strong> {consult.subjective || 'Sin registro detallado.'}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <strong>Diagnóstico:</strong> {consult.assessment || 'Sin diagnóstico detallado.'}
                  </p>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FileText size={32} />
                <span>Este paciente aún no tiene consultas registradas.</span>
              </div>
            )}
          </div>
        </motion.div>

      </div>

      <style>{`
        @media (max-width: 860px) {
          .patient-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PatientDetail;
