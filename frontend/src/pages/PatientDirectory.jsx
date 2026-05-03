import React from 'react';
import { Search, Filter, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientDirectory = () => {
  const navigate = useNavigate();
  
  const patients = [
    { id: 1, name: 'María López Gómez', dob: '15/04/1990', phone: '55 1234 5678', lastVisit: '03/05/2026' },
    { id: 2, name: 'Carlos Ramírez', dob: '22/08/1985', phone: '55 8765 4321', lastVisit: '28/04/2026' },
    { id: 3, name: 'Ana Silva', dob: '10/11/1995', phone: '55 2222 3333', lastVisit: '15/04/2026' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Directorio de Pacientes</h1>
        <button className="btn-primary" onClick={() => navigate('/patient/new')}>+ Nuevo Paciente</button>
      </div>

      <div className="dashboard-panel">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <Search size={18} className="input-icon" />
            <input type="text" className="form-input" placeholder="Buscar por nombre, CURP o teléfono..." />
          </div>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <Filter size={18} /> Filtros
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Fecha de Nacimiento</th>
              <th>Teléfono</th>
              <th>Última Visita</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>{p.dob}</td>
                <td>{p.phone}</td>
                <td>{p.lastVisit}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => navigate(`/patients/${p.id}`)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }} title="Ver Expediente"><Eye size={18} /></button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Editar Datos"><Edit size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientDirectory;
