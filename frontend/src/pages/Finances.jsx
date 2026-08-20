import React, { useState, useEffect } from 'react';
import { DollarSign, Settings as SettingsIcon, Moon, CalendarDays, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const Finances = () => {
  const navigate = useNavigate();
  const [costoBase, setCostoBase] = useState(800);
  const [costoNocturno, setCostoNocturno] = useState(1200);
  const [horaNocturna, setHoraNocturna] = useState('20:00');
  const [costoSabado, setCostoSabado] = useState(1000);
  const [costoDomingo, setCostoDomingo] = useState(1500);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);


  useEffect(() => {
    const fetchProfileAndAnalytics = async () => {
      try {
        // Fetch Profile for Tabulator
        const resProfile = await apiFetch(`/api/profile`);
        if (resProfile.ok) {
          const data = await resProfile.json();
          setDoctorProfile(data);
          
          if (data.profile) {
            setCostoBase(data.profile.basePrice || 800);
            setCostoNocturno(data.profile.nightPrice || 1200);
            setHoraNocturna(data.profile.nightTime || '20:00');
            setCostoSabado(data.profile.saturdayPrice || 1000);
            setCostoDomingo(data.profile.sundayPrice || 1500);
          }
        }

        // Fetch Analytics for Earnings
        const resAnalytics = await apiFetch(`/api/analytics`);
        if (resAnalytics.ok) {
          const data = await resAnalytics.json();
          setTotalEarnings(data.totalEarnings || 0);
        }

      } catch (error) {
        console.error(error);
      }
    };
    fetchProfileAndAnalytics();
  }, []);

  const handleSavePricing = async () => {
    setIsSaving(true);
    try {
      const response = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrice: costoBase,
          nightPrice: costoNocturno,
          nightTime: horaNocturna,
          saturdayPrice: costoSabado,
          sundayPrice: costoDomingo
        })
      });

      if (response.ok) {
        alert('Tabulador de precios actualizado exitosamente');
      } else {
        alert('Hubo un error al guardar los precios');
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un error al conectar con el servidor');
    } finally {
      setIsSaving(false);
    }
  };

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
            <SettingsIcon size={24} />
          </button>
        </div>
      </header>

      <main style={{ padding: '3rem', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* PAGE HEADER */}
        <div style={{ marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: '#000', margin: 0 }}>
            Finanzas.
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '4rem' }}>
          {/* LEFT COL: INGRESOS */}
          <div style={{ flex: 1 }}>
            <div style={{ border: '2px solid #000', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <DollarSign size={24} color="#000" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000' }}>
                  Ingresos del Mes
                </h2>
              </div>
              <div style={{ fontSize: '5rem', fontWeight: 800, letterSpacing: '-0.05em', color: '#000', lineHeight: 1 }}>
                ${totalEarnings.toLocaleString('es-MX')}
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                MXN Acumulado
              </div>
            </div>
          </div>

          {/* RIGHT COL: TABULADOR */}
          <div style={{ flex: 2 }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
              <SettingsIcon size={24} color="#000" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#000' }}>
                Tabulador de Precios
              </h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* BASE */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>
                    <Sun size={18} color="#000" /> Costo Base (Lunes a Viernes)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: '#000', fontSize: '1.25rem', fontWeight: 700 }}>$</span>
                    <input 
                      type="number" 
                      style={{ width: '100%', padding: '1rem 0 1rem 1.5rem', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.25rem', fontWeight: 600, color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                      value={costoBase} 
                      onChange={e => setCostoBase(e.target.value)} 
                      onFocus={e => e.target.style.borderBottom = '2px solid #000'}
                      onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}
                    />
                  </div>
                </div>

                {/* NOCTURNA */}
                <div style={{ border: '1px solid #e5e5e5', padding: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '1.5rem' }}>
                    <Moon size={18} color="#000" /> Tarifa Nocturna
                  </label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#555', marginBottom: '0.5rem' }}>Aplica después de las:</label>
                      <input 
                        type="time" 
                        style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', fontWeight: 600, color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                        value={horaNocturna} 
                        onChange={e => setHoraNocturna(e.target.value)} 
                        onFocus={e => e.target.style.borderBottom = '2px solid #000'}
                        onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#555', marginBottom: '0.5rem' }}>Costo Nocturno</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: '#000', fontSize: '1.125rem', fontWeight: 700 }}>$</span>
                        <input 
                          type="number" 
                          style={{ width: '100%', padding: '1rem 0 1rem 1.25rem', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', fontWeight: 600, color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                          value={costoNocturno} 
                          onChange={e => setCostoNocturno(e.target.value)} 
                          onFocus={e => e.target.style.borderBottom = '2px solid #000'}
                          onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FIN DE SEMANA */}
              <div style={{ border: '1px solid #e5e5e5', padding: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '1.5rem' }}>
                  <CalendarDays size={18} color="#000" /> Fines de Semana
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#555', marginBottom: '0.5rem' }}>Costo Sábado</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: '#000', fontSize: '1.125rem', fontWeight: 700 }}>$</span>
                      <input 
                        type="number" 
                        style={{ width: '100%', padding: '1rem 0 1rem 1.25rem', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', fontWeight: 600, color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                        value={costoSabado} 
                        onChange={e => setCostoSabado(e.target.value)} 
                        onFocus={e => e.target.style.borderBottom = '2px solid #000'}
                        onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#555', marginBottom: '0.5rem' }}>Costo Domingo</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: '#000', fontSize: '1.125rem', fontWeight: 700 }}>$</span>
                      <input 
                        type="number" 
                        style={{ width: '100%', padding: '1rem 0 1rem 1.25rem', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', fontWeight: 600, color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                        value={costoDomingo} 
                        onChange={e => setCostoDomingo(e.target.value)} 
                        onFocus={e => e.target.style.borderBottom = '2px solid #000'}
                        onBlur={e => e.target.style.borderBottom = '2px solid #e5e5e5'}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
            </div>

            <button 
              style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '1.5rem', fontSize: '1.125rem', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s', marginTop: '3rem', opacity: isSaving ? 0.7 : 1 }}
              onClick={handleSavePricing}
              disabled={isSaving}
              onMouseOver={e=>!isSaving && (e.target.style.opacity=0.8)} 
              onMouseOut={e=>!isSaving && (e.target.style.opacity=1)}
            >
              {isSaving ? 'Guardando...' : 'Guardar Tabulador'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Finances;
