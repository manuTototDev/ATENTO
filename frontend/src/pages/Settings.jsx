import React, { useState, useRef, useEffect } from 'react';
import { Upload, ArrowLeft, User, Building2, ImagePlus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api';

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

const sectionMotion = (delay) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }
});

const Settings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isFetchingZip, setIsFetchingZip] = useState(false);
  const [availableColonias, setAvailableColonias] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [logoError, setLogoError] = useState('');

  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch(`/api/profile`);
        if (res.ok) {
          const data = await res.json();
          // Intentar parsear clinicAddress
          let street = '', neighborhood = '', city = '', zipCode = '', state = '';
          if (data.profile?.clinicAddress) {
            const parts = data.profile.clinicAddress.split(', ');
            if (parts.length >= 4) {
              street = parts[0] || '';
              neighborhood = parts[1] || '';
              city = parts[2] || '';
              state = parts[3] || '';
              // Tolerante a "CP 11000", "C.P. 11000" o solo "11000" (formatos históricos)
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
            zipCode: zipCode,
            state: state,
            city: city,
            neighborhood: neighborhood,
            street: street,
            phoneNumber: data.profile?.phoneNumber || '',
            logoBase64: data.profile?.logoUrl || ''
          });

          if (data.profile?.logoUrl) {
            setLogoPreview(data.profile.logoUrl);
          }

          if (zipCode && zipCode.length === 5) {
            fetchLocationFromZip(zipCode, true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    if (id === 'zipCode' && value.length === 5) {
      fetchLocationFromZip(value);
    }
    if (id === 'zipCode' && value.length !== 5) {
      setAvailableColonias([]);
    }
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
          setFormData(prev => ({
            ...prev,
            state: state,
            city: '',
            neighborhood: ''
          }));
        }
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
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData })
      });

      if (res.ok) {
        setSuccessMsg('¡Perfil actualizado con éxito!');
        // Pequeño respiro visual para que se note el feedback antes de salir
        setTimeout(() => navigate('/dashboard'), 900);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'No se pudo actualizar el perfil.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Error de conexión al actualizar el perfil.');
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
    <div className="stg-page">
      <style>{`
        .stg-page {
          padding: 3rem clamp(1.25rem, 5vw, 5rem) 5rem;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
        }
        .stg-back {
          background: none;
          border: none;
          color: var(--text-muted);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          margin-bottom: 2rem;
          margin-left: -0.6rem;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.4rem 0.6rem;
          border-radius: var(--radius-sm);
          transition: color var(--duration-fast) var(--ease-out), background-color var(--duration-fast) var(--ease-out);
        }
        .stg-back:hover { color: var(--text-dark); background-color: var(--input-bg); }
        .stg-title {
          font-size: clamp(2.25rem, 5vw, 3.5rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin: 0 0 1rem;
          color: var(--text-dark);
        }
        .stg-subtitle {
          font-size: 1.05rem;
          color: var(--text-muted);
          max-width: 620px;
          line-height: 1.6;
          margin: 0 0 2.5rem;
        }
        .stg-banner {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.875rem 1.1rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 2rem;
          max-width: 780px;
        }
        .stg-banner svg { flex-shrink: 0; }
        .stg-banner.is-success { background: var(--success-bg); color: var(--success); }
        .stg-banner.is-error { background: var(--error-bg); color: var(--error); }
        .stg-form-wrap { max-width: 780px; }
        .stg-section {
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem clamp(1.25rem, 4vw, 2.5rem);
          margin-bottom: 1.75rem;
          background: var(--surface);
        }
        .stg-section-head {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 1.75rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }
        .stg-section-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm);
          background: var(--text-dark);
          color: #fff;
          flex-shrink: 0;
        }
        .stg-section-head h2 {
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--text-dark);
          margin: 0;
        }
        .stg-field { margin-bottom: 1.5rem; }
        .stg-field:last-child { margin-bottom: 0; }
        .stg-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .stg-grid-2:last-child { margin-bottom: 0; }
        .stg-grid-1-2 { grid-template-columns: 1fr 2fr; }
        .stg-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .stg-input-wrap { position: relative; }
        .stg-input, .stg-select {
          width: 100%;
          padding: 0.75rem 0.9rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--input-bg);
          font-size: 1rem;
          color: var(--text-dark);
          outline: none;
          transition: border-color var(--duration-fast) var(--ease-out), background-color var(--duration-fast) var(--ease-out);
        }
        .stg-select { appearance: none; cursor: pointer; }
        .stg-input:hover, .stg-select:hover { border-color: var(--border-focus); }
        .stg-input:focus, .stg-select:focus { border-color: var(--border-focus); background: #fff; }
        .stg-fetching {
          position: absolute;
          right: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.75rem;
          color: var(--text-muted);
          pointer-events: none;
        }
        .stg-dropzone {
          border: 2px dashed var(--border);
          border-radius: var(--radius-lg);
          padding: 2.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          background: var(--input-bg);
          transition: border-color var(--duration-fast) var(--ease-out), background-color var(--duration-fast) var(--ease-out);
        }
        .stg-dropzone:hover, .stg-dropzone:focus-visible { border-color: var(--text-dark); background: #fff; }
        .stg-dropzone-title { font-size: 1rem; font-weight: 600; color: var(--text-dark); margin-top: 0.9rem; }
        .stg-dropzone-sub { font-size: 0.825rem; color: var(--text-muted); margin-top: 0.35rem; }
        .stg-dropzone-change {
          font-size: 0.825rem; font-weight: 600; color: var(--text-dark);
          border-bottom: 1px solid var(--text-dark); padding-bottom: 2px; margin-top: 0.9rem;
        }
        .stg-logo-preview { max-height: 90px; object-fit: contain; }
        .stg-submit { max-width: 780px; }
        .stg-spin { animation: stg-spin 0.8s linear infinite; }
        @keyframes stg-spin { to { transform: rotate(360deg); } }
        @media (max-width: 720px) {
          .stg-grid-2, .stg-grid-1-2 { grid-template-columns: 1fr; gap: 1.25rem; }
          .stg-page { padding-top: 2rem; }
          .stg-section { padding: 1.5rem 1.25rem; }
        }
      `}</style>

      {/* HEADER */}
      <div>
        <button
          type="button"
          className="stg-back"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={18} />
          Volver al Dashboard
        </button>

        <h1 className="stg-title">Tus Ajustes.</h1>
        <p className="stg-subtitle">
          Actualiza tu información profesional y de contacto. Esta información se usará para generar el membrete automático de tus recetas y expedientes.
        </p>
      </div>

      {(successMsg || errorMsg) && (
        <div
          className={`stg-banner ${successMsg ? 'is-success' : 'is-error'}`}
          role={successMsg ? 'status' : 'alert'}
        >
          {successMsg ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{successMsg || errorMsg}</span>
        </div>
      )}

      {/* FORM */}
      <div className="stg-form-wrap">
        <form onSubmit={handleSubmit}>

          <motion.section className="stg-section" {...sectionMotion(0)}>
            <div className="stg-section-head">
              <span className="stg-section-icon"><User size={16} /></span>
              <h2>Académico y Legal</h2>
            </div>

            <div className="stg-field">
              <label htmlFor="fullName" className="stg-label">Nombre Completo</label>
              <input
                type="text"
                id="fullName"
                className="stg-input"
                placeholder="Ej. Dr. Juan Pérez"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="stg-grid-2">
              <div>
                <label htmlFor="specialty" className="stg-label">Especialidad</label>
                <input
                  type="text"
                  id="specialty"
                  list={formData.specialty.length >= 2 ? "specialties-list" : undefined}
                  className="stg-input"
                  placeholder="Ej. Pediatría"
                  value={formData.specialty}
                  onChange={handleChange}
                  required
                />
                <datalist id="specialties-list">
                  {COMMON_SPECIALTIES.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div>
                <label htmlFor="university" className="stg-label">Universidad de Egreso</label>
                <input
                  type="text"
                  id="university"
                  list={formData.university.length >= 2 ? "universities-list" : undefined}
                  className="stg-input"
                  placeholder="Universidad..."
                  value={formData.university}
                  onChange={handleChange}
                  required
                />
                <datalist id="universities-list">
                  {COMMON_UNIVERSITIES.map(u => <option key={u} value={u} />)}
                </datalist>
              </div>
            </div>

            <div className="stg-grid-2">
              <div>
                <label htmlFor="licenseNumber" className="stg-label">Cédula Profesional</label>
                <input
                  type="text"
                  id="licenseNumber"
                  className="stg-input"
                  placeholder="Número de cédula"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="specialtyLicense" className="stg-label">Cédula de Especialidad</label>
                <input
                  type="text"
                  id="specialtyLicense"
                  className="stg-input"
                  placeholder="Opcional"
                  value={formData.specialtyLicense}
                  onChange={handleChange}
                />
              </div>
            </div>
          </motion.section>

          <motion.section className="stg-section" {...sectionMotion(0.06)}>
            <div className="stg-section-head">
              <span className="stg-section-icon"><Building2 size={16} /></span>
              <h2>Contacto y Consultorio</h2>
            </div>

            <div className="stg-grid-2">
              <div>
                <label htmlFor="clinicName" className="stg-label">Nombre del Consultorio</label>
                <input
                  type="text"
                  id="clinicName"
                  className="stg-input"
                  placeholder="Ej. Clínica San Miguel"
                  value={formData.clinicName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="stg-label">Teléfono de Citas</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  className="stg-input"
                  placeholder="(55) 1234 5678"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="stg-grid-2 stg-grid-1-2">
              <div>
                <label htmlFor="zipCode" className="stg-label">Código Postal</label>
                <div className="stg-input-wrap">
                  <input
                    type="text"
                    id="zipCode"
                    maxLength="5"
                    className="stg-input"
                    placeholder="Ej. 11000"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                  {isFetchingZip && <span className="stg-fetching">Buscando...</span>}
                </div>
              </div>

              <div>
                <label htmlFor="state" className="stg-label">Estado</label>
                <input
                  type="text"
                  id="state"
                  className="stg-input"
                  placeholder="Estado..."
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="stg-grid-2">
              <div>
                <label htmlFor="city" className="stg-label">Municipio / Ciudad</label>
                <input
                  type="text"
                  id="city"
                  className="stg-input"
                  placeholder="Ej. Miguel Hidalgo"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="neighborhood" className="stg-label">Colonia</label>
                {availableColonias.length > 0 ? (
                  <select
                    id="neighborhood"
                    className="stg-select"
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
                    className="stg-input"
                    placeholder="Ej. Polanco"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    required
                  />
                )}
              </div>
            </div>

            <div className="stg-field">
              <label htmlFor="street" className="stg-label">Calle y Número Ext / Int</label>
              <input
                type="text"
                id="street"
                className="stg-input"
                placeholder="Ej. Av. Reforma 123, Consultorio 4B"
                value={formData.street}
                onChange={handleChange}
                required
              />
            </div>
          </motion.section>

          <motion.section className="stg-section" {...sectionMotion(0.12)}>
            <div className="stg-section-head">
              <span className="stg-section-icon"><ImagePlus size={16} /></span>
              <h2>Membrete de Receta</h2>
            </div>

            <div
              className="stg-dropzone"
              role="button"
              tabIndex={0}
              aria-label="Subir logo de la institución"
              onClick={() => fileInputRef.current.click()}
              onKeyDown={handleDropzoneKeyDown}
            >
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo actual del consultorio" className="stg-logo-preview" />
                  <span className="stg-dropzone-change">Cambiar imagen</span>
                </>
              ) : (
                <>
                  <Upload size={28} color="var(--text-dark)" />
                  <span className="stg-dropzone-title">Sube el logo de tu clínica</span>
                  <span className="stg-dropzone-sub">PNG o JPG (Máx 2MB)</span>
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
          </motion.section>

          <button
            type="submit"
            className="btn-primary stg-submit"
            disabled={isLoading}
          >
            {isLoading && <Loader2 size={18} className="stg-spin" />}
            {isLoading ? (successMsg ? 'Guardado, redirigiendo...' : 'Actualizando...') : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
