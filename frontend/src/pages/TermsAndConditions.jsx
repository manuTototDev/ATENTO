import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Brain, Lock, UserCheck, AlertTriangle, Globe, Mail } from 'lucide-react';

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
            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.05em', cursor: 'pointer' }} onClick={() => navigate('/')}>Latento.</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.04em', marginBottom: '0.75rem', lineHeight: 1.1 }}>
            Términos, Privacidad<br />y Uso de Datos
          </h1>
          <p style={{ color: '#a3a3a3', fontSize: '1rem', marginBottom: '0.5rem' }}>
            Última actualización: 15 de mayo de 2026 · Versión 1.0
          </p>
          <p style={{ color: '#a3a3a3', fontSize: '0.875rem' }}>
            Plataforma operada por <strong style={{ color: '#fff' }}>Totot Estudio</strong> bajo la marca <strong style={{ color: '#fff' }}>Latento</strong> — Ciudad de México, México.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e5e5', backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 5%', display: 'flex', gap: '1rem' }}>
          <button style={tabStyle('terms')} onClick={() => setActiveTab('terms')}>Términos de Uso</button>
          <button style={tabStyle('privacy')} onClick={() => setActiveTab('privacy')}>Privacidad y Datos</button>
          <button style={tabStyle('ai')} onClick={() => setActiveTab('ai')}>Política de IA</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 5%' }}>

        {/* ═══ TERMS OF USE ═══ */}
        {activeTab === 'terms' && (
          <>
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '3rem', display: 'flex', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, color: '#78350f', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <strong>Aviso Importante:</strong> Latento es una <strong>herramienta de apoyo administrativo y de documentación clínica</strong>. No constituye un dispositivo médico, no sustituye el juicio clínico del profesional de la salud, ni debe usarse como única fuente para diagnósticos o decisiones terapéuticas. El médico usuario es el único responsable de la atención prestada a sus pacientes.
              </p>
            </div>

            <Section icon={UserCheck} title="1. Aceptación y Capacidad Legal">
              <p style={{ marginBottom: '1rem' }}>Al crear una cuenta en Latento, el usuario declara que:</p>
              <Bullet>Es mayor de 18 años y posee capacidad legal plena para celebrar contratos.</Bullet>
              <Bullet>Es un profesional de la salud con cédula profesional válida emitida por la Dirección General de Profesiones (DGP) de la Secretaría de Educación Pública (SEP) de México, o equivalente en su país.</Bullet>
              <Bullet>Ha leído, entendido y acepta en su totalidad los presentes Términos y Condiciones, la Política de Privacidad y la Política de Uso de Inteligencia Artificial.</Bullet>
              <Bullet>Proporciona información verídica, actualizada y completa durante el registro.</Bullet>
              <p style={{ marginTop: '1rem' }}>En caso de que un representante legal actúe en nombre de una persona moral, dicho representante garantiza que cuenta con las facultades suficientes para obligar a dicha entidad.</p>
            </Section>

            <Section icon={Shield} title="2. Descripción del Servicio">
              <p style={{ marginBottom: '1rem' }}>Latento es una plataforma SaaS (Software as a Service) de gestión médica que provee:</p>
              <Bullet><strong>Transcripción y documentación asistida por IA:</strong> Convierte audio de consultas en notas clínicas estructuradas en formato SOAP.</Bullet>
              <Bullet><strong>Generación de recetas médicas:</strong> Producción de documentos médicos con membrete personalizado.</Bullet>
              <Bullet><strong>Gestión de expedientes electrónicos:</strong> Almacenamiento y organización del historial clínico de pacientes.</Bullet>
              <Bullet><strong>Administración del consultorio:</strong> Agenda, directorio de pacientes, inventario y finanzas básicas.</Bullet>
              <p style={{ marginTop: '1rem' }}>El servicio se presta "tal como está" (<em>as is</em>) y "según disponibilidad". Latento se reserva el derecho de modificar, suspender o discontinuar cualquier funcionalidad con previo aviso de 30 días naturales, salvo en casos de fuerza mayor o imperativo legal.</p>
            </Section>

            <Section icon={Lock} title="3. Cuenta de Usuario y Seguridad">
              <p style={{ marginBottom: '1rem' }}>El usuario es el único responsable de:</p>
              <Bullet>Mantener la confidencialidad de sus credenciales de acceso (usuario y contraseña).</Bullet>
              <Bullet>Todas las actividades realizadas bajo su cuenta, autorizadas o no.</Bullet>
              <Bullet>Notificar inmediatamente a Latento ante cualquier uso no autorizado o brecha de seguridad detectada, a través de <strong>seguridad@latento.mx</strong>.</Bullet>
              <p style={{ marginTop: '1rem' }}>Latento implementa una arquitectura <strong>Zero Trust</strong> y <strong>Validación Estricta de Entradas</strong>. Toda comunicación utiliza cifrado en tránsito (TLS 1.3) y autenticación mediante tokens JWT rotativos en cookies <em>HttpOnly</em>. El usuario no podrá compartir, vender, ceder ni transferir su cuenta a terceros.</p>
            </Section>

            <Section icon={AlertTriangle} title="4. Uso Prohibido">
              <p style={{ marginBottom: '1rem' }}>Queda estrictamente prohibido:</p>
              <Bullet>Ingresar información falsa, engañosa o de pacientes sin su consentimiento informado.</Bullet>
              <Bullet>Usar la plataforma para actividades ilícitas, incluyendo fraude médico o prescripción irregular.</Bullet>
              <Bullet>Intentar hacer ingeniería inversa, descompilar, o acceder al código fuente de la plataforma.</Bullet>
              <Bullet>Realizar ataques de denegación de servicio, inyección de código, o cualquier intento de vulnerar la seguridad del sistema.</Bullet>
              <Bullet>Compartir expedientes clínicos generados en la plataforma sin el consentimiento explícito del paciente correspondiente.</Bullet>
              <Bullet>Utilizar las notas SOAP generadas por IA como único soporte de evidencia clínica sin revisión y validación por parte del médico.</Bullet>
              <p style={{ marginTop: '1rem' }}>El incumplimiento de estas disposiciones podrá resultar en la suspensión o cancelación inmediata de la cuenta, sin perjuicio de las acciones legales que correspondan.</p>
            </Section>

            <Section icon={Globe} title="5. Propiedad Intelectual">
              <p style={{ marginBottom: '1rem' }}>Todos los derechos sobre la plataforma, su diseño, código fuente, algoritmos, marcas y contenidos son propiedad exclusiva de <strong>Totot Estudio</strong>, titular de la marca <strong>Latento</strong>, y están protegidos por la Ley Federal del Derecho de Autor y la Ley de la Propiedad Industrial de México.</p>
              <p>El usuario conserva la propiedad de los datos clínicos que introduce en la plataforma. Latento únicamente los procesa según lo establecido en la Política de Privacidad.</p>
            </Section>

            <Section icon={Shield} title="6. Limitación de Responsabilidad">
              <p style={{ marginBottom: '1rem' }}>Latento no será responsable por:</p>
              <Bullet>Decisiones médicas tomadas con base en las notas o documentos generados por la plataforma.</Bullet>
              <Bullet>Pérdida de datos causada por fuerza mayor, fallas de terceros proveedores de infraestructura, o negligencia del usuario en la gestión de sus credenciales.</Bullet>
              <Bullet>Interrupciones del servicio debidas a mantenimiento programado o eventos imprevistos.</Bullet>
              <Bullet>Daños indirectos, incidentales, especiales o consecuentes derivados del uso o imposibilidad de uso del servicio.</Bullet>
              <p style={{ marginTop: '1rem' }}>La responsabilidad máxima acumulada de Latento hacia el usuario, por cualquier concepto, no excederá el monto pagado por el usuario en los 3 meses previos al evento que originó el reclamo.</p>
            </Section>

            <Section icon={Mail} title="7. Jurisdicción y Ley Aplicable">
              <p>Los presentes Términos se rigen por las leyes de los <strong>Estados Unidos Mexicanos</strong>. Para la resolución de controversias, las partes se someten expresamente a la jurisdicción de los tribunales competentes de la <strong>Ciudad de México</strong>, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros. Contacto legal: <strong>legal@latento.mx</strong>.</p>
            </Section>
          </>
        )}

        {/* ═══ PRIVACY & DATA ═══ */}
        {activeTab === 'privacy' && (
          <>
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '3rem', display: 'flex', gap: '0.75rem' }}>
              <Shield size={20} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, color: '#14532d', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <strong>Compromiso de Privacidad:</strong> Latento fue diseñado desde cero con un enfoque de <em>Privacy by Design</em>. Los datos de tus pacientes son tuyos y nunca se venden, comparten ni utilizan para entrenar modelos de IA sin tu consentimiento explícito.
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
              <Bullet>Audio de consultas: grabaciones temporales procesadas localmente para transcripción (no se almacenan permanentemente en servidores de Latento sin configuración explícita del usuario).</Bullet>
              <Bullet>Documentos generados: recetas médicas en PDF y expedientes exportados.</Bullet>

              <p style={{ marginBottom: '1rem', marginTop: '1.5rem', fontWeight: 600 }}>C) Datos Técnicos:</p>
              <Bullet>Dirección IP, tipo de navegador, sistema operativo, identificadores de sesión.</Bullet>
              <Bullet>Métricas de rendimiento de la plataforma (anonimizadas).</Bullet>
            </Section>

            <Section icon={Lock} title="2. Almacenamiento y Seguridad de Datos">
              <Bullet><strong>Cifrado en tránsito:</strong> Toda comunicación entre el cliente y los servidores utiliza TLS 1.3.</Bullet>
              <Bullet><strong>Cifrado en reposo:</strong> Las bases de datos operativas están cifradas con AES-256. Las contraseñas se almacenan exclusivamente como hashes bcrypt (factor de costo ≥ 12).</Bullet>
              <Bullet><strong>Segregación de datos:</strong> Los datos de cada médico están lógicamente aislados. Ningún usuario puede acceder a los datos de otro, garantizado mediante verificaciones de propiedad en cada transacción.</Bullet>
              <Bullet><strong>Data Lake y Minería de Datos (Anonimización):</strong> Para fines analíticos, estadísticos y de mejora de producto, Latento opera una "Base de Datos Analítica" paralela (Data Lake). Un proceso automatizado extrae la información clínica de la base de datos operativa y <strong>elimina irreversiblemente todos los identificadores personales</strong> (nombres, correos, teléfonos, direcciones exactas) antes de almacenarla. Los científicos de datos y modelos analíticos interactúan exclusivamente con esta base de datos anónima, garantizando que el historial clínico estructurado (diagnósticos, tratamientos, edades) nunca pueda ser vinculado de regreso a la identidad de un paciente específico.</Bullet>
              <Bullet><strong>Infraestructura:</strong> Los servidores de producción se alojan en centros de datos ubicados en territorio mexicano o estadounidense con certificación SOC 2 Tipo II.</Bullet>
              <Bullet><strong>Backups:</strong> Se realizan respaldos cifrados incrementales cada 24 horas, con retención de 30 días.</Bullet>
              <Bullet><strong>Control de acceso:</strong> El personal de Latento con acceso a datos de producción es mínimo, está auditado y tiene acceso de solo lectura restringido por necesidad operativa.</Bullet>
            </Section>

            <Section icon={Globe} title="3. Finalidad y Base Legal del Tratamiento">
              <p style={{ marginBottom: '1rem' }}>De conformidad con la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong> de México, el tratamiento de datos se realiza bajo las siguientes bases legales:</p>
              <Bullet><strong>Ejecución contractual:</strong> Procesamos datos del médico para prestar el servicio contratado.</Bullet>
              <Bullet><strong>Consentimiento explícito:</strong> El procesamiento de datos de pacientes se realiza bajo la responsabilidad del médico titular, quien debe obtener el consentimiento informado de sus pacientes conforme a la NOM-004-SSA3-2012.</Bullet>
              <Bullet><strong>Interés legítimo:</strong> Datos de uso anonimizados para mejora del servicio y detección de fraudes.</Bullet>
              <Bullet><strong>Obligación legal:</strong> Conservación de registros de acceso y auditoría según normativa aplicable.</Bullet>
            </Section>

            <Section icon={UserCheck} title="4. Tus Derechos ARCO">
              <p style={{ marginBottom: '1rem' }}>Como titular de datos personales, tienes los siguientes derechos ejercibles ante Latento:</p>
              <Bullet><strong>Acceso:</strong> Conocer qué datos personales tuyos tenemos y cómo los tratamos.</Bullet>
              <Bullet><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos o incompletos.</Bullet>
              <Bullet><strong>Cancelación:</strong> Solicitar la supresión de tus datos cuando no sean necesarios para la finalidad con la que fueron recabados.</Bullet>
              <Bullet><strong>Oposición:</strong> Oponerte al tratamiento de tus datos para finalidades específicas.</Bullet>
              <p style={{ marginTop: '1rem' }}>Para ejercer tus derechos ARCO, envía un correo a <strong>privacidad@latento.mx</strong> con identificación oficial. Responderemos en un plazo máximo de 20 días hábiles.</p>
            </Section>

            <Section icon={Database} title="5. Retención y Eliminación de Datos">
              <Bullet>Los datos de cuenta activa se conservan durante toda la vigencia de la suscripción.</Bullet>
              <Bullet>Tras la cancelación de la cuenta, los datos se conservarán por <strong>90 días naturales</strong> adicionales para permitir la recuperación ante error, tras los cuales serán eliminados de forma segura (sobrescritura de múltiples pasadas).</Bullet>
              <Bullet>Los expedientes clínicos podrán ser exportados en formato PDF o JSON antes de la cancelación.</Bullet>
              <Bullet>Los logs de auditoría se conservan por <strong>5 años</strong> por obligación legal.</Bullet>
            </Section>

            <Section icon={Globe} title="6. Transferencia Internacional de Datos">
              <p>En caso de que datos sean transferidos a proveedores de infraestructura fuera de México (p.ej. servicios de cómputo en la nube), Latento garantiza que dichos proveedores cumplen con estándares equivalentes de protección, mediante cláusulas contractuales estándar. Nunca vendemos datos personales a terceros.</p>
            </Section>
          </>
        )}

        {/* ═══ AI POLICY ═══ */}
        {activeTab === 'ai' && (
          <>
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '3rem', display: 'flex', gap: '0.75rem' }}>
              <Brain size={20} color="#0369a1" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, color: '#0c4a6e', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <strong>Principio Fundamental:</strong> La IA de Latento es una <strong>herramienta de apoyo</strong> al médico, no un sustituto. Toda nota, receta o diagnóstico generado por IA <strong>debe ser revisado, validado y aprobado</strong> por el profesional de la salud antes de su uso clínico o legal.
              </p>
            </div>

            <Section icon={Brain} title="1. Cómo Funciona Nuestra IA">
              <p style={{ marginBottom: '1rem' }}>Latento utiliza modelos de lenguaje de gran escala (LLMs) de terceros (actualmente Google Gemini API) para:</p>
              <Bullet>Transcribir y estructurar el audio de consultas médicas en notas SOAP.</Bullet>
              <Bullet>Generar borradores de recetas médicas basados en el contenido de la consulta.</Bullet>
              <Bullet>Sugerir resúmenes de historial clínico.</Bullet>
              <p style={{ marginTop: '1rem' }}>Los modelos de IA <strong>no tienen acceso permanente a tus datos</strong>. Cada consulta a la API de IA es independiente y se transmite de forma cifrada.</p>
            </Section>

            <Section icon={Database} title="2. Datos de Pacientes y Entrenamiento de IA">
              <Bullet><strong>No usamos datos de pacientes para entrenar modelos:</strong> Los datos clínicos de tus pacientes nunca se utilizan para entrenar, ajustar (fine-tuning) ni mejorar modelos de IA, ni los propios de Latento ni los de terceros.</Bullet>
              <Bullet><strong>Anonimización para mejora interna:</strong> Únicamente datos de uso anonimizados e irreversiblemente desvinculados de cualquier persona (métricas de tiempo de respuesta, tasas de error) pueden usarse para mejorar el servicio.</Bullet>
              <Bullet><strong>Opt-in para mejora voluntaria:</strong> Si en el futuro Latento desea usar ejemplos de notas para mejorar modelos propios, se solicitará consentimiento explícito, granular y revocable a cada usuario.</Bullet>
              <Bullet><strong>Política de proveedores:</strong> Los acuerdos con proveedores de IA (Google, OpenAI, etc.) incluyen cláusulas de no uso de datos para entrenamiento en entornos de producción API.</Bullet>
            </Section>

            <Section icon={AlertTriangle} title="3. Limitaciones y Responsabilidad Clínica">
              <p style={{ marginBottom: '1rem', fontWeight: 600 }}>El usuario reconoce explícitamente que:</p>
              <Bullet><strong>LA IA NO DIAGNOSTICA:</strong> La plataforma y sus algoritmos de Inteligencia Artificial carecen de capacidad y autorización legal para emitir diagnósticos médicos, prescribir tratamientos o tomar decisiones clínicas. Todo output es meramente una propuesta de estructuración de texto.</Bullet>
              <Bullet>Los modelos de IA pueden cometer errores, omisiones o "alucinaciones" (generación de información plausible pero incorrecta).</Bullet>
              <Bullet>Ninguna nota SOAP, receta o recomendación generada por Latento tiene carácter diagnóstico definitivo. Su propósito es exclusivamente la redacción administrativa.</Bullet>
              <Bullet>El médico es el <strong>único responsable legal y ético</strong> de la información que aprueba, firma y entrega a sus pacientes o integra al expediente clínico.</Bullet>
              <Bullet>Latento no puede ser utilizado en situaciones de emergencia médica donde la inmediatez del juicio clínico humano es crítica.</Bullet>
              <Bullet>El uso de Latento no exime al médico de sus obligaciones deontológicas ni legales conforme a la Ley General de Salud y las normas oficiales mexicanas aplicables (NOM-004-SSA3-2012, NOM-024-SSA3-2012).</Bullet>
            </Section>

            <Section icon={Lock} title="4. Transparencia y Trazabilidad">
              <Bullet>Cada nota generada por IA es marcada internamente con un sello de origen ("Generado por IA — Revisión pendiente") hasta que el médico la valide.</Bullet>
              <Bullet>Se mantiene un log de auditoría de cada acción de generación de IA, incluyendo timestamp y usuario, por un período de 5 años.</Bullet>
              <Bullet>El usuario puede desactivar las funciones de IA en cualquier momento desde la configuración de su cuenta y usar la plataforma únicamente como gestor manual de expedientes.</Bullet>
            </Section>

            <Section icon={Globe} title="5. Actualizaciones a la Política de IA">
              <p>Dado que el campo de la inteligencia artificial evoluciona rápidamente, esta política puede actualizarse con mayor frecuencia que los Términos generales. Notificaremos cambios significativos con al menos 15 días de anticipación mediante correo electrónico y notificación en la plataforma. El uso continuo de las funciones de IA después de dicho período constituirá aceptación de los cambios.</p>
            </Section>
          </>
        )}

        {/* Contact Footer */}
        <div style={{ backgroundColor: '#000', color: '#fff', borderRadius: '16px', padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.03em' }}>¿Tienes preguntas sobre estos términos?</h3>
          <p style={{ color: '#a3a3a3', marginBottom: '2rem', lineHeight: 1.6 }}>
            Nuestro equipo de privacidad y legal está disponible para resolver cualquier duda.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:privacidad@latento.mx" style={{ backgroundColor: '#fff', color: '#000', padding: '0.75rem 1.5rem', borderRadius: '100px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} /> privacidad@latento.mx
            </a>
            <a href="mailto:legal@latento.mx" style={{ backgroundColor: 'transparent', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '100px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', border: '1px solid #444', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} /> legal@latento.mx
            </a>
          </div>
          <p style={{ color: '#555', fontSize: '0.8rem', marginTop: '2rem' }}>
            Totot Estudio · Marca Latento · Ciudad de México, México · Latento © 2026
          </p>
        </div>

      </div>
    </div>
  );
};

export default TermsAndConditions;
