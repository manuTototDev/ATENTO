import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, X, Plus, Users, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../utils/api';

// Por encima de este umbral, el stagger fila-por-fila se desactiva (rendimiento)
// y la tabla entra con un único fade.
const STAGGER_LIMIT = 25;

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
};

const PatientDirectory = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorProfile, setDoctorProfile] = useState(null);

  const [patientToDelete, setPatientToDelete] = useState(null);
  const [dobConfirm, setDobConfirm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, profileRes] = await Promise.all([
          apiFetch('/api/patients'),
          apiFetch('/api/profile')
        ]);

        if (patientsRes.ok) {
          const data = await patientsRes.json();
          setPatients(data);
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

  const handleDeleteClick = (p) => {
    setPatientToDelete(p);
    setDobConfirm('');
  };

  const confirmDelete = async () => {
    if (dobConfirm.trim() !== patientToDelete.dob) {
      alert('La fecha de nacimiento no coincide. Debe tener el formato exacto (ej. 15/05/1990).');
      return;
    }
    try {
      const res = await apiFetch(`/api/patients/${patientToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setPatients(patients.filter(p => p.id !== patientToDelete.id));
        setPatientToDelete(null);
      } else {
        alert('Error al eliminar paciente.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de red al eliminar paciente.');
    }
  };

  const filteredPatients = patients.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone || '').includes(searchTerm)
  );

  const useStagger = filteredPatients.length > 0 && filteredPatients.length <= STAGGER_LIMIT;

  return (
    <div style={{ padding: '2rem', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>

      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '2.1rem', marginBottom: '0.25rem', color: 'var(--primary)' }}>Directorio de Pacientes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {patients.length} {patients.length === 1 ? 'paciente registrado' : 'pacientes registrados'}
          </p>
        </div>
        <motion.button
          className="btn-primary"
          style={{ width: 'auto' }}
          onClick={() => navigate('/patient/new')}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={18} /> Nuevo Paciente
        </motion.button>
      </div>

      {/* CONTROLS */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <div className="input-wrapper" style={{ flex: '1 1 260px' }}>
          <Search size={18} className="input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por nombre o teléfono..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-secondary" style={{ flex: '0 0 auto' }}>
          <Filter size={18} /> Filtros
        </button>
      </div>

      {/* TABLE */}
      <div className="clean-panel" style={{ overflowX: 'auto', boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--radius-lg)' }}>
        <table className="data-table patient-directory-table" style={{ minWidth: '640px' }}>
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Nacimiento</th>
              <th>Teléfono</th>
              <th>Última Visita</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          {filteredPatients.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan="5" style={{ padding: 0, border: 'none' }}>
                  <div className="empty-state">
                    {patients.length === 0 ? (
                      <>
                        <Users size={32} />
                        <strong style={{ color: 'var(--text-dark)' }}>Aún no tienes pacientes registrados</strong>
                        <span>Crea el primer expediente para empezar a llevar el historial clínico.</span>
                      </>
                    ) : (
                      <>
                        <UserX size={32} />
                        <strong style={{ color: 'var(--text-dark)' }}>No se encontraron pacientes</strong>
                        <span>Ningún resultado coincide con &ldquo;{searchTerm}&rdquo;.</span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <motion.tbody
              key={useStagger ? 'stagger' : 'fade'}
              variants={useStagger ? listVariants : undefined}
              initial={useStagger ? 'hidden' : { opacity: 0 }}
              animate={useStagger ? 'visible' : { opacity: 1 }}
              transition={useStagger ? undefined : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {filteredPatients.map(p => (
                <motion.tr
                  key={p.id}
                  variants={useStagger ? rowVariants : undefined}
                >
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.dob}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.phone || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.lastVisit || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <motion.button
                        onClick={() => navigate(`/patients/${p.id}`)}
                        title="Ver Expediente"
                        whileHover={{ scale: 1.08, backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
                        whileTap={{ scale: 0.92 }}
                        style={iconBtnStyle}
                      >
                        <Eye size={17} />
                      </motion.button>
                      <motion.button
                        title="Editar Datos"
                        whileHover={{ scale: 1.08, backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
                        whileTap={{ scale: 0.92 }}
                        style={iconBtnStyle}
                      >
                        <Edit size={17} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteClick(p)}
                        title="Eliminar Paciente"
                        whileHover={{ scale: 1.08, backgroundColor: 'var(--error-bg)', color: 'var(--error)' }}
                        whileTap={{ scale: 0.92 }}
                        style={iconBtnStyle}
                      >
                        <Trash2 size={17} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          )}
        </table>
      </div>

      <style>{`
        .patient-directory-table tr:hover td {
          background-color: var(--accent-light) !important;
        }
      `}</style>

      {/* MODAL: ELIMINAR PACIENTE */}
      <AnimatePresence>
        {patientToDelete && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setPatientToDelete(null)}
          >
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
              <button
                onClick={() => setPatientToDelete(null)}
                className="btn-ghost"
                style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)', padding: '0.4rem' }}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.35rem', marginBottom: 'var(--space-3)', paddingRight: '2rem' }}>Eliminar Paciente</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 'var(--space-5)', lineHeight: 1.5 }}>
                Estás a punto de eliminar a <strong style={{ color: 'var(--text-dark)' }}>{patientToDelete.name}</strong>. Esta acción eliminará permanentemente su expediente y consultas asociadas.
              </p>

              <div className="form-field" style={{ marginBottom: 'var(--space-5)' }}>
                <label className="form-label">
                  Para confirmar, teclea su fecha de nacimiento ({patientToDelete.dob}):
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="DD/MM/YYYY"
                  value={dobConfirm}
                  onChange={e => setDobConfirm(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button
                  onClick={confirmDelete}
                  className="btn-primary"
                  style={{ flex: 1, backgroundColor: 'var(--error)', borderColor: 'var(--error)' }}
                >
                  Eliminar
                </button>
                <button onClick={() => setPatientToDelete(null)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '0.4rem',
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default PatientDirectory;
