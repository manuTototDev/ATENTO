import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Activity, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Reutilizamos el diseño médico limpio

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
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: 'var(--border)' });

  // Evaluar seguridad de la contraseña
  const evaluatePassword = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, text: '', color: 'var(--border)' };
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, text: 'Débil', color: 'var(--error)' };
    if (score === 2) return { score: 50, text: 'Regular', color: '#F59E0B' }; // Orange
    if (score === 3) return { score: 75, text: 'Buena', color: '#10B981' }; // Green
    return { score: 100, text: 'Fuerte', color: '#059669' }; // Dark Green
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
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
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
        // Guardar token y userId para la siguiente pantalla
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
    <div className="login-container">
      <div className="login-content animate-fade-in">
        <div className="logo-container">
          <Activity size={36} strokeWidth={2.5} className="logo-icon" />
          <h1 className="logo-text">Atento</h1>
        </div>

        <div className="clean-panel login-card">
          <div className="login-header">
            <h2>Registro de Especialista</h2>
            <p>Crea tu cuenta segura para comenzar</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="firstName">Nombre</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="firstName"
                    className="form-input"
                    placeholder="Ej. Carlos"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Apellido</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="lastName"
                    className="form-input"
                    placeholder="Ej. Ramírez"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Institucional / Profesional</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="dr.nombre@hospital.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña Segura</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="8"
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Indicador de Fuerza de Contraseña */}
              {formData.password && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Seguridad:</span>
                    <span style={{ color: passwordStrength.color, fontWeight: 600 }}>{passwordStrength.text}</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
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

              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block', lineHeight: 1.4 }}>
                Requerido: Mín. 8 caracteres, 1 mayúscula, 1 número y 1 símbolo especial (!@#$%).
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Repetir Contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="8"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '1.5rem' }}>
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            ¿Ya tienes una cuenta? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Inicia sesión aquí</Link>
          </div>

          <div className="security-badge">
            <ShieldCheck size={16} />
            <span>Datos protegidos con encriptación de grado médico</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
