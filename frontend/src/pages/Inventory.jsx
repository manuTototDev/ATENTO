import React from 'react';
import { Package, Plus } from 'lucide-react';

const Inventory = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Inventario Médico</h1>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Agregar Medicamento
        </button>
      </div>

      <div className="dashboard-panel" style={{ minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <Package size={64} color="var(--border)" />
        <h2 style={{ color: 'var(--text-muted)' }}>Módulo de Inventario (Próximamente)</h2>
        <p style={{ color: 'var(--text-muted)' }}>Aquí podrás registrar las medicinas que vendas directamente en el consultorio, controlar tu stock y definir precios.</p>
      </div>
    </div>
  );
};

export default Inventory;
