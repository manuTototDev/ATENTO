import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, GraduationCap, Award, BadgeCheck, Building2, Phone, MapPin,
  UploadCloud, ArrowLeft, ArrowRight, Check, AlertCircle, Loader2, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import './Onboarding.css';

const COMMON_SPECIALTIES = [
  "Alergología", "Anestesiología", "Angiología", "Biología de la Reproducción",
  "Cardiología", "Cardiología Pediátrica", "Cirugía Bariátrica", "Cirugía General",
  "Cirugía Maxilofacial", "Cirugía Oncológica", "Cirugía Pediátrica", "Cirugía Plástica",
  "Dermatología", "Endocrinología", "Gastroenterología", "Genética Médica",
  "Geriatría", "Ginecología y Obstetricia", "Hematología", "Infectología",
  "Medicina de Rehabilitación", "Medicina del Deporte", "Medicina del Trabajo",
  "Medicina Familiar", "Medicina General", "Medicina Interna", "Nefrología",
  "Neumología", "Neurocirugía", "Neurología", "Nutriología Clínica", "Odontología",
  "Oftalmología", "Oncología Médica", "Ortopedia", "Otorrinolaringología",
  "Pediatría", "Proctología", "Psiquiatría", "Reumatología", "Traumatología", "Urología",
  "Otra Especialidad"
];

const COMMON_UNIVERSITIES = [
  "Universidad Nacional Autónoma de México (UNAM)",
  "Instituto Politécnico Nacional (IPN)",
  "Universidad de Guadalajara (UdeG)",
  "Universidad Autónoma de Nuevo León (UANL)",
  "Tecnológico de Monterrey (ITESM)",
  "Universidad Anáhuac",
  "Universidad La Salle",
  "Universidad Panamericana (UP)",
  "Universidad Autónoma Metropolitana (UAM)",
  "Benemérita Universidad Autónoma de Puebla (BUAP)",
  "Universidad Veracruzana (UV)",
  "Universidad Autónoma del Estado de México (UAEMex)",
  "Universidad Autónoma de Baja California (UABC)",
  "Universidad de Guanajuato (UG)",
  "Universidad Autónoma de San Luis Potosí (UASLP)",
  "Universidad Autónoma de Querétaro (UAQ)",
  "Universidad Michoacana de San Nicolás de Hidalgo (UMSNH)",
  "Universidad Autónoma de Sinaloa (UAS)",
  "Universidad de Sonora (UNISON)",
  "Universidad Autónoma de Yucatán (UADY)",
  "Universidad de Monterrey (UDEM)",
  "Universidad Popular Autónoma del Estado de Puebla (UPAEP)",
  "Universidad del Valle de México (UVM)",
  "Otra Universidad"
];

