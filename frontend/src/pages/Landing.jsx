import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, Mic, FileText, Lock, Users, Calendar } from 'lucide-react';

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
      c: "Voy a mandarte Amoxicilina de 500 miligramos, te tomas una cápsula cada 8 horas por 7 días. Y mucho líquido.",
      rx: "Amoxicilina 500mg\nTomar 1 cápsula cada 8 horas durante 7 días."
    },
    {
      c: "Te daré Paracetamol para la fiebre, tómate una tableta de 500mg si tienes dolor, máximo cada 6 horas.",
      rx: "Paracetamol 500mg\nTomar 1 tableta cada 6 horas en caso de fiebre o dolor."
    },
    {
      c: "Sigue aplicando la crema de Hidrocortisona al 1% en la zona afectada, dos veces al día por dos semanas.",
      rx: "Hidrocortisona al 1% Crema\nAplicar en la zona afectada 2 veces al día por 2 semanas."
    }
  ];

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [typedP, setTypedP] = useState("");
  const [typedD, setTypedD] = useState("");
  const [showSOAP, setShowSOAP] = useState(false);

  const [rxScenarioIndex, setRxScenarioIndex] = useState(0);
  const [typedRxC, setTypedRxC] = useState("");
  const [showRx, setShowRx] = useState(false);

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
    let cIndex = 0;
    let isRunning = true;
    let currentIndex = 0;

    const runRxAnimation = async () => {
      while (isRunning) {
        const currentScenario = prescriptionScenarios[currentIndex];
        
        // Escribir Conversación
        while (cIndex <= currentScenario.c.length && isRunning) {
          setTypedRxC(currentScenario.c.slice(0, cIndex));
          cIndex++;
          await new Promise(r => setTimeout(r, 40));
        }
        
        if (!isRunning) break;
        await new Promise(r => setTimeout(r, 800));
        
        if (isRunning) setShowRx(true);
  
        await new Promise(r => setTimeout(r, 4000));
        
        if (isRunning) {
          setShowRx(false);
          await new Promise(r => setTimeout(r, 500));
          
          setTypedRxC("");
          cIndex = 0;
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
    <div style={{ backgroundColor: '#fff', color: '#000', fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>
      
      <style>
        {`
          @keyframes pulse-mic {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.2); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(255,255,255,0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      {/* Navbar: Ultra minimal */}
      <nav style={{ padding: '2rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.05em' }}>
          Latento.
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', color: '#000' }}>Log in</button>
          <button onClick={() => navigate('/register')} style={{ background: '#000', color: '#fff', border: 'none', borderRadius: '100px', fontSize: '1rem', fontWeight: 500, padding: '0.75rem 1.5rem', cursor: 'pointer' }}>Get Started</button>
        </div>
      </nav>

      {/* Hero: Huge typography, high contrast, clean */}
      <header style={{ padding: '8rem 5% 4rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '2rem', maxWidth: '900px', color: '#000' }}>
          Tu consulta, <br/> humana de nuevo.
        </h1>
        <p style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', color: '#555', maxWidth: '600px', lineHeight: 1.5, marginBottom: '3rem' }}>
          La IA médica que escribe por ti. Latento escucha tus consultas y redacta el expediente clínico y la receta automáticamente. Recupera hasta 2 horas de tu día y vuelve a disfrutar de la medicina.
        </p>
        <button onClick={() => navigate('/register')} style={{ background: '#000', color: '#fff', border: 'none', borderRadius: '100px', fontSize: '1.125rem', fontWeight: 500, padding: '1rem 2.5rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = 0.8} onMouseOut={e => e.currentTarget.style.opacity = 1}>
          Prueba Latento <ArrowRight size={20} />
        </button>
      </header>

      {/* Feature 1: Escucha. Entiende. Escribe. */}
      <section style={{ padding: '8rem 5%', backgroundColor: '#0a0a0a', color: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '2rem', color: '#fff' }}>
              Escucha.<br/>Entiende.<br/>Escribe.
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#a3a3a3', lineHeight: 1.6, maxWidth: '450px' }}>
              La IA procesa el audio de la consulta en tiempo real. Entiende el contexto clínico y extrae la información relevante para estructurar una nota SOAP perfecta.
            </p>
          </div>
          
          {/* Animación de Globos de Transcripción */}
          <div style={{ height: '600px', backgroundColor: '#171717', borderRadius: '24px', display: 'flex', flexDirection: 'column', padding: '2.5rem', justifyContent: 'flex-start', position: 'relative', overflow: 'hidden' }}>
             
             {/* Indicador de escucha */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse-mic 2s infinite' }}>
                 <Mic size={20} color="#fff" />
               </div>
               <span style={{ fontSize: '0.875rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Escuchando consulta...</span>
             </div>

             {/* Conversación */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', width: '100%', zIndex: 2 }}>
               
               {/* Paciente */}
               <div style={{ padding: '1.25rem', background: '#262626', borderRadius: '16px 16px 16px 0', color: '#e5e5e5', fontSize: '1.125rem', fontFamily: 'monospace', lineHeight: 1.5, alignSelf: 'flex-start', maxWidth: '90%', minHeight: '60px' }}>
                 <span style={{ color: '#0ea5e9', fontWeight: 'bold', marginRight: '0.5rem' }}>Paciente:</span>
                 {typedP}
                 {typedP.length < scenarios[scenarioIndex].p.length && <span style={{ borderRight: '2px solid #fff', animation: 'blink 1s infinite' }}>&nbsp;</span>}
               </div>

               {/* Doctor */}
               {typedP.length === scenarios[scenarioIndex].p.length && (
                 <div style={{ padding: '1.25rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '16px 16px 0 16px', color: '#fff', fontSize: '1.125rem', fontFamily: 'monospace', lineHeight: 1.5, alignSelf: 'flex-end', maxWidth: '90%', minHeight: '60px', animation: 'fade-in-up 0.3s ease-out' }}>
                   <span style={{ color: '#10b981', fontWeight: 'bold', marginRight: '0.5rem' }}>Doctor:</span>
                   {typedD}
                   {typedD.length < scenarios[scenarioIndex].d.length && <span style={{ borderRight: '2px solid #fff', animation: 'blink 1s infinite' }}>&nbsp;</span>}
                 </div>
               )}

             </div>

             {/* Globo de resultado estructurado */}
             <div style={{ padding: '1.5rem', background: '#fff', color: '#000', borderRadius: '16px', fontSize: '1.125rem', lineHeight: 1.5, alignSelf: 'center', width: '100%', opacity: showSOAP ? 1 : 0, transform: showSOAP ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', position: 'absolute', bottom: '2.5rem', zIndex: 1, boxShadow: '0 -10px 40px rgba(23,23,23,0.9)' }}>
               <strong style={{ color: '#000' }}>Subjetivo (SOAP):</strong><br/>
               <span style={{ color: '#333' }}>{scenarios[scenarioIndex].soap}</span>
             </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Aclaración de límites de IA */}
      <section style={{ padding: '10rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          
          {/* Animación: De la conversación a la receta */}
          <div style={{ height: '500px', backgroundColor: '#f4f4f4', borderRadius: '24px', display: 'flex', flexDirection: 'column', padding: '2.5rem', position: 'relative', overflow: 'hidden', justifyContent: 'center' }}>
            
            {/* Input conversation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', zIndex: 2 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Mic size={16} color="#000" />
              </div>
              <span style={{ fontSize: '0.875rem', color: '#555', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Voz del Médico</span>
            </div>

            <div style={{ padding: '1.25rem', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px', color: '#000', fontSize: '1.125rem', fontFamily: 'monospace', lineHeight: 1.5, zIndex: 2, minHeight: '120px' }}>
              {typedRxC}
              {typedRxC.length < prescriptionScenarios[rxScenarioIndex].c.length && <span style={{ borderRight: '2px solid #000', animation: 'blink 1s infinite' }}>&nbsp;</span>}
            </div>

            {/* Icono de flecha */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0', opacity: showRx ? 1 : 0, transition: 'opacity 0.3s', zIndex: 2 }}>
              <ArrowRight size={24} color="#a3a3a3" style={{ transform: 'rotate(90deg)' }} />
            </div>

            {/* Receta output */}
            <div style={{ padding: '1.5rem', background: '#000', color: '#fff', borderRadius: '16px', fontSize: '1.125rem', lineHeight: 1.6, width: '100%', opacity: showRx ? 1 : 0, transform: showRx ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 2, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #333', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <FileText size={18} color="#10b981" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#10b981' }}>Receta Médica Extraída</span>
              </div>
              <span style={{ fontFamily: 'monospace', whiteSpace: 'pre-line' }}>{prescriptionScenarios[rxScenarioIndex].rx}</span>
            </div>
            
            {/* Elemento de fondo decorativo */}
            <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, rgba(255,255,255,0) 70%)', zIndex: 1 }}></div>

          </div>
          <div>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '2rem', color: '#000' }}>
              De la conversación a la receta.
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#555', lineHeight: 1.6, maxWidth: '450px' }}>
              <strong>Deja de ser un capturista de datos y vuelve a ser médico.</strong><br/><br/>
              La tecnología no debería interponerse entre tú y quien confía en ti. Latento escucha, analiza y estructura tu consulta automáticamente, permitiéndote recuperar la mirada y la conexión con tu paciente.
            </p>
          </div>
        </div>
      </section>

      {/* Feature 3: Gestión Todo en Uno */}
      <section style={{ padding: '8rem 5%', backgroundColor: '#fff', borderTop: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#000' }}>
              Gestión Todo en Uno
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#555', maxWidth: '600px', margin: '0 auto' }}>
              Control absoluto de tu consultorio. Olvídate de tener software desconectado.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            <div style={{ padding: '2.5rem', backgroundColor: '#000' }}>
              <Users size={32} color="#fff" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>Control de Pacientes</h3>
              <p style={{ color: '#a3a3a3', lineHeight: 1.6 }}>Directorio centralizado con información demográfica, contactos y métricas de salud fácilmente accesibles.</p>
            </div>
            
            <div style={{ padding: '2.5rem', backgroundColor: '#000' }}>
              <FileText size={32} color="#fff" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>Historial Clínico</h3>
              <p style={{ color: '#a3a3a3', lineHeight: 1.6 }}>Notas SOAP y recetas almacenadas de forma segura y cronológica en bases de datos inalterables.</p>
            </div>

            <div style={{ padding: '2.5rem', backgroundColor: '#000' }}>
              <Calendar size={32} color="#fff" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>Gestión de Citas</h3>
              <p style={{ color: '#a3a3a3', lineHeight: 1.6 }}>Agenda inteligente conectada a tus expedientes para un flujo de trabajo continuo desde la sala de espera hasta la receta.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section style={{ padding: '8rem 5%', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Lock size={48} color="#000" style={{ marginBottom: '2rem' }} />
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#000' }}>
            Seguridad clínica inquebrantable.
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#555', lineHeight: 1.6 }}>
            Cumplimos con estándares médicos de privacidad. Los datos de tus pacientes están encriptados y nunca se utilizan para entrenar o alimentar modelos de IA públicos.
          </p>
        </div>
      </section>

      {/* Final CTA - "Vuelve a ser médico no se ve ponlo negro" -> Text black, Background white */}
      <section style={{ padding: '10rem 5%', textAlign: 'center', backgroundColor: '#fff', color: '#000', borderTop: '2px solid #000' }}>
        <h2 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 700, letterSpacing: '-0.04em', marginBottom: '3rem', color: '#000' }}>
          Vuelve a ser médico.
        </h2>
        <button onClick={() => navigate('/register')} style={{ background: '#000', color: '#fff', border: 'none', borderRadius: '100px', fontSize: '1.25rem', fontWeight: 500, padding: '1.25rem 3.5rem', cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = 0.8} onMouseOut={e => e.currentTarget.style.opacity = 1}>
          Comenzar ahora
        </button>
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', fontSize: '0.875rem', color: '#888' }}>
        <div style={{ fontWeight: 600, color: '#000' }}>Latento © 2026</div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link to="/terminos" style={{ cursor: 'pointer', transition: 'color 0.2s', color: '#888', textDecoration: 'none' }} onMouseOver={e=>e.target.style.color='#000'} onMouseOut={e=>e.target.style.color='#888'}>Términos y Condiciones</Link>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#000'} onMouseOut={e=>e.target.style.color='#888'}>Contacto</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
