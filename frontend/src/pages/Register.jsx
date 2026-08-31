import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ExternalLink, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { publicFetch } from '../utils/api';
import './Auth.css';

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
  const [formError, setFormError] = useState('');

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
    setFormError('');

    if (passwordStrength.score < 75) {
      setFormError('Por favor, ingresa una contraseña más segura (mínimo "Buena").');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Las contraseñas no coinciden.');
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
        setFormError(data.error || 'Ocurrió un error al registrarse.');
      }
    } catch (error) {
      console.error(error);
      setFormError('Error de conexión con el servidor.');
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
            Únete al <br /> futuro.
          </h1>
          <p className="auth-tagline">
            Crea tu cuenta de forma segura. Recupera hasta 2 horas diarias de tu tiempo y devuelve el lado humano a tu práctica médica.
          </p>
        </div>

        <div className="auth-fineprint">
          Lemmatica © 2026. Cumplimiento médico y cifrado de extremo a extremo.
        </div>
      </motion.div>

      <div className="auth-side-form">
        <motion.div
          className="auth-form-inner"
          style={{ maxWidth: '460px' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2>Crear Cuenta</h2>
          <p>Ingresa tus datos para registrar tu consultorio inteligente.</p>

          {formError && (
            <div className="auth-error" role="alert">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-grid-2">
              <div>
                <label htmlFor="firstName" className="auth-label">Nombre</label>
                <div className="auth-input-wrap">
                  <input
                    type="text"
                    id="firstName"
                    className="auth-input"
                    placeholder="Ej. Carlos"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="auth-label">Apellido</label>
                <div className="auth-input-wrap">
                  <input
                    type="text"
                    id="lastName"
                    className="auth-input"
                    placeholder="Ej. Ramírez"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Correo Institucional</label>
              <div className="auth-input-wrap">
                <input
                  type="email"
                  id="email"
                  className="auth-input"
                  placeholder="dr.nombre@hospital.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">Contraseña</label>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="8"
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

              {formData.password && (
                <div className="auth-strength">
                  <div className="auth-strength-row">
                    <span>Seguridad:</span>
                    <span style={{ color: passwordStrength.color, fontWeight: 600 }}>{passwordStrength.text}</span>
                  </div>
                  <div className="auth-strength-track">
                    <div
                      className="auth-strength-bar"
                      style={{ width: `${passwordStrength.score}%`, background: passwordStrength.color }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword" className="auth-label">Confirmar Contraseña</label>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="auth-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="8"
                />
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label
                htmlFor="termsCheckbox"
                className={`auth-terms${termsAccepted ? ' checked' : ''}${termsError ? ' has-error' : ''}`}
              >
                <input
                  type="checkbox"
                  id="termsCheckbox"
                  className="auth-terms-checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) setTermsError(false);
                  }}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                />
                <div className="auth-terms-box">
                  {termsAccepted && <Check size={14} color="#fff" strokeWidth={3} />}
                </div>
                <span className="auth-terms-copy">
                  He leído y acepto los{' '}
                  <Link
                    to="/terminos"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Términos y Condiciones, Política de Privacidad y Política de Uso de IA
                    <ExternalLink size={13} />
                  </Link>
                  {' '}de Lemmatica, incluyendo el almacenamiento, procesamiento y tratamiento de mis datos profesionales y los datos de pacientes bajo mi responsabilidad, conforme a la LFPDPPP.
                </span>
              </label>
              {termsError && (
                <p className="form-error" style={{ marginTop: '0.5rem' }}>
                  Debes aceptar los Términos y Condiciones para continuar.
                </p>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="auth-submit">
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              {!isLoading && <ArrowRight size={20} />}
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
