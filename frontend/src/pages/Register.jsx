import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Activity, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Login.css'; // Reutilizamos el diseño médico limpio

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simular llamada a la API
    setTimeout(() => {
      setIsLoading(false);
      console.log('Intento de registro:', formData);
    }, 1500);
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
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem', display: 'block' }}>
                Debe contener al menos 8 caracteres.
              </small>
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
