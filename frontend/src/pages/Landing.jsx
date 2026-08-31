import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mic, FileText, Lock, Users, Calendar } from 'lucide-react';

// Animación de entrada consistente para todas las secciones (scroll-reveal)
const EASE = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }
};

const staggerGroup = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } }
};

const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }
};

const Landing = () => {
  const navigate = useNavigate();

  const scenarios = [
    {
      p: "Sí doctor, me duele el estómago desde ayer en la noche y he tenido muchos gases.",
      d: "¿Has tenido fiebre o náuseas con el dolor?",
      soap: "Paciente refiere dolor abdominal de 24 hrs de evolución asociado a flatulencias. A la interrogación, se indaga sobre presencia de fiebre o náuseas."
    },
    {
      p: "Me he sentido muy mareada al levantarme y como que me zumban los oídos.",
      d: "Vamos a tomar la presión. Probablemente esté un poco alta por el estrés.",
      soap: "Paciente presenta mareos ortostáticos y acúfenos. Se procederá a toma de tensión arterial por probable hipertensión asociada a estrés."
    },
    {
      p: "A mi niño le empezaron a salir unas ronchitas rojas en los brazos hace 3 días, y le dan mucha comezón.",
      d: "¿Ha comido algo diferente o usado algún jabón nuevo últimamente?",
      soap: "Pediátrico presenta exantema pruriginoso en extremidades superiores de 3 días de evolución. Se interroga sobre posibles alérgenos."
    },
    {
      p: "Sigo sintiendo opresión en el pecho cuando subo escaleras, pero ya no me falta tanto el aire.",
      d: "Es buena señal. Continuaremos con el mismo tratamiento cardiológico un mes más.",
      soap: "Paciente refiere persistencia de opresión torácica de esfuerzo, con mejoría de disnea. Se indica continuar con esquema actual por 1 mes."
    }
  ];

  const prescriptionScenarios = [
    {
      p1: "Me duele mucho la cabeza y tengo algo de fiebre desde ayer.",
      d1: "Comprendo. ¿La fiebre ha bajado en algún momento?",
      p2: "No, me tomé un té pero sigo igual, me siento muy débil.",
      d2: "Te voy a recetar Paracetamol de 500mg, tómate una tableta cada 8 horas por 3 días.",
      rx: "PACIENTE: A. Martínez (34 años)\nMOTIVO DE CONSULTA: Cefalea y fiebre sostenida.\nEVALUACIÓN CLÍNICA: Paciente refiere astenia y cuadro febril sin respuesta a remedios caseros. Probable infección viral.\n\nPLAN Y TRATAMIENTO:\n• Paracetamol 500mg\n  Tomar 1 tableta cada 8 hrs por 3 días."
    },
    {
      p1: "Doctor, tengo mucha tos con flema y me duele al tragar.",
      d1: "¿La flema es de color verde o amarillenta?",
      p2: "Sí, es amarillenta, y siento el pecho muy congestionado.",
      d2: "Es una infección. Te daré Amoxicilina de 500mg, una cápsula cada 8 horas por 7 días.",
      rx: "PACIENTE: C. López (42 años)\nMOTIVO DE CONSULTA: Tos productiva y odinofagia.\nEVALUACIÓN CLÍNICA: Refiere esputo purulento amarillento y congestión. Faringoamigdalitis bacteriana.\n\nPLAN Y TRATAMIENTO:\n• Amoxicilina 500mg\n  Tomar 1 cápsula cada 8 hrs por 7 días."
    },
    {
      p1: "Siento mucho ardor al orinar y me quedo con ganas de seguir yendo.",
      d1: "¿Te duele la espalda baja o has tenido escalofríos?",
      p2: "La espalda no me duele, pero sí he tenido como asco en la mañana.",
      d2: "Parece una infección urinaria baja. Te indicaré Ciprofloxacino por 5 días.",
      rx: "PACIENTE: S. Gómez (28 años)\nMOTIVO DE CONSULTA: Disuria y tenesmo vesical.\nEVALUACIÓN CLÍNICA: Refiere sintomatología urinaria baja acompañada de náusea leve sin fiebre. Probable IVU aguda.\n\nPLAN Y TRATAMIENTO:\n• Ciprofloxacino 500mg\n  Tomar 1 tableta cada 12 hrs por 5 días."
    },
    {
      p1: "Mi bebé tiene 3 días con mucha diarrea líquida y no quiere comer.",
      d1: "¿Ha tolerado los líquidos o vomita lo que toma?",
      p2: "Sí toma agua, pero hace popó casi inmediato. Huele un poco ácido.",
      d2: "Le enviaremos Vida Suero Oral a libre demanda y probióticos por 5 días.",
      rx: "PACIENTE: R. Pérez (1 año 2 meses)\nMOTIVO DE CONSULTA: Diarrea y anorexia.\nEVALUACIÓN CLÍNICA: Madre refiere evacuaciones líquidas abundantes sin vómito. Gastroenteritis aguda no complicada.\n\nPLAN Y TRATAMIENTO:\n• Vida Suero Oral: A libre demanda.\n• Enterogermina: 1 ampolleta cada 24 hrs por 5 días."
    },
    {
      p1: "Me salió una mancha muy roja en el brazo y pica muchísimo.",
      d1: "¿Estuviste en contacto con plantas, solventes o algún animal?",
      p2: "Fui al bosque el fin de semana. Empezó chiquita y se hizo grande.",
      d2: "Es dermatitis por contacto. Aplica crema de Hidrocortisona al 1% dos veces al día.",
      rx: "PACIENTE: M. Rojas (25 años)\nMOTIVO DE CONSULTA: Lesión eritematosa en extremidad.\nEVALUACIÓN CLÍNICA: Refiere exposición a flora silvestre. Placa pruriginosa con crecimiento centrífugo. Dermatitis por contacto.\n\nPLAN Y TRATAMIENTO:\n• Hidrocortisona 1% Crema\n  Aplicar capa fina 2 veces al día por 5 días."
    },
    {
      p1: "Llevo días que no puedo dormir, me despierto con el corazón a mil por hora.",
      d1: "¿Estás pasando por algún evento estresante en el trabajo o familia?",
      p2: "Sí, me acaban de despedir y no dejo de pensar en las deudas.",
      d2: "Estás cursando con crisis de ansiedad. Te indicaré un ansiolítico ligero.",
      rx: "PACIENTE: J. Silva (45 años)\nMOTIVO DE CONSULTA: Insomnio y palpitaciones nocturnas.\nEVALUACIÓN CLÍNICA: Paciente refiere cuadro de estrés agudo secundario a pérdida de empleo. Crisis de ansiedad agudizada.\n\nPLAN Y TRATAMIENTO:\n• Clonazepam 0.25mg\n  Tomar 1/2 tableta por las noches."
    },
    {
      p1: "Doctor, me torcí el tobillo bajando la escalera y lo tengo muy hinchado.",
      d1: "¿Puedes apoyar el pie o el dolor es insoportable al pisar?",
      p2: "Duele muchísimo, tengo que caminar cojeando apoyándome en las paredes.",
      d2: "Requiere reposo absoluto y Diclofenaco de 100mg cada 12 horas.",
      rx: "PACIENTE: F. Castillo (39 años)\nMOTIVO DE CONSULTA: Trauma en miembro inferior.\nEVALUACIÓN CLÍNICA: Refiere inversión forzada. Presenta edema y marcha claudicante. Esguince de tobillo grado II.\n\nPLAN Y TRATAMIENTO:\n• Diclofenaco 100mg\n  Tomar 1 tableta cada 12 hrs por 5 días. Reposo."
    },
    {
      p1: "Siento un dolor punzante en la baja espalda que baja hasta la pierna.",
      d1: "¿El dolor empeora cuando pasas mucho tiempo sentado o al agacharte?",
      p2: "Sí, trabajar en la computadora es un suplicio. Siento toques eléctricos.",
      d2: "Es probable ciática. Tomarás Complejo B y Meloxicam por una semana.",
      rx: "PACIENTE: L. Ruiz (52 años)\nMOTIVO DE CONSULTA: Lumbalgia irradiada.\nEVALUACIÓN CLÍNICA: Refiere parestesias al sedentarismo prolongado. Probable radiculopatía lumbar (Ciática).\n\nPLAN Y TRATAMIENTO:\n• Meloxicam 15mg: 1 tableta al día.\n• Tribedoce: 1 tableta al día por 7 días."
    },
    {
      p1: "Tengo mucha acidez después de comer, como si me quemara hasta la garganta.",
      d1: "¿Suele empeorar al acostarte o comer cosas grasosas?",
      p2: "Sí, las noches son terribles. Ya ni el antiácido me ayuda.",
      d2: "Vamos a iniciar con Omeprazol de 20mg en ayunas durante un mes.",
      rx: "PACIENTE: D. Hernández (41 años)\nMOTIVO DE CONSULTA: Pirosis intensa y reflujo nocturno.\nEVALUACIÓN CLÍNICA: Refiere acidez resistente a tratamiento convencional. Enfermedad por Reflujo Gastroesofágico (ERGE).\n\nPLAN Y TRATAMIENTO:\n• Omeprazol 20mg\n  Tomar 1 cápsula en ayunas por 30 días."
    },
    {
      p1: "Traigo el ojo derecho súper rojo, con lagañas y siento que tengo tierrita.",
      d1: "¿La visión se ha vuelto borrosa o tienes sensibilidad a la luz?",
      p2: "No borrosa, pero sí me cala mucho la luz del sol cuando salgo.",
      d2: "Es conjuntivitis bacteriana. Usa gotas de Tobramicina cada 4 horas.",
      rx: "PACIENTE: P. Vargas (19 años)\nMOTIVO DE CONSULTA: Hiperemia conjuntival y secreción.\nEVALUACIÓN CLÍNICA: Refiere sensación de cuerpo extraño y fotofobia sin alteración visual. Conjuntivitis bacteriana.\n\nPLAN Y TRATAMIENTO:\n• Tobramicina Gotas\n  Aplicar 2 gotas en ojo derecho cada 4 hrs por 7 días."
    }
  ];

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [typedP, setTypedP] = useState("");
  const [typedD, setTypedD] = useState("");
  const [showSOAP, setShowSOAP] = useState(false);

  const [rxScenarioIndex, setRxScenarioIndex] = useState(0);
  const [typedRxP1, setTypedRxP1] = useState("");
  const [typedRxD1, setTypedRxD1] = useState("");
  const [typedRxP2, setTypedRxP2] = useState("");
  const [typedRxD2, setTypedRxD2] = useState("");
  const [showRx, setShowRx] = useState(false);

  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeatureIndex(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let pIndex = 0;
    let dIndex = 0;
    let isRunning = true;
    let currentIndex = 0;

    const runAnimation = async () => {
      // Loop infinito internamente controlado por currentIndex
      while (isRunning) {
        const currentScenario = scenarios[currentIndex];

        // Escribir Paciente
        while (pIndex <= currentScenario.p.length && isRunning) {
          setTypedP(currentScenario.p.slice(0, pIndex));
          pIndex++;
          await new Promise(r => setTimeout(r, 30)); // Typing speed
        }

        if (!isRunning) break;
        await new Promise(r => setTimeout(r, 400)); // Pause

        // Escribir Doctor
        while (dIndex <= currentScenario.d.length && isRunning) {
          setTypedD(currentScenario.d.slice(0, dIndex));
          dIndex++;
          await new Promise(r => setTimeout(r, 30));
        }

        if (!isRunning) break;
        await new Promise(r => setTimeout(r, 500)); // Pause

        if (isRunning) setShowSOAP(true);

        // Esperar a que el usuario lea el SOAP final
        await new Promise(r => setTimeout(r, 5000));

        if (isRunning) {
          setShowSOAP(false);
          await new Promise(r => setTimeout(r, 500)); // Fade out pause

          setTypedP("");
          setTypedD("");
          pIndex = 0;
          dIndex = 0;

          currentIndex = (currentIndex + 1) % scenarios.length;
          setScenarioIndex(currentIndex);

          await new Promise(r => setTimeout(r, 500)); // Pause before starting next scenario
        }
      }
    };

    runAnimation();

    return () => { isRunning = false; };
  }, []);

  useEffect(() => {
    let p1Index = 0;
    let d1Index = 0;
    let p2Index = 0;
    let d2Index = 0;
    let isRunning = true;
    let currentIndex = 0;

    const runRxAnimation = async () => {
      while (isRunning) {
        const currentScenario = prescriptionScenarios[currentIndex];

        // P1
        while (p1Index <= currentScenario.p1.length && isRunning) {
          setTypedRxP1(currentScenario.p1.slice(0, p1Index));
          p1Index++;
          await new Promise(r => setTimeout(r, 20));
        }
        if (!isRunning) break;
        await new Promise(r => setTimeout(r, 300));

        // D1
        while (d1Index <= currentScenario.d1.length && isRunning) {
          setTypedRxD1(currentScenario.d1.slice(0, d1Index));
          d1Index++;
          await new Promise(r => setTimeout(r, 20));
        }
        if (!isRunning) break;
        await new Promise(r => setTimeout(r, 300));

        // P2
        while (p2Index <= currentScenario.p2.length && isRunning) {
          setTypedRxP2(currentScenario.p2.slice(0, p2Index));
          p2Index++;
          await new Promise(r => setTimeout(r, 20));
        }
        if (!isRunning) break;
        await new Promise(r => setTimeout(r, 300));

        // D2
        while (d2Index <= currentScenario.d2.length && isRunning) {
          setTypedRxD2(currentScenario.d2.slice(0, d2Index));
          d2Index++;
          await new Promise(r => setTimeout(r, 20));
        }
        if (!isRunning) break;
        await new Promise(r => setTimeout(r, 800));

        if (isRunning) setShowRx(true);

        await new Promise(r => setTimeout(r, 5000));

        if (isRunning) {
          setShowRx(false);
          await new Promise(r => setTimeout(r, 600));

          setTypedRxP1("");
          setTypedRxD1("");
          setTypedRxP2("");
          setTypedRxD2("");
          p1Index = 0;
          d1Index = 0;
          p2Index = 0;
          d2Index = 0;
          currentIndex = (currentIndex + 1) % prescriptionScenarios.length;
          setRxScenarioIndex(currentIndex);
          await new Promise(r => setTimeout(r, 500));
        }
      }
    };

    runRxAnimation();

    return () => { isRunning = false; };
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--surface)', color: 'var(--text-dark)', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>

      <style>
        {`
          @keyframes pulse-mic {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.35); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(13, 148, 136, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes secure-sweep {
            0% { width: 0%; }
            50% { width: 100%; }
            100% { width: 0%; }
          }
          @keyframes ping {
            75%, 100% { transform: scale(1.5); opacity: 0; }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes spin-slow {
            100% { transform: rotate(360deg); }
          }

          .lm-nav-link {
            background: none;
            border: none;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            color: var(--text-dark);
            padding: 0.5rem 0.25rem;
            transition: color 0.2s ease;
          }
          .lm-nav-link:hover { color: var(--accent); }

          .lm-option {
            padding: clamp(1.25rem, 3vw, 2rem);
            border-radius: var(--radius-lg);
            cursor: pointer;
            transition: background-color 0.25s, border-color 0.25s, color 0.25s;
            background-color: transparent;
            color: var(--text-dark);
            border: 1px solid var(--border);
          }
          .lm-option:hover { border-color: var(--accent); background-color: var(--accent-light); }
          .lm-option.lm-option-active { background-color: var(--accent); color: #fff; border-color: var(--accent); }
          .lm-option.lm-option-active:hover { background-color: var(--accent-hover); }
          .lm-option p { color: var(--text-muted); transition: color 0.25s; }
          .lm-option.lm-option-active p { color: rgba(255,255,255,0.82); }

          .lm-footer-link {
            cursor: pointer;
            transition: color 0.2s ease;
            color: var(--text-muted);
            text-decoration: none;
          }
          .lm-footer-link:hover { color: var(--accent); }

          @media (max-width: 640px) {
            .lm-hero-cta, .lm-final-cta { width: 100%; justify-content: center; }
          }
        `}
      </style>

      {/* Navbar: Ultra minimal */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{ padding: '2rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)' }}
      >
        <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.05em' }}>
          Lemmatica.
        </div>
        <div style={{ display: 'flex', gap: 'clamp(1rem, 4vw, 2rem)', alignItems: 'center' }}>
          <button className="lm-nav-link" onClick={() => navigate('/login')}>Log in</button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15, ease: EASE }}
            onClick={() => navigate('/register')}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '100px', fontSize: 'clamp(0.9rem, 2vw, 1rem)', fontWeight: 500, padding: 'clamp(0.6rem, 2vw, 0.75rem) clamp(1.1rem, 3vw, 1.5rem)', cursor: 'pointer', boxShadow: 'var(--shadow-accent)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
          >
            Get Started
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero: Huge typography, high contrast, clean */}
      <header style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerGroup}
        >
          <motion.h1
            variants={staggerItem}
            className="font-display"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 8vw, 6rem)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: '2rem', maxWidth: '900px', color: 'var(--text-dark)' }}
          >
            Tu consulta, <br/> humana de nuevo.
          </motion.h1>
          <motion.p
            variants={staggerItem}
            style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: 1.5, marginBottom: '3rem' }}
          >
            La IA médica que escribe por ti. Lemmatica escucha tus consultas y redacta el expediente clínico y la receta automáticamente. Recupera hasta 2 horas de tu día y vuelve a disfrutar de la medicina.
          </motion.p>
          <motion.button
            variants={staggerItem}
            className="lm-hero-cta"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15, ease: EASE }}
            onClick={() => navigate('/register')}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '100px', fontSize: '1.125rem', fontWeight: 500, padding: '1rem 2.5rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-accent)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
          >
            Prueba Lemmatica <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </header>

      {/* Feature 1: Escucha. Entiende. Escribe. */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerGroup}
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '4rem 5%', backgroundColor: 'var(--primary)', backgroundImage: 'radial-gradient(circle at 85% 15%, rgba(13, 148, 136, 0.28), transparent 45%)', color: '#fff' }}
      >
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))', gap: '4rem', alignItems: 'center' }}>
          <motion.div variants={fadeUp}>
            <h2 className="font-display" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: '2rem', color: '#fff' }}>
              Escucha.<br/>Entiende.<br/>Escribe.
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#94A3B8', lineHeight: 1.6, maxWidth: '450px' }}>
              La IA procesa el audio de la consulta en tiempo real. Entiende el contexto clínico y extrae la información relevante para estructurar una nota SOAP perfecta.
            </p>
          </motion.div>

          {/* Animación de Globos de Transcripción */}
          <motion.div variants={fadeUp} style={{ height: '600px', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', padding: 'clamp(1.5rem, 4vw, 2.5rem)', justifyContent: 'flex-start', position: 'relative', overflow: 'hidden' }}>

             {/* Indicador de escucha */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse-mic 2s infinite' }}>
                 <Mic size={20} color="#fff" />
               </div>
               <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Escuchando consulta...</span>
             </div>

             {/* Conversación */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', width: '100%', zIndex: 2 }}>

               {/* Paciente */}
               <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.06)', borderRadius: '16px 16px 16px 0', color: '#E2E8F0', fontSize: '1.125rem', fontFamily: 'monospace', lineHeight: 1.5, alignSelf: 'flex-start', maxWidth: '90%', minHeight: '60px' }}>
                 <span style={{ color: 'var(--info)', fontWeight: 'bold', marginRight: '0.5rem' }}>Paciente:</span>
                 {typedP}
                 {typedP.length < scenarios[scenarioIndex].p.length && <span style={{ borderRight: '2px solid var(--accent)', animation: 'blink 1s infinite' }}>&nbsp;</span>}
               </div>

               {/* Doctor */}
               {typedP.length === scenarios[scenarioIndex].p.length && (
                 <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px 16px 0 16px', color: '#fff', fontSize: '1.125rem', fontFamily: 'monospace', lineHeight: 1.5, alignSelf: 'flex-end', maxWidth: '90%', minHeight: '60px', animation: 'fade-in-up 0.3s ease-out' }}>
                   <span style={{ color: 'var(--accent)', fontWeight: 'bold', marginRight: '0.5rem' }}>Doctor:</span>
                   {typedD}
                   {typedD.length < scenarios[scenarioIndex].d.length && <span style={{ borderRight: '2px solid var(--accent)', animation: 'blink 1s infinite' }}>&nbsp;</span>}
                 </div>
               )}

             </div>

             {/* Globo de resultado estructurado */}
             <div style={{ padding: '1.5rem', background: '#fff', color: 'var(--text-dark)', borderRadius: 'var(--radius-lg)', fontSize: '1.125rem', lineHeight: 1.5, alignSelf: 'center', width: '100%', opacity: showSOAP ? 1 : 0, transform: showSOAP ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', position: 'absolute', bottom: '2.5rem', zIndex: 1, boxShadow: '0 -20px 48px rgba(15, 23, 42, 0.35)' }}>
               <strong style={{ color: 'var(--text-dark)' }}>Subjetivo (SOAP):</strong><br/>
               <span style={{ color: 'var(--text-muted)' }}>{scenarios[scenarioIndex].soap}</span>
             </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature 2: Aclaración de límites de IA */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerGroup}
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '4rem 5%', maxWidth: '1200px', margin: '0 auto' }}
      >
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))', gap: '4rem', alignItems: 'center' }}>

          {/* Animación: De la conversación a la receta */}
          <motion.div variants={fadeUp} style={{ height: '520px', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', padding: 'clamp(1.25rem, 4vw, 2rem)', position: 'relative', overflow: 'hidden' }}>

            {/* Globos de conversación */}
            <div style={{
               display: 'flex',
               flexDirection: 'column',
               gap: '0.75rem',
               zIndex: 2,
               transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
               transform: showRx ? 'scale(0.9) translateY(-20px)' : 'scale(1) translateY(0)',
               opacity: showRx ? 0.2 : 1
            }}>
              {/* P1 */}
              <div style={{ padding: '0.875rem 1.25rem', background: 'var(--border)', borderRadius: '16px 16px 16px 0', color: 'var(--text-dark)', fontSize: '0.9rem', alignSelf: 'flex-start', maxWidth: '85%', minHeight: '40px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--info)', marginRight: '0.5rem' }}>P:</span>
                {typedRxP1}
                {typedRxP1.length < prescriptionScenarios[rxScenarioIndex].p1.length && <span style={{ color: 'var(--accent)', animation: 'blink 1s infinite' }}>|</span>}
              </div>

              {/* D1 */}
              {typedRxP1.length === prescriptionScenarios[rxScenarioIndex].p1.length && (
                <div style={{ padding: '0.875rem 1.25rem', background: 'var(--primary)', borderRadius: '16px 16px 0 16px', color: '#fff', fontSize: '0.9rem', alignSelf: 'flex-end', maxWidth: '85%', minHeight: '40px', animation: 'fade-in-up 0.3s' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent)', marginRight: '0.5rem' }}>D:</span>
                  {typedRxD1}
                  {typedRxD1.length < prescriptionScenarios[rxScenarioIndex].d1.length && <span style={{ color: 'var(--accent)', animation: 'blink 1s infinite' }}>|</span>}
                </div>
              )}

              {/* P2 */}
              {typedRxD1.length === prescriptionScenarios[rxScenarioIndex].d1.length && (
                <div style={{ padding: '0.875rem 1.25rem', background: 'var(--border)', borderRadius: '16px 16px 16px 0', color: 'var(--text-dark)', fontSize: '0.9rem', alignSelf: 'flex-start', maxWidth: '85%', minHeight: '40px', animation: 'fade-in-up 0.3s' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--info)', marginRight: '0.5rem' }}>P:</span>
                  {typedRxP2}
                  {typedRxP2.length < prescriptionScenarios[rxScenarioIndex].p2.length && <span style={{ color: 'var(--accent)', animation: 'blink 1s infinite' }}>|</span>}
                </div>
              )}

              {/* D2 */}
              {typedRxP2.length === prescriptionScenarios[rxScenarioIndex].p2.length && (
                <div style={{ padding: '0.875rem 1.25rem', background: 'var(--primary)', borderRadius: '16px 16px 0 16px', color: '#fff', fontSize: '0.9rem', alignSelf: 'flex-end', maxWidth: '85%', minHeight: '40px', animation: 'fade-in-up 0.3s' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent)', marginRight: '0.5rem' }}>D:</span>
                  {typedRxD2}
                  {typedRxD2.length < prescriptionScenarios[rxScenarioIndex].d2.length && <span style={{ color: 'var(--accent)', animation: 'blink 1s infinite' }}>|</span>}
                </div>
              )}
            </div>

            {/* Receta Física (Formato Documento) */}
            <div style={{
              position: 'absolute',
              bottom: showRx ? '5%' : '-100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '85%',
              background: '#fff',
              color: 'var(--text-dark)',
              border: '2px solid var(--primary)',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '8px 8px 0px rgba(15, 23, 42, 0.85)',
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 10
            }}>
              <div style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Receta y Evaluación Médica</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>LEMMATICA HEALTHCARE AI</span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.5, whiteSpace: 'pre-line', color: '#334155', fontWeight: 600 }}>
                {prescriptionScenarios[rxScenarioIndex].rx}
              </div>
              <div style={{ marginTop: '1.5rem', borderTop: '2px solid var(--border)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '80px', height: '10px', borderBottom: '2px solid var(--border)', opacity: 0.6 }}></div>
              </div>
            </div>

            {/* Elemento de fondo decorativo */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(13, 148, 136, 0.06) 0%, rgba(255,255,255,0) 70%)', zIndex: 1 }}></div>

          </motion.div>
          <motion.div variants={fadeUp}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '2rem', color: 'var(--text-dark)' }}>
              De la conversación a la receta.
            </h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '450px' }}>
              <strong>Deja de ser un capturista de datos y vuelve a ser médico.</strong><br/><br/>
              La tecnología no debería interponerse entre tú y quien confía en ti. Lemmatica escucha, analiza y estructura tu consulta automáticamente, permitiéndote recuperar la mirada y la conexión con tu paciente.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature 3: Gestión Todo en Uno */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerGroup}
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '4rem 5%', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '1.5rem', color: 'var(--text-dark)' }}>
              Gestión Todo en Uno
            </h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Control absoluto de tu consultorio. Olvídate de tener software desconectado.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))', gap: '4rem', alignItems: 'center' }}>

            {/* Lista interactiva */}
            <motion.div variants={staggerGroup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Opción 1: Pacientes */}
              <motion.div
                variants={staggerItem}
                className={`lm-option${activeFeatureIndex === 0 ? ' lm-option-active' : ''}`}
                onClick={() => setActiveFeatureIndex(0)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <Users size={28} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'inherit' }}>Control de Pacientes</h3>
                </div>
                <p style={{ lineHeight: 1.6, margin: 0 }}>Directorio centralizado con información demográfica, contactos y métricas de salud fácilmente accesibles.</p>
              </motion.div>

              {/* Opción 2: Historial */}
              <motion.div
                variants={staggerItem}
                className={`lm-option${activeFeatureIndex === 1 ? ' lm-option-active' : ''}`}
                onClick={() => setActiveFeatureIndex(1)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <FileText size={28} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'inherit' }}>Historial Clínico</h3>
                </div>
                <p style={{ lineHeight: 1.6, margin: 0 }}>Notas SOAP y recetas almacenadas de forma segura y cronológica en bases de datos inalterables.</p>
              </motion.div>

              {/* Opción 3: Agenda */}
              <motion.div
                variants={staggerItem}
                className={`lm-option${activeFeatureIndex === 2 ? ' lm-option-active' : ''}`}
                onClick={() => setActiveFeatureIndex(2)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <Calendar size={28} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'inherit' }}>Gestión de Citas</h3>
                </div>
                <p style={{ lineHeight: 1.6, margin: 0 }}>Agenda inteligente conectada a tus expedientes para un flujo de trabajo continuo.</p>
              </motion.div>

            </motion.div>

            {/* Pantalla interactiva visual */}
            <motion.div variants={fadeUp} style={{ height: '500px', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-xl)', padding: 'clamp(1.5rem, 4vw, 3rem)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

              {/* Pacientes UI */}
              <div style={{ width: '100%', opacity: activeFeatureIndex === 0 ? 1 : 0, transform: activeFeatureIndex === 0 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s', position: 'absolute', padding: 'clamp(1.5rem, 4vw, 3rem)', pointerEvents: activeFeatureIndex === 0 ? 'auto' : 'none' }}>
                <div style={{ width: '100%', height: '40px', background: '#fff', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', padding: '0 1rem', color: 'var(--text-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                  Buscar paciente...
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: '#fff', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--info)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>CL</div>
                      <div><div style={{ fontWeight: 600 }}>Carlos López</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>42 años • O+</div></div>
                    </div>
                  </div>
                  <div style={{ padding: '1rem', background: '#fff', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>JS</div>
                      <div><div style={{ fontWeight: 600 }}>Julia Silva</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>45 años • A-</div></div>
                    </div>
                  </div>
                  <div style={{ padding: '1rem', background: '#fff', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--warning)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>RP</div>
                      <div><div style={{ fontWeight: 600 }}>Roberto Pérez</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1 año • B+</div></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historial Clínico UI */}
              <div style={{ width: '100%', opacity: activeFeatureIndex === 1 ? 1 : 0, transform: activeFeatureIndex === 1 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s', position: 'absolute', padding: 'clamp(1.5rem, 4vw, 3rem)', pointerEvents: activeFeatureIndex === 1 ? 'auto' : 'none' }}>
                <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>14 MAYO 2026</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Faringoamigdalitis</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', width: '20px' }}>S:</span> <span style={{ color: 'var(--text-muted)' }}>Odinofagia y tos productiva.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', width: '20px' }}>O:</span> <span style={{ color: 'var(--text-muted)' }}>Eritema faríngeo y fiebre 38.5°C.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', width: '20px' }}>A:</span> <span style={{ color: 'var(--text-muted)' }}>Faringoamigdalitis aguda.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: 'bold', width: '20px', color: 'var(--success)' }}>Rx:</span> <span style={{ color: 'var(--success)', fontWeight: 600 }}>Amoxicilina 500mg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agenda UI */}
              <div style={{ width: '100%', opacity: activeFeatureIndex === 2 ? 1 : 0, transform: activeFeatureIndex === 2 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s', position: 'absolute', padding: 'clamp(1.5rem, 4vw, 3rem)', pointerEvents: activeFeatureIndex === 2 ? 'auto' : 'none' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {['L','M','X','J','V','S','D'].map((day, i) => (
                    <div key={i} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{day}</div>
                  ))}
                  {[...Array(14)].map((_, i) => (
                    <div key={i} style={{ aspectRatio: '1', background: i === 9 ? 'var(--accent)' : '#fff', color: i === 9 ? '#fff' : 'var(--text-dark)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: i === 9 ? 700 : 400, boxShadow: i === 9 ? 'var(--shadow-accent)' : 'none' }}>
                      {i + 5}
                    </div>
                  ))}
                </div>
                <div style={{ background: '#fff', borderRadius: '12px', padding: '1rem', borderLeft: '4px solid var(--accent)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>16:00 - 16:30</div>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>Carlos López</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consulta de Seguimiento</div>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Trust - Minimalist Iteration */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerGroup}
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: 'clamp(2rem, 5vh, 4rem) 5%', backgroundColor: 'var(--surface)', color: 'var(--text-dark)', borderTop: '1px solid var(--border)' }}
      >
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))', gap: 'clamp(2rem, 4vw, 4rem)', alignItems: 'center' }}>

          <motion.div variants={fadeUp}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={20} color="var(--accent)" />
              </div>
              <span style={{ fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Privacidad por Diseño</span>
            </div>

            <h2 className="font-display" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '2rem', color: 'var(--text-dark)' }}>
              Lo que se dice en consulta, se queda en consulta.
            </h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '3rem' }}>
              La tecnología debe protegerte, no exponerte. Lemmatica opera bajo una arquitectura de confianza cero (Zero-Trust) cumpliendo con los estándares de salud más estrictos.
            </p>

            <motion.div variants={staggerGroup} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <motion.div variants={staggerItem} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', marginTop: '0.5rem', flexShrink: 0 }}></div>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Bases de Datos Ciegas</h4>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>Almacenamos la identidad de tus pacientes en una bóveda separada de sus diagnósticos. En el backend, tus expedientes son estadísticamente anónimos.</p>
                </div>
              </motion.div>
              <motion.div variants={staggerItem} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', marginTop: '0.5rem', flexShrink: 0 }}></div>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Entorno Privado y Aislado</h4>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>Tus consultas no se comparten con terceros ni alimentan modelos de IA públicos. Todo el procesamiento se realiza en nuestra infraestructura propia y anonimizada.</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Abstract Security Animation */}
          <motion.div variants={fadeUp} style={{ height: '400px', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            {/* Círculos concéntricos de escudo */}
            <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', border: '1px solid var(--border)', animation: 'spin-slow 20s linear infinite' }}>
               <div style={{ position: 'absolute', top: '-4px', left: '50%', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
            </div>
            <div style={{ position: 'absolute', width: '350px', height: '350px', borderRadius: '50%', border: '1px solid var(--border)', animation: 'spin-slow 30s linear infinite reverse' }}>
               <div style={{ position: 'absolute', bottom: '-4px', left: '20%', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
            </div>

            {/* Núcleo de documentos encriptados */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '70%' }}>

              {/* Doc 1 */}
              <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-md)', animation: 'float 5s ease-in-out infinite' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ width: '40%', height: '10px', background: 'var(--border)', borderRadius: '4px' }}></div>
                  <Lock size={16} color="var(--success)" />
                </div>
                <div style={{ height: '6px', background: 'var(--surface-alt)', borderRadius: '4px', width: '100%', marginBottom: '0.75rem' }}></div>
                <div style={{ height: '6px', background: 'var(--surface-alt)', borderRadius: '4px', width: '80%' }}></div>
              </div>

              {/* Doc 2 */}
              <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-md)', animation: 'float 5s ease-in-out infinite 2.5s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ width: '60%', height: '10px', background: 'var(--border)', borderRadius: '4px' }}></div>
                  <Lock size={16} color="var(--success)" />
                </div>
                <div style={{ height: '6px', background: 'var(--surface-alt)', borderRadius: '4px', width: '90%', marginBottom: '0.75rem' }}></div>
                <div style={{ height: '6px', background: 'var(--surface-alt)', borderRadius: '4px', width: '70%' }}></div>
              </div>

            </div>

          </motion.div>

        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerGroup}
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10rem 5%', textAlign: 'center', backgroundColor: 'var(--surface)', color: 'var(--text-dark)', borderTop: '1px solid var(--border)' }}
      >
        <motion.h2 variants={fadeUp} className="font-display" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 500, letterSpacing: '-0.01em', marginBottom: '3rem', color: 'var(--text-dark)' }}>
          Vuelve a ser médico.
        </motion.h2>
        <motion.button
          variants={fadeUp}
          className="lm-final-cta"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15, ease: EASE }}
          onClick={() => navigate('/register')}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '100px', fontSize: '1.25rem', fontWeight: 500, padding: '1.25rem 3.5rem', cursor: 'pointer', boxShadow: 'var(--shadow-accent)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
        >
          Comenzar ahora
        </motion.button>
      </motion.section>

      {/* Footer */}
      <footer style={{ padding: '3rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Lemmatica © 2026</div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link to="/terminos" className="lm-footer-link">Términos y Condiciones</Link>
          <span className="lm-footer-link">Contacto</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
