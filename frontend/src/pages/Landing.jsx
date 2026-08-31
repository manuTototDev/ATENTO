import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Mic, FileText, Lock, Users, Calendar, Sparkles,
  Stethoscope, Receipt, Wallet, ShieldCheck, TrendingUp,
} from 'lucide-react';
import './Landing.css';

const EASE = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const Reveal = ({ as: Tag = motion.div, className, children, variants = fadeUp, ...rest }) => (
  <Tag
    className={className}
    variants={variants}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: '-100px' }}
    {...rest}
  >
    {children}
  </Tag>
);

const scenarios = [
  {
    p: "Sí doctor, me duele el estómago desde ayer en la noche y he tenido muchos gases.",
    d: "¿Has tenido fiebre o náuseas con el dolor?",
    soap: "Paciente refiere dolor abdominal de 24 hrs de evolución asociado a flatulencias. A la interrogación, se indaga sobre presencia de fiebre o náuseas.",
  },
  {
    p: "Me he sentido muy mareada al levantarme y como que me zumban los oídos.",
    d: "Vamos a tomar la presión. Probablemente esté un poco alta por el estrés.",
    soap: "Paciente presenta mareos ortostáticos y acúfenos. Se procederá a toma de tensión arterial por probable hipertensión asociada a estrés.",
  },
  {
    p: "A mi niño le empezaron a salir unas ronchitas rojas en los brazos hace 3 días, y le dan mucha comezón.",
    d: "¿Ha comido algo diferente o usado algún jabón nuevo últimamente?",
    soap: "Pediátrico presenta exantema pruriginoso en extremidades superiores de 3 días de evolución. Se interroga sobre posibles alérgenos.",
  },
  {
    p: "Sigo sintiendo opresión en el pecho cuando subo escaleras, pero ya no me falta tanto el aire.",
    d: "Es buena señal. Continuaremos con el mismo tratamiento cardiológico un mes más.",
    soap: "Paciente refiere persistencia de opresión torácica de esfuerzo, con mejoría de disnea. Se indica continuar con esquema actual por 1 mes.",
  },
];

