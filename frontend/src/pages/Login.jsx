import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Activity, Lock, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { publicFetch } from '../utils/api';
import './Auth.css';

const BLOBS = [
  { size: 460, top: '-12%', left: '-10%', color: 'var(--pop-blue)', blur: 90, tx: 40, ty: 25, dur: '18s' },
  { size: 380, top: '55%', left: '68%', color: 'var(--pop-violet)', blur: 80, tx: -35, ty: 30, dur: '22s' },
  { size: 300, top: '78%', left: '5%', color: 'var(--pop-cyan)', blur: 70, tx: 25, ty: -20, dur: '15s' },
];

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorType, setErrorType] = useState('error'); // 'error' | 'warning' (cuenta bloqueada)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await publicFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        navigate('/hoy');
        return;
      }

      setErrorType(response.status === 423 ? 'warning' : 'error');
      setErrorMsg(data.error || 'No se pudo iniciar sesión. Intenta de nuevo.');
    } catch (error) {
      setErrorType('error');
      setErrorMsg('Error de conexión con el servidor.');
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
        <div className="auth-blobs" aria-hidden="true">
          {BLOBS.map((b, i) => (
            <span
              key={i}
              className="auth-blob"
              style={{
                width: b.size,
                height: b.size,
                top: b.top,
                left: b.left,
                background: b.color,
                filter: `blur(${b.blur}px)`,
                '--drift-x': `${b.tx}px`,
                '--drift-y': `${b.ty}px`,
                '--drift-dur': b.dur,
              }}
            />
          ))}
        </div>

        <Link to="/" className="auth-wordmark">
          <Activity size={22} strokeWidth={2.5} />
          Lemmatica.
        </Link>

        <div className="auth-cover-body">
          <p className="auth-eyebrow pop-blue">Consultorio inteligente</p>
          <h1 className="auth-title">Bienvenido de vuelta.</h1>
          <p className="auth-subtitle">
            Continúa donde lo dejaste. Tus expedientes clínicos y tu agenda están listos y resguardados bajo cifrado de grado bancario.
          </p>
        </div>

        <p className="auth-footnote">Lemmatica © 2026 · Cumplimiento médico y cifrado de grado bancario.</p>
      </motion.div>

      <div className="auth-side-form">
        <motion.div
          className="auth-form-inner"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="auth-title">Iniciar sesión</h2>
          <p className="auth-subtitle">Ingresa tus credenciales para acceder a tu consultorio.</p>

          {errorMsg && (
            <div className={`auth-banner ${errorType === 'warning' ? 'is-warning' : 'is-error'}`} role="alert">
              {errorType === 'warning' ? <Lock size={18} /> : <AlertCircle size={18} />}
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email" className="form-label">Correo electrónico</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="dr.nombre@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-field">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-toggle-btn"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Autenticando...' : 'Entrar al consultorio'}
              {!isLoading && <ArrowRight size={18} />}
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
