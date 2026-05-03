import React from 'react';
import { Printer, Download, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrescriptionView = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <ArrowLeft size={18} /> Volver al Inicio
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--border)' }}>
            <Download size={18} /> Descargar PDF
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }} onClick={() => window.print()}>
            <Printer size={18} /> Imprimir
          </button>
        </div>
      </div>

      {/* DOCUMENTO RECETA MÉDICA (Formato A4 aprox) */}
      <div className="dashboard-panel" style={{ background: 'white', minHeight: '842px', padding: '3rem', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Header Doctor */}
        <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>Dr. Alejandro Médico</h1>
            <p style={{ color: 'var(--text-dark)', fontWeight: 600 }}>Cardiología Clínica</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Universidad Nacional Autónoma de México<br/>
              Céd. Prof. 12345678 | Céd. Esp. 87654321
            </p>
          </div>
          <div style={{ width: '100px', height: '100px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center' }}>
            [Logo Clínica]
          </div>
        </div>

        {/* Datos Paciente */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', marginBottom: '2rem', background: 'var(--input-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
          <div><strong>Paciente:</strong> María López Gómez</div>
          <div><strong>Fecha:</strong> 3 de Mayo de 2026</div>
          <div><strong>Edad:</strong> 34 años</div>
          <div><strong>Alergias:</strong> Penicilina, Sulfa</div>
          <div><strong>Peso:</strong> 65 kg</div>
          <div><strong>Talla:</strong> 1.62 m</div>
          <div><strong>TA:</strong> 120/80 mmHg</div>
          <div><strong>Temp:</strong> 36.5 °C</div>
        </div>

        {/* Medicamentos */}
        <div style={{ minHeight: '300px' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Rx</span>
          </h2>

          <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <li style={{ paddingLeft: '0.5rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Paracetamol 500mg Tabletas</div>
              <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Tomar 1 tableta vía oral cada 8 horas por 5 días en caso de fiebre o dolor.</div>
            </li>
            <li style={{ paddingLeft: '0.5rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Loratadina 10mg Tabletas</div>
              <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Tomar 1 tableta vía oral cada 24 horas por 7 días.</div>
            </li>
          </ol>
        </div>

        {/* Footer Firmas */}
        <div style={{ position: 'absolute', bottom: '3rem', left: '3rem', right: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Av. Insurgentes Sur 1234, Col. Del Valle<br/>
            Benito Juárez, CDMX, C.P. 03100<br/>
            Tel: (55) 1234-5678
          </div>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ borderBottom: '1px solid var(--text-dark)', height: '40px', marginBottom: '0.5rem' }}></div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Firma del Médico</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrescriptionView;
