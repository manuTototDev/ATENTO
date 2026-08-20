import React, { useState, useEffect } from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';

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

  if (loading) return <div style={{ padding: '2rem' }}>Cargando expediente...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  if (!patient) return <div style={{ padding: '2rem' }}>Paciente no encontrado.</div>;

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
      <button onClick={() => navigate('/patients')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> Volver al Directorio
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Perfil del Paciente */}
        <div className="dashboard-panel" style={{ alignSelf: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <User size={40} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-dark)' }}>{patient.firstName} {patient.lastName}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{age} años | {patient.gender}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sangre:</span>
              <span style={{ fontWeight: 600, color: '#EF4444' }}>{patient.bloodType || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Teléfono:</span>
              <span style={{ fontWeight: 600 }}>{patient.phone || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Alergias:</span>
              <span style={{ fontWeight: 600, color: '#DC2626' }}>{patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'Ninguna registrada'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Enf. Crónicas:</span>
              <span style={{ fontWeight: 600 }}>{patient.chronicDiseases?.length > 0 ? patient.chronicDiseases.join(', ') : 'Ninguna registrada'}</span>
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => navigate(`/consultation/${id}`)}>
            Iniciar Consulta
          </button>
        </div>

        {/* Historial Clínico */}
        <div className="dashboard-panel">
          <h2 className="panel-title" style={{ marginBottom: '1.5rem' }}>Historial Clínico</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {patient.consultations && patient.consultations.length > 0 ? (
              patient.consultations.map(consult => (
                <div key={consult.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--input-bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--primary)' }}>{formatDate(consult.createdAt)}</strong>
                    <span className="status-badge status-completed">Completada</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                    <strong>Motivo:</strong> {consult.subjective || 'Sin registro detallado.'}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <strong>Diagnóstico:</strong> {consult.assessment || 'Sin diagnóstico detallado.'}
                  </p>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                Este paciente aún no tiene consultas registradas.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientDetail;
