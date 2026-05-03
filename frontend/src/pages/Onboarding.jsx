import React, { useState, useRef } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  GraduationCap, 
  Award, 
  FileCheck, 
  Upload, 
  CheckCircle,
  Activity,
  Map,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 

// Listas comunes (Ejemplo para México)
const COMMON_SPECIALTIES = [
  "Medicina General", "Pediatría", "Ginecología y Obstetricia", 
  "Medicina Interna", "Cirugía General", "Cardiología", 
  "Dermatología", "Psiquiatría", "Traumatología y Ortopedia",
  "Oftalmología", "Otorrinolaringología", "Urología"
];

const COMMON_UNIVERSITIES = [
  "Universidad Nacional Autónoma de México (UNAM)",
  "Instituto Politécnico Nacional (IPN)",
  "Universidad de Guadalajara (UdeG)",
  "Universidad Autónoma de Nuevo León (UANL)",
  "Tecnológico de Monterrey (ITESM)",
  "Universidad Anáhuac",
  "Universidad La Salle",
  "Universidad Autónoma Metropolitana (UAM)"
];

const Onboarding = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isFetchingZip, setIsFetchingZip] = useState(false);

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
  };

  const fetchLocationFromZip = async (zip) => {
    setIsFetchingZip(true);
    try {
      // Usamos zippopotam, una API pública gratuita para códigos postales
      const res = await fetch(`https://api.zippopotam.us/mx/${zip}`);
      if (res.ok) {
        const data = await res.json();
        const state = data.places[0].state;
        const city = data.places[0]['place name']; // En Zippopotam a veces el place name es la colonia o municipio
        
        setFormData(prev => ({
          ...prev,
          state: state,
          city: city,
          // La colonia (neighborhood) y calle suelen dejarse al usuario o usar otra API más exacta como Sepomex
        }));
      }
    } catch (error) {
      console.error("Error fetching ZIP", error);
    } finally {
      setIsFetchingZip(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("El logo no debe superar los 2MB.");
        return;
      }
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

    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Error de sesión: Por favor regístrate de nuevo.');
      navigate('/register');
      return;
    }

    const fullClinicAddress = `${formData.street}, ${formData.neighborhood}, ${formData.city}, ${formData.state}, C.P. ${formData.zipCode}`;

    try {
      const response = await fetch('http://localhost:5000/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
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
        alert('¡Perfil configurado con éxito!');
        navigate('/dashboard');
      } else {
        alert(data.error || 'Hubo un error al guardar el perfil.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ alignItems: 'flex-start', paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div className="login-content animate-fade-in" style={{ maxWidth: '650px' }}>
        
        <div className="logo-container" style={{ marginBottom: '1.5rem' }}>
          <Activity size={32} strokeWidth={2.5} className="logo-icon" />
          <h1 className="logo-text">Atento</h1>
        </div>

        <div className="clean-panel login-card" style={{ padding: '2rem' }}>
          <div className="login-header" style={{ marginBottom: '1.5rem' }}>
            <h2>Configuración del Perfil Profesional</h2>
            <p>Completa tus datos médicos y del consultorio para emitir recetas.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* DATOS PROFESIONALES */}
            <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Datos Académicos y Legales
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="specialty">Especialidad</label>
                <div className="input-wrapper">
                  <Award size={18} className="input-icon" />
                  <input
                    type="text"
                    id="specialty"
                    list="specialties-list"
                    className="form-input"
                    placeholder="Empieza a escribir..."
                    value={formData.specialty}
                    onChange={handleChange}
                    required
                  />
                  <datalist id="specialties-list">
                    {COMMON_SPECIALTIES.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="university">Universidad de Egreso</label>
                <div className="input-wrapper">
                  <GraduationCap size={18} className="input-icon" />
                  <input
                    type="text"
                    id="university"
                    list="universities-list"
                    className="form-input"
                    placeholder="Empieza a escribir..."
                    value={formData.university}
                    onChange={handleChange}
                    required
                  />
                  <datalist id="universities-list">
                    {COMMON_UNIVERSITIES.map(u => <option key={u} value={u} />)}
                  </datalist>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="licenseNumber">Cédula Profesional</label>
                <div className="input-wrapper">
                  <FileCheck size={18} className="input-icon" />
                  <input
                    type="text"
                    id="licenseNumber"
                    className="form-input"
                    placeholder="General (Ej. 1234567)"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="specialtyLicense">Cédula de Especialidad</label>
                <div className="input-wrapper">
                  <FileCheck size={18} className="input-icon" />
                  <input
                    type="text"
                    id="specialtyLicense"
                    className="form-input"
                    placeholder="Si aplica"
                    value={formData.specialtyLicense}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* CONSULTORIO Y DIRECCIÓN */}
            <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Ubicación y Contacto del Consultorio
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="clinicName">Nombre de Clínica / Consultorio</label>
                <div className="input-wrapper">
                  <Building2 size={18} className="input-icon" />
                  <input
                    type="text"
                    id="clinicName"
                    className="form-input"
                    placeholder="Ej. Clínica San Miguel"
                    value={formData.clinicName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Teléfono del Consultorio</label>
                <div className="input-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    id="phoneNumber"
                    className="form-input"
                    placeholder="(55) 1234 5678"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* DIRECCIÓN CON AUTOFILL */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="zipCode">Código Postal</label>
                <div className="input-wrapper">
                  <Search size={18} className="input-icon" color={isFetchingZip ? "var(--accent)" : "#A0AEC0"} />
                  <input
                    type="text"
                    id="zipCode"
                    maxLength="5"
                    className="form-input"
                    placeholder="Ej. 11000"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="state">Estado</label>
                <div className="input-wrapper">
                  <Map size={18} className="input-icon" />
                  <input
                    type="text"
                    id="state"
                    className="form-input"
                    placeholder="Estado"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="city">Municipio / Ciudad</label>
                <div className="input-wrapper">
                  <MapPin size={18} className="input-icon" />
                  <input
                    type="text"
                    id="city"
                    className="form-input"
                    placeholder="Ciudad o Delegación"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="neighborhood">Colonia</label>
                <div className="input-wrapper">
                  <MapPin size={18} className="input-icon" />
                  <input
                    type="text"
                    id="neighborhood"
                    className="form-input"
                    placeholder="Ej. Lomas de Chapultepec"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="street">Calle y Número</label>
              <div className="input-wrapper">
                <MapPin size={18} className="input-icon" />
                <input
                  type="text"
                  id="street"
                  className="form-input"
                  placeholder="Ej. Av. Reforma 123, Consultorio 4B"
                  value={formData.street}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* LOGO */}
            <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Membrete de Receta
            </h3>

            <div className="form-group">
              <label>Logo de la Institución (Base64)</label>
              <div 
                style={{
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--input-bg)',
                }}
                onClick={() => fileInputRef.current.click()}
              >
                {logoPreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={logoPreview} alt="Logo" style={{ maxHeight: '80px', objectFit: 'contain', marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 500 }}>Cambiar logo</span>
                  </div>
                ) : (
                  <>
                    <Upload size={20} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: 500 }}>Subir logo para receta</span>
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
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '2rem' }}>
              {isLoading ? 'Guardando perfil...' : 'Guardar y Continuar'}
              {!isLoading && <CheckCircle size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