const prescriptionScenarios = [
  {
    p1: "Me duele mucho la cabeza y tengo algo de fiebre desde ayer.",
    d1: "Comprendo. ¿La fiebre ha bajado en algún momento?",
    p2: "No, me tomé un té pero sigo igual, me siento muy débil.",
    d2: "Te voy a recetar Paracetamol de 500mg, tómate una tableta cada 8 horas por 3 días.",
    rx: "PACIENTE: A. Martínez (34 años)\nMOTIVO DE CONSULTA: Cefalea y fiebre sostenida.\nEVALUACIÓN CLÍNICA: Paciente refiere astenia y cuadro febril sin respuesta a remedios caseros. Probable infección viral.\n\nPLAN Y TRATAMIENTO:\n• Paracetamol 500mg\n  Tomar 1 tableta cada 8 hrs por 3 días.",
  },
  {
    p1: "Doctor, tengo mucha tos con flema y me duele al tragar.",
    d1: "¿La flema es de color verde o amarillenta?",
    p2: "Sí, es amarillenta, y siento el pecho muy congestionado.",
    d2: "Es una infección. Te daré Amoxicilina de 500mg, una cápsula cada 8 horas por 7 días.",
    rx: "PACIENTE: C. López (42 años)\nMOTIVO DE CONSULTA: Tos productiva y odinofagia.\nEVALUACIÓN CLÍNICA: Refiere esputo purulento amarillento y congestión. Faringoamigdalitis bacteriana.\n\nPLAN Y TRATAMIENTO:\n• Amoxicilina 500mg\n  Tomar 1 cápsula cada 8 hrs por 7 días.",
  },
  {
    p1: "Siento mucho ardor al orinar y me quedo con ganas de seguir yendo.",
    d1: "¿Te duele la espalda baja o has tenido escalofríos?",
    p2: "La espalda no me duele, pero sí he tenido como asco en la mañana.",
    d2: "Parece una infección urinaria baja. Te indicaré Ciprofloxacino por 5 días.",
    rx: "PACIENTE: S. Gómez (28 años)\nMOTIVO DE CONSULTA: Disuria y tenesmo vesical.\nEVALUACIÓN CLÍNICA: Refiere sintomatología urinaria baja acompañada de náusea leve sin fiebre. Probable IVU aguda.\n\nPLAN Y TRATAMIENTO:\n• Ciprofloxacino 500mg\n  Tomar 1 tableta cada 12 hrs por 5 días.",
  },
  {
    p1: "Mi bebé tiene 3 días con mucha diarrea líquida y no quiere comer.",
    d1: "¿Ha tolerado los líquidos o vomita lo que toma?",
    p2: "Sí toma agua, pero hace popó casi inmediato. Huele un poco ácido.",
    d2: "Le enviaremos Vida Suero Oral a libre demanda y probióticos por 5 días.",
    rx: "PACIENTE: R. Pérez (1 año 2 meses)\nMOTIVO DE CONSULTA: Diarrea y anorexia.\nEVALUACIÓN CLÍNICA: Madre refiere evacuaciones líquidas abundantes sin vómito. Gastroenteritis aguda no complicada.\n\nPLAN Y TRATAMIENTO:\n• Vida Suero Oral: A libre demanda.\n• Enterogermina: 1 ampolleta cada 24 hrs por 5 días.",
  },
  {
    p1: "Me salió una mancha muy roja en el brazo y pica muchísimo.",
    d1: "¿Estuviste en contacto con plantas, solventes o algún animal?",
    p2: "Fui al bosque el fin de semana. Empezó chiquita y se hizo grande.",
    d2: "Es dermatitis por contacto. Aplica crema de Hidrocortisona al 1% dos veces al día.",
    rx: "PACIENTE: M. Rojas (25 años)\nMOTIVO DE CONSULTA: Lesión eritematosa en extremidad.\nEVALUACIÓN CLÍNICA: Refiere exposición a flora silvestre. Placa pruriginosa con crecimiento centrífugo. Dermatitis por contacto.\n\nPLAN Y TRATAMIENTO:\n• Hidrocortisona 1% Crema\n  Aplicar capa fina 2 veces al día por 5 días.",
  },
  {
    p1: "Llevo días que no puedo dormir, me despierto con el corazón a mil por hora.",
    d1: "¿Estás pasando por algún evento estresante en el trabajo o familia?",
    p2: "Sí, me acaban de despedir y no dejo de pensar en las deudas.",
    d2: "Estás cursando con crisis de ansiedad. Te indicaré un ansiolítico ligero.",
    rx: "PACIENTE: J. Silva (45 años)\nMOTIVO DE CONSULTA: Insomnio y palpitaciones nocturnas.\nEVALUACIÓN CLÍNICA: Paciente refiere cuadro de estrés agudo secundario a pérdida de empleo. Crisis de ansiedad agudizada.\n\nPLAN Y TRATAMIENTO:\n• Clonazepam 0.25mg\n  Tomar 1/2 tableta por las noches.",
  },
  {
    p1: "Doctor, me torcí el tobillo bajando la escalera y lo tengo muy hinchado.",
    d1: "¿Puedes apoyar el pie o el dolor es insoportable al pisar?",
    p2: "Duele muchísimo, tengo que caminar cojeando apoyándome en las paredes.",
    d2: "Requiere reposo absoluto y Diclofenaco de 100mg cada 12 horas.",
    rx: "PACIENTE: F. Castillo (39 años)\nMOTIVO DE CONSULTA: Trauma en miembro inferior.\nEVALUACIÓN CLÍNICA: Refiere inversión forzada. Presenta edema y marcha claudicante. Esguince de tobillo grado II.\n\nPLAN Y TRATAMIENTO:\n• Diclofenaco 100mg\n  Tomar 1 tableta cada 12 hrs por 5 días. Reposo.",
  },
  {
    p1: "Siento un dolor punzante en la baja espalda que baja hasta la pierna.",
    d1: "¿El dolor empeora cuando pasas mucho tiempo sentado o al agacharte?",
    p2: "Sí, trabajar en la computadora es un suplicio. Siento toques eléctricos.",
    d2: "Es probable ciática. Tomarás Complejo B y Meloxicam por una semana.",
    rx: "PACIENTE: L. Ruiz (52 años)\nMOTIVO DE CONSULTA: Lumbalgia irradiada.\nEVALUACIÓN CLÍNICA: Refiere parestesias al sedentarismo prolongado. Probable radiculopatía lumbar (Ciática).\n\nPLAN Y TRATAMIENTO:\n• Meloxicam 15mg: 1 tableta al día.\n• Tribedoce: 1 tableta al día por 7 días.",
  },
  {
    p1: "Tengo mucha acidez después de comer, como si me quemara hasta la garganta.",
    d1: "¿Suele empeorar al acostarte o comer cosas grasosas?",
    p2: "Sí, las noches son terribles. Ya ni el antiácido me ayuda.",
    d2: "Vamos a iniciar con Omeprazol de 20mg en ayunas durante un mes.",
    rx: "PACIENTE: D. Hernández (41 años)\nMOTIVO DE CONSULTA: Pirosis intensa y reflujo nocturno.\nEVALUACIÓN CLÍNICA: Refiere acidez resistente a tratamiento convencional. Enfermedad por Reflujo Gastroesofágico (ERGE).\n\nPLAN Y TRATAMIENTO:\n• Omeprazol 20mg\n  Tomar 1 cápsula en ayunas por 30 días.",
  },
  {
    p1: "Traigo el ojo derecho súper rojo, con lagañas y siento que tengo tierrita.",
    d1: "¿La visión se ha vuelto borrosa o tienes sensibilidad a la luz?",
    p2: "No borrosa, pero sí me cala mucho la luz del sol cuando salgo.",
    d2: "Es conjuntivitis bacteriana. Usa gotas de Tobramicina cada 4 horas.",
    rx: "PACIENTE: P. Vargas (19 años)\nMOTIVO DE CONSULTA: Hiperemia conjuntival y secreción.\nEVALUACIÓN CLÍNICA: Refiere sensación de cuerpo extraño y fotofobia sin alteración visual. Conjuntivitis bacteriana.\n\nPLAN Y TRATAMIENTO:\n• Tobramicina Gotas\n  Aplicar 2 gotas en ojo derecho cada 4 hrs por 7 días.",
  },
];

