import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  GraduationCap, 
  Award, 
  FileCheck, 
  Upload, 
  Map,
  Search,
  User,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const Settings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isFetchingZip, setIsFetchingZip] = useState(false);
  const [availableColonias, setAvailableColonias] = useState([]);

  const userId = localStorage.getItem('userId');

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
              zipCode = parts[4] ? parts[4].replace('CP ', '') : '';
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

    if (userId) fetchProfile();
  }, [userId]);

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
    
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData })
      });

      if (res.ok) {
        alert('¡Perfil actualizado con éxito!');
        navigate('/dashboard');
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al actualizar el perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', fontFamily: 'Inter, system-ui, sans-serif', padding: '4rem 6rem', overflowY: 'auto' }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', color: '#555', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem', fontWeight: 600, width: 'max-content', padding: 0 }}
            onMouseOver={(e) => e.currentTarget.style.color = '#000'}
            onMouseOut={(e) => e.currentTarget.style.color = '#555'}
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </button>

          <h1 style={{ fontSize: '4rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: '#000', margin: 0 }}>
            Tus Ajustes.
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#555', maxWidth: '600px', lineHeight: 1.6, marginTop: '1.5rem' }}>
            Actualiza tu información profesional y de contacto. Esta información se usará para generar el membrete automático de tus recetas y expedientes.
          </p>
        </div>
      </div>

      {/* FORM SECTION */}
      <div style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#000', marginBottom: '2rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
              Académico y Legal
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <label htmlFor="fullName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Nombre Completo</label>
                <input
                  type="text"
                  id="fullName"
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="Ej. Dr. Juan Pérez"
                  value={formData.fullName}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label htmlFor="licenseNumber" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Cédula Profesional</label>
                  <input
                    type="text"
                    id="licenseNumber"
                    style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                    placeholder="Número de cédula"
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
                    placeholder="Opcional"
                    value={formData.specialtyLicense}
                    onChange={handleChange}
                    onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                    onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#000', marginBottom: '2rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
              Contacto y Consultorio
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label htmlFor="clinicName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Nombre del Consultorio</label>
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
                  <label htmlFor="phoneNumber" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Teléfono de Citas</label>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div>
                  <label htmlFor="zipCode" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Código Postal</label>
                  <div style={{ position: 'relative' }}>
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
                    {isFetchingZip && <div style={{ position: 'absolute', right: 0, top: '1rem', fontSize: '0.75rem', color: '#888' }}>Buscando...</div>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="state" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Estado</label>
                  <input
                    type="text"
                    id="state"
                    style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                    placeholder="Estado..."
                    value={formData.state}
                    onChange={handleChange}
                    onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                    onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label htmlFor="city" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Municipio / Ciudad</label>
                  <input
                    type="text"
                    id="city"
                    style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                    placeholder="Ej. Miguel Hidalgo"
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

              <div>
                <label htmlFor="street" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '0.5rem' }}>Calle y Número Ext / Int</label>
                <input
                  type="text"
                  id="street"
                  style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '2px solid #e5e5e5', backgroundColor: 'transparent', fontSize: '1.125rem', color: '#000', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="Ej. Av. Reforma 123, Consultorio 4B"
                  value={formData.street}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #000'}
                  onBlur={(e) => e.target.style.borderBottom = '2px solid #e5e5e5'}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#000', marginBottom: '2rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
              Membrete de Receta
            </h2>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', marginBottom: '1rem' }}>Logo de la Institución</label>
              <div 
                style={{
                  border: '2px dashed #e5e5e5',
                  padding: '3rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#000'; e.currentTarget.style.backgroundColor = '#f9f9f9'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                onClick={() => fileInputRef.current.click()}
              >
                {logoPreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={logoPreview} alt="Logo" style={{ maxHeight: '100px', objectFit: 'contain', marginBottom: '1rem' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#000', borderBottom: '1px solid #000', paddingBottom: '0.25rem' }}>Cambiar imagen</span>
                  </div>
                ) : (
                  <>
                    <Upload size={32} color="#000" style={{ marginBottom: '1rem' }} />
                    <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#000' }}>Sube el logo de tu clínica</span>
                    <span style={{ fontSize: '0.875rem', color: '#888', marginTop: '0.5rem' }}>PNG o JPG (Máx 2MB)</span>
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
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            style={{ 
              width: '100%', 
              padding: '1.5rem', 
              backgroundColor: isLoading ? '#555' : '#000', 
              color: '#fff', 
              fontSize: '1.125rem', 
              fontWeight: 700, 
              border: 'none', 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => { if(!isLoading) e.target.style.opacity = '0.8' }}
            onMouseOut={(e) => { if(!isLoading) e.target.style.opacity = '1' }}
          >
            {isLoading ? 'Actualizando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
