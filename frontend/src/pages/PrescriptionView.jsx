import React, { useState, useEffect } from 'react';
import { Download, Printer, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const PrescriptionView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { patient: statePatient, treatments, indications, soap } = location.state || {};
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [patient, setPatient] = useState(statePatient || null);

  const calculateAge = (dobString) => {
    if (!dobString) return '--';
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return '--';
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetch(`http://localhost:5000/api/profile?userId=${userId}`)
        .then(res => res.json())
        .then(data => setDoctorProfile(data))
        .catch(err => console.error("Error fetching profile", err));

      if ((!patient || !patient.firstName) && id) {
        fetch(`http://localhost:5000/api/patients/${id}`)
          .then(res => res.json())
          .then(data => {
            if (data && !data.error) setPatient(data);
          })
          .catch(err => console.error(err));
      }
    }
  }, [patient, id]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* HEADER / ACTIONS (No se imprime) */}
      <div className="no-print" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.5rem 3rem',
        backgroundColor: '#fff',
        borderBottom: '2px solid #000',
        marginBottom: '3rem'
      }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'opacity 0.2s' }} onMouseOver={e=>e.currentTarget.style.opacity=0.6} onMouseOut={e=>e.currentTarget.style.opacity=1}>
          <ArrowLeft size={20} /> Volver al Inicio
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', border: '2px solid #000', background: 'transparent', color: '#000', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={e=>{e.currentTarget.style.background='#000'; e.currentTarget.style.color='#fff'}}
            onMouseOut={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#000'}}
          >
            <Download size={20} /> Descargar PDF
          </button>
          <button 
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', border: 'none', background: '#000', color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseOver={e=>e.currentTarget.style.opacity=0.8}
            onMouseOut={e=>e.currentTarget.style.opacity=1}
          >
            <Printer size={20} /> Imprimir
          </button>
        </div>
      </div>

      {/* DOCUMENTO RECETA MÉDICA (Formato A4 aprox) */}
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
        <div 
          className="printable-prescription" 
          style={{ 
            background: '#fff', 
            minHeight: '1050px', 
            padding: '3rem', 
            position: 'relative', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '2px solid #000'
          }}
        >
          
          {/* Header Doctor */}
          <div style={{ borderBottom: '3px solid #000', paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#000', letterSpacing: '-0.03em', margin: '0 0 0.25rem 0', lineHeight: 1 }}>
                Dr. {doctorProfile?.firstName || ''} {doctorProfile?.lastName || ''}
              </h1>
              <p style={{ color: '#000', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>
                {doctorProfile?.profile?.specialty?.name || ''}
              </p>
              <div style={{ color: '#555', fontSize: '0.75rem', lineHeight: 1.5 }}>
                {doctorProfile?.profile?.university?.name || doctorProfile?.profile?.university || 'Universidad Nacional Autónoma de México'}<br/>
                Céd. Prof. {doctorProfile?.profile?.licenseNumber || '12345678'} 
                {doctorProfile?.profile?.specialtyLicense ? ` | Céd. Esp. ${doctorProfile.profile.specialtyLicense}` : ''}
              </div>
            </div>
            <div style={{ width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {doctorProfile?.profile?.logoUrl ? (
                <img src={doctorProfile.profile.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', textTransform: 'uppercase' }}>
                  Logo
                </div>
              )}
            </div>
          </div>

          {/* Datos Paciente */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: '2px solid #000', fontSize: '0.875rem', marginBottom: '2rem' }}>
            <div style={{ padding: '0.75rem', borderBottom: '2px solid #000', borderRight: '2px solid #000' }}>
              <strong style={{ color: '#555', fontSize: '0.65rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.125rem' }}>Paciente</strong>
              <div style={{ fontWeight: 600, color: '#000' }}>{patient?.firstName || patient?.name || 'Cargando...'} {patient?.lastName || ''}</div>
            </div>
            <div style={{ padding: '0.75rem', borderBottom: '2px solid #000' }}>
              <strong style={{ color: '#555', fontSize: '0.65rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.125rem' }}>Fecha</strong>
              <div style={{ fontWeight: 600, color: '#000' }}>{new Date().toLocaleDateString('es-MX')}</div>
            </div>
            <div style={{ padding: '0.75rem', borderBottom: '2px solid #000', borderRight: '2px solid #000' }}>
              <strong style={{ color: '#555', fontSize: '0.65rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.125rem' }}>Fecha de Nacimiento</strong>
              <div style={{ fontWeight: 600, color: '#000' }}>
                {patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('es-MX', { timeZone: 'UTC' }) : (patient?.dob || '--')}
              </div>
            </div>
            <div style={{ padding: '0.75rem', borderBottom: '2px solid #000' }}>
              <strong style={{ color: '#555', fontSize: '0.65rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.125rem' }}>Edad</strong>
              <div style={{ fontWeight: 600, color: '#000' }}>
                {patient?.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} años` : (patient?.dob ? `${calculateAge(patient.dob.split('/').reverse().join('-'))} años` : '--')}
              </div>
            </div>
            <div style={{ padding: '0.75rem', gridColumn: '1 / -1' }}>
              <strong style={{ color: '#555', fontSize: '0.65rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.125rem' }}>Diagnóstico</strong>
              <div style={{ fontWeight: 600, color: '#000' }}>{soap?.assessment || 'No especificado'}</div>
            </div>
          </div>

          {/* Medicamentos */}
          <div style={{ minHeight: '200px', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#000', marginBottom: '1.5rem', letterSpacing: '-0.05em', lineHeight: 1 }}>
              Rx.
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {treatments && treatments.length > 0 ? treatments.map((t, i) => (
                <div key={i} style={{ paddingLeft: '1rem', borderLeft: '3px solid #000' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#000', marginBottom: '0.25rem' }}>{t.medication}</div>
                  <div style={{ color: '#000', fontSize: '0.875rem' }}>
                    Tomar <span style={{ fontWeight: 600 }}>{t.dose}</span> cada <span style={{ fontWeight: 600 }}>{t.frequencyNumber} {t.frequencyUnit}</span> por <span style={{ fontWeight: 600 }}>{t.durationNumber} {t.durationUnit}</span>.
                  </div>
                </div>
              )) : (
                <div style={{ color: '#555', fontStyle: 'italic', fontSize: '0.875rem' }}>Sin prescripción farmacológica.</div>
              )}
            </div>
          </div>

          {/* Indicaciones Generales */}
          {indications && indications.length > 0 && (
            <div style={{ minHeight: '100px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#000', marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
                Indicaciones Generales
              </h2>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#000', fontSize: '0.875rem' }}>
                {indications.map((ind, i) => (
                  <li key={i}>
                    <strong style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', marginRight: '0.5rem' }}>[{ind.type}]</strong> {ind.instruction}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Firmas */}
          <div style={{ position: 'absolute', bottom: '3rem', left: '3rem', right: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #000', paddingTop: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.5 }}>
              <strong style={{ color: '#000', fontSize: '0.875rem', textTransform: 'uppercase' }}>{doctorProfile?.profile?.clinicName || 'Clínica / Consultorio'}</strong><br/>
              {doctorProfile?.profile?.clinicAddress || 'Dirección no registrada'}<br/>
              Tel: {doctorProfile?.profile?.phoneNumber || 'No registrado'}
            </div>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ borderBottom: '2px solid #000', height: '50px', marginBottom: '0.5rem' }}></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Firma del Médico</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrescriptionView;
