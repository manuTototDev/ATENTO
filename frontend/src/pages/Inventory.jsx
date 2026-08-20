import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { apiFetch } from '../utils/api';

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
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Inventario Médico</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Agregar Medicamento
        </button>
      </div>

      <div className="dashboard-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre del Producto</th>
              <th>Descripción</th>
              <th>Stock Disponible</th>
              <th>Precio Venta ($)</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay medicamentos registrados.</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.description}</td>
                  <td>
                    <span style={{ color: item.stock < 5 ? '#DC2626' : 'inherit', fontWeight: item.stock < 5 ? 600 : 400 }}>
                      {item.stock} unidades
                    </span>
                  </td>
                  <td>${item.price}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Nuevo Medicamento</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
        </div>
      )}
    </div>
  );
};

export default Inventory;
