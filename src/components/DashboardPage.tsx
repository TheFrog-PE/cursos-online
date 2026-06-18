import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';
import { StudentFooter } from './StudentFooter';

import { 
  Play,
  MonitorPlay,
  Lock,
  CheckCircle2,
  Keyboard,
  Scale,
  Gavel,
  FileText
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const courses = React.useMemo(() => {
    const saved = localStorage.getItem('ipc_courses');
    let rawCourses: any[] = [];
    try {
      rawCourses = saved ? JSON.parse(saved) : [];
    } catch {
      rawCourses = [];
    }
    
    if (rawCourses.length === 0) {
      rawCourses = [
        { id: 1, title: 'Certificación Oficial en OCPD: Protección de Datos Personales', status: 'Publicado', category: 'Protección de Datos', modules: 10 },
        { id: 2, title: 'Especialista en Compliance', status: 'Publicado', category: 'Compliance', modules: 12 },
      ];
    }
    
    const published = rawCourses.filter((c: any) => c.status === 'Publicado');
    
    const list = published.map((c: any) => {
      const isCompliance = c.title.toLowerCase().includes('compliance');
      const isOdpc = c.title.toLowerCase().includes('datos') || c.title.toLowerCase().includes('ocpd') || c.title.toLowerCase().includes('odpc');
      
      let path = '';
      if (isCompliance) path = '/cursos/compliance';
      else if (isOdpc) path = '/cursos/odpc';
      else path = `/cursos/${c.id}`;
      
      const isSoon = !!c.isComingSoon;
      return {
        id: c.id,
        title: c.title,
        status: isSoon ? 'soon' : (isCompliance ? 'resume' : isOdpc ? 'continue' : 'resume'),
        desc: isSoon ? 'Próximamente' : `${isCompliance ? '5' : isOdpc ? '2' : '0'} / ${c.modules || 10} Módulos`,
        locked: false,
        completed: false,
        category: c.category || 'General',
        path: path,
        descriptionTop: c.descriptionTop || (isCompliance ? 'Forma profesionales capaces de diseñar, implementar y supervisar Sistemas de Gestión de Compliance alineados a ISO 37301.' : isOdpc ? 'Conviértete en Oficial de Datos Personales certificado. Domina la Ley N° 29733, el Reglamento LPDP y el RGPD europeo.' : ''),
        thumbnail: c.thumbnail || ''
      };
    });
    
    list.push({
      id: 999,
      title: "Derecho Institucional y Gobierno Corporativo",
      status: "soon",
      desc: "Próximamente",
      locked: true,
      completed: false,
      category: "Derecho Institucional",
      path: '',
      descriptionTop: "Curso avanzado en estructuración de gobierno corporativo.",
      thumbnail: ""
    });
    
    return list;
  }, []);

  const trainings = [
    { title: "Prevención de Lavado de Activos (PLAFT)", status: "soon", desc: "Próximamente", locked: true },
    { title: "Ética Pública y Anticorrupción", status: "soon", desc: "Próximamente", locked: true },
    { title: "Gestión de Riesgos Corporativos", status: "soon", desc: "Próximamente", locked: true },
    { title: "Responsabilidad Social Empresarial", status: "soon", desc: "Próximamente", locked: true },
  ];

  const affiliates = ["SUNAFIL", "SBS Perú", "INDECOPI", "SMV Perú", "OSCE", "Contraloría"];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      
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
        
        <div className="resp-pad" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '64px 24px 40px 24px' }}>
          
          {/* Header */}
          <div className="admin-header-wrap" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px', fontWeight: 700 }}>INSTITUTO PERUANO DE COMPLIANCE</p>
              <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                Bienvenido, <span style={{ color: 'var(--primary)' }}>{user?.name || 'Participante'}</span>
              </h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Fake avatars */}
              <div style={{ display: 'flex', marginLeft: '10px', flexShrink: 0 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-card-alt)', border: '2px solid var(--bg-main)', marginLeft: '-10px', zIndex: 3, flexShrink: 0 }} />
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0, 78, 187, 0.15)', border: '2px solid var(--bg-main)', marginLeft: '-10px', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>IPC</div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--overlay-medium)', border: '2px solid var(--bg-main)', color: 'var(--text-muted)', marginLeft: '-10px', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>+99</div>
              </div>
              <div style={{ backgroundColor: 'var(--overlay-light)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Experto activo
              </div>
            </div>
          </div>

          {/* Hero & Latest Courses */}
          <div className="admin-dashboard-grid" style={{ marginBottom: '48px' }}>
            
            {/* Main Course Card */}
            <div className="glass-panel" style={{ 
              padding: '32px', 
              borderRadius: '20px', 
              background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)',
              border: '1px solid var(--overlay-light)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Glow */}
              <div style={{ position: 'absolute', right: '-20%', bottom: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0, 78, 187, 0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
              
              <div style={{ display: 'inline-block', backgroundColor: 'rgba(0, 78, 187, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '24px' }}>
                ÚLTIMO CURSO TOMADO
              </div>
              
              <div className="dashboard-hero-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h3 className="dashboard-hero-title" style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-main)' }}>ESPECIALISTA EN COMPLIANCE</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', maxWidth: '300px', margin: 0 }}>
                    Forma profesionales capaces de diseñar, implementar y supervisar Sistemas de Gestión de Compliance alineados a ISO 37301 y la normativa peruana vigente.
                  </p>
                </div>
                <div className="dashboard-hero-progress-label" style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', lineHeight: '1' }}>42%</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.1em', marginTop: '4px' }}>COMPLETADO</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--overlay-light)', borderRadius: '3px', marginBottom: '32px', overflow: 'hidden' }}>
                <div style={{ width: '42%', height: '100%', backgroundColor: 'var(--primary)', borderRadius: '3px' }} />
              </div>

              <div className="dashboard-hero-buttons" style={{ display: 'flex', gap: '16px' }}>
                <button className="btn-primary" onClick={() => navigate('/cursos/compliance')} style={{ padding: '12px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Play size={14} fill="currentColor" /> Continuar
                </button>
                <button className="btn-secondary" onClick={() => navigate('/cursos/compliance')} style={{ padding: '12px 24px', fontSize: '13px', backgroundColor: 'transparent', border: '1px solid var(--overlay-medium)' }}>
                  Ver Plan de Estudios
                </button>
              </div>
            </div>

            {/* Sidebar Courses List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px 0', fontWeight: 700 }}>ÚLTIMOS CURSOS</h4>
              
              <div className="glass-panel" onClick={() => navigate('/cursos/compliance')} style={{ padding: '20px', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: 'var(--overlay-light)', cursor: 'pointer' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--bg-card-alt)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                  <MonitorPlay size={20} />
                </div>
                <div>
                  <h5 style={{ fontSize: '14px', margin: '0 0 4px 0', color: 'var(--text-main)', fontWeight: 600 }}>Especialista en Compliance</h5>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0 }}>Módulo 5: Gestión de Riesgos<br/>• Hace 10m</p>
                </div>
              </div>

              <div className="glass-panel" onClick={() => navigate('/cursos/odpc')} style={{ padding: '20px', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: 'var(--overlay-light)', cursor: 'pointer' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--bg-card-alt)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                  <MonitorPlay size={20} />
                </div>
                <div>
                  <h5 style={{ fontSize: '14px', margin: '0 0 4px 0', color: 'var(--text-main)', fontWeight: 600 }}>OCPD - Datos Personales</h5>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0 }}>Módulo 2: Ley N° 29733<br/>• Hace 1h</p>
                </div>
              </div>
            </div>

          </div>

          {/* Cursos Grid */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '24px' }}>Cursos</h3>
            <div className="resp-grid-4 student-courses-grid">
              {courses.map((course, idx) => (
                <div key={idx} className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ 
                    height: '140px', 
                    backgroundColor: 'var(--bg-card-alt)', 
                    backgroundImage: course.thumbnail ? `url("${course.thumbnail}")` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative' 
                  }}>
                    {/* Placeholder image */}
                    <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, color: 'var(--text-main)' }}>
                      CURSO
                    </div>
                  </div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-main)', lineHeight: '1.4' }}>{course.title}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.descriptionTop}
                    </p>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{course.desc}</span>
                      {course.locked ? <Lock size={14} color="var(--text-dim)" /> : (course.completed ? <CheckCircle2 size={14} color="var(--primary)" /> : null)}
                    </div>
                    
                    <button 
                      onClick={() => course.path && navigate(course.path)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        border: course.status === 'soon' ? '1px solid var(--overlay-light)' : 'none',
                        backgroundColor: course.status === 'soon' ? 'transparent' : 'var(--overlay-light)',
                        color: course.status === 'soon' ? 'var(--text-dim)' : '#fff',
                        cursor: (course.status === 'soon' && !course.path) ? 'default' : 'pointer'
                      }}
                    >
                      {course.status === 'resume' && 'RESUME'}
                      {course.status === 'continue' && 'CONTINUAR'}
                      {course.status === 'soon' && 'PRÓXIMAMENTE'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capacitaciones Grid */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '24px' }}>Capacitaciones</h3>
            <div className="resp-grid-4 student-courses-grid">
              {trainings.map((training, idx) => (
                <div key={idx} className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '140px', backgroundColor: 'var(--bg-card-alt)', position: 'relative' }}>
                    {/* Placeholder image */}
                  </div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', color: 'var(--text-main)', lineHeight: '1.4' }}>{training.title}</h4>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{training.desc}</span>
                      {training.locked && <Lock size={14} color="var(--text-dim)" />}
                    </div>
                    
                    <button style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      border: '1px solid var(--overlay-light)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-dim)',
                      cursor: 'default'
                    }}>
                      PRÓXIMAMENTE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Practica de Mecanografia */}
          <div className="glass-panel admin-dashboard-grid" style={{ padding: '40px', borderRadius: '20px', alignItems: 'center', marginBottom: '64px', backgroundColor: 'var(--overlay-light)' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(0, 78, 187, 0.1)', color: 'var(--primary)', marginBottom: '16px' }}>
                <Keyboard size={20} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>Práctica de Mecanografía</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                Desarrolla velocidad y precisión en la redacción de documentos legales, informes de compliance y comunicaciones institucionales. Una habilidad clave para el profesional moderno.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button className="btn-primary" onClick={() => navigate('/mecanografia')} style={{ padding: '12px 24px', fontSize: '13px' }}>Iniciar Práctica</button>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  RÉCORD PERSONAL<br/>
                  <span style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '14px' }}>85 WPM</span>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: '16px', padding: '24px', border: '1px solid var(--overlay-light)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.8', fontFamily: 'monospace' }}>
                La redacción jurídica requiere<br/>
                precisión, claridad y apego riguroso al<br/>
                marco normativo ... <span style={{ color: 'var(--primary)', backgroundColor: 'rgba(0, 78, 187, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>PRACTICE_YOUR_SPEED.RUN</span>
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <div style={{ width: '30px', height: '30px', backgroundColor: 'var(--bg-card-alt)', border: '1px solid var(--overlay-light)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} title="Derecho / Justicia">
                  <Scale size={14} />
                </div>
                <div style={{ width: '30px', height: '30px', backgroundColor: 'var(--bg-card-alt)', border: '1px solid var(--overlay-light)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} title="Litigación / Marco Legal">
                  <Gavel size={14} />
                </div>
                <div style={{ width: '30px', height: '30px', backgroundColor: 'var(--bg-card-alt)', border: '1px solid var(--overlay-light)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} title="Redacción de Documentos">
                  <FileText size={14} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sección Oscura Inferior */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '80px 48px', borderTop: '1px solid var(--overlay-light)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Mis links afiliados */}
            <div style={{ marginBottom: '80px' }}>
              <div style={{ display: 'inline-block', backgroundColor: 'rgba(0, 78, 187, 0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '16px' }}>
                ENTIDADES REGULADORAS
              </div>
              <h2 style={{ fontSize: '40px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                Marco <span style={{ color: 'var(--primary)' }}>Regulatorio</span>
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-muted)', margin: '0 0 40px 0' }}>
                Organismos e instituciones del ecosistema compliance peruano<br/>que todo profesional debe conocer.
              </p>

              <div className="student-affiliates-grid">
                {affiliates.map((brand, idx) => (
                  <div key={idx} className="glass-panel hover-nav" style={{ 
                    height: '140px', 
                    borderRadius: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center', padding: '0 12px' }}>
                      {brand}
                      <div style={{ width: '20px', height: '2px', backgroundColor: 'var(--primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational Quote */}
            <div style={{ 
              backgroundColor: '#f6b896', // Color arena de la maqueta
              borderRadius: '24px',
              padding: '60px 40px',
              textAlign: 'center',
              marginBottom: '80px'
            }}>
              <p style={{ 
                fontSize: '22px', 
                fontWeight: 700, 
                color: '#1a1a1a', 
                margin: '0 0 24px 0',
                lineHeight: '1.4',
                fontFamily: 'var(--font-title)'
              }}>
                "El compliance no es una opción, es una ventaja competitiva.<br/>Las organizaciones íntegras construyen confianza,<br/>y la confianza construye valor."
              </p>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: '#4a4a4a', textTransform: 'uppercase' }}>
                — INSTITUTO PERUANO DE COMPLIANCE
              </div>
            </div>

            {/* Centered card-wrapped premium footer */}
            <div className="admin-footer-wrapper" style={{ margin: '64px auto 0', maxWidth: '1200px', width: '100%', padding: 0 }}>
              <StudentFooter />
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};
