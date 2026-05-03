import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientDirectory = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/patients?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    if (userId) fetchPatients();
  }, [userId]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

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
            <input 
              type="text" 
              className="form-input" 
              placeholder="Buscar por nombre o teléfono..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
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
            {filteredPatients.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign: 'center', color: 'var(--text-muted)'}}>No se encontraron pacientes.</td></tr>
            ) : (
              filteredPatients.map(p => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientDirectory;
