import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Calendar, 
  Plus, 
  Search, 
  Clock, 
  FileText,
  UserPlus,
  Settings,
  X,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
            todayPatients: aData.totalAppointments, 
            todayEarnings: aData.totalEarnings,
            totalPatients: aData.totalPatients
          });
        }

        if (appointmentsRes.ok) {
          const appData = await appointmentsRes.json();
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
        
        {/* TOP ROW: ACTIONS & KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* PRIMARY ACTION */}
          <div 
            onClick={() => setShowNewConsultModal(true)}
            style={{ 
              backgroundColor: '#000', 
              color: '#fff', 
              padding: '2.5rem 2rem', 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '200px',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={e=>e.currentTarget.style.opacity=0.9} 
            onMouseOut={e=>e.currentTarget.style.opacity=1}
          >
            <Plus size={32} />
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.5rem' }}>
                Iniciar <br/> Consulta
              </h2>
              <div style={{ fontSize: '0.875rem', color: '#a3a3a3', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Atender paciente <ArrowRight size={16} />
              </div>
            </div>
          </div>

          {/* STAT 1 */}
          <div style={{ 
            border: '2px solid #000', 
            padding: '2.5rem 2rem', 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '200px'
          }}>
            <Users size={32} color="#000" />
            <div>
              <div style={{ fontSize: '4rem', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1, color: '#000' }}>
                {stats.todayPatients}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem' }}>
                Consultas Hoy
              </h3>
            </div>
          </div>

          {/* STAT 2 */}
          <div style={{ 
            border: '2px solid #000', 
            padding: '2.5rem 2rem', 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '200px'
          }}>
            <Activity size={32} color="#000" />
            <div>
              <div style={{ fontSize: '4rem', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1, color: '#000' }}>
                {stats.totalPatients}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem' }}>
                Pacientes Totales
              </h3>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
          
          {/* LEFT: HISTORIAL */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
              <FileText size={24} color="#000" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.03em', color: '#000' }}>
                Consultas Recientes
              </h2>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <th style={{ padding: '1rem 0', fontWeight: 600, color: '#555', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Paciente</th>
                  <th style={{ padding: '1rem 0', fontWeight: 600, color: '#555', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Hora</th>
                  <th style={{ padding: '1rem 0', fontWeight: 600, color: '#555', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentConsults.length > 0 ? recentConsults.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '1.5rem 0', fontWeight: 600, color: '#000', fontSize: '1.125rem' }}>{c.patient}</td>
                    <td style={{ padding: '1.5rem 0', color: '#555' }}>{c.time}</td>
                    <td style={{ padding: '1.5rem 0' }}>
                      <span style={{ 
                        background: c.status === 'Completada' ? '#000' : '#e5e5e5', 
                        color: c.status === 'Completada' ? '#fff' : '#000', 
                        padding: '0.25rem 0.75rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" style={{ padding: '3rem 0', textAlign: 'center', color: '#888' }}>
                      Aún no hay consultas registradas hoy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* RIGHT: AGENDA */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
              <Clock size={24} color="#000" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.03em', color: '#000' }}>
                Siguientes en Espera
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingAppointments.map(app => (
                <div key={app.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', padding: '1.5rem', border: '1px solid #e5e5e5' }}>
                  <div style={{ fontWeight: 700, color: '#000', fontSize: '1.125rem', whiteSpace: 'nowrap' }}>
                    {app.time}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#000', fontSize: '1.125rem', marginBottom: '0.25rem' }}>{app.patient}</div>
                    <div style={{ color: '#555', fontSize: '0.875rem', lineHeight: 1.4 }}>{app.reason}</div>
                  </div>
                </div>
              ))}
              
              {upcomingAppointments.length === 0 && (
                <div style={{ padding: '2rem', border: '1px dashed #e5e5e5', color: '#888', textAlign: 'center' }}>
                  No hay pacientes en espera.
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* FULLSCREEN MODAL: INICIAR NUEVA CONSULTA */}
      {showNewConsultModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowNewConsultModal(false)}>
          <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '600px', padding: '4rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowNewConsultModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#000' }}>
              <X size={32} />
            </button>

            <h2 style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#000', marginBottom: '1rem', lineHeight: 1 }}>
              Identificar <br/> Paciente
            </h2>
            <p style={{ color: '#555', fontSize: '1.125rem', marginBottom: '3rem' }}>Busca un expediente existente o registra uno nuevo para comenzar a dictar.</p>

            <form onSubmit={startConsultation}>
              <div style={{ position: 'relative', marginBottom: '3rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Buscar por Nombre o Teléfono</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Search size={24} color="#000" style={{ position: 'absolute', left: 0 }} />
                  <input
                    type="text"
                    style={{ width: '100%', padding: '1rem 0 1rem 2.5rem', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.5rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                    placeholder="Ej. Ana L..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                    onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                    autoFocus
                  />
                </div>
                
                {searchQuery.trim() !== '' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '2px solid #000', marginTop: '0.5rem', zIndex: 10, maxHeight: '250px', overflowY: 'auto' }}>
                    {filteredSearchPatients.length > 0 ? (
                      filteredSearchPatients.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => {
                            setSearchQuery(p.name);
                          }}
                          style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e5e5', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: '#000', fontSize: '1.125rem' }}>{p.name}</div>
                            <div style={{ fontSize: '0.875rem', color: '#555' }}>Tel: {p.phone || 'No registrado'}</div>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/consultation/${p.id}`);
                              setShowNewConsultModal(false);
                            }}
                            style={{ background: '#000', color: '#fff', border: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Entrar
                          </button>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '1.5rem', color: '#555', fontSize: '1rem', textAlign: 'center' }}>
                        No se encontraron coincidencias.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button 
                  type="submit" 
                  style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '1.25rem', fontSize: '1.125rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseOver={e=>e.target.style.opacity=0.8} 
                  onMouseOut={e=>e.target.style.opacity=1}
                >
                  Continuar a Consulta
                </button>
                <div style={{ textAlign: 'center', margin: '0.5rem 0', color: '#888', fontSize: '0.875rem' }}>O</div>
                <button 
                  type="button" 
                  style={{ width: '100%', background: 'transparent', color: '#000', border: '2px solid #000', padding: '1.25rem', fontSize: '1.125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => {
                    navigate('/patient/new');
                    setShowNewConsultModal(false);
                  }}
                  onMouseOver={e=>{e.target.style.background='#000'; e.target.style.color='#fff'}} 
                  onMouseOut={e=>{e.target.style.background='transparent'; e.target.style.color='#000'}}
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
