import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Plus, Search, Clock, FileText, UserPlus, Settings, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import './Dashboard.css';

const EASE_OUT = [0.16, 1, 0.3, 1];

const topRowVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } },
};

const contentGridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [showNewConsultModal, setShowNewConsultModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Real data state
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [stats, setStats] = useState({ todayPatients: 0, todayEarnings: 0, totalPatients: 0 });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentConsults, setRecentConsults] = useState([]);
  const [patients, setPatients] = useState([]);

  // Fetch dashboard data (la identidad la resuelve el backend a partir del JWT)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, appointmentsRes, patientsRes, profileRes, consultsRes] = await Promise.all([
          apiFetch('/api/analytics'),
          apiFetch('/api/appointments'),
          apiFetch('/api/patients'),
          apiFetch('/api/profile'),
          apiFetch('/api/consultations?limit=10')
        ]);

        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          setStats(prev => ({
            ...prev,
            todayEarnings: aData.totalEarnings,
            totalPatients: aData.totalPatients
          }));
        }

        if (appointmentsRes.ok) {
          const appData = await appointmentsRes.json();
          const now = new Date();
          const upcoming = appData
            .filter(a => new Date(a.startTime) >= now)
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .slice(0, 5)
            .map(a => ({
              id: a.id,
              patient: a.patientName,
              time: new Date(a.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
              reason: a.reason
            }));
          setUpcomingAppointments(upcoming);

          // "Consultas Hoy" = citas de HOY, no el acumulado histórico
          const todayCount = appData.filter(a => {
            const d = new Date(a.startTime);
            return d.getFullYear() === now.getFullYear() &&
                   d.getMonth() === now.getMonth() &&
                   d.getDate() === now.getDate();
          }).length;
          setStats(prev => ({ ...prev, todayPatients: todayCount }));
        }

        if (patientsRes.ok) {
          const pData = await patientsRes.json();
          setPatients(pData);
        }

        if (profileRes.ok) {
          const profData = await profileRes.json();
          setDoctorProfile(profData);
        }

        if (consultsRes.ok) {
          const cData = await consultsRes.json();
          setRecentConsults(cData.map(c => ({
            id: c.id,
            patient: c.patientName,
            time: new Date(c.createdAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
            status: 'Completada'
          })));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboardData();
  }, []);

  const startConsultation = (e) => {
    e.preventDefault();
    if (searchQuery) {
      if (filteredSearchPatients.length > 0) {
        navigate(`/consultation/${filteredSearchPatients[0].id}`);
      } else {
        alert("Por favor, selecciona un paciente de la lista o crea uno nuevo.");
      }
    } else {
      alert("Por favor, busca un paciente o crea uno nuevo.");
    }
    setShowNewConsultModal(false);
  };

  const filteredSearchPatients = searchQuery.trim() === ''
    ? []
    : patients.filter(p => {
        const fullName = p.name ? p.name.toLowerCase() : '';
        return fullName.includes(searchQuery.toLowerCase()) ||
               (p.phone && p.phone.includes(searchQuery));
      }).slice(0, 5);

  return (
    <div className="dashboard-container">
      {/* HEADER TOP BAR */}
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Panel</p>
          <h1 className="dashboard-heading">Resumen del consultorio</h1>
        </div>

        <div className="dashboard-profile">
          <div className="dashboard-profile-text">
            <div className="dashboard-profile-name">
              Dr. {doctorProfile?.firstName || 'Médico'} {doctorProfile?.lastName || ''}
            </div>
            <div className="dashboard-profile-specialty">
              {doctorProfile?.profile?.specialty?.name || 'Especialista'}
            </div>
          </div>
          <motion.button
            className="btn-ghost dashboard-settings-btn"
            onClick={() => navigate('/settings')}
            title="Configuración de Perfil"
            aria-label="Configuración de perfil"
            whileHover={{ rotate: 45 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
          >
            <Settings size={20} />
          </motion.button>
        </div>
      </header>

      <main className="dashboard-main">

        {/* TOP ROW: ACTIONS & KPIs */}
        <motion.div className="stats-grid" variants={topRowVariants} initial="hidden" animate="show">

          {/* PRIMARY ACTION */}
          <motion.div
            className="cta-card"
            variants={cardVariants}
            role="button"
            tabIndex={0}
            onClick={() => setShowNewConsultModal(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowNewConsultModal(true); } }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={28} />
            <div>
              <h2 className="cta-title">
                Iniciar <br /> Consulta
              </h2>
              <div className="cta-subtitle">
                Atender paciente <ArrowRight size={16} />
              </div>
            </div>
          </motion.div>

          {/* STAT 1 */}
          <motion.div className="stat-card" variants={cardVariants}>
            <div className="stat-info">
              <h3>Consultas Hoy</h3>
              <div className="stat-value">{stats.todayPatients}</div>
            </div>
            <div className="stat-icon">
              <Users size={22} />
            </div>
          </motion.div>

          {/* STAT 2 */}
          <motion.div className="stat-card" variants={cardVariants}>
            <div className="stat-info">
              <h3>Pacientes Totales</h3>
              <div className="stat-value">{stats.totalPatients}</div>
            </div>
            <div className="stat-icon">
              <Activity size={22} />
            </div>
          </motion.div>
        </motion.div>

        {/* MAIN CONTENT GRID */}
        <motion.div className="dashboard-content-grid" variants={contentGridVariants} initial="hidden" animate="show">

          {/* LEFT: HISTORIAL */}
          <motion.div className="dashboard-panel" variants={cardVariants}>
            <div className="panel-header">
              <FileText size={20} />
              <h2 className="panel-title">Consultas Recientes</h2>
            </div>

            {recentConsults.length > 0 ? (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Paciente</th>
                      <th>Hora</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentConsults.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.patient}</td>
                        <td>{c.time}</td>
                        <td>
                          <span className={`status-badge ${c.status === 'Completada' ? 'status-completed' : 'status-waiting'}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <FileText size={32} />
                <p>Aún no hay consultas registradas.</p>
              </div>
            )}
          </motion.div>

          {/* RIGHT: AGENDA */}
          <motion.div className="dashboard-panel" variants={cardVariants}>
            <div className="panel-header">
              <Clock size={20} />
              <h2 className="panel-title">Siguientes en Espera</h2>
            </div>

            {upcomingAppointments.length > 0 ? (
              <div className="appointment-list">
                {upcomingAppointments.map(app => (
                  <div key={app.id} className="appointment-item">
                    <div className="appointment-time">{app.time}</div>
                    <div>
                      <div className="appointment-patient">{app.patient}</div>
                      <div className="appointment-reason">{app.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Clock size={32} />
                <p>No hay pacientes en espera.</p>
              </div>
            )}
          </motion.div>

        </motion.div>
      </main>

      {/* FULLSCREEN MODAL: INICIAR NUEVA CONSULTA */}
      {showNewConsultModal && (
        <div className="modal-overlay" onClick={() => setShowNewConsultModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="btn-ghost modal-close-btn"
              onClick={() => setShowNewConsultModal(false)}
              aria-label="Cerrar"
            >
              <X size={22} />
            </button>

            <div className="consult-modal-header">
              <h2>Identificar <br /> Paciente</h2>
              <p>Busca un expediente existente o registra uno nuevo para comenzar a dictar.</p>
            </div>

            <form onSubmit={startConsultation}>
              <div className="search-dropdown-wrapper">
                <div className="form-field">
                  <label className="form-label" htmlFor="patientSearch">Buscar por Nombre o Teléfono</label>
                  <div className="input-wrapper">
                    <Search size={18} className="input-icon" />
                    <input
                      id="patientSearch"
                      type="text"
                      className="form-input"
                      placeholder="Ej. Ana L..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                {searchQuery.trim() !== '' && (
                  <div className="search-results">
                    {filteredSearchPatients.length > 0 ? (
                      filteredSearchPatients.map(p => (
                        <div
                          key={p.id}
                          className="search-result-item"
                          onClick={() => {
                            navigate(`/consultation/${p.id}`);
                            setShowNewConsultModal(false);
                          }}
                        >
                          <div>
                            <div className="search-result-name">{p.name}</div>
                            <div className="search-result-phone">Tel: {p.phone || 'No registrado'}</div>
                          </div>
                          <button
                            type="button"
                            className="search-result-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/consultation/${p.id}`);
                              setShowNewConsultModal(false);
                            }}
                          >
                            Entrar
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="search-empty">No se encontraron coincidencias.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Continuar a Consulta
                </button>
                <div className="modal-divider">O</div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    navigate('/patient/new');
                    setShowNewConsultModal(false);
                  }}
                >
                  <UserPlus size={20} />
                  Crear Nuevo Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
