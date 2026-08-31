import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, GraduationCap, Building2, ImagePlus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api';
import './Auth.css';

// Listas comunes (Ejemplo para México expandido)
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
  { label: 'Académico y Legal', icon: GraduationCap },
  { label: 'Contacto del Consultorio', icon: Building2 },
  { label: 'Membrete de Receta', icon: ImagePlus },
];

const sectionMotion = (delay) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }
});

const Onboarding = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isFetchingZip, setIsFetchingZip] = useState(false);
  const [formError, setFormError] = useState('');
  const [logoError, setLogoError] = useState('');

  const [availableColonias, setAvailableColonias] = useState([]);

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

    // Si es el Código Postal y tiene 5 dígitos (México)
    if (id === 'zipCode' && value.length === 5) {
      fetchLocationFromZip(value);
    }
    // Si cambia el CP o borra, reseteamos las colonias si no es de 5
    if (id === 'zipCode' && value.length !== 5) {
      setAvailableColonias([]);
    }
  };

  const fetchLocationFromZip = async (zip) => {
    setIsFetchingZip(true);
    try {
      // Zippopotam API: Provee estado y múltiples colonias (no provee municipio exacto en México)
      const res = await fetch(`https://api.zippopotam.us/mx/${zip}`);
      if (res.ok) {
        const data = await res.json();
        const state = data.places[0].state;
        const colonias = data.places.map(p => p['place name']);

        setAvailableColonias(colonias);

        setFormData(prev => ({
          ...prev,
          state: state,
          city: '', // El usuario ingresa el municipio manualmente ya que la API gratuita no lo separa bien
          neighborhood: '' // Forzamos a que seleccione de la lista
        }));
      } else {
        setAvailableColonias([]);
      }
    } catch (error) {
      console.error("Error fetching ZIP", error);
      setAvailableColonias([]);
    } finally {
      setIsFetchingZip(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setLogoError('El logo no debe superar los 2MB.');
        return;
      }
      setLogoError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData(prev => ({ ...prev, logoBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setFormError('Error de sesión: por favor regístrate de nuevo.');
      navigate('/register');
      return;
    }
    setIsLoading(true);

    // Formato "CP <código>" — consistente con lo que el servidor genera y Settings parsea
    const fullClinicAddress = `${formData.street}, ${formData.neighborhood}, ${formData.city}, ${formData.state}, CP ${formData.zipCode}`;

    try {
      // La identidad la toma el backend del JWT — no se envía userId en el body
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

      const data = await response.json();

      if (response.ok) {
        setIsDone(true);
        // Pequeño respiro visual para que se note la confirmación antes de entrar al dashboard
        setTimeout(() => navigate('/dashboard'), 900);
      } else {
        setFormError(data.error || 'Hubo un error al guardar el perfil.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setFormError('Error de conexión con el servidor.');
      setIsLoading(false);
    }
  };

  const handleDropzoneKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="auth-split">
      <style>{`
        .obd-cover-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }
        @media (max-width: 900px) {
          .obd-cover-sticky { position: static; height: auto; overflow: visible; }
        }
        .obd-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2.5rem;
        }
        .obd-step {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-subtle);
          font-size: 0.9rem;
          font-weight: 500;
        }
        .obd-step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid var(--accent-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #fff;
        }
        .obd-section-head {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border);
        }
        .obd-section-badge {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm);
          background: var(--primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .obd-section-head h3 {
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--text-dark);
          margin: 0;
        }
        .obd-dropzone {
          border: 2px dashed var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          background: var(--input-bg);
          transition: border-color var(--duration-fast) var(--ease-out), background-color var(--duration-fast) var(--ease-out);
        }
        .obd-dropzone:hover, .obd-dropzone:focus-visible { border-color: var(--accent); background: var(--accent-light); }
        .obd-dropzone-title { font-size: 1rem; font-weight: 500; color: var(--text-dark); margin-top: 0.9rem; }
        .obd-dropzone-sub { font-size: 0.875rem; color: var(--text-muted); margin-top: 0.5rem; }
        .obd-dropzone-change { font-size: 0.875rem; color: var(--accent-hover); font-weight: 600; border-bottom: 1px solid var(--accent-hover); margin-top: 0.9rem; }
        .obd-logo-preview { max-height: 100px; object-fit: contain; margin-bottom: 0.25rem; }
        .obd-spin { animation: obd-spin 0.8s linear infinite; }
        @keyframes obd-spin { to { transform: rotate(360deg); } }
        .obd-zip-hint { font-size: 0.8rem; font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--text-muted); }
      `}</style>

      {/* Left Side: Black Cover */}
      <motion.div
        className="auth-side-cover obd-cover-sticky"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="auth-brand">
          Lemmatica.
        </div>

        <div style={{ margin: 'auto 0' }}>
          <h1>
            Prepara tu <br /> consultorio.
          </h1>
          <p className="auth-tagline">
            Completa tu información clínica. Estos datos se usarán exclusivamente para generar tus recetas médicas y membretes profesionales automáticamente.
          </p>

          <div className="obd-steps">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="obd-step">
                  <span className="obd-step-num">{idx + 1}</span>
                  <Icon size={16} />
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="auth-fineprint">
          Lemmatica © 2026. Cumplimiento médico y cifrado de extremo a extremo.
        </div>
      </motion.div>

      {/* Right Side: White Minimal Form */}
      <div className="auth-side-form">
        <motion.div
          className="auth-form-inner"
          style={{ maxWidth: '600px' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2>Perfil Profesional</h2>
          <p>Tu identidad médica oficial.</p>

          {formError && (
            <div className="auth-error" role="alert">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* DATOS ACADÉMICOS Y LEGALES */}
            <motion.div {...sectionMotion(0)}>
              <div className="obd-section-head">
                <span className="obd-section-badge"><GraduationCap size={16} /></span>
                <h3>Académico y Legal</h3>
              </div>

              <div className="auth-grid-2">
                <div>
                  <label htmlFor="specialty" className="auth-label">Especialidad</label>
                  <div className="auth-input-wrap">
                    <input
                      type="text"
                      id="specialty"
                      list={formData.specialty.length >= 2 ? "specialties-list" : undefined}
                      className="auth-input"
                      placeholder="Ej. Pediatría"
                      value={formData.specialty}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <datalist id="specialties-list">
                    {COMMON_SPECIALTIES.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="university" className="auth-label">Universidad de Egreso</label>
                  <div className="auth-input-wrap">
                    <input
                      type="text"
                      id="university"
                      list={formData.university.length >= 2 ? "universities-list" : undefined}
                      className="auth-input"
                      placeholder="Universidad..."
                      value={formData.university}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <datalist id="universities-list">
                    {COMMON_UNIVERSITIES.map(u => <option key={u} value={u} />)}
                  </datalist>
                </div>
              </div>

              <div className="auth-grid-2">
                <div>
                  <label htmlFor="licenseNumber" className="auth-label">Cédula Profesional</label>
                  <div className="auth-input-wrap">
                    <input
                      type="text"
                      id="licenseNumber"
                      className="auth-input"
                      placeholder="Ej. 1234567"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="specialtyLicense" className="auth-label">Cédula de Especialidad</label>
                  <div className="auth-input-wrap">
                    <input
                      type="text"
                      id="specialtyLicense"
                      className="auth-input"
                      placeholder="Si aplica"
                      value={formData.specialtyLicense}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* UBICACIÓN Y CONTACTO */}
            <motion.div {...sectionMotion(0.06)}>
              <div className="obd-section-head">
                <span className="obd-section-badge"><Building2 size={16} /></span>
                <h3>Contacto del Consultorio</h3>
              </div>

              <div className="auth-grid-2">
                <div>
                  <label htmlFor="clinicName" className="auth-label">Nombre de Clínica / Consultorio</label>
                  <div className="auth-input-wrap">
                    <input
                      type="text"
                      id="clinicName"
                      className="auth-input"
                      placeholder="Ej. Clínica San Miguel"
                      value={formData.clinicName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="auth-label">Teléfono</label>
                  <div className="auth-input-wrap">
                    <input
                      type="tel"
                      id="phoneNumber"
                      className="auth-input"
                      placeholder="(55) 1234 5678"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="auth-grid-2">
                <div>
                  <label htmlFor="zipCode" className="auth-label">
                    C.P. {isFetchingZip && <span className="obd-zip-hint">(Buscando...)</span>}
                  </label>
                  <div className="auth-input-wrap">
                    <input
                      type="text"
                      id="zipCode"
                      maxLength="5"
                      className="auth-input"
                      placeholder="Ej. 11000"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="state" className="auth-label">Estado</label>
                  <div className="auth-input-wrap">
                    <input
                      type="text"
                      id="state"
                      className="auth-input"
                      placeholder="Estado"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="auth-grid-2">
                <div>
                  <label htmlFor="city" className="auth-label">Ciudad / Municipio</label>
                  <div className="auth-input-wrap">
                    <input
                      type="text"
                      id="city"
                      className="auth-input"
                      placeholder="Ciudad o Alcaldía"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="neighborhood" className="auth-label">Colonia</label>
                  <div className="auth-input-wrap">
                    {availableColonias.length > 0 ? (
                      <select
                        id="neighborhood"
                        className="auth-input"
                        style={{ appearance: 'none', cursor: 'pointer' }}
                        value={formData.neighborhood}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>Selecciona una colonia...</option>
                        {availableColonias.map((colonia, idx) => (
                          <option key={idx} value={colonia}>{colonia}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        id="neighborhood"
                        className="auth-input"
                        placeholder="Ej. Polanco"
                        value={formData.neighborhood}
                        onChange={handleChange}
                        required
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="street" className="auth-label">Calle y Número</label>
                <div className="auth-input-wrap">
                  <input
                    type="text"
                    id="street"
                    className="auth-input"
                    placeholder="Ej. Av. Reforma 123, Int 4"
                    value={formData.street}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* LOGO */}
            <motion.div {...sectionMotion(0.12)}>
              <div className="obd-section-head">
                <span className="obd-section-badge"><ImagePlus size={16} /></span>
                <h3>Membrete de Receta</h3>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <div
                  className="obd-dropzone"
                  role="button"
                  tabIndex={0}
                  aria-label="Subir logo de la institución"
                  onClick={() => fileInputRef.current.click()}
                  onKeyDown={handleDropzoneKeyDown}
                >
                  {logoPreview ? (
                    <>
                      <img src={logoPreview} alt="Logo cargado" className="obd-logo-preview" />
                      <span className="obd-dropzone-change">Cambiar imagen</span>
                    </>
                  ) : (
                    <>
                      <Upload size={24} color="var(--text-dark)" />
                      <span className="obd-dropzone-title">Subir logo para tus recetas</span>
                      <span className="obd-dropzone-sub">Formatos soportados: JPG, PNG</span>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/png, image/jpeg"
                    style={{ display: 'none' }}
                  />
                </div>
                {logoError && <p className="form-error" style={{ marginTop: '0.75rem' }}>{logoError}</p>}
              </div>
            </motion.div>

            <button
              type="submit"
              disabled={isLoading}
              className="auth-submit"
            >
              {isLoading && <Loader2 size={20} className="obd-spin" />}
              {isLoading ? (isDone ? 'Perfil listo, entrando...' : 'Guardando perfil...') : 'Guardar y Continuar'}
              {!isLoading && <CheckCircle size={20} />}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
