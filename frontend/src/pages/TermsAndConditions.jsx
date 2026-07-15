import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Brain, Lock, UserCheck, AlertTriangle, Globe, Mail, FileText, Scale } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <div style={{ marginBottom: '3rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '3rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
      <div style={{ width: '40px', height: '40px', backgroundColor: '#000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color="#fff" />
      </div>
      <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#000', margin: 0, letterSpacing: '-0.02em' }}>{title}</h2>
    </div>
    <div style={{ paddingLeft: '0', color: '#333', lineHeight: 1.8, fontSize: '1rem' }}>
      {children}
    </div>
  </div>
);

const Bullet = ({ children }) => (
  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
    <div style={{ width: '6px', height: '6px', backgroundColor: '#000', borderRadius: '50%', flexShrink: 0, marginTop: '0.6rem' }} />
    <span>{children}</span>
  </div>
);

const Clause = ({ n, title, children }) => (
  <div style={{ marginBottom: '1.75rem' }}>
    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#000', marginBottom: '0.6rem' }}>{n}. {title}</h3>
    <div style={{ color: '#333', lineHeight: 1.8, fontSize: '0.98rem' }}>{children}</div>
  </div>
);

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('terms');

  const tabStyle = (tab) => ({
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
    color: activeTab === tab ? '#000' : '#888',
    borderBottom: activeTab === tab ? '2px solid #000' : '2px solid transparent',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#000', color: '#fff', padding: '2rem 5%' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: '1px solid #444', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', transition: 'border-color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#fff'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#444'}
            >
              <ArrowLeft size={16} /> Volver
            </button>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.05em', cursor: 'pointer' }} onClick={() => navigate('/')}>Lemmatica.</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.04em', marginBottom: '0.75rem', lineHeight: 1.1 }}>
            Términos, Privacidad<br />y Uso de Datos
          </h1>
          <p style={{ color: '#a3a3a3', fontSize: '1rem', marginBottom: '0.5rem' }}>
            Última actualización: 14 de julio de 2026 · Versión 2.0
          </p>
          <p style={{ color: '#a3a3a3', fontSize: '0.875rem' }}>
            Plataforma operada por <strong style={{ color: '#fff' }}>Lemma Sistemas Inteligentes S.A. de C.V.</strong> bajo la marca <strong style={{ color: '#fff' }}>Lemmatica</strong> — Estados Unidos Mexicanos.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e5e5', backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 5%', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button style={tabStyle('terms')} onClick={() => setActiveTab('terms')}>Términos de Uso</button>
          <button style={tabStyle('privacy')} onClick={() => setActiveTab('privacy')}>Privacidad y Datos</button>
          <button style={tabStyle('ai')} onClick={() => setActiveTab('ai')}>Política de IA</button>
          <button style={tabStyle('legal')} onClick={() => setActiveTab('legal')}>Infraestructura y Legal</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 5%' }}>

        {/* ═══ TERMS OF USE — Módulo 1: Veracidad, Entrada de Datos e Identidad Profesional ═══ */}
        {activeTab === 'terms' && (
          <>
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '3rem', display: 'flex', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, color: '#78350f', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <strong>Aviso Importante:</strong> Lemmatica es una <strong>herramienta de apoyo administrativo y de documentación clínica</strong>. No constituye un dispositivo médico, no sustituye el juicio clínico del profesional de la salud, ni debe usarse como única fuente para diagnósticos o decisiones terapéuticas. El médico usuario es el único responsable de la atención prestada a sus pacientes.
              </p>
            </div>

            <p style={{ color: '#555', lineHeight: 1.8, marginBottom: '2.5rem', fontSize: '0.95rem' }}>
              El presente instrumento constituye un contrato de adhesión que regula el acceso y uso de la plataforma tecnológica Lemmatica, propiedad y operada por <strong>Lemma Sistemas Inteligentes S.A. de C.V.</strong> Al crear una cuenta, registrar una cédula profesional o hacer uso de cualquier funcionalidad de la plataforma, el usuario manifiesta su consentimiento expreso, libre e informado para quedar obligado en todos sus términos.
            </p>

            <Section icon={UserCheck} title="Módulo 1 · Veracidad, Entrada de Datos e Identidad Profesional">
              <Clause n="1" title="Garantía de Identidad y Cédula Profesional">
                <p style={{ marginBottom: '0.75rem' }}>El usuario declara, bajo protesta de decir verdad, que es un profesional de la salud legalmente facultado para ejercer la medicina en México, y que cuenta con cédula profesional vigente expedida por la Dirección General de Profesiones (SEP), libre de suspensión o cancelación.</p>
                <p>Se obliga a mantenerla actualizada y a notificar a Lemmatica dentro de 48 horas cualquier cambio en su situación profesional. Lemmatica podrá verificar la autenticidad de la cédula ante el Registro Nacional de Profesionistas y suspender de inmediato cualquier cuenta cuya cédula resulte apócrifa, inexistente o cancelada, sin perjuicio de las acciones legales que correspondan.</p>
              </Clause>
              <Clause n="2" title="Obligación de Veracidad del Usuario">
                <p>El médico es el único y exclusivo responsable de la veracidad, exactitud, vigencia y licitud de todos los datos clínicos, personales o administrativos que introduzca en la plataforma, con independencia de que dicha información haya sido procesada o estructurada por herramientas de inteligencia artificial. Lemmatica no tiene obligación de verificar de forma independiente la exactitud clínica de la información capturada.</p>
              </Clause>
              <Clause n="3" title="Exclusión de Responsabilidad por Datos de Entrada">
                <p>Lemma Sistemas Inteligentes no será responsable por diagnósticos erróneos, omisiones o problemas legales derivados de información falsa, incompleta o inexacta capturada por el usuario. El usuario se obliga a indemnizar y sacar en paz y a salvo a la empresa frente a reclamaciones de terceros derivadas de dicha información, en los términos de la cláusula 10.</p>
              </Clause>
              <Clause n="4" title="Exclusividad y Custodia de Credenciales">
                <p>El usuario es el único custodio de sus contraseñas y accesos. Todo uso del software realizado con sus credenciales se presumirá hecho por él mismo, deslindando a Lemmatica de accesos no autorizados por descuido del usuario. El usuario debe notificar cualquier compromiso de sus credenciales dentro de 24 horas.</p>
              </Clause>
            </Section>

            <Section icon={FileText} title="Módulo 5 · Vigencia, Cancelación y Propiedad Intelectual">
              <Clause n="21" title="Vigencia y Cancelación de la Suscripción">
                <p>Las suscripciones son mensuales o anuales recurrentes. El usuario puede cancelar en cualquier momento; el servicio termina al finalizar el periodo ya pagado, sin reembolso de cantidades no consumidas salvo disposición legal en contrario.</p>
              </Clause>
              <Clause n="22" title="Periodo de Gracia para Recuperación de Datos">
                <p>En caso de cancelación o falta de pago, Lemmatica otorgará un plazo de <strong>30 días naturales</strong> para exportar y descargar los expedientes clínicos antes de proceder al borrado definitivo y seguro de la información, conforme a la obligación de supresión de datos personales prevista en la LFPDPPP.</p>
              </Clause>
              <Clause n="23" title="Modificaciones a los Términos">
                <p>Lemmatica notificará los cambios a estos Términos mediante avisos en la aplicación o correo electrónico, con al menos 15 días naturales de anticipación en modificaciones sustanciales. El uso continuado del sistema tras dicha notificación constituye la aceptación tácita de los nuevos términos.</p>
              </Clause>
              <Clause n="24" title="Propiedad Intelectual">
                <p>Todo el software, algoritmos, modelos de IA, logotipos, diseños de interfaz UI/UX y marcas pertenecen de forma exclusiva a <strong>Lemma Sistemas Inteligentes S.A. de C.V.</strong> Este contrato solo otorga al usuario una licencia de uso limitada, personal, no exclusiva e intransferible, sin ceder derecho de propiedad intelectual alguno. La información clínica del paciente es independiente de esta titularidad y corresponde al médico y al paciente.</p>
              </Clause>
              <Clause n="25" title="Jurisdicción y Legislación Mexicana">
                <p>Este contrato se rige por las leyes federales de los Estados Unidos Mexicanos. Ambas partes se someten a la competencia de los tribunales de Toluca, Estado de México, o de la Ciudad de México, a elección de la parte actora, renunciando a cualquier otro fuero por domicilio presente o futuro.</p>
              </Clause>
            </Section>
          </>
        )}

        {/* ═══ PRIVACY & DATA — Módulo 3 ═══ */}
        {activeTab === 'privacy' && (
          <>
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '3rem', display: 'flex', gap: '0.75rem' }}>
              <Shield size={20} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, color: '#14532d', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <strong>Compromiso de Privacidad:</strong> Lemmatica fue diseñado desde cero con un enfoque de <em>Privacy by Design</em>. Los datos de tus pacientes son tuyos y nunca se venden, comparten ni utilizan para entrenar modelos de IA sin tu consentimiento explícito.
              </p>
            </div>

            <Section icon={Database} title="1. Datos que Recopilamos">
              <p style={{ marginBottom: '1rem', fontWeight: 600 }}>A) Datos del Médico (Titular de la Cuenta):</p>
              <Bullet>Información de identificación: nombre, apellido, correo electrónico, contraseña (hashed con bcrypt).</Bullet>
              <Bullet>Información profesional: especialidad, cédula profesional, cédula de especialidad, universidad de egreso.</Bullet>
              <Bullet>Información del consultorio: nombre, dirección completa, teléfono, logotipo.</Bullet>
              <Bullet>Datos de uso: registros de acceso (IP, timestamp), eventos de la plataforma para fines de seguridad y mejora del servicio.</Bullet>

              <p style={{ marginBottom: '1rem', marginTop: '1.5rem', fontWeight: 600 }}>B) Datos de Pacientes (Tratados por el Médico):</p>
              <Bullet>Información demográfica: nombre, fecha de nacimiento, sexo, CURP (opcional), contacto de emergencia.</Bullet>
              <Bullet>Historial clínico: notas SOAP, diagnósticos, medicamentos prescritos, alergias, antecedentes.</Bullet>
              <Bullet>Audio de consultas: grabaciones temporales procesadas para transcripción (no se almacenan permanentemente en servidores de Lemmatica sin configuración explícita del usuario).</Bullet>
              <Bullet>Documentos generados: recetas médicas en PDF y expedientes exportados.</Bullet>

              <p style={{ marginBottom: '1rem', marginTop: '1.5rem', fontWeight: 600 }}>C) Datos Técnicos:</p>
              <Bullet>Dirección IP, tipo de navegador, sistema operativo, identificadores de sesión.</Bullet>
              <Bullet>Métricas de rendimiento de la plataforma (anonimizadas).</Bullet>
            </Section>

            <Section icon={UserCheck} title="Cláusula 11 · Consentimiento del Paciente para Grabación">
              <p>El médico asume la responsabilidad legal total de informar a su paciente y obtener su consentimiento expreso —verbal o por escrito— antes de activar la función de escucha/transcripción de audio durante la consulta, en cumplimiento de la LFPDPPP y del derecho a la privacidad. Lemmatica puede ofrecer plantillas orientativas, pero la obtención y documentación del consentimiento es responsabilidad exclusiva del médico, quien debe conservar evidencia del mismo.</p>
            </Section>

            <Section icon={Lock} title="Cláusula 12 · Cumplimiento de la LFPDPPP y Seguridad">
              <p style={{ marginBottom: '1rem' }}>Lemmatica procesa los Datos Personales Sensibles de salud bajo los estándares más estrictos de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento, autoridad hoy a cargo de la Secretaría Anticorrupción y Buen Gobierno tras la reforma de marzo de 2025.</p>
              <Bullet><strong>Cifrado en tránsito:</strong> Toda comunicación entre el cliente y los servidores utiliza TLS 1.3.</Bullet>
              <Bullet><strong>Cifrado en reposo:</strong> Las bases de datos operativas están cifradas con AES-256. Las contraseñas se almacenan exclusivamente como hashes bcrypt (factor de costo ≥ 12).</Bullet>
              <Bullet><strong>Segregación de datos:</strong> Los datos de cada médico están lógicamente aislados; ningún usuario puede acceder a los datos de otro.</Bullet>
              <Bullet><strong>Infraestructura:</strong> Servidores de producción alojados en centros de datos con certificación SOC 2 Tipo II.</Bullet>
              <Bullet><strong>Backups:</strong> Respaldos cifrados incrementales cada 24 horas, con retención de 30 días.</Bullet>
              <Bullet><strong>Control de acceso:</strong> El personal de Lemmatica con acceso a datos de producción es mínimo, auditado y de solo lectura restringido por necesidad operativa.</Bullet>
            </Section>

            <Section icon={Scale} title="Cláusula 13 · Calidad de Encargado de Tratamiento">
              <p>Respecto de los datos de los pacientes, el médico o la clínica actúa como <strong>"Responsable"</strong> del tratamiento en términos de la LFPDPPP, mientras que Lemma Sistemas Inteligentes actúa únicamente como <strong>"Encargado"</strong>, operando los datos bajo las instrucciones exclusivas del médico, sin utilizarlos para fines distintos a los aquí pactados, y suprimiéndolos o devolviéndolos al concluir la relación contractual conforme al periodo de gracia de 30 días.</p>
            </Section>

            <Section icon={Globe} title="Cláusula 14 · Cumplimiento de la NOM-024-SSA3-2012">
              <p>La plataforma proporciona herramientas técnicas orientadas al cumplimiento de la Norma Oficial Mexicana NOM-024-SSA3-2012 (sistemas de registro electrónico para la salud) y su concordancia con la NOM-004-SSA3-2012 (expediente clínico). El uso correcto de dichas herramientas y el apego a los flujos obligatorios de dichas normas, incluida la conservación del expediente por el plazo mínimo legal, corresponden al médico.</p>
            </Section>

            <Section icon={Brain} title="Cláusula 15 · Datos Anonimizados para Optimización de la IA">
              <p>El usuario autoriza a Lemmatica a utilizar meta-datos y textos clínicos estrictamente disociados y anonimizados (sin nombres, CURP, RFC ni identificadores de pacientes) con el único fin de entrenar y calibrar la precisión local de los algoritmos de IA. Este proceso es irreversible, no se comparte ni comercializa con terceros, y el usuario puede oponerse a este uso desde la configuración de su cuenta sin afectar el resto de las funcionalidades.</p>
            </Section>

            <Section icon={UserCheck} title="Tus Derechos ARCO">
              <p style={{ marginBottom: '1rem' }}>Como titular de datos personales, tienes los siguientes derechos ejercibles ante Lemmatica: Acceso, Rectificación, Cancelación y Oposición (ARCO).</p>
              <p>Para ejercerlos, envía un correo a <strong>privacidad@lemmatica.com.mx</strong> con identificación oficial. Responderemos en un plazo máximo de 20 días hábiles.</p>
            </Section>

            <Section icon={Globe} title="Transferencia Internacional de Datos">
              <p>En caso de que datos sean transferidos a proveedores de infraestructura fuera de México (p. ej. cómputo en la nube), Lemmatica garantiza que dichos proveedores cumplen con estándares equivalentes de protección mediante cláusulas contractuales estándar. Nunca vendemos datos personales a terceros.</p>
            </Section>
          </>
        )}

        {/* ═══ AI POLICY — Módulo 2: Deslinde de Criterio Clínico y Errores de la IA ═══ */}
        {activeTab === 'ai' && (
          <>
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '3rem', display: 'flex', gap: '0.75rem' }}>
              <Brain size={20} color="#0369a1" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, color: '#0c4a6e', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <strong>Principio Fundamental:</strong> La IA de Lemmatica es una <strong>herramienta de apoyo</strong> al médico, no un sustituto. Toda nota, receta o diagnóstico generado por IA <strong>debe ser revisado, validado y aprobado</strong> por el profesional de la salud antes de su uso clínico o legal.
              </p>
            </div>

            <Section icon={Brain} title="Cómo Funciona Nuestra IA">
              <p style={{ marginBottom: '1rem' }}>Lemmatica utiliza modelos de lenguaje de gran escala (LLMs) de terceros (actualmente Google Gemini API) para transcribir y estructurar el audio de consultas médicas, generar borradores de recetas y sugerir resúmenes de historial clínico. Los modelos de IA no tienen acceso permanente a tus datos; cada consulta a la API es independiente y se transmite cifrada.</p>
            </Section>

            <Section icon={UserCheck} title="Cláusula 5 · Naturaleza del Software (Herramienta de Apoyo)">
              <p>Lemmatica es explícitamente un asistente tecnológico de transcripción y optimización administrativa; bajo ninguna circunstancia debe considerarse un sustituto del juicio crítico, diagnóstico o conocimiento del profesional médico. No está registrado como dispositivo médico ante COFEPRIS.</p>
            </Section>

            <Section icon={AlertTriangle} title="Cláusula 6 · Obligación Irrestricta de Revisión">
              <p>El médico tiene la obligación legal y contractual de leer, validar y corregir cualquier texto, resumen o nota clínica generada por la IA antes de guardarla definitivamente en el expediente o recetarla. Validar o guardar un documento generado por la plataforma equivale, para todos los efectos legales, a un acto de autoría y endoso profesional del médico.</p>
            </Section>

            <Section icon={AlertTriangle} title="Cláusula 7 · Margen de Error Inherente a la IA">
              <p>El usuario acepta que los modelos de procesamiento de lenguaje natural (Speech-to-Text) tienen un margen de error técnico derivado de factores externos: ruido ambiental, acentos, fallas de micrófono o vicios de dicción, entre otros.</p>
            </Section>

            <Section icon={AlertTriangle} title="Cláusula 8 · Exclusión de Responsabilidad en Medicación y Dosis">
              <p>Lemmatica se deslinda al 100% de las dosis, sustancias, combinaciones de medicamentos o tratamientos que el médico prescriba a sus pacientes, aun si fueron validados o procesados dentro de la interfaz. La verificación de interacciones y farmacovigilancia es responsabilidad exclusiva del profesional tratante.</p>
            </Section>

            <Section icon={Brain} title="Cláusula 9 · Ausencia de Diagnóstico Automatizado">
              <p>El software no emite juicios médicos automáticos, no genera diagnósticos por sí solo y no sugiere tratamientos de manera autónoma. Su función se limita a transcribir, organizar y estructurar la información que el propio médico dicta o introduce.</p>
            </Section>

            <Section icon={Scale} title="Cláusula 10 · Indemnidad por Mala Práctica">
              <p>El médico se compromete a sacar en paz y a salvo a Lemma Sistemas Inteligentes, sus empleados y socios ante cualquier demanda judicial, queja ante la CONAMED o procedimiento administrativo derivado de negligencia médica o mala práctica, obligándose a notificar de inmediato cualquier reclamación de esta naturaleza y a cooperar en su defensa.</p>
            </Section>

            <Section icon={Database} title="Datos de Pacientes y Entrenamiento de IA">
              <Bullet><strong>No usamos datos de pacientes para entrenar modelos:</strong> nunca se utilizan para entrenar ni ajustar (fine-tuning) modelos de IA propios ni de terceros.</Bullet>
              <Bullet><strong>Anonimización para mejora interna:</strong> solo datos de uso anonimizados e irreversiblemente desvinculados pueden usarse para mejorar el servicio, conforme a la cláusula 15.</Bullet>
              <Bullet><strong>Transparencia:</strong> cada nota generada por IA se marca internamente como "Generado por IA — Revisión pendiente" hasta que el médico la valida, y se mantiene un log de auditoría por 5 años.</Bullet>
              <Bullet>El usuario puede desactivar las funciones de IA en cualquier momento desde la configuración de su cuenta.</Bullet>
            </Section>
          </>
        )}

        {/* ═══ INFRAESTRUCTURA Y LEGAL — Módulo 4 ═══ */}
        {activeTab === 'legal' && (
          <>
            <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #8b5cf6', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '3rem', display: 'flex', gap: '0.75rem' }}>
              <Scale size={20} color="#6d28d9" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, color: '#4c1d95', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Esta sección describe cómo operamos la infraestructura del servicio, los límites de responsabilidad económica y las condiciones de propiedad intelectual aplicables a Lemmatica.
              </p>
            </div>

            <Section icon={Globe} title="Cláusula 16 · Límite de Responsabilidad por Fallas de Terceros">
              <p>Lemmatica no será responsable por interrupciones en el servicio ocasionadas por caídas globales de servidores de infraestructura externa (como AWS o Xertica) o bloqueos en las APIs de comunicación (como Meta/WhatsApp), ni por fallas de conectividad ajenas a nuestro control razonable.</p>
            </Section>

            <Section icon={Lock} title="Cláusula 17 · Ventanas de Mantenimiento">
              <p>Nos reservamos el derecho de suspender temporalmente el acceso a la plataforma para realizar actualizaciones de código, parches de seguridad o mejoras operativas, dando aviso previo en la interfaz salvo en el caso de parches de seguridad urgentes.</p>
            </Section>

            <Section icon={Scale} title="Cláusula 18 · Límite Financiero de Responsabilidad">
              <p>En caso de que un tribunal determine alguna responsabilidad económica de Lemma Sistemas Inteligentes hacia el usuario, esta quedará estrictamente topada al monto equivalente a las mensualidades pagadas por el usuario en los últimos 3 meses de servicio, salvo en casos de dolo o mala fe acreditados.</p>
            </Section>

            <Section icon={AlertTriangle} title="Cláusula 19 · Prohibición de Ingeniería Inversa">
              <p>Queda estrictamente prohibido copiar, descompilar, extraer el código fuente o replicar los modelos de IA propietarios que dan vida a Lemmatica. Su violación constituye una infracción a la Ley Federal del Derecho de Autor y a la Ley Federal de Protección a la Propiedad Industrial.</p>
            </Section>

            <Section icon={Shield} title="Cláusula 20 · Suspensión por Uso Indebido">
              <p>Nos reservamos el derecho unilateral de suspender o dar de baja cuentas que realicen actividades sospechosas, inyección de código malicioso o vulneración perimetral del sistema, notificando al usuario cuando las circunstancias lo permitan.</p>
            </Section>

            <Section icon={Shield} title="Limitación General de Responsabilidad">
              <p style={{ marginBottom: '1rem' }}>Lemmatica no será responsable por:</p>
              <Bullet>Decisiones médicas tomadas con base en las notas o documentos generados por la plataforma.</Bullet>
              <Bullet>Pérdida de datos causada por fuerza mayor, fallas de terceros proveedores de infraestructura, o negligencia del usuario en la gestión de sus credenciales.</Bullet>
              <Bullet>Interrupciones del servicio debidas a mantenimiento programado o eventos imprevistos.</Bullet>
              <Bullet>Daños indirectos, incidentales, especiales o co