import React, { useState } from 'react';
import { DollarSign, Settings, Moon, CalendarDays, Sun } from 'lucide-react';

const Finances = () => {
  const [costoBase, setCostoBase] = useState(800);
  const [costoNocturno, setCostoNocturno] = useState(1200);
  const [horaNocturna, setHoraNocturna] = useState('20:00');
  const [costoSabado, setCostoSabado] = useState(1000);
  const [costoDomingo, setCostoDomingo] = useState(1500);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Finanzas y Rentabilidad</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="dashboard-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={20} /> Ingresos del Mes (Aprox)
          </h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-dark)' }}>$24,500 <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>MXN</span></div>
        </div>
      </div>

      <div className="dashboard-panel">
        <h2 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={20} /> Tabulador de Precios de Consulta
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Columna 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                <Sun size={16} color="var(--primary)" /> Costo Base (Lunes a Viernes)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                <input type="number" className="form-input" style={{ paddingLeft: '2rem' }} value={costoBase} onChange={e => setCostoBase(e.target.value)} />
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                <Moon size={16} color="#6366F1" /> Tarifa Nocturna
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aplica después de las:</label>
                  <input type="time" className="form-input" value={horaNocturna} onChange={e => setHoraNocturna(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Costo Nocturno</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                    <input type="number" className="form-input" style={{ paddingLeft: '1.75rem' }} value={costoNocturno} onChange={e => setCostoNocturno(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                <CalendarDays size={16} color="#F59E0B" /> Tarifas de Fin de Semana
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Costo Sábado</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                    <input type="number" className="form-input" style={{ paddingLeft: '1.75rem' }} value={costoSabado} onChange={e => setCostoSabado(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Costo Domingo</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                    <input type="number" className="form-input" style={{ paddingLeft: '1.75rem' }} value={costoDomingo} onChange={e => setCostoDomingo(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button className="btn-primary" style={{ marginTop: '2rem', padding: '0.75rem 2rem' }} onClick={() => alert('Tabulador de precios actualizado exitosamente')}>
          Guardar Tabulador
        </button>
      </div>
    </div>
  );
};

export default Finances;
