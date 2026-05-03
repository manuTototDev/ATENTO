import React, { useState } from 'react';
import { Mic, MicOff, Save, Printer, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Consultation = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [soapNotes, setSoapNotes] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  const handleFinish = () => {
    alert('Consulta terminada. El costo calculado sugerido es $800.');
    navigate('/prescription');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
            <ArrowLeft size={18} /> Salir
          </button>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Consulta en curso</h1>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 600 }}>María López Gómez</h2>
        </div>

        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
          ⚠️ Alergias: Penicilina, Sulfa
        </div>
      </div>

      {/* ÁREA DE VOZ */}
      <div className="dashboard-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', background: isRecording ? '#FEF2F2' : 'var(--card-bg)', transition: 'all 0.3s' }}>
        <button 
          onClick={() => setIsRecording(!isRecording)}
          style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: isRecording ? '#EF4444' : 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
        >
          {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
        </button>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)' }}>
            {isRecording ? 'Escuchando y transcribiendo...' : 'Asistente de Voz IA (Atento)'}
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {isRecording ? 'Habla con naturalidad. La IA organizará la nota médica automáticamente.' : 'Presiona para dictar tu nota SOAP o indicaciones.'}
          </p>
        </div>
      </div>

      {/* NOTAS SOAP */}
      <div className="dashboard-panel">
        <h3 className="panel-title" style={{ marginBottom: '1.5rem' }}>Expediente Clínico (SOAP)</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label>Subjetivo (Síntomas, Motivo)</label>
            <textarea className="form-input" style={{ minHeight: '120px' }} value={soapNotes.subjective} onChange={e => setSoapNotes({...soapNotes, subjective: e.target.value})} placeholder="El paciente refiere..." />
          </div>
          <div className="form-group">
            <label>Objetivo (Exploración, Signos vitales)</label>
            <textarea className="form-input" style={{ minHeight: '120px' }} value={soapNotes.objective} onChange={e => setSoapNotes({...soapNotes, objective: e.target.value})} placeholder="TA 120/80, FC 80..." />
          </div>
          <div className="form-group">
            <label>Análisis (Diagnóstico)</label>
            <textarea className="form-input" style={{ minHeight: '120px' }} value={soapNotes.assessment} onChange={e => setSoapNotes({...soapNotes, assessment: e.target.value})} placeholder="Faringoamigdalitis aguda..." />
          </div>
          <div className="form-group">
            <label>Plan (Tratamiento, Estudios)</label>
            <textarea className="form-input" style={{ minHeight: '120px' }} value={soapNotes.plan} onChange={e => setSoapNotes({...soapNotes, plan: e.target.value})} placeholder="Amoxicilina 500mg..." />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <Save size={18} /> Guardar Borrador
        </button>
        <button onClick={handleFinish} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
          <Printer size={18} /> Terminar y Crear Receta
        </button>
      </div>

    </div>
  );
};

export default Consultation;
