import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Printer, ArrowLeft, Plus, Trash2, Loader2, Settings, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../utils/api';

// Genera claves estables para filas dinámicas (React keys), sin depender del índice
const newRowKey = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const Consultation = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const recognitionRef = useRef(null);

  const [soapNotes, setSoapNotes] = useState({
    subjective: '',
    objective: '',
    assessment: ''
  });

  const [patientHistoryUpdates, setPatientHistoryUpdates] = useState(null);

  const [treatments, setTreatments] = useState([
    { _key: newRowKey(), medication: '', dose: '', frequencyNumber: '', frequencyUnit: 'horas', durationNumber: '', durationUnit: 'días' }
  ]);

  const [indications, setIndications] = useState([
    { _key: newRowKey(), type: 'Dieta', instruction: '' }
  ]);

  const [medSuggestions, setMedSuggestions] = useState([]);
  const [activeMedInput, setActiveMedInput] = useState(null);

  const addTreatment = () => setTreatments(prev => [...prev, { _key: newRowKey(), medication: '', dose: '', frequencyNumber: '', frequencyUnit: 'horas', durationNumber: '', durationUnit: 'días' }]);
  const updateTreatment = (index, field, value) => {
    setTreatments(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };
  const removeTreatment = (index) => {
    setTreatments(treatments.filter((_, i) => i !== index));
    if (activeMedInput === index) {
      setActiveMedInput(null);
      setMedSuggestions([]);
    }
  };

  const addIndication = () => setIndications(prev => [...prev, { _key: newRowKey(), type: 'General', instruction: '' }]);
  const updateIndication = (index, field, value) => {
    setIndications(prev => prev.map((ind, i) => i === index ? { ...ind, [field]: value } : ind));
  };
  const removeIndication = (index) => {
    setIndications(indications.filter((_, i) => i !== index));
  };

  const handleMedicationChange = async (index, value) => {
    updateTreatment(index, 'medication', value);
    setActiveMedInput(index);
    if (value.length > 1) {
      try {
        const res = await apiFetch(`/api/medications?query=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setMedSuggestions(data);
        }
      } catch (e) {
        console.error('Error fetching meds:', e);
      }
    } else {
      setMedSuggestions([]);
    }
  };

  const selectMedication = (index, med) => {
    updateTreatment(index, 'medication', med.name);
    if (med.presentation && !treatments[index].dose) {
      updateTreatment(index, 'dose', med.presentation);
    }
    setActiveMedInput(null);
    setMedSuggestions([]);
  };

  // Espejo de la transcripción en un ref para leer siempre el valor más reciente
  // (los eventos de onresult pueden llegar después del último render)
  const transcriptionRef = useRef('');
  const manualStopRef = useRef(false);

  // Datos del médico y del paciente
  useEffect(() => {
    apiFetch(`/api/profile`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data) setDoctorProfile(data); })
      .catch(console.error);

    if (id && id !== 'new') {
      apiFetch(`/api/patients/${id}`)
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data && !data.error) setPatientData(data);
        })
        .catch(err => console.error(err));
    }
  }, [id]);

  // Reconocimiento de voz: se crea una vez y se limpia al desmontar
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return undefined;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-MX';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        transcriptionRef.current += finalTranscript;
        setTranscription(transcriptionRef.current);
      }
    };

    recognition.onerror = (event) => {
      console.error('Error de reconocimiento:', event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert('No hay permiso para usar el micrófono. Habilítalo en la configuración del navegador.');
      }
    };

    // Chrome corta la escucha tras un silencio largo: sincronizamos la UI
    // y procesamos lo dictado hasta ese momento (igual que un stop manual).
    recognition.onend = () => {
      setIsRecording(false);
      if (!manualStopRef.current && transcriptionRef.current.trim()) {
        processTranscription();
      }
      manualStopRef.current = false;
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try { recognition.stop(); } catch { /* ya detenido */ }
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge, o escribe la nota manualmente.');
      return;
    }
    if (isRecording) {
      manualStopRef.current = true;
      recognitionRef.current.stop();
      setIsRecording(false);
      processTranscription();
    } else {
      transcriptionRef.current = '';
      setTranscription('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const processTranscription = async () => {
    const text = transcriptionRef.current.trim();
    if (!text) {
      // NUNCA enviar texto clínico inventado a la IA: sin dictado, no hay nada que procesar.
      alert('No se capturó ningún dictado. Intenta grabar de nuevo o escribe la nota manualmente.');
      return;
    }
    setIsProcessingAI(true);
    try {
      const res = await apiFetch('/api/ai/parse-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription: text })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.soap) {
          setSoapNotes(prev => ({
            subjective: data.soap.subjective || prev.subjective,
            objective: data.soap.objective || prev.objective,
            assessment: data.soap.assessment || prev.assessment
          }));
        }
        if (data.treatments && data.treatments.length > 0) {
          setTreatments(prev => {
            const current = prev.length === 1 && !prev[0].medication ? [] : prev;
            return [...current, ...data.treatments.map(t => ({ _key: newRowKey(), ...t }))];
          });
        }
        if (data.indications && data.indications.length > 0) {
          setIndications(prev => {
            const current = prev.length === 1 && !prev[0].instruction ? [] : prev;
            return [...current, ...data.indications.map(ind => ({ _key: newRowKey(), ...ind }))];
          });
        }
        if (data.patientHistoryUpdates) {
          setPatientHistoryUpdates(data.patientHistoryUpdates);
        }
      } else {
        alert('La IA no pudo procesar la transcripción. Puedes completar la nota manualmente.');
      }
    } catch (err) {
      console.error(err);
      alert('Error al procesar la transcripción con IA.');
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleFinish = async () => {
    // El backend exige un UUID de paciente real; sin paciente no hay consulta que guardar.
    if (!id || id === 'new') {
      alert('Selecciona o registra primero al paciente para poder guardar la consulta.');
      return;
    }
    try {
      // Quitar la clave interna de UI (_key) antes de enviar al backend
      const cleanTreatments = treatments.map(({ _key, ...t }) => t);
      const cleanIndications = indications.map(({ _key, ...ind }) => ind);

      const res = await apiFetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: id,
          soap: soapNotes,
          treatments: cleanTreatments,
          indications: cleanIndications,
          rawTranscriptionTexto: transcription,
          patientHistoryUpdates
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || 'Error al guardar consulta');
      }

      navigate(`/prescription/${id}`, {
        state: {
          patient: patientData,
          treatments: cleanTreatments,
          indications: cleanIndications,
          soap: soapNotes
        }
      });
    } catch (e) {
      console.error(e);
      alert(e.message || 'Hubo un error al guardar la consulta');
    }
  };

  const srOnlyStyle = { position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 };

  const voiceStatusLabel = isProcessingAI
    ? 'La IA está estructurando la nota.'
    : (isRecording ? 'Grabando la consulta.' : '');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Estilos locales: hover/focus reales y breakpoints para esta pantalla */}
      <style>{`
        .cs-soap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }
        .cs-treatment-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: var(--space-5); align-items: start; }
        .cs-indication-grid { display: grid; grid-template-columns: 1fr 3fr auto; gap: var(--space-5); align-items: start; }
        @media (max-width: 860px) {
          .cs-soap-grid, .cs-treatment-grid, .cs-indication-grid { grid-template-columns: 1fr; }
          .cs-treatment-grid > *:last-child, .cs-indication-grid > *:last-child { justify-self: flex-end; margin-top: 0 !important; }
        }
        .cs-icon-btn {
          background: transparent; border: none; color: var(--text-muted); cursor: pointer;
          padding: var(--space-2); border-radius: var(--radius-sm); display: inline-flex;
          align-items: center; justify-content: center;
          transition: color var(--duration-fast) var(--ease-out), background-color var(--duration-fast) var(--ease-out);
        }
        .cs-icon-btn:hover { color: var(--error); background: var(--error-bg); }
        .cs-settings-btn {
          background: transparent; border: none; cursor: pointer; color: var(--text-dark);
          display: flex; align-items: center; padding: var(--space-2); border-radius: var(--radius-sm);
          transition: background-color var(--duration-fast) var(--ease-out);
        }
        .cs-settings-btn:hover { background: var(--input-bg); }
        .cs-suggestion-item {
          padding: var(--space-4); border-bottom: 1px solid var(--border); cursor: pointer;
          transition: background-color var(--duration-fast) var(--ease-out);
        }
        .cs-suggestion-item:last-child { border-bottom: none; }
        .cs-suggestion-item:hover, .cs-suggestion-item:focus { background: var(--input-bg); }
        @media (max-width: 640px) {
          .cs-actions-row { flex-direction: column-reverse; align-items: stretch !important; }
        }
      `}</style>

      {/* HEADER TOP BAR */}
      <header style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-5) clamp(1.25rem, 4vw, 3rem)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-color)',
        zIndex: 20
      }}>
        <button onClick={() => navigate('/dashboard')} className="btn-ghost" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Salir
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)' }}>
              Dr. {doctorProfile?.firstName || 'Médico'} {doctorProfile?.lastName || ''}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {doctorProfile?.profile?.specialty?.name || 'Especialista'}
            </div>
          </div>
          <motion.button
            onClick={() => navigate('/settings')}
            className="cs-settings-btn"
            title="Configuración de Perfil"
            aria-label="Configuración de perfil"
            whileHover={{ rotate: 45 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Settings size={22} />
          </motion.button>
        </div>
      </header>

      <main style={{ padding: 'clamp(1.5rem, 4vw, 3rem)', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>

        {/* PAGE HEADER */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-5)', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="font-display" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', lineHeight: 1, color: 'var(--text-dark)', margin: '0 0 var(--space-3) 0' }}>
              Consulta.
            </h1>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '-0.02em', margin: 0 }}>
              {patientData ? `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim() : (id === 'new' ? 'Nuevo Paciente' : 'Paciente Seleccionado')}
            </h2>
          </div>
          {patientData?.allergies?.length > 0 && (
            <div role="alert" className="animate-fade-in" style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              border: `1px solid var(--error)`, background: 'var(--error-bg)',
              borderRadius: 'var(--radius-md)', padding: 'var(--space-4) var(--space-5)',
              color: 'var(--error)', fontWeight: 700
            }}>
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <span>Alergias: {patientData.allergies.join(', ')}</span>
            </div>
          )}
        </div>

        {/* ÁREA DE VOZ */}
        <section
          className="dashboard-panel"
          style={{
            padding: 'var(--space-6)',
            background: isRecording ? 'var(--primary)' : 'var(--card-bg)',
            borderColor: isRecording ? 'var(--primary)' : 'var(--border)',
            color: isRecording ? '#fff' : 'var(--text-dark)',
            boxShadow: isRecording ? 'var(--shadow-lg)' : 'var(--shadow-md)',
            transition: `background-color var(--duration-slow) var(--ease-in-out), color var(--duration-slow) var(--ease-in-out), border-color var(--duration-slow) var(--ease-in-out), box-shadow var(--duration-slow) var(--ease-in-out)`
          }}
        >
          <span aria-live="polite" style={srOnlyStyle}>{voiceStatusLabel}</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <motion.button
              onClick={toggleRecording}
              disabled={isProcessingAI}
              aria-label={isRecording ? 'Detener grabación' : 'Iniciar grabación de la consulta'}
              whileHover={!isProcessingAI ? { scale: 1.05 } : undefined}
              whileTap={!isProcessingAI ? { scale: 0.96 } : undefined}
              style={{
                width: 76, height: 76, borderRadius: 'var(--radius-full)', flexShrink: 0,
                backgroundColor: isRecording ? '#fff' : 'var(--primary)',
                color: isRecording ? 'var(--error)' : '#fff',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isProcessingAI ? 'not-allowed' : 'pointer'
              }}
            >
              {isProcessingAI ? (
                <motion.span
                  style={{ display: 'flex' }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Loader2 size={34} color={isRecording ? 'var(--primary)' : '#fff'} />
                </motion.span>
              ) : (isRecording ? <MicOff size={34} /> : <Mic size={34} />)}
            </motion.button>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '0.4rem' }}>
                {isRecording && (
                  <motion.span
                    aria-hidden="true"
                    animate={{ opacity: [1, 0.35, 1] }}
                    transition={{ repeat: Infinity, duration: 1.3, ease: 'easeInOut' }}
                    style={{ width: 9, height: 9, borderRadius: 'var(--radius-full)', background: 'var(--error)', flexShrink: 0 }}
                  />
                )}
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
                  {isProcessingAI ? 'IA estructurando la nota...' : (isRecording ? 'Escuchando consulta...' : 'Asistente de Voz IA')}
                </h3>
              </div>
              <p style={{ fontSize: '1.05rem', color: isRecording ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)', margin: 0 }}>
                {isProcessingAI ? 'Aplicando estándares médicos y rellenando los campos...' : (isRecording ? 'Habla con naturalidad sobre síntomas, exploración y recetas.' : 'Presiona para dictar. La IA organizará la nota médica y el plan de tratamiento automáticamente.')}
              </p>
            </div>
          </div>

          {isProcessingAI && (
            <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxWidth: '420px' }}>
              <div className="skeleton" style={{ height: 12, width: '90%' }} />
              <div className="skeleton" style={{ height: 12, width: '75%' }} />
              <div className="skeleton" style={{ height: 12, width: '55%' }} />
            </div>
          )}

          <AnimatePresence>
            {transcription && (
              <motion.div
                key="transcription"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  marginTop: 'var(--space-6)',
                  padding: 'var(--space-5)',
                  borderLeft: `3px solid ${isRecording ? '#fff' : 'var(--primary)'}`,
                  fontSize: '1.1rem',
                  fontStyle: 'italic',
                  lineHeight: 1.6
                }}
              >
                "{transcription}"
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* NOTAS SOAP */}
        <div className="dashboard-panel" style={{ padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="panel-title" style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            Expediente Clínico (SOAP)
          </h2>

          <div className="cs-soap-grid">
            <div className="form-field">
              <label className="form-label">Subjetivo (Síntomas, Motivo)</label>
              <textarea
                className="form-input"
                style={{ minHeight: '120px', resize: 'vertical' }}
                value={soapNotes.subjective}
                onChange={e => setSoapNotes({ ...soapNotes, subjective: e.target.value })}
                placeholder="El paciente refiere..."
              />
            </div>
            <div className="form-field">
              <label className="form-label">Objetivo (Exploración, Signos vitales)</label>
              <textarea
                className="form-input"
                style={{ minHeight: '120px', resize: 'vertical' }}
                value={soapNotes.objective}
                onChange={e => setSoapNotes({ ...soapNotes, objective: e.target.value })}
                placeholder="TA 120/80, FC 80..."
              />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Análisis (Diagnóstico)</label>
              <textarea
                className="form-input"
                style={{ minHeight: '120px', resize: 'vertical' }}
                value={soapNotes.assessment}
                onChange={e => setSoapNotes({ ...soapNotes, assessment: e.target.value })}
                placeholder="Faringoamigdalitis aguda..."
              />
            </div>
          </div>
        </div>

        {/* TRATAMIENTO */}
        <div className="dashboard-panel" style={{ padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            <h2 className="panel-title" style={{ fontSize: '1.4rem' }}>
              Plan de Tratamiento
            </h2>
            <button onClick={addTreatment} className="btn-secondary" style={{ width: 'auto' }}>
              <Plus size={18} /> Añadir Fármaco
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {treatments.map((t, index) => (
              <div key={t._key || index} className="cs-treatment-grid" style={{ padding: 'var(--space-5)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div className="form-field" style={{ position: 'relative' }}>
                  <label className="form-label">Fármaco / Principio Activo</label>
                  <input
                    type="text"
                    className="form-input"
                    value={t.medication}
                    onChange={e => handleMedicationChange(index, e.target.value)}
                    onFocus={() => {
                      setActiveMedInput(index);
                      if (t.medication.length > 1) handleMedicationChange(index, t.medication);
                    }}
                    onBlur={() => {
                      setTimeout(() => setActiveMedInput(null), 200);
                    }}
                    placeholder="Ej. Paracetamol 500mg"
                  />
                  {activeMedInput === index && medSuggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', marginTop: 'var(--space-1)', zIndex: 10, maxHeight: '250px', overflowY: 'auto' }}>
                      {medSuggestions.map(med => (
                        <div
                          key={med.id}
                          className="cs-suggestion-item"
                          onClick={() => selectMedication(index, med)}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{med.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{med.activePrinciple} {med.presentation ? `| ${med.presentation}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-field">
                  <label className="form-label">Dosis</label>
                  <input type="text" className="form-input" value={t.dose} onChange={e => updateTreatment(index, 'dose', e.target.value)} placeholder="Ej. 1 tableta" />
                </div>
                <div className="form-field">
                  <label className="form-label">Frecuencia (Cada)</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <input type="text" className="form-input" style={{ width: '64px' }} value={t.frequencyNumber || ''} onChange={e => updateTreatment(index, 'frequencyNumber', e.target.value)} placeholder="8" />
                    <select className="form-input" style={{ flex: 1 }} value={t.frequencyUnit} onChange={e => updateTreatment(index, 'frequencyUnit', e.target.value)}>
                      <option value="horas">Horas</option>
                      <option value="días">Días</option>
                    </select>
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Duración (Por)</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <input type="text" className="form-input" style={{ width: '64px' }} value={t.durationNumber || ''} onChange={e => updateTreatment(index, 'durationNumber', e.target.value)} placeholder="5" />
                    <select className="form-input" style={{ flex: 1 }} value={t.durationUnit} onChange={e => updateTreatment(index, 'durationUnit', e.target.value)}>
                      <option value="días">Días</option>
                      <option value="semanas">Semanas</option>
                      <option value="meses">Meses</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => removeTreatment(index)} className="cs-icon-btn" style={{ marginTop: '1.9rem' }} title="Eliminar este tratamiento" aria-label="Eliminar este tratamiento">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            {treatments.length === 0 && (
              <div className="empty-state">
                No hay tratamientos agregados.
              </div>
            )}
          </div>
        </div>

        {/* INDICACIONES */}
        <div className="dashboard-panel" style={{ padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            <h2 className="panel-title" style={{ fontSize: '1.4rem' }}>
              Indicaciones Generales
            </h2>
            <button onClick={addIndication} className="btn-secondary" style={{ width: 'auto' }}>
              <Plus size={18} /> Añadir Indicación
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {indications.map((ind, index) => (
              <div key={ind._key || index} className="cs-indication-grid" style={{ padding: 'var(--space-5)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div className="form-field">
                  <label className="form-label">Categoría</label>
                  <select className="form-input" value={ind.type} onChange={e => updateIndication(index, 'type', e.target.value)}>
                    <option value="General">General</option>
                    <option value="Dieta">Dieta</option>
                    <option value="Reposo">Reposo / Actividad</option>
                    <option value="Cuidados">Cuidados Específicos</option>
                    <option value="Signos de Alarma">Signos de Alarma</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Instrucción</label>
                  <input type="text" className="form-input" value={ind.instruction} onChange={e => updateIndication(index, 'instruction', e.target.value)} placeholder="Ej. Evitar grasas e irritantes, reposo relativo" />
                </div>
                <button onClick={() => removeIndication(index)} className="cs-icon-btn" style={{ marginTop: '1.9rem' }} title="Eliminar indicación" aria-label="Eliminar indicación">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            {indications.length === 0 && (
              <div className="empty-state">
                No hay indicaciones generales agregadas.
              </div>
            )}
          </div>
        </div>

        {/* VERIFICACIÓN Y ACCIONES */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-5)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-dark)', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
              style={{ width: '1.35rem', height: '1.35rem', accentColor: 'var(--accent)' }}
            />
            He verificado que la transcripción y el plan de tratamiento son correctos.
          </label>

          <div className="cs-actions-row" style={{ display: 'flex', gap: 'var(--space-4)', width: '100%', justifyContent: 'flex-end' }}>
            <button
              onClick={handleFinish}
              disabled={!isVerified}
              className="btn-primary"
              style={{ width: 'auto', padding: '1rem 2.5rem', fontSize: '1.05rem' }}
            >
              <Printer size={20} /> Crear Receta
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Consultation;
