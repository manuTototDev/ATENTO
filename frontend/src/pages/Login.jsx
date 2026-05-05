import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        navigate('/dashboard');
      } else {
        setErrorMsg(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      setErrorMsg('Error de conexión con el servidor');
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
          Atentia.
        </div>
        
        <div style={{ margin: 'auto 0' }}>
          <h1 style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '1.5rem', color: '#fff' }}>
            Bienvenido <br/> de vuelta.
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#a3a3a3', maxWidth: '400px', lineHeight: 1.6 }}>
            Continúa donde lo dejaste. Tus expedientes clínicos y notas SOAP están listas y resguardadas bajo los más altos estándares de seguridad.
          </p>
        </div>
        
        <div style={{ fontSize: '0.875rem', color: '#555' }}>
          Atentia © 2026. Cumplimiento médico y cifrado de grado bancario.
        </div>
      </div>

      {/* Right Side: White Minimal Form */}
      <div style={{ flex: '1 1 500px', backgroundColor: '#fff', padding: '4rem 5%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.04em', marginBottom: '0.5rem', color: '#000' }}>
            Iniciar Sesión
          </h2>
          <p style={{ color: '#555', marginBottom: '3rem', fontSize: '1.125rem' }}>
            Ingresa tus credenciales para acceder a tu consultorio.
          </p>
          
          {errorMsg && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: 500 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.25rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                placeholder="dr.nombre@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                required
              />
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000' }}>
                  Contraseña
                </label>
                <a href="#" style={{ color: '#888', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#000'} onMouseOut={e=>e.target.style.color='#888'}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.25rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  required
                />
                <button 
                  type="button" 
                  style={{ position: 'absolute', right: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '1.25rem', fontSize: '1.125rem', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', transition: 'opacity 0.2s' }} 
              onMouseOver={e=>e.target.style.opacity=0.8} 
              onMouseOut={e=>e.target.style.opacity=1}
            >
              {isLoading ? 'Autenticando...' : 'Entrar al consultorio'}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '1rem', color: '#555' }}>
            ¿Eres nuevo en Atentia?{' '}
            <Link to="/register" style={{ color: '#000', textDecoration: 'none', fontWeight: 600, borderBottom: '1px solid #000', paddingBottom: '2px' }}>
              Crea una cuenta
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
