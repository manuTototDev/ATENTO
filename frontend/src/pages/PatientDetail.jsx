import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Stethoscope, Phone, Mail, Droplet, AlertTriangle, Activity, Pill,
  FileText, AlertCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import './PatientDetail.css';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const formatLongDate = (d) => {
  const date = new Date(d);
  return `${date.getUTCDate().toString().padStart(2, '0')} de ${MONTHS[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
};

const calculateAge = (dobString) => {
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday = now.getUTCMonth() < dob.getUTCMonth() ||
    (now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
};

const GENDER_LABELS = { M: 'Masculino', F: 'Femenino', O: 'Otro', Otro: 'Otro' };

const RecordChips = ({ items, emptyLabel, tone }) => {
  if (!items || items.length === 0) {
    return <span className="record-empty">{emptyLabel}</span>;
  }
  return (
    <div className="record-chips">
      {items.map((item, i) => (
        <span key={i} className={`record-chip record-chip-${tone}`}>{item}</span>
      ))}
    </div>
  );
};

const PatientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchPatient = async () => {
      try {
        const res = await apiFetch(`/api/patients/${id}`);
        if (!res.ok) throw new Error(res.status === 403 ? 'No tienes acceso a este expediente.' : 'No se encontró al paciente.');
        const data = await res.json();
        if (!cancelled) setPatient(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPatient();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="patient-detail-page">
        <div className="skeleton" style={{ width: 160, height: 16, marginBottom: 'var(--space-5)' }} />
        <div className="skeleton" style={{ width: '40%', height: 32, marginBottom: 'var(--space-6)' }} />
        <div className="patient-detail-grid">
          <div className="dashboard-panel" style={{ height: 260 }}><div className="skeleton" style={{ width: '100%', height: '100%' }} /></div>
          <div className="dashboard-panel" style={{ height: 260 }}><div className="skeleton" style={{ width: '100%', height: '100%' }} /></div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="patient-detail-page">
        <button className="btn-ghost" onClick={() => navigate('/pacientes')} style={{ marginBottom: 'var(--space-5)' }}>
          <ArrowLeft size={18} /> Volver al Directorio
        </button>
        <div className="dashboard-panel empty-state">
          <AlertCircle size={32} />
          <p style={{ fontWeight: 500, color: 'var(--text-dark)' }}>{error || 'Paciente no encontrado.'}</p>
        </div>
      </div>
    );
  }

  const age = calculateAge(patient.dateOfBirth);
  const fullName = `${patient.firstName} ${patient.lastName}`;
  const consultations = patient.consultations || [];

  return (
    <div className="patient-detail-page">
      <button className="btn-ghost" onClick={() => navigate('/pacientes')} style={{ marginBottom: 'var(--space-4)' }}>
        <ArrowLeft size={18} /> Volver al Directorio
      </button>

      <div className="patient-detail-header">
        <div className="patient-detail-avatar">
          {fullName.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
        </div>
        <div>
          <h1 className="font-display patient-detail-name">{fullName}</h1>
          <p className="patient-detail-sub">
            {age !== null ? `${age} años` : 'Edad no disponible'} · {GENDER_LABELS[patient.gender] || patient.gender || 'Sexo no registrado'}
          </p>
        </div>
        <motion.button
          className="patient-detail-cta"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(`/consultation/${id}`)}
        >
          <Stethoscope size={18} /> Iniciar Consulta
        </motion.button>
      </div>

      <div className="patient-detail-grid">
        <motion.div className="patient-detail-col" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <div className="dashboard-panel">
            <h2 className="panel-title" style={{ marginBottom: 'var(--space-4)' }}>Datos de contacto</h2>
            <div className="detail-fact-list">
              <div className="detail-fact"><Phone size={16} /> {patient.phone || 'Sin teléfono registrado'}</div>
              <div className="detail-fact"><Mail size={16} /> {patient.email || 'Sin correo registrado'}</div>
              <div className="detail-fact">Nacimiento: {formatLongDate(patient.dateOfBirth)}</div>
            </div>
          </div>

          <div className="dashboard-panel" style={{ marginTop: 'var(--space-5)' }}>
            <h2 className="panel-title" style={{ marginBottom: 'var(--space-4)' }}>Expediente clínico</h2>
            <div className="record-section">
              <span className="record-label"><Droplet size={14} className="pop-red" /> Tipo de sangre</span>
              <span className="record-blood">{patient.bloodType || 'N/A'}</span>
            </div>
            <div className="record-section">
              <span className="record-label"><AlertTriangle size={14} className="pop-gold" /> Alergias</span>
              <RecordChips items={patient.allergies} emptyLabel="Ninguna registrada" tone="allergy" />
            </div>
            <div className="record-section">
              <span className="record-label"><Activity size={14} className="pop-blue" /> Enfermedades crónicas</span>
              <RecordChips items={patient.chronicDiseases} emptyLabel="Ninguna registrada" tone="chronic" />
            </div>
            <div className="record-section">
              <span className="record-label"><Pill size={14} className="pop-violet" /> Tratamientos actuales</span>
              <RecordChips items={patient.currentTreatments} emptyLabel="Sin tratamientos activos" tone="treatment" />
            </div>
          </div>
        </motion.div>

        <motion.div className="dashboard-panel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
          <h2 className="panel-title" style={{ marginBottom: 'var(--space-4)' }}>
            <FileText size={20} className="pop-green" /> Historial de consultas
          </h2>
          {consultations.length === 0 ? (
            <div className="empty-state">
              <FileText size={32} />
              <p style={{ fontWeight: 500, color: 'var(--text-dark)' }}>Este paciente aún no tiene consultas registradas.</p>
              <p style={{ fontSize: '0.85rem' }}>Al iniciar una consulta, aparecerá aquí.</p>
            </div>
          ) : (
            <div className="consult-list">
              {consultations.map(consult => (
                <div key={consult.id} className="consult-card">
                  <div className="consult-card-head">
                    <strong>{formatLongDate(consult.createdAt)}</strong>
                    <div className="consult-card-tags">
                      {consult.icd10Code && <span className="consult-icd">{consult.icd10Code}</span>}
                      <span className="status-badge status-completed">Completada</span>
                    </div>
                  </div>
                  <p className="consult-line"><strong>Motivo:</strong> {consult.subjective || 'Sin registro detallado.'}</p>
                  <p className="consult-line consult-line-muted"><strong>Diagnóstico:</strong> {consult.assessment || 'Sin diagnóstico detallado.'}</p>
                  <div className="consult-card-foot">
                    <span>${Number(consult.cost || 0).toLocaleString('es-MX')} MXN</span>
                    {consult.hasVariableCost && <span className="status-badge status-scheduled">Tarifa variable</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PatientDetail;
