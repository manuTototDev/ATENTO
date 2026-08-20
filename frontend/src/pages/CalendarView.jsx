import React, { useState, useEffect } from 'react';
import { Clock, Plus, X, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const CalendarView = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [formData, setFormData] = useState({ patientName: '', reason: '', date: '', startTime: '', endTime: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, profileRes] = await Promise.all([
          apiFetch(`/api/appointments`),
          apiFetch(`/api/profile`)
        ]);
        
        if (appRes.ok) {
          const data = await appRes.json();
          setAppointments(data);
        }
        if (profileRes.ok) {
          const profData = await profileRes.json();
          setDoctorProfile(profData);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm('¿Estás seguro de eliminar esta cita?')) {
      setIsLoading(true);
      try {
        const res = await apiFetch(`/api/appointments/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setAppointments(prev => prev.filter(a => a.id !== id));
        } else {
          const errData = await res.json().catch(() => null);
          alert(errData?.error || 'No se pudo eliminar la cita.');
        }
      } catch (e) {
        console.error(e);
        alert('Error de red al eliminar la cita.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      alert('Fecha u hora inválida. Revisa los campos.');
      return;
    }
    if (endDateTime <= startDateTime) {
      alert('La hora de término debe ser posterior a la hora de inicio.');
      return;
    }
    if (startDateTime < new Date()) {
      alert('No puedes agendar una cita en el pasado.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patientName: formData.patientName, 
          reason: formData.reason, 
          startTime: startDateTime, 
          endTime: endDateTime
        })
      });
      if (res.ok) {
        const newApp = await res.json();
        setAppointments([...appointments, newApp].sort((a,b) => new Date(a.startTime) - new Date(b.startTime)));
        setShowModal(false);
        setFormData({ patientName: '', reason: '', date: '', startTime: '', endTime: '' });
      } else {
        alert('Error al agendar cita');
      }
    } catch (error) {
      console.error(error);
      alert('Error de red');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* HEADER TOP BAR */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        padding: '1.5rem 3rem',
        borderBottom: '2px solid #000'
      }}>
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

      <main style={{ padding: '3rem', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* PAGE HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: '#000', margin: 0 }}>
              Agenda <br/> Médica.
            </h1>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            style={{ 
              backgroundColor: '#000', 
              color: '#fff', 
              border: 'none', 
              padding: '1rem 2rem', 
              fontSize: '1rem', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={e=>e.currentTarget.style.opacity=0.8}
            onMouseOut={e=>e.currentTarget.style.opacity=1}
          >
            <Plus size={20} /> Agendar Cita
          </button>
        </div>

        {/* LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
            <Clock size={24} color="#000" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.03em', color: '#000' }}>
              Próximas Citas
            </h2>
          </div>

          {appointments.length === 0 ? (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: '#888', fontSize: '1.125rem' }}>No hay citas agendadas.</div>
          ) : (
            appointments.map(app => (
              <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem', border: '1px solid #e5e5e5', transition: 'border-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.borderColor='#000'} onMouseOut={e=>e.currentTarget.style.borderColor='#e5e5e5'}>
                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                  <div style={{ fontWeight: 600, color: '#555', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    {new Date(app.startTime).toLocaleDateString('es-MX')}
                  </div>
                  <div style={{ color: '#000', fontWeight: 700, fontSize: '1.5rem' }}>
                    {new Date(app.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                <div style={{ flex: 1, borderLeft: '1px solid #e5e5e5', paddingLeft: '2rem' }}>
                  <div style={{ fontWeight: 700, color: '#000', fontSize: '1.25rem', marginBottom: '0.25rem' }}>{app.patientName || 'Paciente No Registrado'}</div>
                  <div style={{ color: '#555', fontSize: '1rem' }}>{app.reason}</div>
                  <span style={{ 
                    marginTop: '0.75rem', 
                    display: 'inline-block',
                    background: app.status === 'Completada' ? '#000' : '#f5f5f5', 
                    color: app.status === 'Completada' ? '#fff' : '#000', 
                    padding: '0.25rem 0.75rem', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {app.status}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleDelete(app.id)} style={{ background: 'transparent', border: '2px solid transparent', padding: '0.75rem', color: '#000', cursor: 'pointer', transition: 'all 0.2s' }} title="Eliminar Cita" onMouseOver={e=>{e.currentTarget.style.borderColor='#ef4444'; e.currentTarget.style.color='#ef4444'}} onMouseOut={e=>{e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#000'}}>
                    <X size={24} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
          <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '600px', padding: '4rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#000' }}><X size={32} /></button>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#000', marginBottom: '3rem', lineHeight: 1 }}>Nueva <br/>Cita.</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Nombre del Paciente</label>
                <input 
                  type="text" 
                  required 
                  value={formData.patientName} 
                  onChange={e => setFormData({...formData, patientName: e.target.value})} 
                  placeholder="Ej. Juan Pérez" 
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Motivo de la Cita</label>
                <input 
                  type="text" 
                  required 
                  value={formData.reason} 
                  onChange={e => setFormData({...formData, reason: e.target.value})} 
                  placeholder="Ej. Revisión mensual" 
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Fecha de la Cita</label>
                <input 
                  type="date" 
                  required 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Hora de Inicio</label>
                  <input 
                    type="time" 
                    required 
                    value={formData.startTime} 
                    onChange={e => setFormData({...formData, startTime: e.target.value})} 
                    style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderBottom = '2px solid #000'}
                    onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Hora de Fin</label>
                  <input 
                    type="time" 
                    required 
                    value={formData.endTime} 
                    onChange={e => setFormData({...formData, endTime: e.target.value})} 
                    style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderBottom = '2px solid #000'}
                    onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading} 
                style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '1.5rem', fontSize: '1.125rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s', marginTop: '1rem' }}
                onMouseOver={e=>{if(!isLoading) e.target.style.opacity=0.8}} 
                onMouseOut={e=>{if(!isLoading) e.target.style.opacity=1}}
              >
                {isLoading ? 'Guardando...' : 'Guardar Cita'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
