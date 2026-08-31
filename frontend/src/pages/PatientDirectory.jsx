import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, X, Users, UserPlus, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import './PatientDirectory.css';

const initialsOf = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const second = parts[1]?.[0] || '';
  return (first + second).toUpperCase();
};

const PatientDirectory = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [patientToDelete, setPatientToDelete] = useState(null);
  const [dobConfirm, setDobConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await apiFetch('/api/patients');
        if (res.ok) setPatients(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(p =>
      (p.name || '').toLowerCase().includes(q) || (p.phone || '').includes(searchTerm.trim())
    );
  }, [patients, searchTerm]);

  const handleDeleteClick = (p) => {
    setPatientToDelete(p);
    setDobConfirm('');
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (dobConfirm.trim() !== patientToDelete.dob) {
      setDeleteError('La fecha no coincide. Escríbela igual que aparece arriba (DD/MM/AAAA).');
      return;
    }
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/patients/${patientToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setPatients(prev => prev.filter(p => p.id !== patientToDelete.id));
        setPatientToDelete(null);
      } else {
        setDeleteError('No se pudo eliminar al paciente. Intenta de nuevo.');
      }
    } catch (e) {
      console.error(e);
      setDeleteError('Error de red al eliminar paciente.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="patients-page">
      <div className="patients-header">
        <div>
          <p className="patients-eyebrow">
            {loading ? 'Cargando…' : `${patients.length} paciente${patients.length !== 1 ? 's' : ''} registrado${patients.length !== 1 ? 's' : ''}`}
          </p>
          <h1 className="font-display patients-title">Pacientes.</h1>
        </div>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/pacientes/nuevo')}>
          <Plus size={18} /> Nuevo Paciente
        </button>
      </div>

      <div className="input-wrapper patients-search">
        <Search size={18} className="input-icon" />
        <input
          type="text"
          className="form-input"
          placeholder="Buscar por nombre o teléfono…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="dashboard-panel patients-panel">
        {loading ? (
          <div className="patients-list">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="patient-row patient-row-skeleton">
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="skeleton" style={{ width: '40%', height: 14 }} />
                  <div className="skeleton" style={{ width: '25%', height: 12 }} />
                </div>
              </div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <Users size={32} />
            <p style={{ fontWeight: 500, color: 'var(--text-dark)' }}>Aún no tienes pacientes registrados.</p>
            <p style={{ fontSize: '0.85rem', marginBottom: 'var(--space-3)' }}>Da de alta tu primer expediente para empezar a llevar su historial.</p>
            <button className="btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/pacientes/nuevo')}>
              <UserPlus size={18} /> Registrar el primer paciente
            </button>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="empty-state">
            <Search size={32} />
            <p style={{ fontWeight: 500, color: 'var(--text-dark)' }}>Sin coincidencias para “{searchTerm}”.</p>
            <p style={{ fontSize: '0.85rem' }}>Prueba con otro nombre o número de teléfono.</p>
          </div>
        ) : (
          <div className="patients-list">
            {filteredPatients.map((p, i) => (
              <motion.div
                key={p.id}
                className="patient-row"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                onClick={() => navigate(`/pacientes/${p.id}`)}
              >
                <div className="patient-avatar">{initialsOf(p.name)}</div>
                <div className="patient-row-main">
                  <div className="patient-row-name">{p.name}</div>
                  <div className="patient-row-meta">
                    {p.dob && p.dob !== 'N/A' && <span>Nac. {p.dob}</span>}
                    {p.phone && p.phone !== 'N/A' && (
                      <span className="patient-row-phone"><Phone size={12} /> {p.phone}</span>
                    )}
                  </div>
                </div>
                <div className="patient-row-visit">
                  {p.lastVisit === 'Sin visitas' ? (
                    <span className="status-badge status-scheduled">Primera vez</span>
                  ) : (
                    <>
                      <span className="patient-row-visit-label">Última visita</span>
                      <span className="patient-row-visit-date">{p.lastVisit}</span>
                    </>
                  )}
                </div>
                <button
                  className="patient-row-delete"
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(p); }}
                  aria-label={`Eliminar a ${p.name}`}
                  title="Eliminar paciente"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {patientToDelete && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPatientToDelete(null)}>
            <motion.div className="modal-content" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <h2 className="font-display" style={{ fontSize: '1.4rem' }}>Eliminar paciente</h2>
                <button className="btn-ghost" onClick={() => setPatientToDelete(null)}><X size={20} /></button>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-5)', lineHeight: 1.5 }}>
                Estás a punto de eliminar a <strong style={{ color: 'var(--text-dark)' }}>{patientToDelete.name}</strong>. Esta acción borra permanentemente su expediente y consultas asociadas.
              </p>
              <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Para confirmar, escribe su fecha de nacimiento ({patientToDelete.dob}):</label>
                <input
                  type="text"
                  className={`form-input${deleteError ? ' has-error' : ''}`}
                  placeholder="DD/MM/AAAA"
                  value={dobConfirm}
                  onChange={e => { setDobConfirm(e.target.value); setDeleteError(''); }}
                  autoFocus
                />
                {deleteError && <span className="form-error">{deleteError}</span>}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, backgroundColor: 'var(--error)', borderColor: 'var(--error)', boxShadow: 'none' }}
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Eliminando…' : 'Eliminar'}
                </button>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setPatientToDelete(null)}>
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDirectory;
