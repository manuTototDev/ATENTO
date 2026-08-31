import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, ArrowLeft, Plus, Trash2, Settings, AlertTriangle, FileCheck2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import './Consultation.css';

// Genera claves estables para filas dinámicas (React keys), sin depender del índice
const newRowKey = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const emptyTreatment = () => ({ _key: newRowKey(), medication: '', dose: '', frequencyNumber: '', frequencyUnit: 'horas', durationNumber: '', durationUnit: 'días' });
const emptyIndication = () => ({ _key: newRowKey(), type: 'Dieta', instruction: '' });

const easeOut = [0.16, 1, 0.3, 1];
const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: easeOut },
};

const Consultation = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const recognitionRef = useRef(null);

  const [soapNotes, setSoapNotes] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    icd10Code: '',
    plan: '',
  });

  const [patientHistoryUpdates, setPatientHistoryUpdates] = useState(null);
  const [treatments, setTreatments] = useState([emptyTreatment()]);
  const [indications, setIndications] = useState([emptyIndication()]);

  const [medSuggestions, setMedSuggestions] = useState([]);
  const [activeMedInput, setActiveMedInput] = useState(null);

  const addTreatment = () => setTreatments(prev => [...prev, emptyTreatment()]);
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

  const addIndication = () => setIndications(prev => [...prev, emptyIndication()]);
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
            assessment: data.soap.assessment || prev.assessment,
            icd10Code: data.soap.icd10Code || prev.icd10Code,
            plan: data.soap.plan || prev.plan,
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

  const hasUnsavedWork = () =>
    Boolean(
      transcription.trim() ||
      soapNotes.subjective || soapNotes.objective || soapNotes.assessment || soapNotes.plan ||
      treatments.some(t => t.medication) ||
      indications.some(ind => ind.instruction)
    );

  const goBackTarget = () => (id && id !== 'new' ? `/pacientes/${id}` : '/hoy');

  const handleExit = () => {
    if (hasUnsavedWork() && !window.confirm('Tienes datos de esta consulta sin guardar. ¿Deseas salir de todas formas?')) {
      return;
    }
    if (isRecording) {
      manualStopRef.current = true;
      try { recognitionRef.current?.stop(); } catch { /* ya detenido */ }
    }
    navigate(goBackTarget());
  };

  const handleFinish = async () => {
    // El backend exige un UUID de paciente real; sin paciente no hay consulta que guardar.
    if (!id || id === 'new') {
      alert('Selecciona o registra primero al paciente para poder guardar la consulta.');
      return;
    }
    setIsSaving(true);
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

      const savedConsultation = await res.json();

      navigate(`/prescription/${savedConsultation.id}`, {
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
    } finally {
      setIsSaving(false);
    }
  };

  const patientName = patientData
    ? `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim()
    : (id === 'new' ? 'Nuevo paciente' : 'Paciente');

  const voiceTitle = isProcessingAI
    ? 'IA estructurando la nota...'
    : (isRecording ? 'Escuchando la consulta...' : 'Asistente de voz IA');

  const voiceSub = isProcessingAI
    ? 'Aplicando estándares médicos y llenando los campos automáticamente.'
    : (isRecording
      ? 'Habla con naturalidad sobre síntomas, exploración y tratamiento.'
      : 'Presiona para dictar. La IA organizará la nota clínica y el plan de tratamiento.');

  return (
    <div className="consult-page">
      <header className="consult-topbar">
        <button className="btn-ghost" onClick={handleExit}>
          <ArrowLeft size={18} /> Salir
        </button>
        <div className="consult-doctor">
          <div className="consult-doctor-info">
            <div className="consult-doctor-name">
              Dr. {doctorProfile?.firstName || 'Médico'} {doctorProfile?.lastName || ''}
            </div>
            <div className="consult-doctor-specialty">
              {doctorProfile?.profile?.specialty?.name || 'Especialista'}
            </div>
          </div>
          <button className="consult-settings-btn" onClick={() => navigate('/ajustes')} title="Configuración de perfil">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="consult-main">
        <motion.div className="consult-heading" {...fadeUp}>
          <div>
            <p className="consult-eyebrow">Nueva consulta</p>
            <h1 className="font-display consult-title">{patientName}</h1>
          </div>
          {patientData?.allergies?.length > 0 && (
            <div className="consult-allergy-alert">
              <AlertTriangle size={18} />
              Alergias: {patientData.allergies.join(', ')}
            </div>
          )}
        </motion.div>

        <motion.section
          className={`consult-voice-card${isRecording ? ' is-recording' : ''}`}
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.05 }}
        >
          <div className="consult-mic-wrap">
            {isRecording && (
              <motion.div
                className="consult-mic-ring"
                animate={{ scale: [1, 1.55, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <button
              className={`consult-mic-btn${isRecording ? ' is-recording' : ''}`}
              onClick={toggleRecording}
              disabled={isProcessingAI}
              aria-label={isRecording ? 'Detener grabación' : 'Iniciar grabación'}
            >
              {isProcessingAI ? <Loader2 size={32} className="spin" /> : (isRecording ? <MicOff size={32} /> : <Mic size={32} />)}
            </button>
          </div>
          <div className="consult-voice-copy">
            <h3 className="consult-voice-title">{voiceTitle}</h3>
            <p className="consult-voice-sub">{voiceSub}</p>
          </div>
        </motion.section>

        <AnimatePresence>
          {transcription && (
            <motion.blockquote
              className="consult-transcript"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: easeOut }}
            >
              "{transcription}"
            </motion.blockquote>
          )}
        </AnimatePresence>

        {/* NOTAS SOAP */}
        <motion.section {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          <div className="consult-section-head">
            <h2 className="consult-section-title">
              Nota clínica <span className="soap-tag">SOAP</span>
            </h2>
          </div>

          <div className="soap-grid">
            <div className="form-field">
              <label className="form-label">Subjetivo — síntomas, motivo</label>
              <textarea
                className="form-input"
                value={soapNotes.subjective}
                onChange={e => setSoapNotes({ ...soapNotes, subjective: e.target.value })}
                placeholder="El paciente refiere..."
              />
            </div>
            <div className="form-field">
              <label className="form-label">Objetivo — exploración, signos vitales</label>
              <textarea
                className="form-input"
                value={soapNotes.objective}
                onChange={e => setSoapNotes({ ...soapNotes, objective: e.target.value })}
                placeholder="TA 120/80, FC 80..."
              />
            </div>
            <div className="form-field span-2">
              <div className="soap-field-head">
                <label className="form-label">Análisis — diagnóstico</label>
                <div className="icd-field">
                  <label className="form-label">CIE-10</label>
                  <input
                    type="text"
                    className="form-input icd-input"
                    value={soapNotes.icd10Code}
                    onChange={e => setSoapNotes({ ...soapNotes, icd10Code: e.target.value })}
                    placeholder="Ej. J02.9"
                  />
                </div>
              </div>
              <textarea
                className="form-input"
                value={soapNotes.assessment}
                onChange={e => setSoapNotes({ ...soapNotes, assessment: e.target.value })}
                placeholder="Faringoamigdalitis aguda..."
              />
            </div>
            <div className="form-field span-2">
              <label className="form-label">Plan — tratamiento y próximos pasos</label>
              <textarea
                className="form-input"
                value={soapNotes.plan}
                onChange={e => setSoapNotes({ ...soapNotes, plan: e.target.value })}
                placeholder="Manejo sintomático, control en 5 días si persisten los síntomas..."
              />
            </div>
          </div>
        </motion.section>

        {/* TRATAMIENTO */}
        <motion.section {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
          <div className="consult-section-head">
            <h2 className="consult-section-title">Plan de tratamiento</h2>
            <button className="btn-secondary" onClick={addTreatment}>
              <Plus size={16} /> Añadir fármaco
            </button>
          </div>

          <div className="consult-rows">
            {treatments.map((t, index) => (
              <div key={t._key} className="treatment-row">
                <div className="form-field med-field">
                  <label className="form-label">Fármaco</label>
                  <input
                    type="text"
                    className="form-input"
                    value={t.medication}
                    onChange={e => handleMedicationChange(index, e.target.value)}
                    onFocus={() => {
                      setActiveMedInput(index);
                      if (t.medication.length > 1) handleMedicationChange(index, t.medication);
                    }}
                    onBlur={() => setTimeout(() => setActiveMedInput(null), 200)}
                    placeholder="Ej. Paracetamol 500mg"
                  />
                  <AnimatePresence>
                    {activeMedInput === index && medSuggestions.length > 0 && (
                      <motion.div
                        className="med-suggestions"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {medSuggestions.map(med => (
                          <div key={med.id} className="med-suggestion-item" onClick={() => selectMedication(index, med)}>
                            <div className="med-suggestion-name">{med.name}</div>
                            <div className="med-suggestion-meta">{med.activePrinciple} {med.presentation ? `| ${med.presentation}` : ''}</div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="form-field">
                  <label className="form-label">Dosis</label>
                  <input type="text" className="form-input" value={t.dose} onChange={e => updateTreatment(index, 'dose', e.target.value)} placeholder="Ej. 1 tableta" />
                </div>
                <div className="form-field">
                  <label className="form-label">Frecuencia (cada)</label>
                  <div className="freq-duration-inputs">
                    <input type="text" className="form-input" value={t.frequencyNumber || ''} onChange={e => updateTreatment(index, 'frequencyNumber', e.target.value)} placeholder="8" />
                    <select className="form-input" value={t.frequencyUnit} onChange={e => updateTreatment(index, 'frequencyUnit', e.target.value)}>
                      <option value="horas">Horas</option>
                      <option value="días">Días</option>
                    </select>
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Duración (por)</label>
                  <div className="freq-duration-inputs">
                    <input type="text" className="form-input" value={t.durationNumber || ''} onChange={e => updateTreatment(index, 'durationNumber', e.target.value)} placeholder="5" />
                    <select className="form-input" value={t.durationUnit} onChange={e => updateTreatment(index, 'durationUnit', e.target.value)}>
                      <option value="días">Días</option>
                      <option value="semanas">Semanas</option>
                      <option value="meses">Meses</option>
                    </select>
                  </div>
                </div>
                <button className="row-remove-btn" onClick={() => removeTreatment(index)} title="Eliminar este tratamiento">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            {treatments.length === 0 && (
              <div className="empty-state">
                <p>No hay tratamientos agregados.</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* INDICACIONES */}
        <motion.section {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
          <div className="consult-section-head">
            <h2 className="consult-section-title">Indicaciones generales</h2>
            <button className="btn-secondary" onClick={addIndication}>
              <Plus size={16} /> Añadir indicación
            </button>
          </div>

          <div className="consult-rows">
            {indications.map((ind, index) => (
              <div key={ind._key} className="indication-row">
                <div className="form-field">
                  <label className="form-label">Categoría</label>
                  <select className="form-input" value={ind.type} onChange={e => updateIndication(index, 'type', e.target.value)}>
                    <option value="General">General</option>
                    <option value="Dieta">Dieta</option>
                    <option value="Reposo">Reposo / actividad</option>
                    <option value="Cuidados">Cuidados específicos</option>
                    <option value="Signos de Alarma">Signos de alarma</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Instrucción</label>
                  <input type="text" className="form-input" value={ind.instruction} onChange={e => updateIndication(index, 'instruction', e.target.value)} placeholder="Ej. Evitar grasas e irritantes, reposo relativo" />
                </div>
                <button className="row-remove-btn" onClick={() => removeIndication(index)} title="Eliminar indicación">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            {indications.length === 0 && (
              <div className="empty-state">
                <p>No hay indicaciones generales agregadas.</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* VERIFICACIÓN Y ACCIONES */}
        <motion.div className="consult-footer" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.25 }}>
          <label className="consult-verify">
            <input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} />
            He verificado que la transcripción y el plan de tratamiento son correctos.
          </label>

          <button className="btn-primary consult-finish-btn" onClick={handleFinish} disabled={!isVerified || isSaving}>
            {isSaving ? <Loader2 size={20} className="spin" /> : <FileCheck2 size={20} />}
            {isSaving ? 'Guardando...' : 'Crear receta'}
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default Consultation;
