import React from 'react';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';

const CalendarView = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Agenda Médica</h1>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Agendar Cita
        </button>
      </div>

      <div className="dashboard-panel" style={{ minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <CalendarIcon size={64} color="var(--border)" />
        <h2 style={{ color: 'var(--text-muted)' }}>Vista de Calendario (Próximamente)</h2>
        <p style={{ color: 'var(--text-muted)' }}>Aquí se integrará el calendario interactivo de citas por día, semana y mes.</p>
      </div>
    </div>
  );
};

export default CalendarView;
