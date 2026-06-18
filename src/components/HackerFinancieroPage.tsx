import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';
import { StudentFooter } from './StudentFooter';

import { 
  TrendingUp,
  Play, Star, CheckCircle2, MonitorPlay, ChevronDown, ChevronUp,
  Download, ArrowRight, Lock, PlayCircle, ShieldAlert, Activity, Gamepad2
} from 'lucide-react';
import { CheckoutPage } from './CheckoutPage';

export const HackerFinancieroPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [isPurchased, setIsPurchased] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePurchaseSuccess = () => {
    setIsPurchased(true);
    setShowPaymentModal(false);
    window.scrollTo(0, 0);
  };

  const modules = [
    { title: "Módulo 1: Introducción a la Tarjetología", lessons: 4 },
    { title: "Módulo 2: Finanzas Personales", lessons: 6 },
    { title: "Módulo 3: Arbitraje y Flujo de Efectivo", lessons: 5 },
    { title: "Módulo 4: Estrategias Avanzadas", lessons: 8 },
    { title: "Módulo 5: Creación de Historial Crediticio", lessons: 5 },
    { title: "Módulo 6: Reglas Ocultas de los Bancos", lessons: 4 },
    { title: "Módulo 7: Maximizando Puntos y Millas", lessons: 7 },
    { title: "Módulo 8: Blindaje Financiero", lessons: 5 },
    { title: "Módulo 9: Inversión Inteligente", lessons: 6 },
    { title: "Módulo 10: Deuda Buena vs Deuda Mala", lessons: 4 },
    { title: "Módulo 11: Tarjetas de Alto Nivel", lessons: 5 },
    { title: "Módulo 12: Casos Prácticos", lessons: 8 },
    { title: "Módulo 13: Aspectos Legal", lessons: 4 },
    { title: "Módulo 14: Escalamiento Institucional", lessons: 6 }
  ];

  const benefits = [
    { icon: <ShieldAlert size={20} />, title: "Dominio de Finanzas", desc: "Aprende a diseñar tu sistema de ingresos y gastos pasivos." },
    { icon: <TrendingUp size={20} />, title: "Tarjetas de Crédito", desc: "Maximiza tus líneas de crédito como apalancamiento." },
    { icon: <Activity size={20} />, title: "Gestión de Deuda", desc: "Estrategias para eliminar pasivos tóxicos." },
    { icon: <Gamepad2 size={20} />, title: "Sistema Bancario", desc: "Conoce las reglas de los bancos a tu favor." },
    { icon: <MonitorPlay size={20} />, title: "Inversión Inteligente", desc: "Aprende a usar el dinero de otros (OPM)." },
    { icon: <CheckCircle2 size={20} />, title: "Blindaje Financiero", desc: "Estructura tus activos de forma segura." }
  ];

  const otrosCursos = useMemo(() => {
    const saved = localStorage.getItem('ipc_courses');
    let list: any[] = [];
    try {
      list = saved ? JSON.parse(saved) : [];
    } catch {
      list = [];
    }
    if (list.length === 0) {
      list = [
        { id: 1, title: 'Certificación Oficial en OCPD: Protección de Datos Personales', status: 'Publicado', price: 'S/ 750', isComingSoon: false },
        { id: 2, title: 'Especialista en Compliance', status: 'Publicado', price: 'S/ 890', isComingSoon: false },
        { id: 3, title: 'Derecho Institucional y Gobierno Corporativo', status: 'Publicado', price: 'S/ 820', isComingSoon: true }
      ];
    }

    return list
      .filter((c: any) => c.status === 'Publicado')
      .filter((c: any) => {
        if (c.id === 4) return false;
        if (c.title.toLowerCase().includes('hacker')) return false;
        return true;
      })
      .map((c: any) => {
        let priceStr = c.price;
        if (priceStr && !String(priceStr).startsWith('S/') && !String(priceStr).startsWith('$')) {
          priceStr = `S/ ${priceStr}`;
        }
        if (!priceStr) priceStr = 'S/ 750';

        let path = '';
        if (c.title.toLowerCase().includes('compliance')) {
          path = '/cursos/compliance';
        } else if (c.title.toLowerCase().includes('datos') || c.title.toLowerCase().includes('ocpd') || c.title.toLowerCase().includes('odpc')) {
          path = '/cursos/odpc';
        } else {
          path = `/cursos/${c.id}`;
        }

        return {
          id: c.id,
          t: c.title,
          rating: c.isComingSoon ? 'Próximamente' : '4.8/5',
          price: priceStr,
          thumbnail: c.thumbnail,
          isComingSoon: !!c.isComingSoon,
          path: path
        };
      });
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
      
      {/* SIDEBAR */}
      <StudentSidebar 
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT */}
      <main className="app-main" style={{ marginLeft: '280px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <StudentHeader
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="course-content-wrapper">
          
          {!isPurchased ? (
            <>
              {/* Header Section (Landing) */}
              <div className="hacker-course-hero-grid">
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '16px', display: 'inline-block', border: '1px solid var(--primary)', padding: '4px 8px', borderRadius: '4px' }}>ETAPA 1</div>
                  <h2 className="course-hero-title">
                    CURSO ONLINE DE HACKER FINANCIERO: <br/><span style={{ color: 'var(--primary)' }}>CONVIÉRTETE EN UN EXPERTO EN EL MANEJO DE TARJETAS DE CRÉDITO</span>
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                    Aprende a hackear el sistema financiero usando el dinero de los bancos a tu favor para generar riqueza.
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', color: 'var(--primary)' }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>4.9/5 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(2,500 valoraciones)</span></span>
                  </div>

                  {/* Desktop Only Buttons */}
                  <div className="desktop-only-flex" style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ padding: '14px 32px', fontSize: '13px', borderRadius: '9999px', fontWeight: 700 }}>ADQUIRIR AHORA</button>
                    <button style={{ padding: '14px 32px', fontSize: '13px', borderRadius: '9999px', backgroundColor: 'transparent', border: '1px solid var(--overlay-medium)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700 }}>
                      <Play size={14} /> Ver introducción
                    </button>
                  </div>
                </div>

                {/* Desktop Only Video Preview */}
                <div className="desktop-only-specs-card" style={{ position: 'relative' }}>
                  <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: 'var(--bg-card)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--overlay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-main)', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0, 78, 187, )' }}>
                      <Play size={24} fill="currentColor" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile-only Video Hero Block and CTA Buttons */}
              <div className="mobile-only-hero-video-cta" style={{ flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: 'var(--bg-card)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--overlay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <button style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-main)', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0, 78, 187, )' }}>
                    <Play size={20} fill="currentColor" />
                  </button>
                </div>
                <div className="course-cta-buttons" style={{ width: '100%' }}>
                  <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ justifyContent: 'center', padding: '14px 16px', fontSize: '13px', borderRadius: '9999px', fontWeight: 700 }}>ADQUIRIR AHORA</button>
                  <button style={{ justifyContent: 'center', padding: '14px 16px', fontSize: '13px', borderRadius: '9999px', backgroundColor: 'transparent', border: '1px solid var(--overlay-medium)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700 }}>
                    <Play size={12} /> Ver intro
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="course-stats-grid" style={{ padding: '32px 0', borderTop: '1px solid var(--overlay-light)', borderBottom: '1px solid var(--overlay-light)', marginBottom: '64px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px', color: 'var(--primary)', fontFamily: 'var(--font-title)' }}>15k+</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>ALUMNOS GLOBALES</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px', color: 'var(--primary)', fontFamily: 'var(--font-title)' }}>14</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>MÓDULOS DE APRENDIZAJE</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px', color: 'var(--primary)', fontFamily: 'var(--font-title)' }}>80</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>LECCIONES EN VIDEO</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px', color: 'var(--primary)', fontFamily: 'var(--font-title)' }}>24/7</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>SOPORTE DE EXPERTOS</div>
                </div>
              </div>

              {/* Beneficios */}
              <div style={{ marginBottom: '64px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>
                  ¿QUÉ APRENDERÁS <span style={{ color: 'var(--primary)' }}>EN ESTE CURSO?</span>
                </h3>
                <div className="course-benefits-grid">
                  {benefits.map((benefit, i) => (
                    <div key={i} style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--overlay-light)', backgroundColor: 'var(--overlay-light)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(0, 78, 187, )', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        {benefit.icon}
                      </div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0' }}>{benefit.title}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>{benefit.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Temario y Sticky Card */}
              <div className="course-layout" style={{ marginBottom: '80px' }}>
                
                {/* Left Content */}
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>SOBRE ESTE CURSO</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '48px' }}>
                    El curso de Hacker Financiero está diseñado para llevarte desde cero hasta convertirte en un experto en el manejo del crédito. Aprenderás a utilizar el dinero de los bancos a tu favor, cómo evitar comisiones ocultas y estrategias probadas para generar liquidez sin riesgo.
                  </p>

                   {/* Mobile-only Specs Card */}
                   <div className="mobile-only-specs-card-wrapper" style={{ marginBottom: '48px' }}>
                     <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                       <div style={{ width: '100%', height: '180px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                         <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=500&auto=format&fit=crop" alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                         <button style={{ position: 'absolute', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
                           <Play size={20} fill="currentColor" />
                         </button>
                       </div>
                       <div style={{ padding: '24px' }}>
                         <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '14px', borderRadius: '8px', marginBottom: '24px' }}>
                           ADQUIRIR AHORA
                         </button>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={16} /> Nivel</span>
                             <span style={{ color: 'var(--text-main)' }}>Completo</span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MonitorPlay size={16} /> Duración</span>
                             <span style={{ color: 'var(--text-main)' }}>15h 30m</span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} /> Actualizado</span>
                             <span style={{ color: 'var(--text-main)' }}>Este mes</span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} /> Certificado</span>
                             <span style={{ color: 'var(--text-main)' }}>Digital</span>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>

                  <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>TEMARIO DEL CURSO</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {modules.map((mod, idx) => (
                      <div key={idx} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--overlay-light)' }}>
                        <div 
                          onClick={() => setOpenModule(openModule === idx ? null : idx)}
                          style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: openModule === idx ? 'var(--overlay-light)' : 'var(--overlay-light)' }}
                        >
                          <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{mod.title}</h4>
                          {openModule === idx ? <ChevronUp size={16} color="var(--primary)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                        </div>
                        {openModule === idx && (
                          <div style={{ padding: '0 20px 20px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', backgroundColor: 'var(--overlay-light)' }}>
                            <div style={{ marginTop: '16px' }}>
                              En este módulo exploraremos {mod.lessons} lecciones esenciales que transformarán tu visión sobre las finanzas institucionales.
                              <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
                                <li>Lección 1: Conceptos Básicos</li>
                                <li>Lección 2: Reglas del Sistema</li>
                                <li>Lección 3: Aplicación Práctica</li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Sticky Content (Desktop Only) */}
                <div className="desktop-only-specs-card" style={{ position: 'sticky', top: '100px', alignSelf: 'start' }}>
                  <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=500&auto=format&fit=crop" alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                      <button style={{ position: 'absolute', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
                        <Play size={20} fill="currentColor" />
                      </button>
                    </div>
                    <div style={{ padding: '32px' }}>
                      <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '14px', borderRadius: '8px', marginBottom: '24px' }}>
                        ADQUIRIR AHORA
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={16} /> Nivel</span>
                          <span style={{ color: 'var(--text-main)' }}>Completo</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MonitorPlay size={16} /> Duración</span>
                          <span style={{ color: 'var(--text-main)' }}>15h 30m</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} /> Actualizado</span>
                          <span style={{ color: 'var(--text-main)' }}>Este mes</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} /> Certificado</span>
                          <span style={{ color: 'var(--text-main)' }}>Digital</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

          {/* Testimonios */}
          <div style={{ marginBottom: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>OPINIONES DE ALUMNOS</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--bg-main)', backgroundColor: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '12px' }}>
                4.9 <Star size={12} fill="currentColor" />
              </div>
            </div>
            
            <div className="reviews-horizontal-scroll">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--overlay-light)', backgroundColor: 'var(--overlay-light)' }}>
                  <div style={{ display: 'flex', color: 'var(--primary)', marginBottom: '16px' }}>
                    {[...Array(5)].map((_, idx) => <Star key={idx} size={12} fill="currentColor" />)}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px', fontStyle: 'italic' }}>
                    "Un material increíble que me abrió los ojos sobre cómo funcionan las tarjetas. Ahora genero ingresos extra usando el crédito a mi favor."
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--bg-card-alt)' }} />
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>Usuario {i}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div style={{ padding: '64px 48px', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--overlay-light)', backgroundColor: 'var(--overlay-light)', margin: '0 auto', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px', fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>
              ¿ESTÁS LISTO PARA <br/><span style={{ color: 'var(--primary)' }}>DOMINAR TU DESTINO FINANCIERO?</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
              Únete a miles de alumnos que ya están aprovechando las ventajas del sistema bancario a su favor. Empieza tu transformación hoy.
            </p>
            <div className="course-cta-buttons">
              <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ padding: '14px 32px', fontSize: '13px', borderRadius: '9999px', fontWeight: 700 }}>EMPEZAR AHORA</button>
              <button style={{ padding: '14px 32px', fontSize: '13px', borderRadius: '9999px', backgroundColor: 'transparent', border: '1px solid var(--overlay-medium)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 700 }}>
                Hablar con un Asesor
              </button>
            </div>
          </div>
            </>
          ) : (
            <>
              {/* ACTIVE COURSE VIEW */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ backgroundColor: 'rgba(0, 78, 187, )', color: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em' }}>LIVE</span>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, fontFamily: 'var(--font-title)' }}>Lección Actual: El Algoritmo de Arbitraje</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>PROGRESO DEL CURSO</span>
                   <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>12%</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '64px' }}>
                {/* Video Player & Info */}
                <div>
                  <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#0a0a0a', borderRadius: '16px', border: '1px solid var(--overlay-light)', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                    <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                    <button style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-main)', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0, 78, 187, )' }}>
                      <Play size={24} fill="currentColor" />
                    </button>
                    {/* Fake progress bar */}
                    <div style={{ position: 'absolute', bottom: '16px', left: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>15:40 / 34:20</div>
                      <div style={{ flexGrow: 1, height: '4px', backgroundColor: 'var(--overlay-heavy)', borderRadius: '2px' }}>
                        <div style={{ width: '45%', height: '100%', backgroundColor: 'var(--primary)', borderRadius: '2px' }} />
                      </div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>4.2 El Algoritmo de Arbitraje</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
                    Aprenderás a identificar las inconsistencias del mercado usando herramientas automatizadas. En esta lección nos concentraremos en los flujos fijos y variables del sistema interbancario SWIFT.
                  </p>

                  <div className="player-actions-row">
                    <button style={{ padding: '14px 24px', borderRadius: '8px', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--overlay-medium)', color: 'var(--text-main)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <Download size={16} /> Material de Apoyo
                    </button>
                    <button className="btn-primary" style={{ padding: '14px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      SIGUIENTE LECCIÓN <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Playlist Sidebar */}
                <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', alignSelf: 'start', border: '1px solid var(--overlay-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Módulo 4 <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Estrategias...</span></h4>
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>8 Lecciones</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle2 size={16} color="var(--primary)" /> <span style={{ fontSize: '13px' }}>4.1 Teoría de Flujos</span></div>
                      <span style={{ fontSize: '11px' }}>14:20</span>
                    </div>
                    <div style={{ padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-main)', backgroundColor: 'rgba(0, 78, 187, )', border: '1px solid rgba(0, 78, 187, )', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><PlayCircle size={16} color="var(--primary)" /> <span style={{ fontSize: '13px', fontWeight: 600 }}>4.2 El Algoritmo de Arbitraje</span></div>
                      <span style={{ fontSize: '11px', color: 'var(--primary)' }}>34:20</span>
                    </div>
                    <div style={{ padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Lock size={16} /> <span style={{ fontSize: '13px' }}>4.3 Operaciones en Cascada</span></div>
                      <span style={{ fontSize: '11px' }}>18:45</span>
                    </div>
                    <div style={{ padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Lock size={16} /> <span style={{ fontSize: '13px' }}>4.4 Evaluación de Riesgos</span></div>
                      <span style={{ fontSize: '11px' }}>22:10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Módulos Accordion */}
              <div style={{ marginBottom: '64px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', fontFamily: 'var(--font-title)' }}>Módulos del Programa</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {modules.slice(0, 8).map((mod, idx) => (
                    <div key={idx} className="glass-panel" style={{ borderRadius: '8px', border: '1px solid var(--overlay-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', opacity: idx > 3 ? 0.6 : 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>MOD {idx + 1}</span>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{mod.title.split(': ')[1] || mod.title}</h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {idx < 3 ? `${mod.lessons} / ${mod.lessons} Lecciones` : `0 / ${mod.lessons} Lecciones`}
                        </span>
                        {idx < 3 ? <CheckCircle2 size={18} color="var(--primary)" /> : (idx === 3 ? <PlayCircle size={18} color="#fff" /> : <Lock size={18} color="var(--text-dim)" />)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonios */}
              <div style={{ marginBottom: '80px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, fontFamily: 'var(--font-title)' }}>Opiniones de alumnos</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--bg-main)', backgroundColor: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '12px' }}>
                    4.9 <Star size={12} fill="currentColor" />
                  </div>
                </div>
                
                <div className="reviews-horizontal-scroll">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--overlay-light)' }}>
                      <div style={{ display: 'flex', color: 'var(--primary)', marginBottom: '16px' }}>
                        {[...Array(5)].map((_, idx) => <Star key={idx} size={12} fill="currentColor" />)}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px', fontStyle: 'italic' }}>
                        "Excelente material, las lecciones son muy claras y van directo al punto."
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--bg-card-alt)' }} />
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>Alumno {i}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Otros Cursos */}
              <div style={{ marginTop: '80px', marginBottom: '80px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', fontFamily: 'var(--font-title)' }}>Otros Cursos</h3>
                <div className="other-courses-grid">
                  {otrosCursos.map((c, i) => (
                    <div key={i} className="other-course-card">
                      <div className="other-course-img" style={{ 
                        backgroundImage: c.thumbnail ? `url("${c.thumbnail}")` : 'none'
                      }}>
                        {!c.thumbnail && <img src={`https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} className="mobile-hidden-img" />}
                      </div>
                      <div className="other-course-content">
                        <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', minHeight: '40px' }}>{c.t}</h4>
                        <div className="other-course-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.rating}</span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>{c.price}</span>
                        </div>
                        <button 
                          onClick={() => navigate(c.path)}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--overlay-light)', color: 'var(--text-main)', fontSize: '12px', fontWeight: 600, border: '1px solid var(--overlay-medium)', cursor: 'pointer' }}
                        >
                          CONOCER MÁS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </>
          )}

          {/* Footer */}
          <footer className="admin-footer-wrapper" style={{ marginTop: '80px', padding: 0 }}>
            <StudentFooter />
          </footer>

        </div>
      </main>

      {/* Checkout Modal */}
      {showPaymentModal && (
        <CheckoutPage 
          onNavigateToHome={() => setShowPaymentModal(false)} 
          isModal={true}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
};

