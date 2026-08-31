import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Droplet, AlertTriangle, Activity, ArrowLeft, Stethoscope, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import './NewPatient.css';

const ChipInput = ({ id, label, icon: Icon, iconColor, placeholder, values, onChange }) => {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="chip-input">
        {values.map((v, i) => (
          <span key={`${v}-${i}`} className="chip-tag">
            {v}
            <button type="button" onClick={() => remove(i)} aria-label={`Quitar ${v}`}><X size={12} /></button>
          </span>
        ))}
        <div className="input-wrapper chip-input-field">
          <Icon size={18} className="input-icon" color={iconColor} />
          <input
            id={id}
            type="text"
            className="form-input"
            placeholder={values.length === 0 ? placeholder : 'Agregar otro y Enter…'}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
          />
        </div>
      </div>
      <p className="chip-hint">Escribe uno y presiona Enter o coma para agregarlo.</p>
    </div>
  );
};

const NewPatient = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

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
    allergies: [],
    chronicDiseases: []
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (formData.firstName.trim().length < 2) newErrors.firstName = 'El nombre es requerido.';
    if (formData.lastName.trim().length < 2) newErrors.lastName = 'El apellido es requerido.';

    const day = parseInt(formData.dobDay, 10);
    const month = parseInt(formData.dobMonth, 10);
    const year = parseInt(formData.dobYear, 10);
    const currentYear = new Date().getFullYear();
    let dateOfBirth = null;

    if (!day || !month || !year || year < 1900 || year > currentYear) {
      newErrors.dob = 'Revisa el día, mes y año de nacimiento.';
    } else {
      const testDate = new Date(Date.UTC(year, month - 1, day));
      const isRealDate =
        testDate.getUTCFullYear() === year &&
        testDate.getUTCMonth() === month - 1 &&
        testDate.getUTCDate() === day;
      if (!isRealDate || testDate > new Date()) {
        newErrors.dob = 'Esa fecha no existe en el calendario o es una fecha futura.';
      } else {
        dateOfBirth = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00Z`;
      }
    }

    if (formData.email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Ese correo no parece válido.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setServerError('');
    setIsLoading(true);

    try {
      // La identidad del médico la toma el backend del JWT — no se envía doctorId
      const response = await apiFetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          dateOfBirth,
          gender: formData.gender,
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          bloodType: formData.bloodType,
          allergies: formData.allergies,
          chronicDiseases: formData.chronicDiseases
        })
      });

      const data = await response.json();
      if (response.ok) {
        navigate(`/consultation/${data.id}`);
      } else {
        setServerError(data.error || 'Error al registrar paciente.');
      }
    } catch (error) {
      console.error(error);
      setServerError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-form" style={{ alignItems: 'flex-start', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="page-form-content" style={{ maxWidth: '680px' }}>
        <button className="btn-ghost" onClick={() => navigate('/hoy')} style={{ marginBottom: 'var(--space-4)' }}>
          <ArrowLeft size={18} /> Volver
        </button>

        <motion.div
          className="clean-panel form-panel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="form-panel-header" style={{ textAlign: 'center' }}>
            <h2 className="font-display" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <User size={22} className="pop-green" />
              Nuevo Paciente
            </h2>
            <p>Registra los datos demográficos y clínicos básicos.</p>
          </div>

          {serverError && (
            <div className="form-banner-error">
              <AlertCircle size={16} /> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <h3 className="form-section-title">Datos Demográficos</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="firstName">Nombres</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="firstName"
                    className={`form-input${errors.firstName ? ' has-error' : ''}`}
                    placeholder="Ej. María"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                {errors.firstName && <span className="form-error">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Apellidos</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="lastName"
                    className={`form-input${errors.lastName ? ' has-error' : ''}`}
                    placeholder="Ej. López Gómez"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                {errors.lastName && <span className="form-error">{errors.lastName}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <div className="dob-grid">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="2"
                    id="dobDay"
                    className={`form-input${errors.dob ? ' has-error' : ''}`}
                    style={{ textAlign: 'center' }}
                    placeholder="DD"
                    value={formData.dobDay}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="2"
                    id="dobMonth"
                    className={`form-input${errors.dob ? ' has-error' : ''}`}
                    style={{ textAlign: 'center' }}
                    placeholder="MM"
                    value={formData.dobMonth}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="4"
                    id="dobYear"
                    className={`form-input${errors.dob ? ' has-error' : ''}`}
                    style={{ textAlign: 'center' }}
                    placeholder="AAAA"
                    value={formData.dobYear}
                    onChange={handleChange}
                  />
                </div>
                {errors.dob && <span className="form-error">{errors.dob}</span>}
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
                  <option value="Otro">Otro</option>
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
                    className={`form-input${errors.email ? ' has-error' : ''}`}
                    placeholder="paciente@correo.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
            </div>

            <h3 className="form-section-title" style={{ marginTop: '1.5rem' }}>Antecedentes Clave</h3>

            <div className="form-group">
              <label htmlFor="bloodType">Tipo de Sangre</label>
              <div className="input-wrapper">
                <Droplet size={18} className="input-icon" color="var(--pop-red)" />
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

            <ChipInput
              id="allergies"
              label="Alergias Conocidas"
              icon={AlertTriangle}
              iconColor="var(--pop-gold)"
              placeholder="Ej. Penicilina (Enter para agregar)"
              values={formData.allergies}
              onChange={(vals) => setFormData({ ...formData, allergies: vals })}
            />

            <ChipInput
              id="chronicDiseases"
              label="Enfermedades Crónicas (APP)"
              icon={Activity}
              iconColor="var(--pop-blue)"
              placeholder="Ej. Hipertensión Arterial (Enter para agregar)"
              values={formData.chronicDiseases}
              onChange={(vals) => setFormData({ ...formData, chronicDiseases: vals })}
            />

            <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '1.5rem', width: '100%' }}>
              {isLoading ? 'Registrando…' : 'Registrar e Iniciar Consulta'}
              {!isLoading && <Stethoscope size={18} />}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default NewPatient;
