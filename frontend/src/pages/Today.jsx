import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, UserPlus, X, Clock, FileText, Trash2, CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import './Today.css';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const Today = () => {
  const navigate = useNavigate();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [recentConsults, setRecentConsults] = useState([]);

  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showApptModal, setShowApptModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [apptSaving, setApptSaving] = useState(false);
  const [apptForm, setApptForm] = useState({ patientName: '', reason: '', date: '', startTime: '', endTime: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, patientsRes, appointmentsRes, consultsRes] = await Promise.all([
          apiFetch('/api/profile'),
          apiFetch('/api/patients'),
          apiFetch('/api/appointments'),
          apiFetch('/api/consultations?limit=8'),
        ]);
        if (profileRes.ok) setDoctorProfile(await profileRes.json());
        if (patientsRes.ok) setPatients(await patientsRes.json());
        if (appointmentsRes.ok) setAppointments(await appointmentsRes.json());
        if (consultsRes.ok) {
          const c = await consultsRes.json();
          setRecentConsults(c.map(x => ({
            id: x.id,
            patient: x.patientName,
            time: new Date(x.createdAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
          })));
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const now = new Date();
  const todaysAppointments = useMemo(() => appointments
    .filter(a => {
      const d = new Date(a.startTime);
      return d.toDateString() === now.toDateString();
    })
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [appointments]
  );

  const upNext = useMemo(() => appointments
    .filter(a => new Date(a.startTime) >= now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 6),
    [appointments]
  );

  const filteredSearchPatients = searchQuery.trim() === ''
    ? []
    : patients.filter(p => {
        const name = p.name ? p.name.toLowerCase() : '';
        return name.includes(searchQuery.toLowerCase()) || (p.phone && p.phone.includes(searchQuery));
      }).slice(0, 5);

  const startConsultation = (e) => {
    e.preventDefault();
    if (filteredSearchPatients.length > 0) {
      navigate(`/consultation/${filteredSearchPatients[0].id}`);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('¿Eliminar esta cita?')) return;
    try {
      const res = await apiFetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (res.ok) setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    const startDateTime = new Date(`${apptForm.date}T${apptForm.startTime}:00`);
    const endDateTime = new Date(`${apptForm.date}T${apptForm.endTime}:00`);
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime()) || endDateTime <= startDateTime) return;

    setApptSaving(true);
    try {
      const res = await apiFetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientName: apptForm.patientName, reason: apptForm.reason, startTime: startDateTime, endTime: endDateTime }),
      });
      if (res.ok) {
        const newApp = await res.json();
        setAppointments(prev => [...prev, newApp]);
        setShowApptModal(false);
        setApptForm({ patientName: '', reason: '', date: '', startTime: '', endTime: '' });
      }
    } finally {
      setApptSaving(false);
    }
  };

  const doctorName = doctorProfile ? `Dr. ${doctorProfile.firstName}` : 'Doctor';
  const dateLabel = now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="today-page">
      <div className="today-header">
        <div>
          <p className="today-eyebrow">{dateLabel}</p>
          <h1 className="font-display today-greeting">{greeting()}, {doctorName}.</h1>
        </div>
        <div className="today-pills">
          <div className="today-pill">
            <span className="today-pill-value">{todaysAppointments.length}</span>
            <span className="today-pill-label">citas hoy</span>
          </div>
          <div className="today-pill">
            <span className="today-pill-value">{patients.length}</span>
            <span className="today-pill-label">pacientes</span>
          </div>
        </div>
      </div>

      <motion.button
        className="today-cta"
        onClick={() => setShowConsultModal(true)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="today-cta-icon"><Plus size={22} /></div>
        <div>
          <div className="today-cta-title">Iniciar consulta</div>
          <div className="today-cta-sub">Busca o registra un paciente para empezar a dictar</div>
        </div>
      </motion.button>

      <div className="today-grid">
        <motion.section
          className="dashboard-panel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="today-section-head">
            <h2 className="panel-title"><Clock size={20} className="pop-blue" /> Agenda de hoy</h2>
            <button className="btn-ghost" onClick={() => setShowApptModal(true)}>
              <CalendarPlus size={16} /> Agendar
            </button>
          </div>

          {upNext.length === 0 ? (
            <div className="empty-state">
              <Clock size={32} />
              <p style={{ fontWeight: 500, color: 'var(--text-dark)' }}>No hay citas próximas.</p>
              <p style={{ fontSize: '0.85rem' }}>Agenda una cita para verla aquí.</p>
            </div>
          ) : (
            <div className="today-appt-list">
              {upNext.map(app => (
                <div key={app.id} className="today-appt-row">
                  <div className="today-appt-time">
                    {new Date(app.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="today-appt-info">
                    <div className="today-appt-patient">{app.patientName || 'Paciente no registrado'}</div>
                    <div className="today-appt-reason">{app.reason}</div>
                  </div>
                  <span className={`status-badge status-${(app.status || 'scheduled').toLowerCase()}`}>
                    {app.status === 'COMPLETED' ? 'Completada' : app.status === 'CANCELLED' ? 'Cancelada' : 'Agendada'}
                  </span>
                  <button className="today-appt-delete" onClick={() => handleDeleteAppointment(app.id)} aria-label="Eliminar cita">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          className="dashboard-panel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="panel-title"><FileText size={20} className="pop-green" /> Actividad reciente</h2>
          {recentConsults.length === 0 ? (
            <div className="empty-state">
              <FileText size={32} />
              <p style={{ fontWeight: 500, color: 'var(--text-dark)' }}>Aún no hay consultas registradas.</p>
            </div>
          ) : (
            <div className="today-activity-list">
              {recentConsults.map(c => (
                <div key={c.id} className="today-activity-row">
                  <div className="today-activity-dot" />
                  <div>
                    <div className="today-activity-patient">{c.patient}</div>
                    <div className="today-activity-time">{c.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>

      <AnimatePresence>
        {showConsultModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConsultModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} onClick={e => e.stopPropagation()}>
              <div className="today-modal-head">
                <h2 className="font-display" style={{ fontSize: '1.5rem' }}>Identificar paciente</h2>
                <button className="btn-ghost" onClick={() => setShowConsultModal(false)}><X size={22} /></button>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>Busca un expediente existente o registra uno nuevo.</p>
              <form onSubmit={startConsultation}>
                <div className="form-field" style={{ position: 'relative', marginBottom: 'var(--space-5)' }}>
                  <div className="input-wrapper">
                    <Search size={18} className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nombre o teléfono..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {searchQuery.trim() !== '' && (
                    <div className="today-search-results">
                      {filteredSearchPatients.length > 0 ? filteredSearchPatients.map(p => (
                        <div key={p.id} className="today-search-item" onClick={() => navigate(`/consultation/${p.id}`)}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tel: {p.phone || 'No registrado'}</div>
                          </div>
                          <button type="button" className="btn-primary" style={{ width: 'auto', padding: '0.4rem 0.9rem' }} onClick={(e) => { e.stopPropagation(); navigate(`/consultation/${p.id}`); }}>Entrar</button>
                        </div>
                      )) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Sin coincidencias.</div>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <button type="submit" className="btn-primary">Continuar a consulta</button>
                  <button type="button" className="btn-secondary" onClick={() => { navigate('/pacientes/nuevo'); setShowConsultModal(false); }}>
                    <UserPlus size={18} /> Crear nuevo paciente
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showApptModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowApptModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} onClick={e => e.stopPropagation()}>
              <div className="today-modal-head">
                <h2 className="font-display" style={{ fontSize: '1.5rem' }}>Nueva cita</h2>
                <button className="btn-ghost" onClick={() => setShowApptModal(false)}><X size={22} /></button>
              </div>
              <form onSubmit={handleCreateAppointment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-field">
                  <label className="form-label">Nombre del paciente</label>
                  <input className="form-input" required value={apptForm.patientName} onChange={e => setApptForm({ ...apptForm, patientName: e.target.value })} placeholder="Ej. Juan Pérez" />
                </div>
                <div className="form-field">
                  <label className="form-label">Motivo</label>
                  <input className="form-input" required value={apptForm.reason} onChange={e => setApptForm({ ...apptForm, reason: e.target.value })} placeholder="Ej. Revisión mensual" />
                </div>
                <div className="form-field">
                  <label className="form-label">Fecha</label>
                  <input type="date" className="form-input" required value={apptForm.date} onChange={e => setApptForm({ ...apptForm, date: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-field">
                    <label className="form-label">Inicio</label>
                    <input type="time" className="form-input" required value={apptForm.startTime} onChange={e => setApptForm({ ...apptForm, startTime: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Fin</label>
                    <input type="time" className="form-input" required value={apptForm.endTime} onChange={e => setApptForm({ ...apptForm, endTime: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={apptSaving}>{apptSaving ? 'Guardando...' : 'Guardar cita'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Today;
