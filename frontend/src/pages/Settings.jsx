import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Stethoscope, Award, BadgeCheck,
  Building2, Phone, MapPin, UploadCloud, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import './Settings.css';

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

const emptyForm = {
  fullName: '',
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
};

const Settings = () => {
  const fileInputRef = useRef(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isFetchingZip, setIsFetchingZip] = useState(false);
  const [availableColonias, setAvailableColonias] = useState([]);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text }
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          let street = '', neighborhood = '', city = '', zipCode = '', state = '';
          if (data.profile?.clinicAddress) {
            const parts = data.profile.clinicAddress.split(', ');
            if (parts.length >= 4) {
              street = parts[0] || '';
              neighborhood = parts[1] || '';
              city = parts[2] || '';
              state = parts[3] || '';
              zipCode = parts[4] ? parts[4].replace(/^C\.?P\.?\s*/i, '').trim() : '';
            }
          }

          setFormData({
            fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            specialty: data.profile?.specialty?.name || '',
            licenseNumber: data.profile?.licenseNumber || '',
            specialtyLicense: data.profile?.specialtyLicense || '',
            university: data.profile?.university?.name || '',
            clinicName: data.profile?.clinicName || '',
            zipCode, state, city, neighborhood, street,
            phoneNumber: data.profile?.phoneNumber || '',
            logoBase64: data.profile?.logoUrl || ''
          });

          if (data.profile?.logoUrl) setLogoPreview(data.profile.logoUrl);
          if (zipCode && zipCode.length === 5) fetchLocationFromZip(zipCode, true);
        } else {
          setFeedback({ type: 'error', text: 'No se pudo cargar tu perfil.' });
        }
      } catch (err) {
        console.error(err);
        setFeedback({ type: 'error', text: 'Error de conexión al cargar el perfil.' });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    if (id === 'zipCode' && value.length === 5) fetchLocationFromZip(value);
    if (id === 'zipCode' && value.length !== 5) setAvailableColonias([]);
  };

  const fetchLocationFromZip = async (zip, isInit = false) => {
    setIsFetchingZip(true);
    try {
      const res = await fetch(`https://api.zippopotam.us/mx/${zip}`);
      if (res.ok) {
        const data = await res.json();
        const state = data.places[0].state;
        const colonias = data.places.map(p => p['place name']);
        setAvailableColonias(colonias);
        if (!isInit) {
          setFormData(prev => ({ ...prev, state, city: '', neighborhood: '' }));
        }
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
      setFeedback({ type: 'error', text: 'El logo no debe superar los 2MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setFormData(prev => ({ ...prev, logoBase64: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData })
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: 'Tu perfil se guardó correctamente.' });
      } else {
        const err = await res.json().catch(() => ({}));
        setFeedback({ type: 'error', text: err.error || 'No se pudo guardar el perfil.' });
      }
    } catch (error) {
      console.error('Error:', error);
      setFeedback({ type: 'error', text: 'Error de conexión al actualizar el perfil.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const doctorLabel = formData.fullName ? `Dr(a). ${formData.fullName}` : 'Dr(a). Tu nombre';

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="font-display settings-title">Ajustes.</h1>
        <p className="settings-subtitle">Tu identidad profesional y los datos de tu consultorio — así se verán en cada receta que emitas.</p>
      </div>

      {isLoadingProfile ? (
        <div className="settings-grid">
          <div className="settings-col-main">
            {[0, 1, 2].map(i => <div key={i} className="dashboard-panel skeleton" style={{ height: '160px', marginBottom: 'var(--space-4)' }} />)}
          </div>
          <div className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-lg)' }} />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="settings-grid">
            <div className="settings-col-main">

              <motion.section className="dashboard-panel settings-section" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <h2 className="settings-section-title"><Stethoscope size={18} className="pop-blue" /> Identidad profesional</h2>
                <div className="form-field">
                  <label className="form-label" htmlFor="fullName">Nombre completo</label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input id="fullName" className="form-input" placeholder="Ej. Juan Pérez" value={formData.fullName} onChange={handleChange} required />
                  </div>
                </div>
                <div className="settings-field-row">
                  <div className="form-field">
                    <label className="form-label" htmlFor="specialty">Especialidad</label>
                    <input
                      id="specialty" className="form-input"
                      list={formData.specialty.length >= 2 ? 'specialties-list' : undefined}
                      placeholder="Ej. Pediatría" value={formData.specialty} onChange={handleChange} required
                    />
                    <datalist id="specialties-list">
                      {COMMON_SPECIALTIES.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="university">Universidad de egreso</label>
                    <input
                      id="university" className="form-input"
                      list={formData.university.length >= 2 ? 'universities-list' : undefined}
                      placeholder="Universidad..." value={formData.university} onChange={handleChange} required
                    />
                    <datalist id="universities-list">
                      {COMMON_UNIVERSITIES.map(u => <option key={u} value={u} />)}
                    </datalist>
                  </div>
                </div>
                <div className="settings-field-row">
                  <div className="form-field">
                    <label className="form-label" htmlFor="licenseNumber">Cédula profesional</label>
                    <div className="input-wrapper">
                      <Award size={16} className="input-icon" />
                      <input id="licenseNumber" className="form-input" placeholder="Número de cédula" value={formData.licenseNumber} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="specialtyLicense">Cédula de especialidad</label>
                    <div className="input-wrapper">
                      <BadgeCheck size={16} className="input-icon" />
                      <input id="specialtyLicense" className="form-input" placeholder="Opcional" value={formData.specialtyLicense} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section className="dashboard-panel settings-section" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
                <h2 className="settings-section-title"><Building2 size={18} className="pop-gold" /> Consultorio</h2>
                <div className="settings-field-row">
                  <div className="form-field">
                    <label className="form-label" htmlFor="clinicName">Nombre del consultorio</label>
                    <input id="clinicName" className="form-input" placeholder="Ej. Clínica San Miguel" value={formData.clinicName} onChange={handleChange} required />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="phoneNumber">Teléfono de citas</label>
                    <div className="input-wrapper">
                      <Phone size={16} className="input-icon" />
                      <input id="phoneNumber" type="tel" className="form-input" placeholder="(55) 1234 5678" value={formData.phoneNumber} onChange={handleChange} required />
                    </div>
                  </div>
                </div>

                <div className="settings-address-head">
                  <MapPin size={14} className="pop-gold" /> Dirección
                  {isFetchingZip && <span className="settings-zip-loading">Buscando código postal...</span>}
                </div>
                <div className="settings-field-row settings-field-row-3">
                  <div className="form-field">
                    <label className="form-label" htmlFor="zipCode">Código postal</label>
                    <input id="zipCode" maxLength="5" className="form-input" placeholder="Ej. 11000" value={formData.zipCode} onChange={handleChange} required />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="state">Estado</label>
                    <input id="state" className="form-input" placeholder="Estado..." value={formData.state} onChange={handleChange} required />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="city">Municipio / ciudad</label>
                    <input id="city" className="form-input" placeholder="Ej. Miguel Hidalgo" value={formData.city} onChange={handleChange} required />
                  </div>
                </div>
                <div className="settings-field-row">
                  <div className="form-field">
                    <label className="form-label" htmlFor="neighborhood">Colonia</label>
                    {availableColonias.length > 0 ? (
                      <select id="neighborhood" className="form-input" value={formData.neighborhood} onChange={handleChange} required>
                        <option value="" disabled>Selecciona una colonia...</option>
                        {availableColonias.map((colonia, idx) => <option key={idx} value={colonia}>{colonia}</option>)}
                      </select>
                    ) : (
                      <input id="neighborhood" className="form-input" placeholder="Ej. Polanco" value={formData.neighborhood} onChange={handleChange} required />
                    )}
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="street">Calle y número</label>
                    <input id="street" className="form-input" placeholder="Ej. Av. Reforma 123, Consultorio 4B" value={formData.street} onChange={handleChange} required />
                  </div>
                </div>
              </motion.section>

              <motion.section className="dashboard-panel settings-section" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
                <h2 className="settings-section-title"><UploadCloud size={18} className="pop-violet" /> Membrete de receta</h2>
                <div
                  className="settings-upload-zone"
                  onClick={() => fileInputRef.current.click()}
                >
                  {logoPreview ? (
                    <div className="settings-upload-preview">
                      <img src={logoPreview} alt="Logo del consultorio" />
                      <span>Cambiar imagen</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={26} />
                      <span className="settings-upload-title">Sube el logo de tu clínica</span>
                      <span className="settings-upload-sub">PNG o JPG · máx. 2MB</span>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg" style={{ display: 'none' }} />
                </div>
              </motion.section>
            </div>

            <motion.aside
              className="settings-preview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
            >
              <p className="settings-preview-label">Así se verá en tus recetas</p>
              <div className="settings-preview-card">
                {logoPreview && <img src={logoPreview} alt="" className="settings-preview-logo" />}
                <div className="settings-preview-name">{doctorLabel}</div>
                <div className="settings-preview-specialty">{formData.specialty || 'Especialidad'}</div>
                <div className="settings-preview-divider" />
                <div className="settings-preview-line">Céd. Prof. {formData.licenseNumber || '—'}{formData.specialtyLicense ? ` · Céd. Esp. ${formData.specialtyLicense}` : ''}</div>
                <div className="settings-preview-line">{formData.university || 'Universidad de egreso'}</div>
                <div className="settings-preview-divider" />
                <div className="settings-preview-line settings-preview-strong">{formData.clinicName || 'Nombre del consultorio'}</div>
                <div className="settings-preview-line">{formData.street || 'Calle y número'}{formData.neighborhood ? `, ${formData.neighborhood}` : ''}</div>
                <div className="settings-preview-line">{[formData.city, formData.state].filter(Boolean).join(', ') || 'Ciudad, Estado'}{formData.zipCode ? ` · CP ${formData.zipCode}` : ''}</div>
                <div className="settings-preview-line">{formData.phoneNumber || 'Teléfono de citas'}</div>
              </div>
            </motion.aside>
          </div>

          <div className="settings-save-bar">
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  key={feedback.text}
                  className={`settings-feedback settings-feedback-${feedback.type}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {feedback.text}
                </motion.div>
              )}
            </AnimatePresence>
            <button type="submit" className="btn-primary settings-save-btn" disabled={isSaving}>
              {isSaving ? <Loader2 size={18} className="settings-spin" /> : null}
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
