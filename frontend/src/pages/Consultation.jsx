import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Save, Printer, ArrowLeft, Plus, Trash2, Loader2, Settings } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';

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
    { medication: '', dose: '', frequencyNumber: '', frequencyUnit: 'horas', durationNumber: '', durationUnit: 'días' }
  ]);

  const [indications, setIndications] = useState([
    { type: 'Dieta', instruction: '' }
  ]);

  const [medSuggestions, setMedSuggestions] = useState([]);
  const [activeMedInput, setActiveMedInput] = useState(null);

  const userId = localStorage.getItem('userId');

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
        const res = await apiFetch(`/api/medications?query=${value}`);
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

  useEffect(() => {
    if (userId) {
      apiFetch(`/api/profile`)
        .then(res => res?.json())
        .then(data => { if (data) setDoctorProfile(data); })
        .catch(console.error);
    }

    if (id && id !== 'new') {
      apiFetch(`/api/patients/${id}`)
        .then(res => res?.json())
        .then(data => {
          if (data && !data.error) setPatientData(data);
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
    setTimeout(async () => {
      setIsProcessingAI(true);
      try {
        const res = await apiFetch('/api/ai/parse-consultation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcription: transcription || 'El paciente refiere dolor de cabeza' })
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
          if (data.patientHistoryUpdates) {
            setPatientHistoryUpdates(data.patientHistoryUpdates);
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

  const handleFinish = async () => {
    try {
      const res = await apiFetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: id,
          soap: soapNotes,
          treatments,
          indications,
          rawTranscriptionTexto: transcription,
          patientHistoryUpdates
        })
      });

      if (!res.ok) throw new Error('Error al guardar consulta');

      navigate(`/prescription/${id}`, { 
        state: { 
          patient: patientData, 
          treatments, 
          indications, 
          soap: soapNotes 
        } 
      });
    } catch (e) {
      console.error(e);
      alert('Hubo un error al guardar la consulta');
    }
  };

  const inputStyle = { width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Inter' };
  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#555', marginBottom: '0.5rem' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* HEADER TOP BAR */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.5rem 3rem',
        borderBottom: '2px solid #000'
      }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'opacity 0.2s' }} onMouseOver={e=>e.currentTarget.style.opacity=0.6} onMouseOut={e=>e.currentTarget.style.opacity=1}>
          <ArrowLeft size={20} /> Salir
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#000' }}>
              Dr. {doctorProfile?.firstName || 'Médico'} {doctorProfile?.lastName || ''}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {doctorProfile?.profile?.specialty?.name || 'Especialista'}
            </div>
          </div>
          <button 
            onClick={() => navigate('/settings')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }}
            title="Configuración de Perfil"
            onMouseOver={e=>e.currentTarget.style.transform='rotate(45deg)'}
            onMouseOut={e=>e.currentTarget.style.transform='rotate(0deg)'}
          >
            <Settings size={24} />
          </button>
        </div>
      </header>

      <main style={{ padding: '3rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* PAGE HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '4rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: '#000', margin: '0 0 1rem 0' }}>
              Consulta.
            </h1>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#555', letterSpacing: '-0.02em', margin: 0 }}>
              {patientData ? patientData.name : (id === 'new' ? 'Nuevo Paciente' : 'Paciente Seleccionado')}
            </h2>
          </div>
          {patientData?.allergies?.length > 0 && (
            <div style={{ border: '2px solid #ef4444', padding: '1rem 2rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Alergias: {patientData.allergies.join(', ')}
            </div>
          )}
        </div>

        {/* ÁREA DE VOZ */}
        <div style={{ border: '2px solid #000', padding: '3rem', background: isRecording ? '#000' : '#fff', color: isRecording ? '#fff' : '#000', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <button 
              onClick={toggleRecording}
              style={{ 
                width: '80px', height: '80px', borderRadius: '50%', 
                backgroundColor: isRecording ? '#fff' : '#000', 
                color: isRecording ? '#ef4444' : '#fff', 
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' 
              }}
              onMouseOver={e=>e.currentTarget.style.transform='scale(1.05)'}
              onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}
              disabled={isProcessingAI}
            >
              {isProcessingAI ? <Loader2 size={40} className="spin" color={isRecording ? '#000' : '#fff'} /> : (isRecording ? <MicOff size={40} /> : <Mic size={40} />)}
            </button>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 0.5rem 0' }}>
                {isProcessingAI ? 'Gemini AI estructurando...' : (isRecording ? 'Escuchando consulta...' : 'Asistente de Voz IA (Gemini 1.5)')}
              </h3>
              <p style={{ fontSize: '1.125rem', color: isRecording ? '#ccc' : '#555', margin: 0 }}>
                {isProcessingAI ? 'Aplicando estándares médicos y rellenando los campos...' : (isRecording ? 'Habla con naturalidad sobre síntomas, exploración y recetas.' : 'Presiona para dictar. La IA organizará la nota médica y el plan de tratamiento automáticamente.')}
              </p>
            </div>
          </div>
          
          {transcription && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', borderLeft: `4px solid ${isRecording ? '#fff' : '#000'}`, fontSize: '1.25rem', fontStyle: 'italic', lineHeight: 1.6 }}>
              "{transcription}"
            </div>
          )}
        </div>

        {/* NOTAS SOAP */}
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.04em', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem' }}>
            Expediente Clínico (SOAP)
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div>
              <label style={labelStyle}>Subjetivo (Síntomas, Motivo)</label>
              <textarea 
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} 
                value={soapNotes.subjective} 
                onChange={e => setSoapNotes({...soapNotes, subjective: e.target.value})} 
                placeholder="El paciente refiere..." 
                onFocus={e => e.target.style.borderBottom = '2px solid #000'}
                onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}
              />
            </div>
            <div>
              <label style={labelStyle}>Objetivo (Exploración, Signos vitales)</label>
              <textarea 
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} 
                value={soapNotes.objective} 
                onChange={e => setSoapNotes({...soapNotes, objective: e.target.value})} 
                placeholder="TA 120/80, FC 80..." 
                onFocus={e => e.target.style.borderBottom = '2px solid #000'}
                onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Análisis (Diagnóstico)</label>
              <textarea 
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} 
                value={soapNotes.assessment} 
                onChange={e => setSoapNotes({...soapNotes, assessment: e.target.value})} 
                placeholder="Faringoamigdalitis aguda..." 
                onFocus={e => e.target.style.borderBottom = '2px solid #000'}
                onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}
              />
            </div>
          </div>
        </div>

        {/* TRATAMIENTO */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.04em', margin: 0 }}>
              Plan de Tratamiento
            </h2>
            <button 
              onClick={addTreatment} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#000', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseOver={e=>e.currentTarget.style.opacity=0.8}
              onMouseOut={e=>e.currentTarget.style.opacity=1}
            >
              <Plus size={18} /> Añadir Fármaco
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {treatments.map((t, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '2rem', alignItems: 'start', padding: '1.5rem', border: '1px solid #e5e5e5' }}>
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle}>Fármaco / Principio Activo</label>
                  <input 
                    type="text" 
                    style={inputStyle} 
                    value={t.medication} 
                    onChange={e => handleMedicationChange(index, e.target.value)} 
                    onFocus={(e) => {
                      e.target.style.borderBottom = '2px solid #000';
                      setActiveMedInput(index);
                      if (t.medication.length > 1) handleMedicationChange(index, t.medication);
                    }}
                    onBlur={(e) => {
                      e.target.style.borderBottom = '2px solid #e5e5e5';
                      setTimeout(() => setActiveMedInput(null), 200);
                    }}
                    placeholder="Ej. Paracetamol 500mg" 
                  />
                  {activeMedInput === index && medSuggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '2px solid #000', marginTop: '0.25rem', zIndex: 10, maxHeight: '250px', overflowY: 'auto' }}>
                      {medSuggestions.map(med => (
                        <div 
                          key={med.id} 
                          onClick={() => selectMedication(index, med)}
                          style={{ padding: '1rem', borderBottom: '1px solid #e5e5e5', cursor: 'pointer' }}
                        >
                          <div style={{ fontWeight: 600, color: '#000' }}>{med.name}</div>
                          <div style={{ fontSize: '0.875rem', color: '#555' }}>{med.activePrinciple} {med.presentation ? `| ${med.presentation}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Dosis</label>
                  <input type="text" style={inputStyle} value={t.dose} onChange={e => updateTreatment(index, 'dose', e.target.value)} placeholder="Ej. 1 tableta" onFocus={e => e.target.style.borderBottom = '2px solid #000'} onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'} />
                </div>
                <div>
                  <label style={labelStyle}>Frecuencia (Cada)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" style={{...inputStyle, width: '60px'}} value={t.frequencyNumber || ''} onChange={e => updateTreatment(index, 'frequencyNumber', e.target.value)} placeholder="8" onFocus={e => e.target.style.borderBottom = '2px solid #000'} onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'} />
                    <select style={{...inputStyle, flex: 1}} value={t.frequencyUnit} onChange={e => updateTreatment(index, 'frequencyUnit', e.target.value)} onFocus={e => e.target.style.borderBottom = '2px solid #000'} onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}>
                      <option value="horas">Horas</option>
                      <option value="días">Días</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Duración (Por)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" style={{...inputStyle, width: '60px'}} value={t.durationNumber || ''} onChange={e => updateTreatment(index, 'durationNumber', e.target.value)} placeholder="5" onFocus={e => e.target.style.borderBottom = '2px solid #000'} onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'} />
                    <select style={{...inputStyle, flex: 1}} value={t.durationUnit} onChange={e => updateTreatment(index, 'durationUnit', e.target.value)} onFocus={e => e.target.style.borderBottom = '2px solid #000'} onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}>
                      <option value="días">Días</option>
                      <option value="semanas">Semanas</option>
                      <option value="meses">Meses</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => removeTreatment(index)} style={{ marginTop: '2rem', background: 'transparent', border: 'none', color: '#000', cursor: 'pointer', padding: '0.5rem' }} title="Eliminar este tratamiento" onMouseOver={e=>e.currentTarget.style.color='#ef4444'} onMouseOut={e=>e.currentTarget.style.color='#000'}>
                  <Trash2 size={24} />
                </button>
              </div>
            ))}
            
            {treatments.length === 0 && (
              <div style={{ padding: '4rem 0', textAlign: 'center', color: '#888', fontSize: '1.125rem' }}>
                No hay tratamientos agregados.
              </div>
            )}
          </div>
        </div>

        {/* INDICACIONES */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.04em', margin: 0 }}>
              Indicaciones Generales
            </h2>
            <button 
              onClick={addIndication} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: '#000', border: '2px solid #000', padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e=>{e.currentTarget.style.background='#000'; e.currentTarget.style.color='#fff'}}
              onMouseOut={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#000'}}
            >
              <Plus size={18} /> Añadir Indicación
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {indications.map((ind, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 3fr auto', gap: '2rem', alignItems: 'start', padding: '1.5rem', border: '1px solid #e5e5e5' }}>
                <div>
                  <label style={labelStyle}>Categoría</label>
                  <select style={inputStyle} value={ind.type} onChange={e => updateIndication(index, 'type', e.target.value)} onFocus={e => e.target.style.borderBottom = '2px solid #000'} onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}>
                    <option value="General">General</option>
                    <option value="Dieta">Dieta</option>
                    <option value="Reposo">Reposo / Actividad</option>
                    <option value="Cuidados">Cuidados Específicos</option>
                    <option value="Signos de Alarma">Signos de Alarma</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Instrucción</label>
                  <input type="text" style={inputStyle} value={ind.instruction} onChange={e => updateIndication(index, 'instruction', e.target.value)} placeholder="Ej. Evitar grasas e irritantes, reposo relativo" onFocus={e => e.target.style.borderBottom = '2px solid #000'} onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'} />
                </div>
                <button onClick={() => removeIndication(index)} style={{ marginTop: '2rem', background: 'transparent', border: 'none', color: '#000', cursor: 'pointer', padding: '0.5rem' }} title="Eliminar indicación" onMouseOver={e=>e.currentTarget.style.color='#ef4444'} onMouseOut={e=>e.currentTarget.style.color='#000'}>
                  <Trash2 size={24} />
                </button>
              </div>
            ))}
            
            {indications.length === 0 && (
              <div style={{ padding: '4rem 0', textAlign: 'center', color: '#888', fontSize: '1.125rem' }}>
                No hay indicaciones generales agregadas.
              </div>
            )}
          </div>
        </div>

        {/* VERIFICACIÓN Y ACCIONES */}
        <div style={{ borderTop: '2px solid #000', paddingTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontSize: '1.125rem', color: '#000', fontWeight: 600 }}>
            <input 
              type="checkbox" 
              checked={isVerified} 
              onChange={(e) => setIsVerified(e.target.checked)} 
              style={{ width: '1.5rem', height: '1.5rem', accentColor: '#000' }}
            />
            He verificado que la transcripción y el plan de tratamiento son correctos.
          </label>
          
          <div style={{ display: 'flex', gap: '1.5rem', width: '100%', justifyContent: 'flex-end' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1.5rem 3rem', border: '2px solid #000', background: 'transparent', color: '#000', fontSize: '1.125rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>{e.currentTarget.style.background='#f5f5f5'}} onMouseOut={e=>{e.currentTarget.style.background='transparent'}}>
              <Save size={20} /> Guardar Borrador
            </button>
            <button 
              onClick={handleFinish} 
              disabled={!isVerified}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1.5rem 3rem', border: 'none', background: '#000', color: '#fff', fontSize: '1.125rem', fontWeight: 700, cursor: isVerified ? 'pointer' : 'not-allowed', opacity: isVerified ? 1 : 0.5, transition: 'opacity 0.2s' }}
              onMouseOver={e=>{if(isVerified) e.currentTarget.style.opacity=0.8}} 
              onMouseOut={e=>{if(isVerified) e.currentTarget.style.opacity=1}}
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
