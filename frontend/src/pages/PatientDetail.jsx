import React from 'react';
import { ArrowLeft, User, Activity, Clock, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const PatientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-dark)' }}>María López Gómez</h2>
            <p style={{ color: 'var(--text-muted)' }}>34 años | Femenino</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sangre:</span>
              <span style={{ fontWeight: 600, color: '#EF4444' }}>O+</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Teléfono:</span>
              <span style={{ fontWeight: 600 }}>55 1234 5678</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Alergias:</span>
              <span style={{ fontWeight: 600, color: '#DC2626' }}>Penicilina, Sulfa</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Enf. Crónicas:</span>
              <span style={{ fontWeight: 600 }}>Asma Leve</span>
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => navigate('/consultation/new-12345')}>
            Iniciar Consulta
          </button>
        </div>

        {/* Historial Clínico */}
        <div className="dashboard-panel">
          <h2 className="panel-title" style={{ marginBottom: '1.5rem' }}>Historial Clínico</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--input-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--primary)' }}>03 de Mayo de 2026</strong>
                <span className="status-badge status-completed">Completada</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                <strong>Motivo:</strong> Cuadro febril de 48 hrs de evolución con odinofagia.
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>Diagnóstico:</strong> Faringoamigdalitis aguda.
              </p>
            </div>

            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--text-dark)' }}>15 de Enero de 2026</strong>
                <span className="status-badge status-completed">Completada</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                <strong>Motivo:</strong> Control de asma rutinario.
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>Diagnóstico:</strong> Asma controlada. Se mantiene tratamiento base.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientDetail;
