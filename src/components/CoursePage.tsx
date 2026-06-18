import React, { useState } from 'react';
import { StudentFooter } from './StudentFooter';
import { 
  X, 
  Play, 
  Star, 
  ChevronDown, 
  ChevronUp,
  ShieldAlert,
  TrendingUp,
  Activity,
  Gamepad2,
  MonitorPlay,
  CheckCircle2
} from 'lucide-react';

interface CoursePageProps {
  onNavigateToHome: () => void;
  onNavigateToCheckout: () => void;
}

export const CoursePage: React.FC<CoursePageProps> = ({ onNavigateToHome, onNavigateToCheckout }) => {
  const [openModule, setOpenModule] = useState<number | null>(0);

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
    { title: "Módulo 13: Aspectos Legales", lessons: 4 },
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

  return (
    <div className="course-container" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', overflowX: 'hidden' }}>
      
      {/* 1. NAVBAR (Solo con Logo y X) */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(12, 11, 11, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--overlay-light)',
        padding: '20px 8%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: 800,
          fontFamily: 'var(--font-title)',
          color: 'var(--text-main)',
          letterSpacing: '-0.02em',
          cursor: 'pointer'
        }} onClick={onNavigateToHome}>
          Instituto Peruano de Compliance
        </div>
        <button 
          onClick={onNavigateToHome}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--overlay-light)'
          }}
        >
          <X size={20} />
        </button>
      </header>

      {/* 2. RESPONSIVE UNIFIED CONTENT PANEL */}
      <div className="course-content-wrapper" style={{ flexGrow: 1, width: '100%' }}>
        
        {/* Hero Section */}
        <div className="hacker-course-hero-grid" style={{ marginBottom: '64px' }}>
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
              <button onClick={onNavigateToCheckout} className="btn-primary" style={{ padding: '14px 32px', fontSize: '13px', borderRadius: '9999px', fontWeight: 700 }}>ADQUIRIR AHORA</button>
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
            <button onClick={onNavigateToCheckout} className="btn-primary" style={{ justifyContent: 'center', padding: '14px 16px', fontSize: '13px', borderRadius: '9999px', fontWeight: 700 }}>ADQUIRIR AHORA</button>
            <button style={{ justifyContent: 'center', padding: '14px 16px', fontSize: '13px', borderRadius: '9999px', backgroundColor: 'transparent', border: '1px solid var(--overlay-medium)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700 }}>
              <Play size={12} /> Ver intro
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="course-stats-grid" style={{
          padding: '32px 0',
          borderTop: '1px solid var(--overlay-light)',
          borderBottom: '1px solid var(--overlay-light)',
          marginBottom: '64px'
        }}>
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

        {/* What You Will Learn / Benefits */}
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

        {/* Course Layout (Temario & Specifications) */}
        <div className="course-layout" style={{ marginBottom: '80px' }}>
          
          {/* Columna Izquierda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', width: '100%', minWidth: 0 }}>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>SOBRE ESTE CURSO</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '48px' }}>
                El curso de Hacker Financiero está diseñado para llevarte desde cero hasta convertirte en un experto en el manejo del crédito. Aprenderás a utilizar el dinero de los bancos a tu favor, cómo evitar comisiones ocultas y estrategias probadas para generar liquidez sin riesgo.
              </p>
            </div>

            {/* Mobile-only duplicate Specifications Card */}
            <div className="mobile-only-specs-card-wrapper" style={{ marginBottom: '48px' }}>
              <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '180px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div className="img-placeholder"></div>
                  <button style={{ position: 'absolute', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
                    <Play size={20} fill="currentColor" />
                  </button>
                </div>
                <div style={{ padding: '24px' }}>
                  <button onClick={onNavigateToCheckout} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '14px', borderRadius: '8px', marginBottom: '24px' }}>
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

            <div>
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
            
            {/* Opiniones de alumnos */}
            <div style={{ width: '100%', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>OPINIONES DE ALUMNOS</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--bg-main)', backgroundColor: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '12px' }}>
                  4.9 <Star size={12} fill="currentColor" />
                </div>
              </div>
              
              <div className="reviews-horizontal-scroll" style={{ width: '100%' }}>
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
          </div>

          {/* Columna Derecha (Sticky Card — Desktop-only) */}
          <div className="desktop-only-specs-card" style={{ position: 'sticky', top: '100px', alignSelf: 'start' }}>
            <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div className="img-placeholder"></div>
                <button style={{ position: 'absolute', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
                  <Play size={20} fill="currentColor" />
                </button>
              </div>
              <div style={{ padding: '32px' }}>
                <button onClick={onNavigateToCheckout} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '14px', borderRadius: '8px', marginBottom: '24px' }}>
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

        {/* CTA FINAL */}
        <div style={{
          padding: '64px 48px',
          borderRadius: '24px',
          textAlign: 'center',
          border: '1px solid var(--overlay-light)',
          backgroundColor: 'var(--overlay-light)',
          margin: '0 auto 80px auto',
          maxWidth: '800px',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px', fontFamily: 'var(--font-title)', textTransform: 'uppercase', lineHeight: '1.3' }}>
            ¿ESTÁS LISTO PARA <br/><span style={{ color: 'var(--primary)' }}>DOMINAR TU DESTINO FINANCIERO?</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
            Únete a miles de alumnos que ya están aprovechando las ventajas del sistema bancario a su favor. Empieza tu transformación hoy.
          </p>
          <div className="course-cta-buttons">
            <button onClick={onNavigateToCheckout} className="btn-primary" style={{ padding: '14px 32px', fontSize: '13px', borderRadius: '9999px', fontWeight: 700 }}>EMPEZAR AHORA</button>
            <button style={{ padding: '14px 32px', fontSize: '13px', borderRadius: '9999px', backgroundColor: 'transparent', border: '1px solid var(--overlay-medium)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 700 }}>
              Hablar con un Asesor
            </button>
          </div>
        </div>

        {/* FOOTER CARD */}
        <footer className="admin-footer-wrapper" style={{ padding: '0 0 40px 0', width: '100%', boxSizing: 'border-box' }}>
          <StudentFooter />
        </footer>

      </div>

    </div>
  );
};
