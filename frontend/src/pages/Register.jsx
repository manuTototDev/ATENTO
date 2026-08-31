import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Activity, AlertCircle, ExternalLink, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { publicFetch } from '../utils/api';
import './Auth.css';

const BLOBS = [
  { size: 440, top: '-10%', left: '65%', color: 'var(--pop-gold)', blur: 90, tx: -35, ty: 25, dur: '19s' },
  { size: 380, top: '60%', left: '-12%', color: 'var(--pop-green)', blur: 85, tx: 30, ty: -25, dur: '21s' },
  { size: 260, top: '82%', left: '70%', color: 'var(--pop-pink)', blur: 65, tx: -20, ty: -18, dur: '16s' },
];

const evaluatePassword = (pass) => {
  let score = 0;
  if (!pass) return { score: 0, text: '', color: 'var(--border)' };
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 25, text: 'Débil', color: 'var(--error)' };
  if (score === 2) return { score: 50, text: 'Regular', color: 'var(--warning)' };
  if (score === 3) return { score: 75, text: 'Buena', color: 'var(--pop-green)' };
  return { score: 100, text: 'Fuerte', color: '#1F8A32' };
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: 'var(--border)' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (id === 'password') {
      setPasswordStrength(evaluatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (passwordStrength.score < 75) {
      setErrorMsg('Ingresa una contraseña más segura (mínimo nivel "Buena").');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
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
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        navigate('/onboarding');
        return;
      }

      setErrorMsg(data.error || 'Ocurrió un error al registrarse.');
    } catch (error) {
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
          <p className="auth-eyebrow pop-gold">Únete a Lemmatica</p>
          <h1 className="auth-title">Crea tu cuenta.</h1>
          <p className="auth-subtitle">
            Recupera hasta 2 horas diarias de tu tiempo y devuelve el lado humano a tu práctica médica.
          </p>
        </div>

        <p className="auth-footnote">Lemmatica © 2026 · Cumplimiento médico y cifrado de extremo a extremo.</p>
      </motion.div>

      <div className="auth-side-form">
        <motion.div
          className="auth-form-inner auth-form-wide"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="auth-title">Crear cuenta</h2>
          <p className="auth-subtitle">Ingresa tus datos para registrar tu consultorio inteligente.</p>

          {errorMsg && (
            <div className="auth-banner is-error" role="alert">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field-grid">
              <div className="form-field">
                <label htmlFor="firstName" className="form-label">Nombre</label>
                <input
                  type="text"
                  id="firstName"
                  className="form-input"
                  placeholder="Ej. Carlos"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="form-field">
                <label htmlFor="lastName" className="form-label">Apellido</label>
                <input
                  type="text"
                  id="lastName"
                  className="form-input"
                  placeholder="Ej. Ramírez"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="email" className="form-label">Correo institucional</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="dr.nombre@hospital.com"
                value={formData.email}
                onChange={handleChange}
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
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
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

              {formData.password && (
                <div className="auth-strength">
                  <div className="auth-strength-row">
                    <span>Seguridad de la contraseña</span>
                    <span style={{ color: passwordStrength.color, fontWeight: 600 }}>{passwordStrength.text}</span>
                  </div>
                  <div className="auth-strength-track">
                    <div
                      className="auth-strength-fill"
                      style={{ width: `${passwordStrength.score}%`, background: passwordStrength.color }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                className="form-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label
                htmlFor="termsCheckbox"
                className={`auth-terms${termsError ? ' has-error' : ''}${termsAccepted ? ' is-checked' : ''}`}
              >
                <input
                  type="checkbox"
                  id="termsCheckbox"
                  className="auth-checkbox-input"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) setTermsError(false);
                  }}
                />
                <div className={`auth-checkbox-box${termsAccepted ? ' is-checked' : ''}`}>
                  {termsAccepted && <Check size={13} color="#fff" strokeWidth={3} />}
                </div>
                <span className="auth-terms-text">
                  He leído y acepto los{' '}
                  <Link to="/terminos" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    Términos y Condiciones, Política de Privacidad y Política de Uso de IA
                    <ExternalLink size={13} />
                  </Link>{' '}
                  de Lemmatica, incluyendo el almacenamiento, procesamiento y tratamiento de mis datos profesionales y los datos de pacientes bajo mi responsabilidad, conforme a la LFPDPPP.
                </span>
              </label>
              {termsError && (
                <p className="auth-terms-error">Debes aceptar los Términos y Condiciones para continuar.</p>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-switch">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login">Inicia sesión aquí</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
