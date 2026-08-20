import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Calendar } from 'lucide-react';
import { apiFetch } from '../utils/api';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          setError('No se pudieron cargar las métricas.');
        }
      } catch (err) {
        console.error(err);
        setError('Error de conexión al cargar métricas.');
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Reportes y Finanzas</h1>
      </div>

      {error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#b91c1c' }}>{error}</div>
      ) : !stats ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Cargando métricas...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info">
                <h3>Ingresos Acumulados</h3>
                <div className="stat-value">${stats.totalEarnings} <span style={{fontSize:'1rem',fontWeight:400}}>MXN</span></div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
                <DollarSign size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Pacientes Únicos</h3>
                <div className="stat-value">{stats.totalPatients}</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
                <Users size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Citas Agendadas</h3>
                <div className="stat-value">{stats.totalAppointments}</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                <Calendar size={24} />
              </div>
            </div>
          </div>

          <div className="dashboard-panel">
            <h2 className="panel-title" style={{ marginBottom: '1.5rem' }}>Evolución de Ingresos</h2>
            
            {/* Gráfica Mockada con CSS simple para MVP */}
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {(stats.monthlyRevenue || []).map((rev, i) => {
                const max = Math.max(...(stats.monthlyRevenue || []).map(r => r.value), 1);
                const height = Math.max((rev.value / max) * 100, 5); // min 5% height
                
                return (
                  <div key={rev.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '100%', maxWidth: '60px', height: `${height}%`, backgroundColor: 'var(--primary)', borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease' }}></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.name}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>${rev.value}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Analytics;
