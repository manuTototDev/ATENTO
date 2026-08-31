import React, { useState, useEffect } from 'react';
import { Plus, X, PackageSearch, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../utils/api';

const EASE = [0.16, 1, 0.3, 1];

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
};

// Clasificación puramente visual: no altera los datos, solo decide qué insignia mostrar.
const getStockStatus = (stock) => {
  const value = Number(stock);
  if (value <= 0) return { label: 'Agotado', color: 'var(--error)', bg: 'var(--error-bg)', border: '#FECACA' };
  if (value < 5) return { label: 'Stock crítico', color: 'var(--error)', bg: 'var(--error-bg)', border: '#FECACA' };
  if (value < 15) return { label: 'Stock bajo', color: 'var(--warning)', bg: 'var(--warning-bg)', border: '#FEF08A' };
  return null;
};

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', stock: 0, price: 0 });


  const fetchInventory = async () => {
    try {
      const res = await apiFetch(`/api/inventory`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData })
      });
      if (res.ok) {
        fetchInventory();
        setShowModal(false);
        setFormData({ name: '', description: '', stock: 0, price: 0 });
      } else {
        alert('Error al guardar el medicamento');
      }
    } catch (error) {
      console.error(error);
      alert('Error de red');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: 'clamp(1.25rem, 4vw, 2rem)', minHeight: '100vh', backgroundColor: 'var(--surface-alt)' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}
      >
        <h1 className="font-display" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 600, color: 'var(--text-dark)' }}>Inventario Médico</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ width: 'auto' }}>
          <Plus size={18} /> Agregar Medicamento
        </button>
      </motion.div>

      <motion.div
        className="dashboard-panel"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: EASE }}
        style={{ padding: 0, overflow: 'hidden', backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '640px' }}>
            <thead>
              <tr>
                <th>Nombre del Producto</th>
                <th>Descripción</th>
                <th style={{ textAlign: 'right' }}>Stock Disponible</th>
                <th style={{ textAlign: 'right' }}>Precio Venta</th>
              </tr>
            </thead>
            <motion.tbody
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: 0, border: 'none' }}>
                    <div className="empty-state">
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--accent-light)',
                        marginBottom: '0.25rem',
                      }}>
                        <PackageSearch size={28} strokeWidth={1.5} color="var(--accent)" />
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>No hay medicamentos registrados</div>
                      <div style={{ fontSize: '0.85rem' }}>Agrega el primero para llevar el control de tu inventario.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map(item => {
                  const status = getStockStatus(item.stock);
                  return (
                    <motion.tr key={item.id} variants={fadeUp} transition={{ duration: 0.25, ease: EASE }}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td style={{ color: item.description ? 'var(--text-dark)' : 'var(--text-subtle)' }}>
                        {item.description || 'Sin descripción'}
                      </td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {status ? (
                          <span
                            className="status-badge"
                            style={{ backgroundColor: status.bg, color: status.color, border: `1px solid ${status.border}` }}
                          >
                            <AlertTriangle size={12} />
                            {item.stock} u. · {status.label}
                          </span>
                        ) : (
                          <span>{item.stock} unidades</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        ${Number(item.price || 0).toLocaleString('es-MX')}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </motion.tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            onClick={() => setShowModal(false)}
          >
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Nuevo Medicamento</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-ghost"
                  aria-label="Cerrar"
                  style={{ padding: '0.4rem', borderRadius: 'var(--radius-full)' }}
                >
                  <X size={22} />
                </button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Nombre del Producto</label>
                  <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Descripción / Gramaje</label>
                  <input type="text" className="form-input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Stock Inicial</label>
                    <input type="number" className="form-input" required min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Precio Venta ($)</label>
                    <input type="number" step="0.01" className="form-input" required min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '1rem' }}>
                  {isLoading ? 'Guardando...' : 'Guardar en Inventario'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
