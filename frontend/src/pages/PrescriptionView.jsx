import React, { useState } from 'react';
import { Printer, Download, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const PrescriptionView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, treatments, indications, soap } = location.state || {};
  const [emailSent, setEmailSent] = useState(false);

  const handleSendEmail = () => {
    let email = patient?.email;
    if (!email) {
      email = window.prompt("El paciente no tiene un correo registrado. Ingresa un correo electrónico para enviarle la receta:");
      if (!email) return; // cancelado
      // Aquí haríamos el UPDATE en la BD del paciente para guardarle su email nuevo
      alert(`Correo registrado. Guardando en base de datos...`);
    }
    
    // Simular el envío de correo
    setTimeout(() => {
      setEmailSent(true);
      alert(`Receta enviada exitosamente a ${email}`);
    }, 1000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <ArrowLeft size={18} /> Volver al Inicio
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-secondary" 
            onClick={handleSendEmail}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--border)' }}
          >
            {emailSent ? <CheckCircle size={18} color="green" /> : <Mail size={18} />}
            {emailSent ? 'Enviada' : 'Enviar por Correo'}
          </button>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--border)' }}>
            <Download size={18} /> Descargar PDF
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }} onClick={() => window.print()}>
            <Printer size={18} /> Imprimir
          </button>
        </div>
      </div>

      {/* DOCUMENTO RECETA MÉDICA (Formato A4 aprox) */}
      <div className="dashboard-panel" style={{ background: 'white', minHeight: '842px', padding: '3rem', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Header Doctor */}
        <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>Dr. Alejandro Médico</h1>
            <p style={{ color: 'var(--text-dark)', fontWeight: 600 }}>Cardiología Clínica</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Universidad Nacional Autónoma de México<br/>
              Céd. Prof. 12345678 | Céd. Esp. 87654321
            </p>
          </div>
          <div style={{ width: '100px', height: '100px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center' }}>
            [Logo Clínica]
          </div>
        </div>

        {/* Datos Paciente */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', marginBottom: '2rem', background: 'var(--input-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
          <div><strong>Paciente:</strong> {patient?.firstName} {patient?.lastName}</div>
          <div><strong>Fecha:</strong> {new Date().toLocaleDateString('es-MX')}</div>
          <div><strong>Edad:</strong> {patient?.dob ? Math.floor((new Date() - new Date(patient.dob)) / 31557600000) : '--'} años</div>
          <div><strong>Diagnóstico:</strong> {soap?.assessment || 'No especificado'}</div>
        </div>

        {/* Medicamentos */}
        <div style={{ minHeight: '200px', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Rx</span> Farmacológico
          </h2>

          <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {treatments && treatments.length > 0 ? treatments.map((t, i) => (
              <li key={i} style={{ paddingLeft: '0.5rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{t.medication}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Tomar {t.dose} cada {t.frequencyNumber} {t.frequencyUnit} por {t.durationNumber} {t.durationUnit}.
                </div>
              </li>
            )) : (
              <li style={{ color: 'var(--text-muted)' }}>Sin prescripción farmacológica.</li>
            )}
          </ol>
        </div>

        {/* Indicaciones Generales */}
        {indications && indications.length > 0 && (
          <div style={{ minHeight: '150px' }}>
            <h2 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '1rem', fontWeight: 600 }}>
              Indicaciones Generales y Cuidados
            </h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
              {indications.map((ind, i) => (
                <li key={i}>
                  <strong>{ind.type}:</strong> {ind.instruction}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer Firmas */}
        <div style={{ position: 'absolute', bottom: '3rem', left: '3rem', right: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Av. Insurgentes Sur 1234, Col. Del Valle<br/>
            Benito Juárez, CDMX, C.P. 03100<br/>
            Tel: (55) 1234-5678
          </div>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ borderBottom: '1px solid var(--text-dark)', height: '40px', marginBottom: '0.5rem' }}></div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Firma del Médico</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrescriptionView;
