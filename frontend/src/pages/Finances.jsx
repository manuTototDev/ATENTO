import React, { useState, useEffect } from 'react';
import { DollarSign, Settings as SettingsIcon, Moon, CalendarDays, Sun, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api';

const EASE = [0.16, 1, 0.3, 1];

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const underlineInputStyle = {
  width: '100%',
  padding: '1rem 0 1rem 1.5rem',
  border: 'none',
  borderBottom: '2px solid var(--border)',
  backgroundColor: 'transparent',
  fontSize: '1.25rem',
  fontWeight: 600,
  color: 'var(--text-dark)',
  outline: 'none',
  transition: `border-color var(--duration-fast) var(--ease-out)`,
};

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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* HEADER TOP BAR */}
      <header style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1.25rem, 5vw, 3rem)',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)' }}>
              Dr. {doctorProfile?.firstName || 'Médico'} {doctorProfile?.lastName || ''}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {doctorProfile?.profile?.specialty?.name || 'Especialista'}
            </div>
          </div>
          <motion.button
            onClick={() => navigate('/settings')}
            whileHover={{ rotate: 45, backgroundColor: 'var(--input-bg)' }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dark)',
              display: 'flex',
              alignItems: 'center',
              padding: '0.4rem',
              borderRadius: 'var(--radius-full)',
            }}
            title="Configuración de Perfil"
            aria-label="Ir a configuración de perfil"
          >
            <SettingsIcon size={24} />
          </motion.button>
        </div>
      </header>

      <motion.main
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', maxWidth: '1400px', margin: '0 auto' }}
      >

        {/* PAGE HEADER */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4, ease: EASE }} style={{ marginBottom: 'clamp(2rem, 6vw, 4rem)' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--text-dark)', margin: 0 }}>
            Finanzas.
          </h1>
        </motion.div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(1.5rem, 4vw, 4rem)', alignItems: 'stretch' }}>
          {/* LEFT COL: INGRESOS */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.4, ease: EASE }}
            className="dashboard-panel"
            style={{
              flex: '1 1 320px',
              padding: 'clamp(2rem, 5vw, 3rem)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <DollarSign size={24} color="var(--success)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dark)' }}>
                Ingresos del Mes
              </h2>
            </div>
            <div style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--text-dark)', lineHeight: 1 }}>
              ${totalEarnings.toLocaleString('es-MX')}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <TrendingUp size={18} color="var(--success)" />
              MXN Acumulado
            </div>
          </motion.div>

          {/* RIGHT COL: TABULADOR */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.4, ease: EASE }}
            className="dashboard-panel"
            style={{ flex: '2 1 420px', padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}
          >
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <SettingsIcon size={22} color="var(--text-dark)" />
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-dark)', margin: 0 }}>
                Tabulador de Precios
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(1.5rem, 3vw, 3rem)' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* BASE */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                    <Sun size={18} color="var(--text-dark)" /> Costo Base (Lunes a Viernes)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark)', fontSize: '1.25rem', fontWeight: 700 }}>$</span>
                    <input
                      type="number"
                      style={underlineInputStyle}
                      value={costoBase}
                      onChange={e => setCostoBase(e.target.value)}
                      onFocus={e => e.target.style.borderBottom = '2px solid var(--border-focus)'}
                      onBlur={e => e.target.style.borderBottom = '2px solid var(--border)'}
                    />
                  </div>
                </div>

                {/* NOCTURNA */}
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
                    <Moon size={18} color="var(--text-dark)" /> Tarifa Nocturna
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Aplica después de las:</label>
                      <input
                        type="time"
                        style={{ ...underlineInputStyle, padding: '1rem 0', fontSize: '1.125rem' }}
                        value={horaNocturna}
                        onChange={e => setHoraNocturna(e.target.value)}
                        onFocus={e => e.target.style.borderBottom = '2px solid var(--border-focus)'}
                        onBlur={e => e.target.style.borderBottom = '2px solid var(--border)'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Costo Nocturno</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark)', fontSize: '1.125rem', fontWeight: 700 }}>$</span>
                        <input
                          type="number"
                          style={{ ...underlineInputStyle, padding: '1rem 0 1rem 1.25rem', fontSize: '1.125rem' }}
                          value={costoNocturno}
                          onChange={e => setCostoNocturno(e.target.value)}
                          onFocus={e => e.target.style.borderBottom = '2px solid var(--border-focus)'}
                          onBlur={e => e.target.style.borderBottom = '2px solid var(--border)'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FIN DE SEMANA */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
                  <CalendarDays size={18} color="var(--text-dark)" /> Fines de Semana
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Costo Sábado</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark)', fontSize: '1.125rem', fontWeight: 700 }}>$</span>
                      <input
                        type="number"
                        style={{ ...underlineInputStyle, padding: '1rem 0 1rem 1.25rem', fontSize: '1.125rem' }}
                        value={costoSabado}
                        onChange={e => setCostoSabado(e.target.value)}
                        onFocus={e => e.target.style.borderBottom = '2px solid var(--border-focus)'}
                        onBlur={e => e.target.style.borderBottom = '2px solid var(--border)'}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Costo Domingo</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark)', fontSize: '1.125rem', fontWeight: 700 }}>$</span>
                      <input
                        type="number"
                        style={{ ...underlineInputStyle, padding: '1rem 0 1rem 1.25rem', fontSize: '1.125rem' }}
                        value={costoDomingo}
                        onChange={e => setCostoDomingo(e.target.value)}
                        onFocus={e => e.target.style.borderBottom = '2px solid var(--border-focus)'}
                        onBlur={e => e.target.style.borderBottom = '2px solid var(--border)'}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', padding: '1.25rem', fontSize: '1.0625rem', fontWeight: 700, marginTop: '3rem', letterSpacing: 'normal' }}
              onClick={handleSavePricing}
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Guardar Tabulador'}
            </button>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

export default Finances;
