import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { publicFetch } from '../utils/api';
import './Auth.css';

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
      const response = await publicFetch('/api/auth/login', {
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
    <div className="auth-split">
      <motion.div
        className="auth-side-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="auth-brand" onClick={() => navigate('/')}>
          Lemmatica.
        </div>

        <div style={{ margin: 'auto 0' }}>
          <h1>
            Bienvenido <br /> de vuelta.
          </h1>
          <p className="auth-tagline">
            Continúa donde lo dejaste. Tus expedientes clínicos y notas SOAP están listas y resguardadas bajo los más altos estándares de seguridad.
          </p>
        </div>

        <div className="auth-fineprint">
          Lemmatica © 2026. Cumplimiento médico y cifrado de grado bancario.
        </div>
      </motion.div>

      <div className="auth-side-form">
        <motion.div
          className="auth-form-inner"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2>Iniciar Sesión</h2>
          <p>Ingresa tus credenciales para acceder a tu consultorio.</p>

          {errorMsg && (
            <div className="auth-error" role="alert">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Correo Electrónico
              </label>
              <div className="auth-input-wrap">
                <input
                  type="email"
                  id="email"
                  className="auth-input"
                  placeholder="dr.nombre@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field" style={{ marginBottom: '2.5rem' }}>
              <div className="auth-field-row">
                <label htmlFor="password" className="auth-label">
                  Contraseña
                </label>
                <a href="#" className="auth-link">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                  className="auth-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="auth-submit">
              {isLoading ? 'Autenticando...' : 'Entrar al consultorio'}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="auth-switch">
            ¿Eres nuevo en Lemmatica?{' '}
            <Link to="/register">Crea una cuenta</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