const steps = [
  {
    icon: Mic, tone: 'blue', num: '01',
    title: 'Escucha',
    text: 'Activa el micrófono al iniciar la consulta. Escrivo transcribe la conversación en tiempo real, sin que tengas que dejar de ver a tu paciente.',
  },
  {
    icon: Stethoscope, tone: 'green', num: '02',
    title: 'Estructura',
    text: 'La IA convierte la conversación en nota SOAP, extrae tratamientos e indicaciones, y actualiza el expediente del paciente automáticamente.',
  },
  {
    icon: Receipt, tone: 'gold', num: '03',
    title: 'Cobra y receta',
    text: 'Calcula el cobro según tu tabulador (tarifa base, nocturna o de fin de semana) y genera la receta lista para imprimir.',
  },
];

const suiteItems = [
  {
    id: 'pacientes', icon: Users, tone: 'blue',
    title: 'Control de pacientes',
    text: 'Directorio centralizado con información demográfica, contacto y antecedentes clínicos siempre a la mano.',
  },
  {
    id: 'historial', icon: FileText, tone: 'green',
    title: 'Historial clínico',
    text: 'Notas SOAP, diagnósticos y recetas guardadas de forma cronológica y segura, generadas por la IA en cada consulta.',
  },
  {
    id: 'agenda', icon: Calendar, tone: 'violet',
    title: 'Gestión de citas',
    text: 'Agenda conectada a tus expedientes: agrega, reprograma o cancela citas sin cambiar de pantalla.',
  },
  {
    id: 'negocio', icon: Wallet, tone: 'gold',
    title: 'Negocio, en un solo lugar',
    text: 'Tabulador de precios, inventario de medicamentos y analítica de ingresos de tu consultorio, siempre actualizados.',
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [typedP, setTypedP] = useState('');
  const [typedD, setTypedD] = useState('');
  const [showSOAP, setShowSOAP] = useState(false);

  const [rxScenarioIndex, setRxScenarioIndex] = useState(0);
  const [typedRxP1, setTypedRxP1] = useState('');
  const [typedRxD1, setTypedRxD1] = useState('');
  const [typedRxP2, setTypedRxP2] = useState('');
  const [typedRxD2, setTypedRxD2] = useState('');
  const [showRx, setShowRx] = useState(false);

  const [activeSuite, setActiveSuite] = useState('pacientes');

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSuite(prev => {
        const idx = suiteItems.findIndex(s => s.id === prev);
        return suiteItems[(idx + 1) % suiteItems.length].id;
      });
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let pIndex = 0;
    let dIndex = 0;
    let isRunning = true;
    let currentIndex = 0;

    const run = async () => {
      while (isRunning) {
        const s = scenarios[currentIndex];

        while (pIndex <= s.p.length && isRunning) {
          setTypedP(s.p.slice(0, pIndex));
          pIndex++;
          await new Promise(r => setTimeout(r, 28));
        }
        if (!isRunning) break;
        await new Promise(r => setTimeout(r, 400));

        while (dIndex <= s.d.length && isRunning) {
          setTypedD(s.d.slice(0, dIndex));
          dIndex++;
          await new Promise(r => setTimeout(r, 28));
        }
        if (!isRunning) break;
        await new Promise(r => setTimeout(r, 500));

        if (isRunning) setShowSOAP(true);
        await new Promise(r => setTimeout(r, 5000));

        if (isRunning) {
          setShowSOAP(false);
          await new Promise(r => setTimeout(r, 500));
          setTypedP('');
          setTypedD('');
          pIndex = 0;
          dIndex = 0;
          currentIndex = (currentIndex + 1) % scenarios.length;
          setScenarioIndex(currentIndex);
          await new Promise(r => setTimeout(r, 500));
        }
      }
    };

    run();
    return () => { isRunning = false; };
  }, []);

  useEffect(() => {
    let p1 = 0, d1 = 0, p2 = 0, d2 = 0;
    let isRunning = true;
    let currentIndex = 0;

    const run = async () => {
      while (isRunning) {
        const s = prescriptionScenarios[currentIndex];

        while (p1 <= s.p1.length && isRunning) { setTypedRxP1(s.p1.slice(0, p1)); p1++; await new Promise(r => setTimeout(r, 18)); }
        if (!isRunning) break;
        await new Promise(r => setTimeout(r, 280));

        while (d1 <= s.d1.length && isRunning) { setTypedRxD1(s.d1.slice(0, d1)); d1++; await new Promise(r => setTimeout(r, 18)); }
        if (!isRunning) break;
        await new Promise(r => setTimeout(r, 280));

        while (p2 <= s.p2.length && isRunning) { setTypedRxP2(s.p2.slice(0, p2)); p2++; await new Promise(r => setTimeout(r, 18)); }
        if (!isRunning) break;
        await new Promise(r => setTimeout(r, 280));

        while (d2 <= s.d2.length && isRunning) { setTypedRxD2(s.d2.slice(0, d2)); d2++; await new Promise(r => setTimeout(r, 18)); }
        if (!isRunning) break;
        await new Promise(r => setTimeout(r, 700));

        if (isRunning) setShowRx(true);
        await new Promise(r => setTimeout(r, 5000));

        if (isRunning) {
          setShowRx(false);
          await new Promise(r => setTimeout(r, 600));
          setTypedRxP1(''); setTypedRxD1(''); setTypedRxP2(''); setTypedRxD2('');
          p1 = d1 = p2 = d2 = 0;
          currentIndex = (currentIndex + 1) % prescriptionScenarios.length;
          setRxScenarioIndex(currentIndex);
          await new Promise(r => setTimeout(r, 500));
        }
      }
    };

    run();
    return () => { isRunning = false; };
  }, []);

  return (
    <div className="lp">
      <nav className={`lp-nav${isScrolled ? ' is-scrolled' : ''}`}>
        <button className="lp-logo" onClick={() => navigate('/')}>Escrivo.</button>
        <div className="lp-nav-actions">
          <button className="lp-btn lp-btn-ghost" onClick={() => navigate('/login')}>Iniciar sesión</button>
          <button className="lp-btn lp-btn-dark" onClick={() => navigate('/register')}>
            Empezar gratis <ArrowRight size={17} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="lp-hero">
        <div className="lp-container lp-hero-grid">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp} className="lp-eyebrow-chip">
              <span className="lp-eyebrow-dot" /> <Sparkles size={14} /> IA médica en tiempo real
            </motion.div>
            <motion.h1 variants={fadeUp}>
              Tu consulta, <br /><span className="lp-accent">humana</span> de nuevo.
            </motion.h1>
            <motion.p variants={fadeUp} className="lp-lead">
              La IA que escribe por ti. Escrivo escucha tu consulta, redacta la nota SOAP, actualiza el expediente y prepara la receta y el cobro automáticamente. Recupera hasta 2 horas de tu día.
            </motion.p>
            <motion.div variants={fadeUp} className="lp-hero-actions">
              <button className="lp-btn lp-btn-dark lp-btn-lg" onClick={() => navigate('/register')}>
                Prueba Escrivo <ArrowRight size={20} />
              </button>
              <span className="lp-hero-trust"><ShieldCheck size={16} /> Sin tarjeta de crédito</span>
            </motion.div>
          </motion.div>

          <Reveal variants={fadeUp} className="lp-hero-card" style={{ transitionDelay: '0.1s' }}>
            <div className="lp-hero-mic"><Mic size={22} /></div>
            <div className="lp-hero-card-label">Escuchando consulta…</div>
            <div className="lp-wave">
              <span /><span /><span /><span /><span /><span />
            </div>
            <div className="lp-hero-card-stats">
              <div className="lp-hero-stat"><b>~2h</b><span>Recuperadas al día</span></div>
              <div className="lp-hero-stat"><b>100%</b><span>Notas SOAP estructuradas</span></div>
            </div>
          </Reveal>
        </div>
      </header>

      {/* Cómo funciona */}
      <section className="lp-steps">
        <div className="lp-container">
          <Reveal className="lp-section-head">
            <div className="lp-eyebrow">Cómo funciona</div>
            <h2>De la voz a un expediente listo, en tres pasos.</h2>
            <p>Sin capturar nada a mano. Sin cambiar de aplicación. Solo la consulta y tu paciente.</p>
          </Reveal>

          <Reveal as={motion.div} variants={stagger} className="lp-steps-grid">
            {steps.map((s) => (
              <motion.div key={s.title} variants={fadeUp} className="lp-step-card">
                <div className="lp-step-num">{s.num}</div>
                <div className={`lp-step-icon ${s.tone}`}><s.icon size={24} /></div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Demo oscuro — manchas de color */}
      <section className="lp-demo">
        <div className="lp-demo-blobs">
          <div className="lp-blob lp-blob--a" />
          <div className="lp-blob lp-blob--b" />
          <div className="lp-blob lp-blob--c" />
        </div>

        <div className="lp-container lp-demo-grid">
          <Reveal className="lp-section-head lp-section-head--light" style={{ marginBottom: 0 }}>
            <div className="lp-eyebrow">Escucha. Entiende. Escribe.</div>
            <h2>La consulta se transcribe sola, mientras tú sigues siendo médico.</h2>
            <p>La IA procesa el audio en tiempo real, entiende el contexto clínico y extrae lo relevante para estructurar una nota SOAP precisa, sin que dictes nada por separado.</p>
          </Reveal>

          <Reveal variants={fadeUp} className="lp-demo-panel" style={{ transitionDelay: '0.1s' }}>
            <div className="lp-demo-listening">
              <div className="lp-demo-mic"><Mic size={18} /></div>
              <span>Escuchando consulta...</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', zIndex: 2, position: 'relative' }}>
              <div className="lp-bubble lp-bubble-patient">
                <span className="lp-bubble-label-patient">Paciente:</span>
                {typedP}
                {typedP.length < scenarios[scenarioIndex].p.length && <span className="lp-caret">&nbsp;</span>}
              </div>

              {typedP.length === scenarios[scenarioIndex].p.length && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="lp-bubble lp-bubble-doctor">
                  <span className="lp-bubble-label-doctor">Doctor:</span>
                  {typedD}
                  {typedD.length < scenarios[scenarioIndex].d.length && <span className="lp-caret">&nbsp;</span>}
                </motion.div>
              )}
            </div>

            <AnimatePresence>
              {showSOAP && (
                <motion.div
                  className="lp-demo-soap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <b>Subjetivo (SOAP):</b>
                  <span>{scenarios[scenarioIndex].soap}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Reveal>
        </div>
      </section>

      {/* De la conversación a la receta + cobro automático */}
      <section className="lp-rx">
        <div className="lp-container lp-rx-grid">
          <Reveal variants={fadeUp} className="lp-rx-panel">
            <div className={`lp-rx-chat${showRx ? ' is-collapsed' : ''}`}>
              <div className="lp-rx-bubble lp-rx-bubble-p">
                {typedRxP1}
                {typedRxP1.length < prescriptionScenarios[rxScenarioIndex].p1.length && <span className="lp-caret">&nbsp;</span>}
              </div>
              {typedRxP1.length === prescriptionScenarios[rxScenarioIndex].p1.length && (
                <div className="lp-rx-bubble lp-rx-bubble-d">
                  {typedRxD1}
                  {typedRxD1.length < prescriptionScenarios[rxScenarioIndex].d1.length && <span className="lp-caret">&nbsp;</span>}
                </div>
              )}
              {typedRxD1.length === prescriptionScenarios[rxScenarioIndex].d1.length && (
                <div className="lp-rx-bubble lp-rx-bubble-p">
                  {typedRxP2}
                  {typedRxP2.length < prescriptionScenarios[rxScenarioIndex].p2.length && <span className="lp-caret">&nbsp;</span>}
                </div>
              )}
              {typedRxP2.length === prescriptionScenarios[rxScenarioIndex].p2.length && (
                <div className="lp-rx-bubble lp-rx-bubble-d">
                  {typedRxD2}
                  {typedRxD2.length < prescriptionScenarios[rxScenarioIndex].d2.length && <span className="lp-caret">&nbsp;</span>}
                </div>
              )}
            </div>

            <div className="lp-rx-doc" style={{ bottom: showRx ? '5%' : '-110%', opacity: showRx ? 1 : 0 }}>
              <div className="lp-rx-doc-head">
                <h3>Receta y evaluación médica</h3>
                <span>ESCRIVO HEALTHCARE AI</span>
              </div>
              <div className="lp-rx-doc-body">{prescriptionScenarios[rxScenarioIndex].rx}</div>
              <div className="lp-rx-doc-cost"><Receipt size={14} /> Cobro calculado automáticamente según tu tabulador</div>
            </div>
          </Reveal>

          <Reveal className="lp-rx-copy">
            <div className="lp-eyebrow">De la conversación a la receta</div>
            <h2>Deja de ser capturista y vuelve a ser médico.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.65, marginTop: '1.25rem' }}>
              La tecnología no debería interponerse entre tú y quien confía en ti. Escrivo escucha, analiza y estructura tu consulta, dejándote recuperar la mirada y la conexión con tu paciente.
            </p>
            <div className="lp-rx-billing-note">
              <TrendingUp size={20} color="var(--pop-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p>Cada consulta calcula su propio cobro: <strong>tarifa base, nocturna o de fin de semana</strong>, según tu tabulador y la hora en que atendiste. No hay que hacer cuentas.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Todo en uno */}
      <section className="lp-suite">
        <div className="lp-container">
          <Reveal className="lp-section-head" style={{ margin: '0 auto clamp(2.5rem, 6vw, 4rem)', textAlign: 'center', maxWidth: '620px' }}>
            <div className="lp-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>Gestión todo en uno</div>
            <h2>Control absoluto de tu consultorio.</h2>
            <p>Pacientes, historial, agenda y negocio conectados entre sí. Olvídate de tener software desconectado.</p>
          </Reveal>

          <div className="lp-suite-grid">
            <Reveal as={motion.div} variants={stagger} className="lp-suite-list">
              {suiteItems.map((item) => (
                <motion.button
                  key={item.id}
                  variants={fadeUp}
                  className={`lp-suite-item${activeSuite === item.id ? ' active' : ''}`}
                  onClick={() => setActiveSuite(item.id)}
                >
                  <div className="lp-suite-item-head">
                    <div className={`lp-suite-icon ${item.tone}`}><item.icon size={22} /></div>
                    <h3>{item.title}</h3>
                  </div>
                  <p>{item.text}</p>
                </motion.button>
              ))}
            </Reveal>

            <Reveal variants={fadeUp} className="lp-suite-visual">
              <AnimatePresence mode="wait">
                {activeSuite === 'pacientes' && (
                  <motion.div key="pacientes" className="lp-mock-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease: EASE }}>
                    <div className="lp-mock-search">Buscar paciente...</div>
                    <div className="lp-mock-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="lp-mock-avatar" style={{ background: 'var(--pop-blue)' }}>CL</div>
                        <div><div className="lp-mock-name">Carlos López</div><div className="lp-mock-sub">42 años • O+</div></div>
                      </div>
                    </div>
                    <div className="lp-mock-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="lp-mock-avatar" style={{ background: 'var(--pop-green)' }}>JS</div>
                        <div><div className="lp-mock-name">Julia Silva</div><div className="lp-mock-sub">45 años • A-</div></div>
                      </div>
                    </div>
                    <div className="lp-mock-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="lp-mock-avatar" style={{ background: 'var(--pop-gold)' }}>RP</div>
                        <div><div className="lp-mock-name">Roberto Pérez</div><div className="lp-mock-sub">1 año • B+</div></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSuite === 'historial' && (
                  <motion.div key="historial" className="lp-mock-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease: EASE }}>
                    <div className="lp-mock-soap">
                      <div className="lp-mock-soap-head">
                        <div className="lp-mock-soap-date">14 MAYO 2026</div>
                        <div className="lp-mock-soap-title">Faringoamigdalitis</div>
                      </div>
                      <div className="lp-mock-soap-row"><b>S:</b> <span>Odinofagia y tos productiva.</span></div>
                      <div className="lp-mock-soap-row"><b>O:</b> <span>Eritema faríngeo y fiebre 38.5°C.</span></div>
                      <div className="lp-mock-soap-row"><b>A:</b> <span>Faringoamigdalitis aguda.</span></div>
                      <div className="lp-mock-soap-row lp-mock-soap-rx"><b style={{ color: 'var(--pop-green)' }}>Rx:</b> <span style={{ color: 'var(--pop-green)', fontWeight: 600 }}>Amoxicilina 500mg</span></div>
                    </div>
                  </motion.div>
                )}

                {activeSuite === 'agenda' && (
                  <motion.div key="agenda" className="lp-mock-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease: EASE }}>
                    <div className="lp-mock-calendar">
                      {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                        <div key={i} className="lp-mock-calendar-day">{day}</div>
                      ))}
                      {[...Array(14)].map((_, i) => (
                        <div key={i} className={`lp-mock-calendar-cell${i === 9 ? ' active' : ''}`}>{i + 5}</div>
                      ))}
                    </div>
                    <div className="lp-mock-appt">
                      <div className="lp-mock-appt-time">16:00 - 16:30</div>
                      <div className="lp-mock-appt-name">Carlos López</div>
                      <div className="lp-mock-appt-reason">Consulta de seguimiento</div>
                    </div>
                  </motion.div>
                )}

                {activeSuite === 'negocio' && (
                  <motion.div key="negocio" className="lp-mock-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease: EASE }}>
                    <div className="lp-mock-biz-stats">
                      <div className="lp-mock-biz-stat"><b>$18,400</b><span>Ingresos del mes</span></div>
                      <div className="lp-mock-biz-stat"><b>32</b><span>Consultas cobradas</span></div>
                    </div>
                    <div className="lp-mock-biz-chart">
                      {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
                        <div key={i} className="lp-mock-biz-bar" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Confianza */}
      <section className="lp-trust">
        <div className="lp-container lp-trust-grid">
          <Reveal>
            <div className="lp-eyebrow-chip"><Lock size={14} /> Privacidad por diseño</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Lo que se dice en consulta, se queda en consulta.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.65, marginTop: '1.25rem' }}>
              La tecnología debe protegerte, no exponerte. Escrivo opera bajo cifrado de grado clínico y cumple con los estándares de protección de datos de salud más estrictos.
            </p>

            <div className="lp-trust-list">
              <div className="lp-trust-item">
                <div className="lp-trust-dot" />
                <div>
                  <h4>Aislamiento por consultorio</h4>
                  <p>Los expedientes de cada médico están lógicamente separados: nadie puede acceder a pacientes que no le pertenecen.</p>
                </div>
              </div>
              <div className="lp-trust-item">
                <div className="lp-trust-dot" style={{ background: 'var(--pop-violet)' }} />
                <div>
                  <h4>Capa analítica anonimizada</h4>
                  <p>Tus métricas de ingresos y diagnósticos se calculan sobre una copia de datos sin nombres ni identificadores, nunca al revés.</p>
                </div>
              </div>
              <div className="lp-trust-item">
                <div className="lp-trust-dot" style={{ background: 'var(--pop-green)' }} />
                <div>
                  <h4>Cifrado en tránsito y en reposo</h4>
                  <p>Toda la información viaja y se guarda cifrada, con contraseñas resguardadas mediante hash y acceso restringido por diseño.</p>
                </div>
              </div>
            </div>

            <div className="lp-trust-badges">
              <span className="lp-trust-badge">TLS 1.3</span>
              <span className="lp-trust-badge">AES-256</span>
              <span className="lp-trust-badge">bcrypt</span>
            </div>
          </Reveal>

          <Reveal variants={fadeUp} className="lp-trust-visual">
            <div className="lp-trust-ring lp-trust-ring--a" />
            <div className="lp-trust-ring lp-trust-ring--b" />
            <div className="lp-trust-docs">
              <div className="lp-trust-doc">
                <div className="lp-trust-doc-top">
                  <div className="lp-trust-doc-bar" style={{ width: '40%' }} />
                  <Lock size={16} color="var(--pop-green)" />
                </div>
                <div className="lp-trust-doc-bar" style={{ width: '100%' }} />
                <div className="lp-trust-doc-bar" style={{ width: '80%', marginBottom: 0 }} />
              </div>
              <div className="lp-trust-doc">
                <div className="lp-trust-doc-top">
                  <div className="lp-trust-doc-bar" style={{ width: '60%' }} />
                  <Lock size={16} color="var(--pop-green)" />
                </div>
                <div className="lp-trust-doc-bar" style={{ width: '90%' }} />
                <div className="lp-trust-doc-bar" style={{ width: '70%', marginBottom: 0 }} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA final */}
      <section className="lp-final">
        <div className="lp-final-glow" />
        <div className="lp-container">
          <Reveal>
            <h2>Vuelve a ser médico.</h2>
            <button className="lp-btn lp-btn-dark lp-btn-lg" onClick={() => navigate('/register')}>
              Comenzar ahora <ArrowRight size={20} />
            </button>
          </Reveal>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
          <div className="lp-footer-brand">Escrivo © 2026</div>
          <div className="lp-footer-links">
            <Link to="/terminos">Términos y Condiciones</Link>
            <span>Contacto</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
