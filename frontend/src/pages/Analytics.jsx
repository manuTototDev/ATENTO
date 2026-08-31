import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Calendar, AlertTriangle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api';
import './Dashboard.css';

const cardVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

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

  // Variación de ingresos derivada de los dos últimos puntos ya cargados
  // (comparación puramente visual, no requiere datos adicionales del backend).
  const monthlyRevenue = stats?.monthlyRevenue || [];
  const lastValue = monthlyRevenue[monthlyRevenue.length - 1]?.value;
  const prevValue = monthlyRevenue[monthlyRevenue.length - 2]?.value;
  const revenueTrend =
    lastValue != null && prevValue != null && prevValue !== 0
      ? ((lastValue - prevValue) / prevValue) * 100
      : null;

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-1)' }}>Reportes y Finanzas</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Un vistazo a tus ingresos y actividad de consultorio.
          </p>
        </div>
      </div>

      {error ? (
        <div
          className="dashboard-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-7)',
            textAlign: 'center',
          }}
        >
          <AlertTriangle size={28} color="var(--error)" />
          <p style={{ color: 'var(--error)', fontWeight: 500 }}>{error}</p>
        </div>
      ) : !stats ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="stats-grid">
            {[0, 1, 2].map(i => (
              <div key={i} className="stat-card">
                <div className="stat-info" style={{ width: '100%' }}>
                  <div className="skeleton" style={{ width: '60%', height: '0.875rem', marginBottom: 'var(--space-3)' }} />
                  <div className="skeleton" style={{ width: '40%', height: '1.75rem' }} />
                </div>
                <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
          <div className="dashboard-panel">
            <div className="skeleton" style={{ width: '220px', height: '1.1rem', marginBottom: 'var(--space-5)' }} />
            <div className="skeleton" style={{ width: '100%', height: '200px' }} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          <div className="stats-grid">
            <motion.div
              className="stat-card"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="stat-info">
                <h3>Ingresos Acumulados</h3>
                <div className="stat-value" style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>
                  ${stats.totalEarnings.toLocaleString('es-MX')}{' '}
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>MXN</span>
                </div>
                {revenueTrend !== null && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginTop: 'var(--space-2)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: revenueTrend >= 0 ? 'var(--success)' : 'var(--error)',
                    }}
                  >
                    {revenueTrend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(revenueTrend).toFixed(1)}% vs. mes anterior
                  </div>
                )}
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                <DollarSign size={24} />
              </div>
            </motion.div>

            <motion.div
              className="stat-card"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="stat-info">
                <h3>Pacientes Únicos</h3>
                <div className="stat-value" style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>
                  {stats.totalPatients}
                </div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                <Users size={24} />
              </div>
            </motion.div>

            <motion.div
              className="stat-card"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="stat-info">
                <h3>Citas Agendadas</h3>
                <div className="stat-value" style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>
                  {stats.totalAppointments}
                </div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
                <Calendar size={24} />
              </div>
            </motion.div>
          </div>

          <motion.div
            className="dashboard-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="panel-title" style={{ marginBottom: 'var(--space-5)' }}>Evolución de Ingresos</h2>

            {monthlyRevenue.length === 0 ? (
              <div className="empty-state">
                <BarChart3 size={32} />
                <p style={{ fontWeight: 500, color: 'var(--text-dark)' }}>Aún no hay ingresos registrados.</p>
                <p style={{ fontSize: '0.85rem' }}>La evolución mensual aparecerá aquí en cuanto tengas consultas cobradas.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: 'var(--space-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-2)' }}>
                {monthlyRevenue.map((rev, i) => {
                  const max = Math.max(...monthlyRevenue.map(r => r.value), 1);
                  const height = Math.max((rev.value / max) * 100, 5); // min 5% de altura visible

                  return (
                    <div key={rev.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: '100%', maxWidth: '60px', backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.name}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dark)' }}>${rev.value.toLocaleString('es-MX')}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

        </div>
      )}
    </div>
  );
};

export default Analytics;