const STEPS = [
  { key: 'identity', label: 'Identidad', color: 'var(--pop-blue)' },
  { key: 'clinic', label: 'Consultorio', color: 'var(--pop-gold)' },
  { key: 'letterhead', label: 'Membrete', color: 'var(--pop-violet)' },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isFetchingZip, setIsFetchingZip] = useState(false);
  const [availableColonias, setAvailableColonias] = useState([]);
  const [stepError, setStepError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    specialty: '',
    licenseNumber: '',
    specialtyLicense: '',
    university: '',
    clinicName: '',
    zipCode: '',
    state: '',
    city: '',
    neighborhood: '',
    street: '',
    phoneNumber: '',
    logoBase64: ''
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setStepError('');

    if (id === 'zipCode' && value.length === 5) fetchLocationFromZip(value);
    if (id === 'zipCode' && value.length !== 5) setAvailableColonias([]);
  };

  const fetchLocationFromZip = async (zip) => {
    setIsFetchingZip(true);
    try {
      const res = await fetch(`https://api.zippopotam.us/mx/${zip}`);
      if (res.ok) {
        const data = await res.json();
        const state = data.places[0].state;
        const colonias = data.places.map(p => p['place name']);
        setAvailableColonias(colonias);
        setFormData(prev => ({ ...prev, state, city: '', neighborhood: '' }));
      } else {
        setAvailableColonias([]);
      }
    } catch (error) {
      console.error('Error fetching ZIP', error);
      setAvailableColonias([]);
    } finally {
      setIsFetchingZip(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setStepError('El logo no debe superar los 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setFormData(prev => ({ ...prev, logoBase64: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    if (step === 0) {
      if (!formData.specialty || !formData.licenseNumber || !formData.university) {
        setStepError('Completa especialidad, universidad y cédula profesional para continuar.');
        return false;
      }
    }
    if (step === 1) {
      if (!formData.clinicName || !formData.phoneNumber || !formData.zipCode || !formData.state || !formData.city || !formData.neighborhood || !formData.street) {
        setStepError('Completa todos los datos del consultorio para continuar.');
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStepError('');
    setDirection(1);
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setStepError('');
    setDirection(-1);
    setStep(s => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitError('Tu sesión expiró. Regístrate de nuevo.');
      setTimeout(() => navigate('/register'), 1200);
      return;
    }
    setIsLoading(true);
    setSubmitError('');

    const fullClinicAddress = `${formData.street}, ${formData.neighborhood}, ${formData.city}, ${formData.state}, CP ${formData.zipCode}`;

    try {
      const response = await apiFetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty: formData.specialty,
          licenseNumber: formData.licenseNumber,
          specialtyLicense: formData.specialtyLicense,
          university: formData.university,
          clinicName: formData.clinicName,
          phoneNumber: formData.phoneNumber,
          logoBase64: formData.logoBase64,
          clinicAddress: fullClinicAddress
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        navigate('/hoy');
      } else {
        setSubmitError(data.error || 'Hubo un error al guardar tu perfil.');
      }
    } catch (error) {
      console.error(error);
      setSubmitError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-shell">
        <div className="onboarding-brand">
          <Activity size={22} strokeWidth={2.5} />
          <span className="font-display">Lemmatica.</span>
        </div>

        <div className="onboarding-progress">
          {STEPS.map((s, i) => (
            <div key={s.key} className={`onboarding-step${i === step ? ' active' : ''}${i < step ? ' done' : ''}`} style={{ '--step-color': s.color }}>
              <div className="onboarding-step-dot">{i < step ? <Check size={13} /> : i + 1}</div>
              <span className="onboarding-step-label">{s.label}</span>
              {i < STEPS.length - 1 && <div className="onboarding-step-line" />}
            </div>
          ))}
        </div>

        <form onSubmit={step === STEPS.length - 1 ? handleSubmit : (e) => e.preventDefault()}>
          <AnimatePresence mode="wait" custom={direction}>

            {step === 0 && (
              <motion.div key="identity" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
                <h1 className="font-display onboarding-headline">Tu identidad profesional.</h1>
                <p className="onboarding-sub">Estos datos aparecerán en cada receta que emitas — son obligatorios para su validez legal.</p>

                <div className="onboarding-field-row">
                  <div className="form-field">
                    <label className="form-label" htmlFor="specialty"><Stethoscope size={14} className="pop-blue" /> Especialidad</label>
                    <input
                      id="specialty" className="form-input"
                      list={formData.specialty.length >= 2 ? 'specialties-list' : undefined}
                      placeholder="Ej. Pediatría" value={formData.specialty} onChange={handleChange}
                    />
                    <datalist id="specialties-list">
                      {COMMON_SPECIALTIES.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="university"><GraduationCap size={14} className="pop-blue" /> Universidad de egreso</label>
                    <input
                      id="university" className="form-input"
                      list={formData.university.length >= 2 ? 'universities-list' : undefined}
                      placeholder="Universidad..." value={formData.university} onChange={handleChange}
                    />
                    <datalist id="universities-list">
                      {COMMON_UNIVERSITIES.map(u => <option key={u} value={u} />)}
                    </datalist>
                  </div>
                </div>

                <div className="onboarding-field-row">
                  <div className="form-field">
                    <label className="form-label" htmlFor="licenseNumber"><Award size={14} className="pop-blue" /> Cédula profesional</label>
                    <input id="licenseNumber" className="form-input" placeholder="Ej. 1234567" value={formData.licenseNumber} onChange={handleChange} />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="specialtyLicense"><BadgeCheck size={14} className="pop-blue" /> Cédula de especialidad</label>
                    <input id="specialtyLicense" className="form-input" placeholder="Si aplica" value={formData.specialtyLicense} onChange={handleChange} />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="clinic" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
                <h1 className="font-display onboarding-headline">Tu consultorio.</h1>
                <p className="onboarding-sub">Dónde y cómo te contactan tus pacientes.</p>

                <div className="onboarding-field-row">
                  <div className="form-field">
                    <label className="form-label" htmlFor="clinicName"><Building2 size={14} className="pop-gold" /> Nombre de clínica / consultorio</label>
                    <input id="clinicName" className="form-input" placeholder="Ej. Clínica San Miguel" value={formData.clinicName} onChange={handleChange} />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="phoneNumber"><Phone size={14} className="pop-gold" /> Teléfono</label>
                    <input id="phoneNumber" type="tel" className="form-input" placeholder="(55) 1234 5678" value={formData.phoneNumber} onChange={handleChange} />
                  </div>
                </div>

                <div className="onboarding-address-head">
                  <MapPin size={13} className="pop-gold" /> Dirección
                  {isFetchingZip && <span className="onboarding-zip-loading">Buscando...</span>}
                </div>

                <div className="onboarding-field-row onboarding-field-row-3">
                  <div className="form-field">
                    <label className="form-label" htmlFor="zipCode">C.P.</label>
                    <input id="zipCode" maxLength="5" className="form-input" placeholder="Ej. 11000" value={formData.zipCode} onChange={handleChange} />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="state">Estado</label>
                    <input id="state" className="form-input" placeholder="Estado" value={formData.state} onChange={handleChange} />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="city">Ciudad / municipio</label>
                    <input id="city" className="form-input" placeholder="Ciudad o alcaldía" value={formData.city} onChange={handleChange} />
                  </div>
                </div>

                <div className="onboarding-field-row">
                  <div className="form-field">
                    <label className="form-label" htmlFor="neighborhood">Colonia</label>
                    {availableColonias.length > 0 ? (
                      <select id="neighborhood" className="form-input" value={formData.neighborhood} onChange={handleChange}>
                        <option value="" disabled>Selecciona una colonia...</option>
                        {availableColonias.map((colonia, idx) => <option key={idx} value={colonia}>{colonia}</option>)}
                      </select>
                    ) : (
                      <input id="neighborhood" className="form-input" placeholder="Ej. Polanco" value={formData.neighborhood} onChange={handleChange} />
                    )}
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="street">Calle y número</label>
                    <input id="street" className="form-input" placeholder="Ej. Av. Reforma 123, Int 4" value={formData.street} onChange={handleChange} />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="letterhead" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
                <h1 className="font-display onboarding-headline">Membrete de receta.</h1>
                <p className="onboarding-sub">Opcional: sube el logo de tu consultorio para imprimirlo en tus recetas.</p>

                <div className="onboarding-letterhead-grid">
                  <div className="onboarding-upload-zone" onClick={() => fileInputRef.current.click()}>
                    {logoPreview ? (
                      <div className="onboarding-upload-preview">
                        <img src={logoPreview} alt="Logo" />
                        <span>Cambiar imagen</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={24} />
                        <span className="onboarding-upload-title">Subir logo</span>
                        <span className="onboarding-upload-sub">JPG o PNG</span>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg" style={{ display: 'none' }} />
                  </div>

                  <div className="onboarding-preview-card">
                    {logoPreview && <img src={logoPreview} alt="" className="onboarding-preview-logo" />}
                    <div className="onboarding-preview-specialty">{formData.specialty || 'Especialidad'}</div>
                    <div className="onboarding-preview-divider" />
                    <div className="onboarding-preview-line">Céd. Prof. {formData.licenseNumber || '—'}</div>
                    <div className="onboarding-preview-divider" />
                    <div className="onboarding-preview-line onboarding-preview-strong">{formData.clinicName || 'Nombre del consultorio'}</div>
                    <div className="onboarding-preview-line">{[formData.city, formData.state].filter(Boolean).join(', ') || 'Ciudad, Estado'}</div>
                    <div className="onboarding-preview-line">{formData.phoneNumber || 'Teléfono'}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {stepError && (
            <div className="onboarding-error"><AlertCircle size={15} /> {stepError}</div>
          )}
          {submitError && (
            <div className="onboarding-error"><AlertCircle size={15} /> {submitError}</div>
          )}

          <div className="onboarding-nav">
            <button
              type="button"
              className="btn-secondary"
              onClick={goBack}
              disabled={step === 0}
              style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
            >
              <ArrowLeft size={16} /> Atrás
            </button>

            {step < STEPS.length - 1 ? (
              <button type="button" className="btn-primary onboarding-next-btn" onClick={goNext}>
                Continuar <ArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" className="btn-primary onboarding-next-btn" disabled={isLoading}>
                {isLoading ? <Loader2 size={16} className="onboarding-spin" /> : <Check size={16} />}
                {isLoading ? 'Guardando...' : 'Finalizar y entrar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
