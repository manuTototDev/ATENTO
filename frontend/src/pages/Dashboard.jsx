import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  DollarSign, 
  Calendar, 
  Plus, 
  Search, 
  Clock, 
  FileText,
  UserPlus,
  LogOut,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Estilos específicos del dashboard

const Dashboard = () => {
  const navigate = useNavigate();
  const [showNewConsultModal, setShowNewConsultModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real data state
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [stats, setStats] = useState({ todayPatients: 0, todayEarnings: 0, totalPatients: 0 });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentConsults, setRecentConsults] = useState([]);
  const [patients, setPatients] = useState([]);
  
  const userId = localStorage.getItem('userId');

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, appointmentsRes, patientsRes, profileRes] = await Promise.all([
          fetch(`http://localhost:5000/api/analytics?userId=${userId}`),
          fetch(`http://localhost:5000/api/appointments?userId=${userId}`),
          fetch(`http://localhost:5000/api/patients?userId=${userId}`),
          fetch(`http://localhost:5000/api/profile?userId=${userId}`)
        ]);

        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          setStats({
            todayPatients: aData.totalAppointments, // Simulado
            todayEarnings: aData.totalEarnings,
            totalPatients: aData.totalPatients
          });
        }

        if (appointmentsRes.ok) {
          const appData = await appointmentsRes.json();
          // Solo mostrar las de hoy en adelante, limitado a 5
          const upcoming = appData
            .filter(a => new Date(a.startTime) >= new Date())
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .slice(0, 5)
            .map(a => ({
              id: a.id,
              patient: a.patientName,
              time: new Date(a.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
              reason: a.reason
            }));
          setUpcomingAppointments(upcoming);
        }

        if (patientsRes.ok) {
          const pData = await patientsRes.json();
          setPatients(pData);
        }

        if (profileRes.ok) {
          const profData = await profileRes.json();
          setDoctorProfile(profData);
        }
      } catch (error) {
        console.error(error);
      }
    };
    
    if (userId) fetchDashboardData();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

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
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) || 
               (p.phone && p.phone.includes(searchQuery));
      }).slice(0, 5);

  return (
    <div className="dashboard-container">
      {/* HEADER TOP BAR */}
      <header className="dashboard-header" style={{ justifyContent: 'flex-end' }}>

        <div className="user-profile-mini">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>
              Dr. {doctorProfile?.firstName || 'Médico'} {doctorProfile?.lastName || ''}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {doctorProfile?.profile?.specialty?.name || 'Médico General'}
            </div>
          </div>
          <div className="avatar-circle">
            {doctorProfile?.firstName ? doctorProfile.firstName.charAt(0).toUpperCase() : 'M'}
          </div>
          <button 
            onClick={() => navigate('/settings')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: '1rem' }}
            title="Configuración de Perfil"
          >
            <UserPlus size={20} />
          </button>
          <button 
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: '0.5rem' }}
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* PANEL DE ACCIONES RÁPIDAS */}
        <div className="quick-actions">
          <button className="btn-primary" onClick={() => setShowNewConsultModal(true)} style={{ padding: '0.75rem 1.5rem' }}>
            <Plus size={20} />
            Iniciar Nueva Consulta
          </button>
          <button className="btn-secondary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            <Calendar size={20} color="var(--text-muted)" />
            Agendar Cita
          </button>
        </div>

        {/* MÉTRICAS (KPIs) */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>Consultas Hoy</h3>
              <div className="stat-value">{stats.todayPatients}</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
              <Users size={24} />
            </div>
          </div>



          <div className="stat-card">
            <div className="stat-info">
              <h3>Pacientes Totales</h3>
              <div className="stat-value">{stats.totalPatients}</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
              <Activity size={24} />
            </div>
          </div>
        </section>

        {/* MAIN CONTENT GRID */}
        <section className="dashboard-content-grid">
          
          {/* COLUMNA IZQUIERDA: Historial de Consultas */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <FileText size={20} color="var(--primary)" />
                Consultas Recientes
              </h2>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Hora</th>
                  <th>Tipo</th>
                  <th>Cobro</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentConsults.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.patient}</td>
                    <td>{c.time}</td>
                    <td>{c.type}</td>
                    <td>${c.cost}</td>
                    <td>
                      <span className={`status-badge ${c.status === 'Completada' ? 'status-completed' : ''}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* COLUMNA DERECHA: Agenda / Próximos */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <Clock size={20} color="var(--primary)" />
                Siguientes en Espera
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingAppointments.map(app => (
                <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ background: 'var(--input-bg)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, color: 'var(--primary)', fontSize: '0.875rem' }}>
                    {app.time}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{app.patient}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{app.reason}</div>
                  </div>
                </div>
              ))}
              
              {upcomingAppointments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No hay más pacientes en espera hoy.
                </div>
              )}
            </div>
          </div>

        </section>
      </main>

      {/* MODAL: INICIAR NUEVA CONSULTA */}
      {showNewConsultModal && (
        <div className="modal-overlay" onClick={() => setShowNewConsultModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-dark)' }}>Iniciar Consulta</h2>
              <button onClick={() => setShowNewConsultModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={startConsultation}>
              <div className="form-group" style={{ position: 'relative' }}>
                <label>Buscar Paciente (Nombre, Teléfono o CURP)</label>
                <div className="input-wrapper">
                  <Search size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Juan Pérez..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                {searchQuery.trim() !== '' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginTop: '0.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredSearchPatients.length > 0 ? (
                      filteredSearchPatients.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => {
                            setSearchQuery(`${p.firstName} ${p.lastName}`);
                          }}
                          style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--text-dark)' }}>{p.firstName} {p.lastName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tel: {p.phone || 'No registrado'}</div>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchQuery(`${p.firstName} ${p.lastName}`);
                              navigate(`/consultation/${p.id}`);
                              setShowNewConsultModal(false);
                            }}
                            className="btn-primary"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
                          >
                            Iniciar
                          </button>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        No se encontraron coincidencias.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Continuar a Consulta
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                  onClick={() => {
                    navigate('/patient/new');
                    setShowNewConsultModal(false);
                  }}
                >
                  <UserPlus size={18} />
                  Crear Nuevo Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURACIÓN DE PERFIL Y COSTOS */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-dark)' }}>Configuración Financiera</h2>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Establece tus tarifas. Al terminar cada consulta médica, el sistema te sugerirá este costo, pero podrás modificarlo antes de cobrar.
              </p>

              <div className="form-group">
                <label>Costo Base de Consulta ($ MXN)</label>
                <div className="input-wrapper">
                  <DollarSign size={18} className="input-icon" />
                  <input
                    type="number"
                    className="form-input"
                    value={consultCostConfig.basePrice}
                    onChange={(e) => setConsultCostConfig({...consultCostConfig, basePrice: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-options" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <label className="remember-me" style={{ color: 'var(--text-dark)', fontWeight: 500 }}>
                  <input 
                    type="checkbox" 
                    checked={consultCostConfig.hasVariablePricing}
                    onChange={(e) => setConsultCostConfig({...consultCostConfig, hasVariablePricing: e.target.checked})}
                  />
                  <span>Manejar tarifas variables por día/hora</span>
                </label>
              </div>

              {consultCostConfig.hasVariablePricing && (
                <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'grid', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Cargo extra fines de semana ($)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={consultCostConfig.weekendSurge}
                      onChange={(e) => setConsultCostConfig({...consultCostConfig, weekendSurge: e.target.value})}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Cargo extra horario nocturno ($)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={consultCostConfig.nightSurge}
                      onChange={(e) => setConsultCostConfig({...consultCostConfig, nightSurge: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <button 
                className="btn-primary" 
                style={{ marginTop: '2rem', width: '100%' }}
                onClick={() => {
                  alert('Configuración guardada en Base de Datos.');
                  setShowSettingsModal(false);
                }}
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
