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
  Map,
  Search,
  User
} from 'lucide-react';
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

const Settings = () => {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isFetchingZip, setIsFetchingZip] = useState(false);

  // Datos simulados del médico (idealmente vendrían del backend)
  const [formData, setFormData] = useState({
    fullName: 'Dr. Alejandro Médico',
    specialty: 'Cardiología Clínica',
    licenseNumber: '1234567',
    specialtyLicense: '87654321',
    university: 'Universidad Nacional Autónoma de México',
    clinicName: 'Clínica San Miguel',
    zipCode: '11000',
    state: 'CDMX',
    city: 'Miguel Hidalgo',
    neighborhood: 'Lomas de Chapultepec',
    street: 'Av. Reforma 123, Consultorio 4B',
    phoneNumber: '(55) 1234 5678',
    logoBase64: ''
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    if (id === 'zipCode' && value.length === 5) {
      fetchLocationFromZip(value);
    }
  };

  const fetchLocationFromZip = async (zip) => {
    setIsFetchingZip(true);
    try {
      const res = await fetch(`https://api.zippopotam.us/mx/${zip}`);
      if (res.ok) {
        const data = await res.json();
        const state = data.places[0].state;
        const city = data.places[0]['place name'];
        setFormData(prev => ({ ...prev, state: state, city: city }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular guardado
    setTimeout(() => {
      setIsLoading(false);
      alert('¡Perfil actualizado con éxito!');
    }, 800);
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Configuración de Perfil</h1>
      
      <div className="dashboard-panel" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          
          {/* DATOS PERSONALES Y PROFESIONALES */}
          <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            Datos Personales y Legales
          </h3>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="fullName">Nombre Completo</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input type="text" id="fullName" className="form-input" value={formData.fullName} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="specialty">Especialidad</label>
              <div className="input-wrapper">
                <Award size={18} className="input-icon" />
                <input type="text" id="specialty" list="specialties-list" className="form-input" value={formData.specialty} onChange={handleChange} required />
                <datalist id="specialties-list">
                  {COMMON_SPECIALTIES.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="university">Universidad de Egreso</label>
              <div className="input-wrapper">
                <GraduationCap size={18} className="input-icon" />
                <input type="text" id="university" list="universities-list" className="form-input" value={formData.university} onChange={handleChange} required />
                <datalist id="universities-list">
                  {COMMON_UNIVERSITIES.map(u => <option key={u} value={u} />)}
                </datalist>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="licenseNumber">Cédula Profesional</label>
              <div className="input-wrapper">
                <FileCheck size={18} className="input-icon" />
                <input type="text" id="licenseNumber" className="form-input" value={formData.licenseNumber} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="specialtyLicense">Cédula de Especialidad</label>
              <div className="input-wrapper">
                <FileCheck size={18} className="input-icon" />
                <input type="text" id="specialtyLicense" className="form-input" value={formData.specialtyLicense} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* CONSULTORIO Y DIRECCIÓN */}
          <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginTop: '2.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            Ubicación y Contacto del Consultorio
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="clinicName">Nombre de Clínica / Consultorio</label>
              <div className="input-wrapper">
                <Building2 size={18} className="input-icon" />
                <input type="text" id="clinicName" className="form-input" value={formData.clinicName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Teléfono del Consultorio</label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input type="tel" id="phoneNumber" className="form-input" value={formData.phoneNumber} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* DIRECCIÓN */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="zipCode">Código Postal</label>
              <div className="input-wrapper">
                <Search size={18} className="input-icon" color={isFetchingZip ? "var(--accent)" : "#A0AEC0"} />
                <input type="text" id="zipCode" maxLength="5" className="form-input" value={formData.zipCode} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="state">Estado</label>
              <div className="input-wrapper">
                <Map size={18} className="input-icon" />
                <input type="text" id="state" className="form-input" value={formData.state} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="city">Municipio / Ciudad</label>
              <div className="input-wrapper">
                <MapPin size={18} className="input-icon" />
                <input type="text" id="city" className="form-input" value={formData.city} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="neighborhood">Colonia</label>
              <div className="input-wrapper">
                <MapPin size={18} className="input-icon" />
                <input type="text" id="neighborhood" className="form-input" value={formData.neighborhood} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="street">Calle y Número</label>
            <div className="input-wrapper">
              <MapPin size={18} className="input-icon" />
              <input type="text" id="street" className="form-input" value={formData.street} onChange={handleChange} required />
            </div>
          </div>

          {/* LOGO */}
          <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginTop: '2.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            Membrete de Receta
          </h3>

          <div className="form-group">
            <label>Logo de la Institución</label>
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
                maxWidth: '400px'
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

          <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '2.5rem', width: '100%' }}>
            {isLoading ? 'Guardando perfil...' : 'Guardar y Actualizar Perfil'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
