import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Database, Brain, Lock, UserCheck, AlertTriangle, Globe, Mail, FileText, Scale } from 'lucide-react';
import './TermsAndConditions.css';

const TABS = [
  { id: 'terms', label: 'Términos de Uso' },
  { id: 'privacy', label: 'Privacidad y Datos' },
  { id: 'ai', label: 'Política de IA' },
  { id: 'legal', label: 'Infraestructura y Legal' },
];

const Section = ({ icon: Icon, tone, title, children }) => (
  <div className="tc-section">
    <div className="tc-section-head">
      <div className={`tc-section-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <h2 className="tc-section-title">{title}</h2>
    </div>
    <div className="tc-section-body">{children}</div>
  </div>
);

const Bullet = ({ children }) => (
  <div className="tc-bullet">
    <div className="tc-bullet-dot" />
    <span>{children}</span>
  </div>
);

const Clause = ({ n, title, children }) => (
  <div className="tc-clause">
    <h3 className="tc-clause-title">{n}. {title}</h3>
    <div className="tc-clause-body">{children}</div>
  </div>
);

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('terms');

  return (
    <div className="tc-page">

      {/* Header */}
      <div className="tc-header">
        <div className="tc-header-inner">
          <div className="tc-header-top">
            <button className="tc-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Volver
            </button>
            <button className="tc-brand" onClick={() => navigate('/')}>Escrivo.</button>
          </div>
          <h1 className="tc-title">Términos, Privacidad<br />y Uso de Datos</h1>
          <p className="tc-meta">Última actualización: 14 de julio de 2026 · Versión 2.0</p>
          <p className="tc-meta-sub">
            Plataforma operada por <strong>Totot Estudio S.A.S. de C.V.</strong> bajo la marca <strong>Escrivo</strong> — Estados Unidos Mexicanos.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tc-tabs-wrap">
        <div className="tc-tabs">
          <div className="tab-bar">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="tc-content">

        <AnimatePresence mode="wait">
          {/* ═══ TERMS OF USE — Módulo 1: Veracidad, Entrada de Datos e Identidad Profesional ═══ */}
          {activeTab === 'terms' && (
            <motion.div key="terms" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="tc-alert tc-alert-warning">
                <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <p>
                  <strong>Aviso Importante:</strong> Escrivo es una <strong>herramienta de apoyo administrativo y de documentación clínica</strong>. No constituye un dispositivo médico, no sustituye el juicio clínico del profesional de la salud, ni debe usarse como única fuente para diagnósticos o decisiones terapéuticas. El médico usuario es el único responsable de la atención prestada a sus pacientes.
                </p>
              </div>

              <p className="tc-intro">
                El presente instrumento constituye un contrato de adhesión que regula el acceso y uso de la plataforma tecnológica Escrivo, propiedad y operada por <strong>Totot Estudio S.A.S. de C.V.</strong> Al crear una cuenta, registrar una cédula profesional o hacer uso de cualquier funcionalidad de la plataforma, el usuario manifiesta su consentimiento expreso, libre e informado para quedar obligado en todos sus términos.
              </p>

              <Section icon={UserCheck} tone="blue" title="Módulo 1 · Veracidad, Entrada de Datos e Identidad Profesional">
                <Clause n="1" title="Garantía de Identidad y Cédula Profesional">
                  <p>El usuario declara, bajo protesta de decir verdad, que es un profesional de la salud legalmente facultado para ejercer la medicina en México, y que cuenta con cédula profesional vigente expedida por la Dirección General de Profesiones (SEP), libre de suspensión o cancelación.</p>
                  <p>Se obliga a mantenerla actualizada y a notificar a Escrivo dentro de 48 horas cualquier cambio en su situación profesional. Escrivo podrá verificar la autenticidad de la cédula ante el Registro Nacional de Profesionistas y suspender de inmediato cualquier cuenta cuya cédula resulte apócrifa, inexistente o cancelada, sin perjuicio de las acciones legales que correspondan.</p>
                </Clause>
                <Clause n="2" title="Obligación de Veracidad del Usuario">
                  <p>El médico es el único y exclusivo responsable de la veracidad, exactitud, vigencia y licitud de todos los datos clínicos, personales o administrativos que introduzca en la plataforma, con independencia de que dicha información haya sido procesada o estructurada por herramientas de inteligencia artificial. Escrivo no tiene obligación de verificar de forma independiente la exactitud clínica de la información capturada.</p>
                </Clause>
                <Clause n="3" title="Exclusión de Responsabilidad por Datos de Entrada">
                  <p>Totot Estudio no será responsable por diagnósticos erróneos, omisiones o problemas legales derivados de información falsa, incompleta o inexacta capturada por el usuario. El usuario se obliga a indemnizar y sacar en paz y a salvo a la empresa frente a reclamaciones de terceros derivadas de dicha información, en los términos de la cláusula 10.</p>
                </Clause>
                <Clause n="4" title="Exclusividad y Custodia de Credenciales">
                  <p>El usuario es el único custodio de sus contraseñas y accesos. Todo uso del software realizado con sus credenciales se presumirá hecho por él mismo, deslindando a Escrivo de accesos no autorizados por descuido del usuario. El usuario debe notificar cualquier compromiso de sus credenciales dentro de 24 horas.</p>
                </Clause>
              </Section>

              <Section icon={FileText} tone="gold" title="Módulo 5 · Vigencia, Cancelación y Propiedad Intelectual">
                <Clause n="21" title="Vigencia y Cancelación de la Suscripción">
                  <p>Las suscripciones son mensuales o anuales recurrentes. El usuario puede cancelar en cualquier momento; el servicio termina al finalizar el periodo ya pagado, sin reembolso de cantidades no consumidas salvo disposición legal en contrario.</p>
                </Clause>
                <Clause n="22" title="Periodo de Gracia para Recuperación de Datos">
                  <p>En caso de cancelación o falta de pago, Escrivo otorgará un plazo de <strong>30 días naturales</strong> para exportar y descargar los expedientes clínicos antes de proceder al borrado definitivo y seguro de la información, conforme a la obligación de supresión de datos personales prevista en la LFPDPPP.</p>
                </Clause>
                <Clause n="23" title="Modificaciones a los Términos">
                  <p>Escrivo notificará los cambios a estos Términos mediante avisos en la aplicación o correo electrónico, con al menos 15 días naturales de anticipación en modificaciones sustanciales. El uso continuado del sistema tras dicha notificación constituye la aceptación tácita de los nuevos términos.</p>
                </Clause>
                <Clause n="24" title="Propiedad Intelectual">
                  <p>Todo el software, algoritmos, modelos de IA, logotipos, diseños de interfaz UI/UX y marcas pertenecen de forma exclusiva a <strong>Totot Estudio S.A.S. de C.V.</strong> Este contrato solo otorga al usuario una licencia de uso limitada, personal, no exclusiva e intransferible, sin ceder derecho de propiedad intelectual alguno. La información clínica del paciente es independiente de esta titularidad y corresponde al médico y al paciente.</p>
                </Clause>
                <Clause n="25" title="Jurisdicción y Legislación Mexicana">
                  <p>Este contrato se rige por las leyes federales de los Estados Unidos Mexicanos. Ambas partes se someten a la competencia de los tribunales de Toluca, Estado de México, o de la Ciudad de México, a elección de la parte actora, renunciando a cualquier otro fuero por domicilio presente o futuro.</p>
                </Clause>
              </Section>
            </motion.div>
          )}

          {/* ═══ PRIVACY & DATA — Módulo 3 ═══ */}
          {activeTab === 'privacy' && (
            <motion.div key="privacy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="tc-alert tc-alert-success">
                <Shield size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <p>
                  <strong>Compromiso de Privacidad:</strong> Escrivo fue diseñado desde cero con un enfoque de <em>Privacy by Design</em>. Los datos de tus pacientes son tuyos y nunca se venden, comparten ni utilizan para entrenar modelos de IA sin tu consentimiento explícito.
                </p>
              </div>

              <Section icon={Database} tone="blue" title="1. Datos que Recopilamos">
                <p className="tc-sub-label">A) Datos del Médico (Titular de la Cuenta):</p>
                <Bullet>Información de identificación: nombre, apellido, correo electrónico, contraseña (hashed con bcrypt).</Bullet>
                <Bullet>Información profesional: especialidad, cédula profesional, cédula de especialidad, universidad de egreso.</Bullet>
                <Bullet>Información del consultorio: nombre, dirección completa, teléfono, logotipo.</Bullet>
                <Bullet>Datos de uso: registros de acceso (IP, timestamp), eventos de la plataforma para fines de seguridad y mejora del servicio.</Bullet>

                <p className="tc-sub-label">B) Datos de Pacientes (Tratados por el Médico):</p>
                <Bullet>Información demográfica: nombre, fecha de nacimiento, sexo, CURP (opcional), contacto de emergencia.</Bullet>
                <Bullet>Historial clínico: notas SOAP, diagnósticos, medicamentos prescritos, alergias, antecedentes.</Bullet>
                <Bullet>Audio de consultas: grabaciones temporales procesadas para transcripción (no se almacenan permanentemente en servidores de Escrivo sin configuración explícita del usuario).</Bullet>
                <Bullet>Documentos generados: recetas médicas en PDF y expedientes exportados.</Bullet>

                <p className="tc-sub-label">C) Datos Técnicos:</p>
                <Bullet>Dirección IP, tipo de navegador, sistema operativo, identificadores de sesión.</Bullet>
                <Bullet>Métricas de rendimiento de la plataforma (anonimizadas).</Bullet>
              </Section>

              <Section icon={UserCheck} tone="violet" title="Cláusula 11 · Consentimiento del Paciente para Grabación">
                <p>El médico asume la responsabilidad legal total de informar a su paciente y obtener su consentimiento expreso —verbal o por escrito— antes de activar la función de escucha/transcripción de audio durante la consulta, en cumplimiento de la LFPDPPP y del derecho a la privacidad. Escrivo puede ofrecer plantillas orientativas, pero la obtención y documentación del consentimiento es responsabilidad exclusiva del médico, quien debe conservar evidencia del mismo.</p>
              </Section>

              <Section icon={Lock} tone="green" title="Cláusula 12 · Cumplimiento de la LFPDPPP y Seguridad">
                <p className="tc-sub-label" style={{ marginTop: 0 }}>Escrivo procesa los Datos Personales Sensibles de salud bajo los estándares más estrictos de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento, autoridad hoy a cargo de la Secretaría Anticorrupción y Buen Gobierno tras la reforma de marzo de 2025.</p>
                <Bullet><strong>Cifrado en tránsito:</strong> Toda comunicación entre el cliente y los servidores utiliza TLS 1.3.</Bullet>
                <Bullet><strong>Cifrado en reposo:</strong> Las bases de datos operativas están cifradas con AES-256. Las contraseñas se almacenan exclusivamente como hashes bcrypt (factor de costo ≥ 12).</Bullet>
                <Bullet><strong>Segregación de datos:</strong> Los datos de cada médico están lógicamente aislados; ningún usuario puede acceder a los datos de otro.</Bullet>
                <Bullet><strong>Infraestructura:</strong> Servidores de producción alojados en centros de datos con certificación SOC 2 Tipo II.</Bullet>
                <Bullet><strong>Backups:</strong> Respaldos cifrados incrementales cada 24 horas, con retención de 30 días.</Bullet>
                <Bullet><strong>Control de acceso:</strong> El personal de Escrivo con acceso a datos de producción es mínimo, auditado y de solo lectura restringido por necesidad operativa.</Bullet>
              </Section>

              <Section icon={Scale} tone="gold" title="Cláusula 13 · Calidad de Encargado de Tratamiento">
                <p>Respecto de los datos de los pacientes, el médico o la clínica actúa como <strong>"Responsable"</strong> del tratamiento en términos de la LFPDPPP, mientras que Totot Estudio actúa únicamente como <strong>"Encargado"</strong>, operando los datos bajo las instrucciones exclusivas del médico, sin utilizarlos para fines distintos a los aquí pactados, y suprimiéndolos o devolviéndolos al concluir la relación contractual conforme al periodo de gracia de 30 días.</p>
              </Section>

              <Section icon={Globe} tone="blue" title="Cláusula 14 · Cumplimiento de la NOM-024-SSA3-2012">
                <p>La plataforma proporciona herramientas técnicas orientadas al cumplimiento de la Norma Oficial Mexicana NOM-024-SSA3-2012 (sistemas de registro electrónico para la salud) y su concordancia con la NOM-004-SSA3-2012 (expediente clínico). El uso correcto de dichas herramientas y el apego a los flujos obligatorios de dichas normas, incluida la conservación del expediente por el plazo mínimo legal, corresponden al médico.</p>
              </Section>

              <Section icon={Brain} tone="violet" title="Cláusula 15 · Datos Anonimizados para Optimización de la IA">
                <p>El usuario autoriza a Escrivo a utilizar meta-datos y textos clínicos estrictamente disociados y anonimizados (sin nombres, CURP, RFC ni identificadores de pacientes) con el único fin de entrenar y calibrar la precisión local de los algoritmos de IA. Este proceso es irreversible, no se comparte ni comercializa con terceros, y el usuario puede oponerse a este uso desde la configuración de su cuenta sin afectar el resto de las funcionalidades.</p>
              </Section>

              <Section icon={UserCheck} tone="green" title="Tus Derechos ARCO">
                <p className="tc-sub-label" style={{ marginTop: 0 }}>Como titular de datos personales, tienes los siguientes derechos ejercibles ante Escrivo: Acceso, Rectificación, Cancelación y Oposición (ARCO).</p>
                <p>Para ejercerlos, envía un correo a <strong>privacidad@escrivo.com.mx</strong> con identificación oficial. Responderemos en un plazo máximo de 20 días hábiles.</p>
              </Section>

              <Section icon={Globe} tone="gold" title="Transferencia Internacional de Datos">
                <p>En caso de que datos sean transferidos a proveedores de infraestructura fuera de México (p. ej. cómputo en la nube), Escrivo garantiza que dichos proveedores cumplen con estándares equivalentes de protección mediante cláusulas contractuales estándar. Nunca vendemos datos personales a terceros.</p>
              </Section>
            </motion.div>
          )}

          {/* ═══ AI POLICY — Módulo 2: Deslinde de Criterio Clínico y Errores de la IA ═══ */}
          {activeTab === 'ai' && (
            <motion.div key="ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="tc-alert tc-alert-info">
                <Brain size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <p>
                  <strong>Principio Fundamental:</strong> La IA de Escrivo es una <strong>herramienta de apoyo</strong> al médico, no un sustituto. Toda nota, receta o diagnóstico generado por IA <strong>debe ser revisado, validado y aprobado</strong> por el profesional de la salud antes de su uso clínico o legal.
                </p>
              </div>

              <Section icon={Brain} tone="blue" title="Cómo Funciona Nuestra IA">
                <p>Escrivo utiliza modelos de lenguaje de gran escala (LLMs) de terceros (actualmente Google Gemini API) para transcribir y estructurar el audio de consultas médicas, generar borradores de recetas y sugerir resúmenes de historial clínico. Los modelos de IA no tienen acceso permanente a tus datos; cada consulta a la API es independiente y se transmite cifrada.</p>
              </Section>

              <Section icon={UserCheck} tone="green" title="Cláusula 5 · Naturaleza del Software (Herramienta de Apoyo)">
                <p>Escrivo es explícitamente un asistente tecnológico de transcripción y optimización administrativa; bajo ninguna circunstancia debe considerarse un sustituto del juicio crítico, diagnóstico o conocimiento del profesional médico. No está registrado como dispositivo médico ante COFEPRIS.</p>
              </Section>

              <Section icon={AlertTriangle} tone="gold" title="Cláusula 6 · Obligación Irrestricta de Revisión">
                <p>El médico tiene la obligación legal y contractual de leer, validar y corregir cualquier texto, resumen o nota clínica generada por la IA antes de guardarla definitivamente en el expediente o recetarla. Validar o guardar un documento generado por la plataforma equivale, para todos los efectos legales, a un acto de autoría y endoso profesional del médico.</p>
              </Section>

              <Section icon={AlertTriangle} tone="gold" title="Cláusula 7 · Margen de Error Inherente a la IA">
                <p>El usuario acepta que los modelos de procesamiento de lenguaje natural (Speech-to-Text) tienen un margen de error técnico derivado de factores externos: ruido ambiental, acentos, fallas de micrófono o vicios de dicción, entre otros.</p>
              </Section>

              <Section icon={AlertTriangle} tone="gold" title="Cláusula 8 · Exclusión de Responsabilidad en Medicación y Dosis">
                <p>Escrivo se deslinda al 100% de las dosis, sustancias, combinaciones de medicamentos o tratamientos que el médico prescriba a sus pacientes, aun si fueron validados o procesados dentro de la interfaz. La verificación de interacciones y farmacovigilancia es responsabilidad exclusiva del profesional tratante.</p>
              </Section>

              <Section icon={Brain} tone="violet" title="Cláusula 9 · Ausencia de Diagnóstico Automatizado">
                <p>El software no emite juicios médicos automáticos, no genera diagnósticos por sí solo y no sugiere tratamientos de manera autónoma. Su función se limita a transcribir, organizar y estructurar la información que el propio médico dicta o introduce.</p>
              </Section>

              <Section icon={Scale} tone="blue" title="Cláusula 10 · Indemnidad por Mala Práctica">
                <p>El médico se compromete a sacar en paz y a salvo a Totot Estudio, sus empleados y socios ante cualquier demanda judicial, queja ante la CONAMED o procedimiento administrativo derivado de negligencia médica o mala práctica, obligándose a notificar de inmediato cualquier reclamación de esta naturaleza y a cooperar en su defensa.</p>
              </Section>

              <Section icon={Database} tone="green" title="Datos de Pacientes y Entrenamiento de IA">
                <Bullet><strong>No usamos datos de pacientes para entrenar modelos:</strong> nunca se utilizan para entrenar ni ajustar (fine-tuning) modelos de IA propios ni de terceros.</Bullet>
                <Bullet><strong>Anonimización para mejora interna:</strong> solo datos de uso anonimizados e irreversiblemente desvinculados pueden usarse para mejorar el servicio, conforme a la cláusula 15.</Bullet>
                <Bullet><strong>Transparencia:</strong> cada nota generada por IA se marca internamente como "Generado por IA — Revisión pendiente" hasta que el médico la valida, y se mantiene un log de auditoría por 5 años.</Bullet>
                <Bullet>El usuario puede desactivar las funciones de IA en cualquier momento desde la configuración de su cuenta.</Bullet>
              </Section>
            </motion.div>
          )}

          {/* ═══ INFRAESTRUCTURA Y LEGAL — Módulo 4 ═══ */}
          {activeTab === 'legal' && (
            <motion.div key="legal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="tc-alert tc-alert-violet">
                <Scale size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <p>Esta sección describe cómo operamos la infraestructura del servicio, los límites de responsabilidad económica y las condiciones de propiedad intelectual aplicables a Escrivo.</p>
              </div>

              <Section icon={Globe} tone="blue" title="Cláusula 16 · Límite de Responsabilidad por Fallas de Terceros">
                <p>Escrivo no será responsable por interrupciones en el servicio ocasionadas por caídas globales de servidores de infraestructura externa (como AWS o Xertica) o bloqueos en las APIs de comunicación (como Meta/WhatsApp), ni por fallas de conectividad ajenas a nuestro control razonable.</p>
              </Section>

              <Section icon={Lock} tone="green" title="Cláusula 17 · Ventanas de Mantenimiento">
                <p>Nos reservamos el derecho de suspender temporalmente el acceso a la plataforma para realizar actualizaciones de código, parches de seguridad o mejoras operativas, dando aviso previo en la interfaz salvo en el caso de parches de seguridad urgentes.</p>
              </Section>

              <Section icon={Scale} tone="gold" title="Cláusula 18 · Límite Financiero de Responsabilidad">
                <p>En caso de que un tribunal determine alguna responsabilidad económica de Totot Estudio hacia el usuario, esta quedará estrictamente topada al monto equivalente a las mensualidades pagadas por el usuario en los últimos 3 meses de servicio, salvo en casos de dolo o mala fe acreditados.</p>
              </Section>

              <Section icon={AlertTriangle} tone="violet" title="Cláusula 19 · Prohibición de Ingeniería Inversa">
                <p>Queda estrictamente prohibido copiar, descompilar, extraer el código fuente o replicar los modelos de IA propietarios que dan vida a Escrivo. Su violación constituye una infracción a la Ley Federal del Derecho de Autor y a la Ley Federal de Protección a la Propiedad Industrial.</p>
              </Section>

              <Section icon={Shield} tone="blue" title="Cláusula 20 · Suspensión por Uso Indebido">
                <p>Nos reservamos el derecho unilateral de suspender o dar de baja cuentas que realicen actividades sospechosas, inyección de código malicioso o vulneración perimetral del sistema, notificando al usuario cuando las circunstancias lo permitan.</p>
              </Section>

              <Section icon={Shield} tone="gold" title="Limitación General de Responsabilidad">
                <p className="tc-sub-label" style={{ marginTop: 0 }}>Escrivo no será responsable por:</p>
                <Bullet>Decisiones médicas tomadas con base en las notas o documentos generados por la plataforma.</Bullet>
                <Bullet>Pérdida de datos causada por fuerza mayor, fallas de terceros proveedores de infraestructura, o negligencia del usuario en la gestión de sus credenciales.</Bullet>
                <Bullet>Interrupciones del servicio debidas a mantenimiento programado o eventos imprevistos.</Bullet>
                <Bullet>Daños indirectos, incidentales, especiales o consecuentes derivados del uso o imposibilidad de uso del servicio.</Bullet>
              </Section>

              <Section icon={Mail} tone="green" title="Jurisdicción y Ley Aplicable">
                <p>Los presentes Términos se rigen por las leyes de los <strong>Estados Unidos Mexicanos</strong>. Para la resolución de controversias, las partes se someten expresamente a la jurisdicción de los tribunales competentes de <strong>Toluca, Estado de México, o de la Ciudad de México</strong>, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros. Contacto legal: <strong>legal@escrivo.com.mx</strong>.</p>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Footer */}
        <div className="tc-contact">
          <h3>¿Tienes preguntas sobre estos términos?</h3>
          <p>Nuestro equipo de privacidad y legal está disponible para resolver cualquier duda.</p>
          <div className="tc-contact-actions">
            <a href="mailto:privacidad@escrivo.com.mx" className="tc-contact-link tc-contact-link-fill">
              <Mail size={16} /> privacidad@escrivo.com.mx
            </a>
            <a href="mailto:legal@escrivo.com.mx" className="tc-contact-link tc-contact-link-outline">
              <Shield size={16} /> legal@escrivo.com.mx
            </a>
          </div>
          <p className="tc-contact-foot">
            Totot Estudio S.A.S. de C.V. · Marca Escrivo · Estados Unidos Mexicanos · Escrivo © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
