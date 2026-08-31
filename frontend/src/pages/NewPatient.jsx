import React, { useState } from 'react';
import { User, Phone, Mail, Droplet, AlertTriangle, Activity, ArrowLeft, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const NewPatient = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    gender: 'M',
    phone: '',
    email: '',
    bloodType: '',
    allergies: '',
    chronicDiseases: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar fecha de nacimiento real antes de enviar
    const day = parseInt(formData.dobDay, 10);
    const month = parseInt(formData.dobMonth, 10);
    const year = parseInt(formData.dobYear, 10);
    const currentYear = new Date().getFullYear();

    if (!day || !month || !year || year < 1900 || year > currentYear) {
      alert('Fecha de nacimiento inválida. Revisa el día, mes y año.');
      return;
    }
    const testDate = new Date(Date.UTC(year, month - 1, day));
    const isRealDate =
      testDate.getUTCFullYear() === year &&
      testDate.getUTCMonth() === month - 1 &&
      testDate.getUTCDate() === day;
    if (!isRealDate || testDate > new Date()) {
      alert('Fecha de nacimiento inválida. Ese día no existe en el calendario o es futuro.');
      return;
    }

    setIsLoading(true);
    const dateOfBirth = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00Z`;

    try {
      // La identidad del médico la toma el backend del JWT — no se envía userId
      const response = await apiFetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
          bloodType: formData.bloodType,
          allergies: formData.allergies,
          chronicDiseases: formData.chronicDiseases
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Paciente registrado exitosamente. Iniciando consulta...');
        navigate(`/consultation/${data.id}`); 
      } else {
        alert(data.error || 'Error al registrar paciente');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-form" style={{ alignItems: 'flex-start', paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="page-form-content animate-fade-in" style={{ maxWidth: '700px' }}>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn-ghost"
          style={{ marginBottom: '1.5rem', paddingLeft: 0 }}
        >
          <ArrowLeft size={18} /> Volver al Dashboard
        </button>

        <div className="clean-panel form-panel" style={{ padding: '2rem' }}>
          <div className="form-panel-header" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <User size={24} color="var(--primary)" />
              Nuevo Paciente
            </h2>
            <p>Registra los datos demográficos y clínicos básicos</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* DATOS DEMOGRÁFICOS */}
            <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Datos Demográficos
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="firstName">Nombres</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="firstName"
                    className="form-input"
                    placeholder="Ej. María"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Apellidos</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="lastName"
                    className="form-input"
                    placeholder="Ej. López Gómez"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '0.5rem' }}>
                  <input
                    type="text"
                    maxLength="2"
                    id="dobDay"
                    className="form-input"
                    style={{ paddingLeft: '0.75rem', textAlign: 'center' }}
                    placeholder="DD"
                    value={formData.dobDay}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    maxLength="2"
                    id="dobMonth"
                    className="form-input"
                    style={{ paddingLeft: '0.75rem', textAlign: 'center' }}
                    placeholder="MM"
                    value={formData.dobMonth}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    maxLength="4"
                    id="dobYear"
                    className="form-input"
                    style={{ paddingLeft: '0.75rem', textAlign: 'center' }}
                    placeholder="AAAA"
                    value={formData.dobYear}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="gender">Sexo</label>
                <select
                  id="gender"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <div className="input-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    className="form-input"
                    placeholder="(55) 1234 5678"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="paciente@correo.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* EXPEDIENTE CLÍNICO */}
            <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Antecedentes Clave
            </h3>

            <div className="form-group">
              <label htmlFor="bloodType">Tipo de Sangre</label>
              <div className="input-wrapper">
                <Droplet size={18} className="input-icon" color="#EF4444" />
                <select
                  id="bloodType"
                  className="form-input"
                  value={formData.bloodType}
                  onChange={handleChange}
                >
                  <option value="">Desconocido</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="allergies">Alergias Conocidas</label>
              <div className="input-wrapper">
                <AlertTriangle size={18} className="input-icon" color="#F59E0B" />
                <input
                  type="text"
                  id="allergies"
                  className="form-input"
                  placeholder="Ej. Penicilina, Sulfa (Dejar en blanco si no hay)"
                  value={formData.allergies}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="chronicDiseases">Enfermedades Crónicas (APP)</label>
              <div className="input-wrapper">
                <Activity size={18} className="input-icon" color="#3B82F6" />
                <textarea
                  id="chronicDiseases"
                  className="form-input"
                  style={{ minHeight: '80px', paddingTop: '0.75rem', paddingLeft: '2.5rem' }}
                  placeholder="Ej. Hipertensión Arterial, Diabetes Mellitus Tipo 2..."
                  value={formData.chronicDiseases}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '2rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {isLoading ? 'Registrando...' : 'Registrar e Iniciar Consulta'}
              {!isLoading && <Stethoscope size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPatient;
