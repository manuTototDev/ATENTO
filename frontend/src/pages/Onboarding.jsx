import React, { useState, useRef } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

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

const Onboarding = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isFetchingZip, setIsFetchingZip] = useState(false);

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
      const response = await apiFetch('/api/auth/onboarding', {
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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', flexWrap: 'wrap' }}>
      
      {/* Left Side: Black Cover (Sticky on desktop) */}
      <div style={{ flex: '1 1 400px', backgroundColor: '#000', color: '#fff', padding: '4rem 5%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '50vh', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.05em' }}>
          Latento.
        </div>
        
        <div style={{ margin: 'auto 0' }}>
          <h1 style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '1.5rem', color: '#fff' }}>
            Prepara tu <br/> consultorio.
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#a3a3a3', maxWidth: '400px', lineHeight: 1.6 }}>
            Completa tu información clínica. Estos datos se usarán exclusivamente para generar tus recetas médicas y membretes profesionales automáticamente.
          </p>
        </div>
        
        <div style={{ fontSize: '0.875rem', color: '#555' }}>
          Latento © 2026. Cumplimiento médico y cifrado de extremo a extremo.
        </div>
      </div>

      {/* Right Side: White Minimal Form */}
      <div style={{ flex: '2 1 600px', backgroundColor: '#fff', padding: '4rem 5%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.04em', marginBottom: '0.5rem', color: '#000' }}>
            Perfil Profesional
          </h2>
          <p style={{ color: '#555', marginBottom: '3rem', fontSize: '1.125rem' }}>
            Tu identidad médica oficial.
          </p>

          <form onSubmit={handleSubmit}>
            {/* DATOS ACADÉMICOS Y LEGALES */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#000', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
              Académico y Legal
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label htmlFor="specialty" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Especialidad</label>
                <input
                  type="text"
                  id="specialty"
                  list={formData.specialty.length >= 2 ? "specialties-list" : undefined}
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="Ej. Pediatría"
                  value={formData.specialty}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  required
                />
                <datalist id="specialties-list">
                  {COMMON_SPECIALTIES.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div>
                <label htmlFor="university" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Universidad de Egreso</label>
                <input
                  type="text"
                  id="university"
                  list={formData.university.length >= 2 ? "universities-list" : undefined}
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="Universidad..."
                  value={formData.university}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  required
                />
                <datalist id="universities-list">
                  {COMMON_UNIVERSITIES.map(u => <option key={u} value={u} />)}
                </datalist>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div>
                <label htmlFor="licenseNumber" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Cédula Profesional</label>
                <input
                  type="text"
                  id="licenseNumber"
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="Ej. 1234567"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  required
                />
              </div>

              <div>
                <label htmlFor="specialtyLicense" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Cédula de Especialidad</label>
                <input
                  type="text"
                  id="specialtyLicense"
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="Si aplica"
                  value={formData.specialtyLicense}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                />
              </div>
            </div>

            {/* UBICACIÓN Y CONTACTO */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#000', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
              Contacto del Consultorio
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label htmlFor="clinicName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Nombre de Clínica / Consultorio</label>
                <input
                  type="text"
                  id="clinicName"
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="Ej. Clínica San Miguel"
                  value={formData.clinicName}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  required
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Teléfono</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="(55) 1234 5678"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label htmlFor="zipCode" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: isFetchingZip ? '#000' : '#000', marginBottom: '0.5rem' }}>C.P. {isFetchingZip && '(Buscando...)'}</label>
                <input
                  type="text"
                  id="zipCode"
                  maxLength="5"
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="Ej. 11000"
                  value={formData.zipCode}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="state" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Estado</label>
                <input
                  type="text"
                  id="state"
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="Estado"
                  value={formData.state}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label htmlFor="city" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Ciudad / Municipio</label>
                <input
                  type="text"
                  id="city"
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="Ciudad o Alcaldía"
                  value={formData.city}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  required
                />
              </div>

              <div>
                <label htmlFor="neighborhood" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Colonia</label>
                {availableColonias.length > 0 ? (
                  <select
                    id="neighborhood"
                    style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s', appearance: 'none', cursor: 'pointer' }}
                    value={formData.neighborhood}
                    onChange={handleChange}
                    onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                    onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
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
                    style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                    placeholder="Ej. Polanco"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                    onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                    required
                  />
                )}
              </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <label htmlFor="street" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Calle y Número</label>
              <input
                type="text"
                id="street"
                style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                placeholder="Ej. Av. Reforma 123, Int 4"
                value={formData.street}
                onChange={handleChange}
                onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                required
              />
            </div>

            {/* LOGO */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#000', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
              Membrete de Receta
            </h3>

            <div style={{ marginBottom: '3rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '1rem' }}>Logo de la Institución</label>
              <div 
                style={{
                  border: '2px dashed #e5e5e5',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#fafafa',
                  transition: 'border-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#000'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e5e5'}
                onClick={() => fileInputRef.current.click()}
              >
                {logoPreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={logoPreview} alt="Logo" style={{ maxHeight: '100px', objectFit: 'contain', marginBottom: '1rem' }} />
                    <span style={{ fontSize: '0.875rem', color: '#000', fontWeight: 600, borderBottom: '1px solid #000' }}>Cambiar imagen</span>
                  </div>
                ) : (
                  <>
                    <Upload size={24} color="#000" style={{ marginBottom: '1rem' }} />
                    <span style={{ fontSize: '1rem', color: '#000', fontWeight: 500 }}>Subir logo para tus recetas</span>
                    <span style={{ fontSize: '0.875rem', color: '#888', marginTop: '0.5rem' }}>Formatos soportados: JPG, PNG</span>
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

            <button 
              type="submit" 
              disabled={isLoading}
              style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '1.25rem', fontSize: '1.125rem', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', transition: 'opacity 0.2s' }} 
              onMouseOver={e=>e.target.style.opacity=0.8} 
              onMouseOut={e=>e.target.style.opacity=1}
            >
              {isLoading ? 'Guardando perfil...' : 'Guardar y Continuar'}
              {!isLoading && <CheckCircle size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Onboarding;
