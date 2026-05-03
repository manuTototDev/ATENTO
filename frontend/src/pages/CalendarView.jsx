import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, X } from 'lucide-react';

const CalendarView = () => {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ patientName: '', reason: '', startTime: '', endTime: '' });

  const userId = localStorage.getItem('userId');

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/appointments?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userId) fetchAppointments();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      });
      if (res.ok) {
        fetchAppointments();
        setShowModal(false);
        setFormData({ patientName: '', reason: '', startTime: '', endTime: '' });
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
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Agenda Médica</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Agendar Cita
        </button>
      </div>

      <div className="dashboard-panel">
        <h2 className="panel-title" style={{ marginBottom: '1.5rem' }}>
          <Clock size={20} color="var(--primary)" /> Próximas Citas
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay citas agendadas.</div>
          ) : (
            appointments.map(app => (
              <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ background: 'var(--input-bg)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', minWidth: '150px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>
                    {new Date(app.startTime).toLocaleDateString('es-MX')}
                  </div>
                  <div style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '1.1rem' }}>
                    {new Date(app.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '1.1rem' }}>{app.patientName || 'Paciente No Registrado'}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{app.reason}</div>
                  <span className={`status-badge status-${app.status.toLowerCase()}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>{app.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Agendar Nueva Cita</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Nombre del Paciente</label>
                <input type="text" className="form-input" required value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} placeholder="Ej. Juan Pérez" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Motivo de la Cita</label>
                <input type="text" className="form-input" required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="Ej. Revisión mensual" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Fecha y Hora de Inicio</label>
                  <input type="datetime-local" className="form-input" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Fecha y Hora de Fin</label>
                  <input type="datetime-local" className="form-input" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '1rem' }}>
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
