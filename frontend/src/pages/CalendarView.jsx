import React, { useState, useEffect } from 'react';
import { Clock, Plus, X, Settings, CalendarX2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../utils/api';

// Mapa presentacional: valores reales del backend (SCHEDULED/COMPLETED/CANCELLED)
// hacia la variante visual correspondiente del sistema de diseño.
const STATUS_META = {
  SCHEDULED: { label: 'Programada', className: 'status-scheduled' },
  COMPLETED: { label: 'Completada', className: 'status-completed' },
  CANCELLED: {
    label: 'Cancelada',
    style: { backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid #FECACA' },
  },
};

const getStatusMeta = (status) => STATUS_META[status] || STATUS_META.SCHEDULED;

const formatGroupLabel = (dateStr) => {
  const label = new Date(dateStr).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

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

  // Agrupación puramente presentacional por día, para dar jerarquía de
  // "navegación de fecha" sobre la lista plana de citas ya cargadas.
  const groupedAppointments = appointments.reduce((groups, app) => {
    const dayKey = new Date(app.startTime).toDateString();
    if (!groups[dayKey]) groups[dayKey] = [];
    groups[dayKey].push(app);
    return groups;
  }, {});

  const orderedDayKeys = Object.keys(groupedAppointments).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>

      {/* PAGE HEADER: título + acciones */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-1)' }}>Agenda Médica</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Gestiona tus próximas citas y disponibilidad.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>
              Dr. {doctorProfile?.firstName || 'Médico'} {doctorProfile?.lastName || ''}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {doctorProfile?.profile?.specialty?.name || 'Especialista'}
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="btn-ghost"
            style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)' }}
            title="Configuración de Perfil"
            aria-label="Configuración de Perfil"
          >
            <Settings size={20} />
          </button>
          <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>
            <Plus size={18} /> Agendar Cita
          </button>
        </div>
      </motion.div>

      {/* LISTA DE CITAS */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="dashboard-panel"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
          <Clock size={20} />
          <h2 className="panel-title">Próximas Citas</h2>
        </div>

        {appointments.length === 0 ? (
          <div className="empty-state">
            <CalendarX2 size={32} />
            <p style={{ fontWeight: 500, color: 'var(--text-dark)' }}>No hay citas agendadas.</p>
            <p style={{ fontSize: '0.85rem' }}>Crea una nueva cita para empezar a llenar tu agenda.</p>
            <button className="btn-secondary" style={{ marginTop: 'var(--space-3)', width: 'auto' }} onClick={() => setShowModal(true)}>
              <Plus size={16} /> Agendar Cita
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {orderedDayKeys.map((dayKey, groupIndex) => (
              <div key={dayKey}>
                {/* Encabezado de fecha: separa la "navegación de fecha" de la lista */}
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    paddingBottom: 'var(--space-2)',
                    marginBottom: 'var(--space-3)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {formatGroupLabel(dayKey)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {groupedAppointments[dayKey].map((app, i) => {
                    const meta = getStatusMeta(app.status);
                    const badgeClassName = meta.className ? `status-badge ${meta.className}` : 'status-badge';
                    return (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: Math.min(groupIndex * 0.05 + i * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-5)',
                          padding: 'var(--space-4)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          transition: `border-color var(--duration-base) var(--ease-out), background-color var(--duration-base) var(--ease-out)`,
                          flexWrap: 'wrap',
                        }}
                        whileHover={{ borderColor: 'var(--border-focus)' }}
                      >
                        <div style={{ textAlign: 'center', minWidth: '84px' }}>
                          <div style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '1.25rem' }}>
                            {new Date(app.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <div style={{ flex: 1, minWidth: '200px', borderLeft: '1px solid var(--border)', paddingLeft: 'var(--space-5)' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '1.05rem', marginBottom: '0.15rem' }}>
                            {app.patientName || 'Paciente No Registrado'}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--space-2)' }}>
                            {app.reason}
                          </div>
                          <span className={badgeClassName} style={meta.style}>
                            {meta.label}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDelete(app.id)}
                          disabled={isLoading}
                          className="btn-ghost"
                          style={{ padding: '0.6rem', color: 'var(--text-muted)' }}
                          title="Eliminar Cita"
                          aria-label="Eliminar Cita"
                          onMouseOver={e => { e.currentTarget.style.color = 'var(--error)'; }}
                          onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* MODAL: NUEVA CITA */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-5)' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Nueva Cita</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-ghost"
                  style={{ padding: '0.4rem' }}
                  aria-label="Cerrar"
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-field">
                  <label className="form-label">Nombre del Paciente</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.patientName}
                    onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Motivo de la Cita</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Ej. Revisión mensual"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Fecha de la Cita</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-field">
                    <label className="form-label">Hora de Inicio</label>
                    <input
                      type="time"
                      required
                      className="form-input"
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Hora de Fin</label>
                    <input
                      type="time"
                      required
                      className="form-input"
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary" style={{ marginTop: 'var(--space-2)' }}>
                  {isLoading ? 'Guardando...' : 'Guardar Cita'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;
