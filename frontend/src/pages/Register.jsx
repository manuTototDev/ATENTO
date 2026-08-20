import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { publicFetch } from '../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '#e5e5e5' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);

  // Evaluar seguridad de la contraseña
  const evaluatePassword = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, text: '', color: '#e5e5e5' };
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, text: 'Débil', color: '#ef4444' };
    if (score === 2) return { score: 50, text: 'Regular', color: '#f59e0b' }; 
    if (score === 3) return { score: 75, text: 'Buena', color: '#10b981' }; 
    return { score: 100, text: 'Fuerte', color: '#059669' }; 
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (id === 'password') {
      setPasswordStrength(evaluatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordStrength.score < 75) {
      alert('Por favor, ingresa una contraseña más segura (mínimo "Buena").');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (!termsAccepted) {
      setTermsError(true);
      return;
    }
    setIsLoading(true);
    
    try {
      const response = await publicFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        navigate('/onboarding');
      } else {
        alert(data.error || 'Ocurrió un error al registrarse.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', flexWrap: 'wrap' }}>
      
      {/* Left Side: Black Cover */}
      <div style={{ flex: '1 1 500px', backgroundColor: '#000', color: '#fff', padding: '4rem 5%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '50vh' }}>
        <div 
          onClick={() => navigate('/')} 
          style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.05em', cursor: 'pointer' }}
        >
          Lemmatica.
        </div>
        
        <div style={{ margin: 'auto 0' }}>
          <h1 style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '1.5rem', color: '#fff' }}>
            Únete al <br/> futuro.
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#a3a3a3', maxWidth: '400px', lineHeight: 1.6 }}>
            Crea tu cuenta de forma segura. Recupera hasta 2 horas diarias de tu tiempo y devuelve el lado humano a tu práctica médica.
          </p>
        </div>
        
        <div style={{ fontSize: '0.875rem', color: '#555' }}>
          Lemmatica © 2026. Cumplimiento médico y cifrado de extremo a extremo.
        </div>
      </div>

      {/* Right Side: White Minimal Form */}
      <div style={{ flex: '1 1 500px', backgroundColor: '#fff', padding: '4rem 5%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.04em', marginBottom: '0.5rem', color: '#000' }}>
            Crear Cuenta
          </h2>
          <p style={{ color: '#555', marginBottom: '3rem', fontSize: '1.125rem' }}>
            Ingresa tus datos para registrar tu consultorio inteligente.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label htmlFor="firstName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>
                  Nombre
                </label>
                <input
                  type="text"
                  id="firstName"
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="Ej. Carlos"
                  value={formData.firstName}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>
                  Apellido
                </label>
                <input
                  type="text"
                  id="lastName"
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="Ej. Ramírez"
                  value={formData.lastName}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>
                Correo Institucional
              </label>
              <input
                type="email"
                id="email"
                style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                placeholder="dr.nombre@hospital.com"
                value={formData.email}
                onChange={handleChange}
                onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                required
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  required
                  minLength="8"
                />
                <button 
                  type="button" 
                  style={{ position: 'absolute', right: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
              
              {/* Indicador de Fuerza */}
              {formData.password && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#888' }}>Seguridad:</span>
                    <span style={{ color: passwordStrength.color, fontWeight: 600 }}>{passwordStrength.text}</span>
                  </div>
                  <div style={{ height: '4px', background: '#e5e5e5', borderRadius: '2px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${passwordStrength.score}%`, 
                        background: passwordStrength.color,
                        transition: 'all 0.3s ease'
                      }} 
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>
                Confirmar Contraseña
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                required
                minLength="8"
              />
            </div>

            {/* T&C Checkbox */}
            <div style={{ marginBottom: '2.5rem' }}>
              <label
                htmlFor="termsCheckbox"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                  cursor: 'pointer',
                  padding: '1.25rem',
                  border: termsError ? '2px solid #ef4444' : '2px solid #e5e5e5',
                  borderRadius: '8px',
                  backgroundColor: termsAccepted ? '#f0fdf4' : '#fafafa',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0, marginTop: '2px' }}>
                  <input
                    type="checkbox"
                    id="termsCheckbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (e.target.checked) setTermsError(false);
                    }}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{
                    width: '22px',
                    height: '22px',
                    border: `2px solid ${termsAccepted ? '#000' : '#ccc'}`,
                    borderRadius: '4px',
                    backgroundColor: termsAccepted ? '#000' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}>
                    {termsAccepted && (
                      <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                        <path d="M1 5L5 9L12 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: '0.9rem', color: '#333', lineHeight: 1.6 }}>
                  He leído y acepto los{' '}
                  <Link
                    to="/terminos"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#000', fontWeight: 700, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Términos y Condiciones, Política de Privacidad y Política de Uso de IA
                    <ExternalLink size={13} />
                  </Link>
                  {' '}de Lemmatica, incluyendo el almacenamiento, procesamiento y tratamiento de mis datos profesionales y los datos de pacientes bajo mi responsabilidad, conforme a la LFPDPPP.
                </span>
              </label>
              {termsError && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 500 }}>
                  Debes aceptar los Términos y Condiciones para continuar.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '1.25rem', fontSize: '1.125rem', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', transition: 'opacity 0.2s' }}
              onMouseOver={e=>e.target.style.opacity=0.8}
              onMouseOut={e=>e.target.style.opacity=1}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '1rem', color: '#555' }}>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" style={{ color: '#000', textDecoration: 'none', fontWeight: 600, borderBottom: '1px solid #000', paddingBottom: '2px' }}>
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
