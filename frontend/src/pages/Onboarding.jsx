import React, { useState, useRef } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  GraduationCap, 
  Award, 
  FileCheck, 
  Upload, 
  Image as ImageIcon,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reutilizamos el estilo estéril y limpio

const Onboarding = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const [formData, setFormData] = useState({
    specialty: '',
    licenseNumber: '',
    specialtyLicense: '',
    university: '',
    clinicName: '',
    clinicAddress: '',
    phoneNumber: '',
    logoBase64: '' // Aquí guardaremos la imagen en base64
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Manejar la carga y conversión a Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("El logo no debe superar los 2MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setLogoPreview(base64String);
        setFormData({ ...formData, logoBase64: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simular el guardado de datos en el backend (donde se subirá el base64 a Prisma/Supabase)
    setTimeout(() => {
      setIsLoading(false);
      console.log('Datos de onboarding enviados:', formData);
      alert('¡Perfil configurado con éxito!');
      // navigate('/dashboard'); // Redirigiríamos al panel de control
    }, 2000);
  };

  return (
    <div className="login-container" style={{ alignItems: 'flex-start', paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div className="login-content animate-fade-in" style={{ maxWidth: '600px' }}>
        
        <div className="logo-container" style={{ marginBottom: '1.5rem' }}>
          <Activity size={32} strokeWidth={2.5} className="logo-icon" />
          <h1 className="logo-text">Atento</h1>
        </div>

        <div className="clean-panel login-card" style={{ padding: '2rem' }}>
          <div className="login-header" style={{ marginBottom: '1.5rem' }}>
            <h2>Configuración del Consultorio</h2>
            <p>Comencemos configurando los datos legales y estéticos para tus recetas médicas.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* SECCIÓN: DATOS PROFESIONALES */}
            <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Datos Profesionales (Obligatorios para la receta)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="specialty">Especialidad Principal</label>
                <div className="input-wrapper">
                  <Award size={18} className="input-icon" />
                  <input
                    type="text"
                    id="specialty"
                    className="form-input"
                    placeholder="Ej. Pediatra, Medicina General"
                    value={formData.specialty}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="university">Universidad de Egreso</label>
                <div className="input-wrapper">
                  <GraduationCap size={18} className="input-icon" />
                  <input
                    type="text"
                    id="university"
                    className="form-input"
                    placeholder="Ej. UNAM, UBA..."
                    value={formData.university}
                    onChange={handleChange}
                    required
                  />
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
                    placeholder="Obligatoria"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="specialtyLicense">Cédula de Especialidad (Opcional)</label>
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

            {/* SECCIÓN: CONSULTORIO */}
            <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Datos del Consultorio o Clínica
            </h3>

            <div className="form-group">
              <label htmlFor="clinicName">Nombre de la Clínica o Consultorio</label>
              <div className="input-wrapper">
                <Building2 size={18} className="input-icon" />
                <input
                  type="text"
                  id="clinicName"
                  className="form-input"
                  placeholder="Ej. Centro Médico San José"
                  value={formData.clinicName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="clinicAddress">Dirección Completa</label>
              <div className="input-wrapper">
                <MapPin size={18} className="input-icon" />
                <input
                  type="text"
                  id="clinicAddress"
                  className="form-input"
                  placeholder="Calle, Número, Ciudad, Estado, CP"
                  value={formData.clinicAddress}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Teléfono de Contacto</label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input
                  type="text"
                  id="phoneNumber"
                  className="form-input"
                  placeholder="Teléfono para pacientes/farmacias"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* SECCIÓN: LOGO (Base64) */}
            <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Personalización de Receta
            </h3>

            <div className="form-group">
              <label>Logo de la Clínica (Opcional)</label>
              <div 
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--input-bg)',
                  transition: 'border-color 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => fileInputRef.current.click()}
              >
                {logoPreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={logoPreview} alt="Logo de clínica" style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain', marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 500 }}>Cambiar imagen</span>
                  </div>
                ) : (
                  <>
                    <Upload size={24} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-dark)', fontWeight: 500 }}>Haz clic para subir un logo</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>PNG, JPG o SVG (Máx. 2MB)</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/png, image/jpeg, image/svg+xml"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '2rem' }}>
              {isLoading ? 'Guardando perfil...' : 'Finalizar Configuración'}
              {!isLoading && <CheckCircle size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
