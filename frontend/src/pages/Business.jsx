import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Wallet, Package, DollarSign, Users, Calendar, TrendingUp, TrendingDown, Sun, Moon, CalendarDays, Plus, X } from 'lucide-react';
import { apiFetch } from '../utils/api';
import './Business.css';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: BarChart3 },
  { id: 'precios', label: 'Precios', icon: Wallet },
  { id: 'inventario', label: 'Inventario', icon: Package },
];

const Business = () => {
  const [tab, setTab] = useState('resumen');

  // Resumen (analytics)
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);

  // Precios (tarifas)
  const [pricing, setPricing] = useState({ basePrice: 800, nightPrice: 1200, nightTime: '20:00', saturdayPrice: 1000, sundayPrice: 1500 });
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [pricingMsg, setPricingMsg] = useState('');

  // Inventario
  const [items, setItems] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemSaving, setItemSaving] = useState(false);
  const [itemForm, setItemForm] = useState({ name: '', description: '', stock: 0, price: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, profileRes, inventoryRes] = await Promise.all([
          apiFetch('/api/analytics'),
          apiFetch('/api/profile'),
          apiFetch('/api/inventory'),
        ]);
        if (analyticsRes.ok) setStats(await analyticsRes.json());
        else setStatsError('No se pudieron cargar las métricas.');

        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.profile) {
            setPricing({
              basePrice: data.profile.basePrice ?? 800,
              nightPrice: data.profile.nightPrice ?? 1200,
              nightTime: data.profile.nightTime ?? '20:00',
              saturdayPrice: data.profile.saturdayPrice ?? 1000,
              sundayPrice: data.profile.sundayPrice ?? 1500,
            });
          }
        }
        if (inventoryRes.ok) setItems(await inventoryRes.json());
      } catch (err) {
        console.error(err);
        setStatsError('Error de conexión al cargar métricas.');
      }
    };
    load();
  }, []);

  const savePricing = async () => {
    setIsSavingPricing(true);
    setPricingMsg('');
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricing),
      });
      setPricingMsg(res.ok ? 'Tabulador actualizado.' : 'Error al guardar los precios.');
    } catch {
      setPricingMsg('Error de conexión al guardar.');
    } finally {
      setIsSavingPricing(false);
      setTimeout(() => setPricingMsg(''), 3000);
    }
  };

  const fetchInventory = async () => {
    const res = await apiFetch('/api/inventory');
    if (res.ok) setItems(await res.json());
  };

  const submitItem = async (e) => {
    e.preventDefault();
    setItemSaving(true);
    try {
      const res = await apiFetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemForm),
      });
      if (res.ok) {
        await fetchInventory();
        setShowItemModal(false);
        setItemForm({ name: '', description: '', stock: 0, price: 0 });
      }
    } finally {
      setItemSaving(false);
    }
  };

  const monthlyRevenue = stats?.monthlyRevenue || [];
  const lastValue = monthlyRevenue[monthlyRevenue.length - 1]?.value;
  const prevValue = monthlyRevenue[monthlyRevenue.length - 2]?.value;
  const revenueTrend = lastValue != null && prevValue != null && prevValue !== 0 ? ((lastValue - prevValue) / prevValue) * 100 : null;

  return (
    <div className="business-page">
      <h1 className="font-display business-title">Negocio.</h1>
      <p className="business-subtitle">Ingresos, tarifas e inventario de tu consultorio.</p>

      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'resumen' && (
          <motion.div key="resumen" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {statsError ? (
              <div className="dashboard-panel empty-state"><p style={{ color: 'var(--error)' }}>{statsError}</p></div>
            ) : !stats ? (
              <div className="stats-grid">
                {[0, 1, 2].map(i => <div key={i} className="stat-card"><div className="skeleton" style={{ width: '100%', height: '60px' }} /></div>)}
              </div>
            ) : (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-info">
                      <h3>Ingresos acumulados</h3>
                      <div className="stat-value">${stats.totalEarnings.toLocaleString('es-MX')} <span className="stat-unit">MXN</span></div>
                      {revenueTrend !== null && (
                        <div className="stat-trend" style={{ color: revenueTrend >= 0 ? 'var(--success)' : 'var(--error)' }}>
                          {revenueTrend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {Math.abs(revenueTrend).toFixed(1)}% vs. mes anterior
                        </div>
                      )}
                    </div>
                    <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><DollarSign size={22} /></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-info"><h3>Pacientes únicos</h3><div className="stat-value">{stats.totalPatients}</div></div>
                    <div className="stat-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}><Users size={22} /></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-info"><h3>Citas agendadas</h3><div className="stat-value">{stats.totalAppointments}</div></div>
                    <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><Calendar size={22} /></div>
                  </div>
                </div>

                <div className="dashboard-panel" style={{ marginTop: 'var(--space-5)' }}>
                  <h2 className="panel-title" style={{ marginBottom: 'var(--space-5)' }}>Evolución de ingresos</h2>
                  <div className="revenue-chart">
                    {monthlyRevenue.map((rev, i) => {
                      const max = Math.max(...monthlyRevenue.map(r => r.value), 1);
                      const barMaxPx = 160;
                      const heightPx = Math.max((rev.value / max) * barMaxPx, 6);
                      return (
                        <div key={rev.name} className="revenue-bar-col">
                          <motion.div
                            className="revenue-bar"
                            initial={{ height: 0 }}
                            animate={{ height: heightPx }}
                            transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                          />
                          <div className="revenue-bar-label">{rev.name}</div>
                          <div className="revenue-bar-value">${rev.value.toLocaleString('es-MX')}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {tab === 'precios' && (
          <motion.div key="precios" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="dashboard-panel">
              <div className="pricing-grid">
                <div className="form-field">
                  <label className="form-label"><Sun size={14} className="pop-gold" /> Costo base (lunes a viernes)</label>
                  <input type="number" className="form-input" value={pricing.basePrice} onChange={e => setPricing({ ...pricing, basePrice: e.target.value })} />
                </div>
                <div className="pricing-box">
                  <label className="form-label"><Moon size={14} className="pop-violet" /> Tarifa nocturna</label>
                  <div className="form-field" style={{ marginTop: 'var(--space-3)' }}>
                    <label className="form-label">Aplica después de las</label>
                    <input type="time" className="form-input" value={pricing.nightTime} onChange={e => setPricing({ ...pricing, nightTime: e.target.value })} />
                  </div>
                  <div className="form-field" style={{ marginTop: 'var(--space-3)' }}>
                    <label className="form-label">Costo nocturno</label>
                    <input type="number" className="form-input" value={pricing.nightPrice} onChange={e => setPricing({ ...pricing, nightPrice: e.target.value })} />
                  </div>
                </div>
                <div className="pricing-box">
                  <label className="form-label"><CalendarDays size={14} className="pop-blue" /> Fin de semana</label>
                  <div className="form-field" style={{ marginTop: 'var(--space-3)' }}>
                    <label className="form-label">Costo sábado</label>
                    <input type="number" className="form-input" value={pricing.saturdayPrice} onChange={e => setPricing({ ...pricing, saturdayPrice: e.target.value })} />
                  </div>
                  <div className="form-field" style={{ marginTop: 'var(--space-3)' }}>
                    <label className="form-label">Costo domingo</label>
                    <input type="number" className="form-input" value={pricing.sundayPrice} onChange={e => setPricing({ ...pricing, sundayPrice: e.target.value })} />
                  </div>
                </div>
              </div>
              {pricingMsg && <p style={{ marginTop: 'var(--space-4)', color: 'var(--success)', fontSize: '0.85rem' }}>{pricingMsg}</p>}
              <button className="btn-primary" style={{ marginTop: 'var(--space-5)', width: 'auto' }} onClick={savePricing} disabled={isSavingPricing}>
                {isSavingPricing ? 'Guardando...' : 'Guardar tabulador'}
              </button>
            </div>
          </motion.div>
        )}

        {tab === 'inventario' && (
          <motion.div key="inventario" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="business-inventory-head">
              <p style={{ color: 'var(--text-muted)' }}>{items.length} producto{items.length !== 1 ? 's' : ''} registrados</p>
              <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setShowItemModal(true)}><Plus size={18} /> Agregar medicamento</button>
            </div>
            <div className="dashboard-panel" style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Producto</th><th>Descripción</th><th>Stock</th><th>Precio</th></tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan="4"><div className="empty-state"><Package size={28} /><p>No hay medicamentos registrados.</p></div></td></tr>
                  ) : items.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>{item.description}</td>
                      <td>
                        <span className={`status-badge ${item.stock < 5 ? 'status-cancelled' : 'status-completed'}`}>
                          {item.stock} unidades
                        </span>
                      </td>
                      <td>${item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showItemModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowItemModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h2 className="font-display" style={{ fontSize: '1.3rem' }}>Nuevo medicamento</h2>
                <button className="btn-ghost" onClick={() => setShowItemModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={submitItem} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-field">
                  <label className="form-label">Nombre del producto</label>
                  <input className="form-input" required value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Descripción / gramaje</label>
                  <input className="form-input" value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-field">
                    <label className="form-label">Stock inicial</label>
                    <input type="number" className="form-input" required min="0" value={itemForm.stock} onChange={e => setItemForm({ ...itemForm, stock: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Precio venta</label>
                    <input type="number" step="0.01" className="form-input" required min="0" value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={itemSaving}>{itemSaving ? 'Guardando...' : 'Guardar en inventario'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Business;
