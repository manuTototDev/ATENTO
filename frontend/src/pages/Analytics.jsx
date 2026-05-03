import React from 'react';
import { BarChart2, TrendingUp, DollarSign } from 'lucide-react';

const Analytics = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Reportes y Finanzas</h1>
      </div>

      <div className="dashboard-panel" style={{ minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <BarChart2 size={64} color="var(--border)" />
        <h2 style={{ color: 'var(--text-muted)' }}>Módulo Financiero (Próximamente)</h2>
        <p style={{ color: 'var(--text-muted)' }}>Aquí verás gráficas de tus ingresos, número de pacientes por mes, y diagnósticos más comunes.</p>
      </div>
    </div>
  );
};

export default Analytics;
