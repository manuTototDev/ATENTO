import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login attempt with secure credentials');
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
            <h2>Acceso Clínico</h2>
            <p>Ingresa tus credenciales seguras</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="dr.nombre@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Mantener sesión iniciada</span>
              </label>
              <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Autenticando...' : 'Iniciar Sesión'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            ¿Eres nuevo en Atento? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Crea una cuenta</Link>
          </div>

          <div className="security-badge">
            <ShieldCheck size={16} />
            <span>Conexión encriptada de extremo a extremo (HIPAA Compliant)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
