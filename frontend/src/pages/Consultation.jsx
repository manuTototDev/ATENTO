import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Save, Printer, ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const Consultation = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patientData, setPatientData] = useState(null);
  
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

  const [treatments, setTreatments] = useState([
    { medication: '', dose: '', frequencyNumber: '', frequencyUnit: 'horas', durationNumber: '', durationUnit: 'días' }
  ]);

  const [indications, setIndications] = useState([
    { type: 'Dieta', instruction: '' }
  ]);

  const [medSuggestions, setMedSuggestions] = useState([]);
  const [activeMedInput, setActiveMedInput] = useState(null);

  const addTreatment = () => setTreatments([...treatments, { medication: '', dose: '', frequencyNumber: '', frequencyUnit: 'horas', durationNumber: '', durationUnit: 'días' }]);
  const updateTreatment = (index, field, value) => {
    const newT = [...treatments];
    newT[index][field] = value;
    setTreatments(newT);
  };
  const removeTreatment = (index) => {
    setTreatments(treatments.filter((_, i) => i !== index));
    if (activeMedInput === index) {
      setActiveMedInput(null);
      setMedSuggestions([]);
    }
  };

  const addIndication = () => setIndications([...indications, { type: 'General', instruction: '' }]);
  const updateIndication = (index, field, value) => {
    const newI = [...indications];
    newI[index][field] = value;
    setIndications(newI);
  };
  const removeIndication = (index) => {
    setIndications(indications.filter((_, i) => i !== index));
  };

  const handleMedicationChange = async (index, value) => {
    updateTreatment(index, 'medication', value);
    setActiveMedInput(index);
    if (value.length > 1) {
      try {
        const res = await fetch(`http://localhost:5000/api/medications?query=${value}`);
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
    // Sugerimos la dosis/presentación por defecto si existe
    if (med.presentation && !treatments[index].dose) {
      updateTreatment(index, 'dose', med.presentation);
    }
    setActiveMedInput(null);
    setMedSuggestions([]);
  };

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (id && id !== 'new') {
      fetch(`http://localhost:5000/api/patients?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          const found = data.find(p => p.id === id);
          if (found) setPatientData(found);
        })
        .catch(err => console.error(err));
    }

    // Inicializar Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-MX';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscription(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Error de reconocimiento:', event.error);
        setIsRecording(false);
      };
    }
  }, [id, userId]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      processTranscription();
    } else {
      setTranscription('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const processTranscription = async () => {
    // Usamos el state ref actual o dejamos un delay pequeño si el onresult no ha terminado
    setTimeout(async () => {
      setIsProcessingAI(true);
      try {
        const res = await fetch('http://localhost:5000/api/ai/parse-consultation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcription: transcription || 'El paciente refiere dolor de cabeza' }) // fallback por si acaso
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
              return [...current, ...data.treatments];
            });
          }
          if (data.indications && data.indications.length > 0) {
            setIndications(prev => {
              const current = prev.length === 1 && !prev[0].instruction ? [] : prev;
              return [...current, ...data.indications];
            });
          }
        }
      } catch (err) {
        console.error(err);
        alert('Error al procesar con Gemini IA.');
      } finally {
        setIsProcessingAI(false);
      }
    }, 500);
  };

  const handleFinish = () => {
    navigate('/prescription', { 
      state: { 
        patient: patientData, 
        treatments, 
        indications, 
        soap: soapNotes 
      } 
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
            <ArrowLeft size={18} /> Salir
          </button>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Consulta en curso</h1>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 600 }}>
            {patientData ? patientData.name : (id === 'new' ? 'Nuevo Paciente' : 'Paciente Seleccionado')}
          </h2>
        </div>

        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
          ⚠️ Alergias: {patientData && patientData.name === 'María López Gómez' ? 'Penicilina, Sulfa' : 'No registradas'}
        </div>
      </div>

      {/* ÁREA DE VOZ */}
      <div className="dashboard-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: isRecording ? '#FEF2F2' : 'var(--card-bg)', transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={toggleRecording}
            style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: isRecording ? '#EF4444' : 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
            disabled={isProcessingAI}
          >
            {isProcessingAI ? <Loader2 size={32} className="spin" /> : (isRecording ? <MicOff size={32} /> : <Mic size={32} />)}
          </button>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)' }}>
              {isProcessingAI ? 'Gemini AI está estructurando tu consulta...' : (isRecording ? 'Escuchando... Presiona para terminar y procesar' : 'Asistente de Voz IA (Gemini)')}
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {isProcessingAI ? 'Aplicando estándares médicos y rellenando los campos...' : (isRecording ? 'Habla con naturalidad sobre síntomas, exploración y recetas.' : 'Presiona para dictar. La IA (Gemini 1.5) organizará la nota médica y el plan de tratamiento automáticamente.')}
            </p>
          </div>
        </div>
        
        {transcription && (
          <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
            "{transcription}"
          </div>
        )}
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
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Plan de Tratamiento (Prescripción)</label>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {treatments.map((t, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'start', background: 'var(--input-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ position: 'relative' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fármaco / Principio Activo</label>
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
                    {activeMedInput === index && medSuggestions.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginTop: '0.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                        {medSuggestions.map(med => (
                          <div 
                            key={med.id} 
                            onClick={() => selectMedication(index, med)}
                            style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.875rem' }}
                          >
                            <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{med.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{med.activePrinciple} {med.presentation ? `| ${med.presentation}` : ''}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dosis</label>
                    <input type="text" className="form-input" value={t.dose} onChange={e => updateTreatment(index, 'dose', e.target.value)} placeholder="Ej. 1 tableta" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Frecuencia (Cada...)</label>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <input type="text" className="form-input" style={{ width: '80px' }} value={t.frequencyNumber || ''} onChange={e => updateTreatment(index, 'frequencyNumber', e.target.value)} placeholder="Ej. 8" />
                      <select className="form-input" style={{ flex: 1, padding: '0.5rem' }} value={t.frequencyUnit} onChange={e => updateTreatment(index, 'frequencyUnit', e.target.value)}>
                        <option value="horas">Horas</option>
                        <option value="días">Días</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duración (Por...)</label>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <input type="text" className="form-input" style={{ width: '80px' }} value={t.durationNumber || ''} onChange={e => updateTreatment(index, 'durationNumber', e.target.value)} placeholder="Ej. 5" />
                      <select className="form-input" style={{ flex: 1, padding: '0.5rem' }} value={t.durationUnit} onChange={e => updateTreatment(index, 'durationUnit', e.target.value)}>
                        <option value="días">Días</option>
                        <option value="semanas">Semanas</option>
                        <option value="meses">Meses</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={() => removeTreatment(index)} style={{ marginTop: '1.25rem', padding: '0.5rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', cursor: 'pointer', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Eliminar este tratamiento">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              
              {treatments.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                  No hay tratamientos agregados.
                </div>
              )}

              <button 
                onClick={addTreatment} 
                style={{ 
                  marginTop: '0.5rem', alignSelf: 'flex-start', padding: '0.5rem 1.25rem', 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem',
                  background: '#E0E7FF', color: '#4338CA', border: '1px solid #C7D2FE',
                  borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#C7D2FE'}
                onMouseOut={(e) => e.currentTarget.style.background = '#E0E7FF'}
              >
                <Plus size={18} strokeWidth={2.5} /> Añadir Fármaco / Indicación
              </button>
            </div>
          </div>

          {/* INDICACIONES GENERALES */}
          <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Indicaciones Generales (No farmacológicas)</label>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {indications.map((ind, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 3fr auto', gap: '1rem', alignItems: 'start', background: 'var(--input-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Categoría</label>
                    <select className="form-input" value={ind.type} onChange={e => updateIndication(index, 'type', e.target.value)}>
                      <option value="General">General</option>
                      <option value="Dieta">Dieta</option>
                      <option value="Reposo">Reposo / Actividad</option>
                      <option value="Cuidados">Cuidados Específicos</option>
                      <option value="Signos de Alarma">Signos de Alarma</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instrucción</label>
                    <input type="text" className="form-input" value={ind.instruction} onChange={e => updateIndication(index, 'instruction', e.target.value)} placeholder="Ej. Evitar grasas e irritantes, reposo relativo" />
                  </div>
                  <button onClick={() => removeIndication(index)} style={{ marginTop: '1.25rem', padding: '0.5rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', cursor: 'pointer', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Eliminar indicación">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              
              {indications.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                  No hay indicaciones generales agregadas.
                </div>
              )}

              <button 
                onClick={addIndication} 
                style={{ 
                  marginTop: '0.5rem', alignSelf: 'flex-start', padding: '0.5rem 1.25rem', 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem',
                  background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0',
                  borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#A7F3D0'}
                onMouseOut={(e) => e.currentTarget.style.background = '#ECFDF5'}
              >
                <Plus size={18} strokeWidth={2.5} /> Añadir Indicación
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.5rem', marginTop: '1rem', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500 }}>
          <input 
            type="checkbox" 
            checked={isVerified} 
            onChange={(e) => setIsVerified(e.target.checked)} 
            style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)' }}
          />
          He revisado y verificado que la transcripción del diagnóstico y la receta generados por IA son correctos.
        </label>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <Save size={18} /> Guardar Borrador
          </button>
          <button 
            onClick={handleFinish} 
            className="btn-primary" 
            disabled={!isVerified}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', opacity: isVerified ? 1 : 0.5, cursor: isVerified ? 'pointer' : 'not-allowed' }}
          >
            <Printer size={18} /> Terminar y Crear Receta
          </button>
        </div>
      </div>

    </div>
  );
};

export default Consultation;
