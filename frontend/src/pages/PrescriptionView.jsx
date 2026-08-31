import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import './PrescriptionView.css';

const PrescriptionView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { patient: statePatient, treatments, indications, soap } = location.state || {};
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [patient, setPatient] = useState(statePatient || null);

  const calculateAge = (dobString) => {
    if (!dobString) return '--';
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return '--';
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const profileRes = await apiFetch('/api/profile');
        if (!cancelled && profileRes.ok) {
          setDoctorProfile(await profileRes.json());
        }
      } catch (err) {
        console.error('Error fetching profile', err);
      }

      // Solo buscar al paciente si no llegó por location.state y el id es un registro real
      if (!statePatient && id && id !== 'new') {
        try {
          const patientRes = await apiFetch(`/api/patients/${id}`);
          if (!cancelled && patientRes.ok) {
            setPatient(await patientRes.json());
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const goBack = () => {
    if (patient?.id) navigate(`/pacientes/${patient.id}`);
    else navigate('/hoy');
  };

  const patientName = patient ? `${patient.firstName || patient.name || ''} ${patient.lastName || ''}`.trim() : 'Cargando...';

  return (
    <div className="rx-page">
      {/* HEADER / ACCIONES (No se imprime) */}
      <div className="no-print rx-topbar">
        <button className="btn-ghost" onClick={goBack}>
          <ArrowLeft size={18} /> Volver
        </button>
        <div className="rx-actions">
          <button className="btn-secondary" onClick={() => window.print()}>
            <Download size={18} /> Descargar PDF
          </button>
          <button className="btn-primary" onClick={() => window.print()}>
            <Printer size={18} /> Imprimir
          </button>
        </div>
      </div>

      <div className="rx-wrap">
        <motion.div
          className="rx-preview-head no-print"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <span className="rx-preview-eyebrow">Receta generada</span>
          <span className="rx-preview-status">{patientName}</span>
        </motion.div>

        <motion.div
          className="rx-doc-shell"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* DOCUMENTO RECETA MÉDICA — se mantiene neutro en pantalla e impresión */}
          <div className="printable-prescription">

            {/* Membrete del médico */}
            <div className="rx-header">
              <div>
                <h1 className="rx-doctor-name">
                  Dr. {doctorProfile?.firstName || ''} {doctorProfile?.lastName || ''}
                </h1>
                <p className="rx-doctor-specialty">
                  {doctorProfile?.profile?.specialty?.name || ''}
                </p>
                <div className="rx-doctor-meta">
                  {doctorProfile?.profile?.university?.name || ''}
                  {doctorProfile?.profile?.university?.name && <br />}
                  {doctorProfile?.profile?.licenseNumber
                    ? <>Céd. Prof. {doctorProfile.profile.licenseNumber}</>
                    : <span className="rx-license-warning">⚠ Falta cédula profesional — completa tu perfil antes de imprimir</span>}
                  {doctorProfile?.profile?.specialtyLicense ? ` | Céd. Esp. ${doctorProfile.profile.specialtyLicense}` : ''}
                </div>
              </div>
              <div className="rx-logo-box">
                {doctorProfile?.profile?.logoUrl ? (
                  <img src={doctorProfile.profile.logoUrl} alt="Logo de la clínica" />
                ) : 'Logo'}
              </div>
            </div>

            {/* Datos del paciente */}
            <div className="rx-meta-grid">
              <div className="rx-meta-cell">
                <strong className="rx-meta-label">Paciente</strong>
                <div className="rx-meta-value">{patientName}</div>
              </div>
              <div className="rx-meta-cell">
                <strong className="rx-meta-label">Fecha</strong>
                <div className="rx-meta-value">{new Date().toLocaleDateString('es-MX')}</div>
              </div>
              <div className="rx-meta-cell">
                <strong className="rx-meta-label">Fecha de nacimiento</strong>
                <div className="rx-meta-value">
                  {patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('es-MX', { timeZone: 'UTC' }) : (patient?.dob || '--')}
                </div>
              </div>
              <div className="rx-meta-cell">
                <strong className="rx-meta-label">Edad</strong>
                <div className="rx-meta-value">
                  {patient?.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} años` : (patient?.dob ? `${calculateAge(patient.dob.split('/').reverse().join('-'))} años` : '--')}
                </div>
              </div>
              <div className="rx-meta-cell span-2">
                <strong className="rx-meta-label">Diagnóstico{soap?.icd10Code ? ` (CIE-10: ${soap.icd10Code})` : ''}</strong>
                <div className="rx-meta-value">{soap?.assessment || 'No especificado'}</div>
              </div>
            </div>

            {/* Medicamentos */}
            <div className="rx-body-block">
              <h2 className="rx-symbol">Rx.</h2>
              <div className="rx-med-list">
                {treatments && treatments.length > 0 ? treatments.map((t, i) => (
                  <div key={i} className="rx-med-item">
                    <div className="rx-med-name">{t.medication}</div>
                    <div className="rx-med-detail">
                      Tomar <strong>{t.dose}</strong> cada <strong>{t.frequencyNumber} {t.frequencyUnit}</strong> por <strong>{t.durationNumber} {t.durationUnit}</strong>.
                    </div>
                  </div>
                )) : (
                  <div className="rx-empty">Sin prescripción farmacológica.</div>
                )}
              </div>
            </div>

            {/* Indicaciones generales */}
            {indications && indications.length > 0 && (
              <div>
                <h2 className="rx-indications-title">Indicaciones generales</h2>
                <ul className="rx-indications-list">
                  {indications.map((ind, i) => (
                    <li key={i}>
                      <strong>[{ind.type}]</strong> {ind.instruction}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Firma y datos de la clínica */}
            <div className="rx-footer">
              <div className="rx-clinic">
                <strong>{doctorProfile?.profile?.clinicName || 'Clínica / consultorio'}</strong><br />
                {doctorProfile?.profile?.clinicAddress || 'Dirección no registrada'}<br />
                Tel: {doctorProfile?.profile?.phoneNumber || 'No registrado'}
              </div>
              <div className="rx-signature">
                <div className="rx-signature-line" />
                <div className="rx-signature-label">Firma del médico</div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrescriptionView;
