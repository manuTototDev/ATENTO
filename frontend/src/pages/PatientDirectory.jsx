import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, X, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const PatientDirectory = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorProfile, setDoctorProfile] = useState(null);
  
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [dobConfirm, setDobConfirm] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, profileRes] = await Promise.all([
          apiFetch('/api/patients'),
          apiFetch('/api/profile')
        ]);

        if (patientsRes.ok) {
          const data = await patientsRes.json();
          setPatients(data);
        }
        if (profileRes.ok) {
          const profData = await profileRes.json();
          setDoctorProfile(profData);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleDeleteClick = (p) => {
    setPatientToDelete(p);
    setDobConfirm('');
  };

  const confirmDelete = async () => {
    if (dobConfirm.trim() !== patientToDelete.dob) {
      alert('La fecha de nacimiento no coincide. Debe tener el formato exacto (ej. 15/05/1990).');
      return;
    }
    try {
      const res = await apiFetch(`/api/patients/${patientToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setPatients(patients.filter(p => p.id !== patientToDelete.id));
        setPatientToDelete(null);
      } else {
        alert('Error al eliminar paciente.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de red al eliminar paciente.');
    }
  };

  const filteredPatients = patients.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone || '').includes(searchTerm)
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* HEADER TOP BAR */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        padding: '1.5rem 3rem',
        borderBottom: '2px solid #000'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#000' }}>
              Dr. {doctorProfile?.firstName || 'Médico'} {doctorProfile?.lastName || ''}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {doctorProfile?.profile?.specialty?.name || 'Especialista'}
            </div>
          </div>
          <button 
            onClick={() => navigate('/settings')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }}
            title="Configuración de Perfil"
            onMouseOver={e=>e.currentTarget.style.transform='rotate(45deg)'}
            onMouseOut={e=>e.currentTarget.style.transform='rotate(0deg)'}
          >
            <Settings size={24} />
          </button>
        </div>
      </header>

      <main style={{ padding: '3rem', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* PAGE HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: '#000', margin: 0 }}>
              Directorio de <br/> Pacientes.
            </h1>
          </div>
          <button 
            onClick={() => navigate('/patient/new')}
            style={{ 
              backgroundColor: '#000', 
              color: '#fff', 
              border: 'none', 
              padding: '1rem 2rem', 
              fontSize: '1rem', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={e=>e.currentTarget.style.opacity=0.8}
            onMouseOut={e=>e.currentTarget.style.opacity=1}
          >
            <Plus size={20} /> Nuevo Paciente
          </button>
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', borderBottom: '2px solid #e5e5e5', transition: 'border-color 0.2s', paddingBottom: '0.5rem' }}>
            <Search size={24} color="#000" style={{ marginRight: '1rem' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o teléfono..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', border: 'none', fontSize: '1.25rem', color: '#000', outline: 'none', background: 'transparent' }}
              onFocus={e => e.target.parentElement.style.borderBottom = '2px solid #000'}
              onBlur={e => e.target.parentElement.style.borderBottom = '2px solid #e5e5e5'}
            />
          </div>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'transparent', border: '2px solid #000', color: '#000', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={e=>{e.currentTarget.style.background='#000'; e.currentTarget.style.color='#fff'}}
            onMouseOut={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#000'}}
          >
            <Filter size={20} /> Filtros
          </button>
        </div>

        {/* TABLE */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              <th style={{ padding: '1.5rem 0', fontWeight: 600, color: '#000', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em' }}>Nombre Completo</th>
              <th style={{ padding: '1.5rem 0', fontWeight: 600, color: '#000', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em' }}>Nacimiento</th>
              <th style={{ padding: '1.5rem 0', fontWeight: 600, color: '#000', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em' }}>Teléfono</th>
              <th style={{ padding: '1.5rem 0', fontWeight: 600, color: '#000', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em' }}>Última Visita</th>
              <th style={{ padding: '1.5rem 0', fontWeight: 600, color: '#000', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '4rem 0', textAlign: 'center', color: '#888', fontSize: '1.125rem' }}>No se encontraron pacientes.</td></tr>
            ) : (
              filteredPatients.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #e5e5e5', transition: 'background-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#f9f9f9'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>
                  <td style={{ padding: '1.5rem 0', fontWeight: 700, color: '#000', fontSize: '1.125rem' }}>{p.name}</td>
                  <td style={{ padding: '1.5rem 0', color: '#555' }}>{p.dob}</td>
                  <td style={{ padding: '1.5rem 0', color: '#555', fontWeight: 500 }}>{p.phone}</td>
                  <td style={{ padding: '1.5rem 0', color: '#555' }}>{p.lastVisit}</td>
                  <td style={{ padding: '1.5rem 0', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => navigate(`/patients/${p.id}`)} style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer', transition: 'color 0.2s' }} title="Ver Expediente" onMouseOver={e=>e.currentTarget.style.color='#666'} onMouseOut={e=>e.currentTarget.style.color='#000'}><Eye size={20} /></button>
                      <button style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer', transition: 'color 0.2s' }} title="Editar Datos" onMouseOver={e=>e.currentTarget.style.color='#666'} onMouseOut={e=>e.currentTarget.style.color='#000'}><Edit size={20} /></button>
                      <button onClick={() => handleDeleteClick(p)} style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer', transition: 'color 0.2s' }} title="Eliminar Paciente" onMouseOver={e=>e.currentTarget.style.color='#ef4444'} onMouseOut={e=>e.currentTarget.style.color='#000'}><Trash2 size={20} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>

      {patientToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPatientToDelete(null)}>
          <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '500px', padding: '4rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setPatientToDelete(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#000' }}><X size={32} /></button>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#000', marginBottom: '1rem', lineHeight: 1 }}>Eliminar <br/>Paciente</h2>
            <p style={{ color: '#555', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.5 }}>
              Estás a punto de eliminar a <strong style={{ color: '#000' }}>{patientToDelete.name}</strong>. Esta acción eliminará permanentemente su expediente y consultas asociadas.
            </p>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Para confirmar, teclea su fecha de nacimiento ({patientToDelete.dob}):</label>
              <input 
                type="text" 
                placeholder="DD/MM/YYYY" 
                value={dobConfirm} 
                onChange={e => setDobConfirm(e.target.value)} 
                autoFocus 
                style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #000', backgroundColor: 'transparent', fontSize: '1.25rem', color: '#000', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={confirmDelete} style={{ flex: 1, backgroundColor: '#000', color: '#fff', border: 'none', padding: '1.25rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#ef4444'} onMouseOut={e=>e.currentTarget.style.backgroundColor='#000'}>
                Eliminar
              </button>
              <button onClick={() => setPatientToDelete(null)} style={{ flex: 1, backgroundColor: 'transparent', color: '#000', border: '2px solid #000', padding: '1.25rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDirectory;
