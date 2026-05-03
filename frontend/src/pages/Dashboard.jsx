import React, { useState } from 'react';
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

  // Costos de consulta configurables
  const [consultCostConfig, setConsultCostConfig] = useState({
    basePrice: 800,
    hasVariablePricing: false,
    weekendSurge: 200, // Cargo extra fines de semana
    nightSurge: 300 // Cargo extra nocturno
  });

  // Datos simulados (Estos vendrán de Supabase después)
  const stats = {
    todayPatients: 8,
    todayEarnings: 4500,
    totalPatients: 142
  };

  const recentConsults = [
    { id: 1, patient: 'María López', time: '10:30 AM', type: 'Primera Vez', cost: 600, status: 'Completada' },
    { id: 2, patient: 'Carlos Ramírez', time: '11:15 AM', type: 'Seguimiento', cost: 400, status: 'Completada' },
    { id: 3, patient: 'Ana Silva', time: '12:00 PM', type: 'Lectura de Estudios', cost: 300, status: 'Completada' },
  ];

  const upcomingAppointments = [
    { id: 4, patient: 'Roberto Gómez', time: '04:00 PM', reason: 'Dolor abdominal' },
    { id: 5, patient: 'Elena Torres', time: '04:45 PM', reason: 'Control mensual' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const startConsultation = (e) => {
    e.preventDefault();
    // Aquí buscaríamos al paciente o lo crearíamos
    console.log('Iniciando consulta para:', searchQuery);
    alert('Navegando a pantalla de Expediente/Consulta para: ' + (searchQuery || 'Nuevo Paciente'));
    setShowNewConsultModal(false);
  };

  return (
    <div className="dashboard-container">
      {/* HEADER TOP BAR */}
      <header className="dashboard-header">
        <div className="logo-container" style={{ margin: 0 }}>
          <Activity size={28} strokeWidth={2.5} className="logo-icon" />
          <h1 className="logo-text" style={{ fontSize: '1.25rem' }}>Atento</h1>
        </div>

        <div className="user-profile-mini">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>Dr. Médico</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cardiología</div>
          </div>
          <div className="avatar-circle">M</div>
          <button 
            onClick={() => setShowSettingsModal(true)}
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
              <h3>Ingresos del Día</h3>
              <div className="stat-value">${stats.todayEarnings} <span style={{ fontSize:'1rem', color:'var(--text-muted)', fontWeight:400 }}>MXN</span></div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
              <DollarSign size={24} />
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
              <div className="form-group">
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
                    alert('Navegando a formulario de creación de paciente...');
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
