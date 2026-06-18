import React from 'react';
import { 
  Home, 
  BookOpen,
  Activity, 
  User, 
  LogOut,
  ArrowUpRight,
  HelpCircle,
  X,
  Keyboard,
  CreditCard,
  GraduationCap,
  TrendingUp,
  BarChart2,
  Shield,
  Award
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface StudentSidebarProps {
  sidebarOpen?: boolean;
  onCloseSidebar?: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({ 
  sidebarOpen = false,
  onCloseSidebar
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [coursesList, setCoursesList] = React.useState<any[]>(() => {
    const saved = localStorage.getItem('ipc_courses');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('ipc_courses');
      if (saved) {
        setCoursesList(JSON.parse(saved));
      }
    };
    window.addEventListener('storage', handleStorage);
    handleStorage();
    return () => window.removeEventListener('storage', handleStorage);
  }, [location]);

  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap size={16} />;
      case 'TrendingUp': return <TrendingUp size={16} />;
      case 'BarChart2': return <BarChart2 size={16} />;
      case 'BookOpen': return <BookOpen size={16} />;
      case 'Shield': return <Shield size={16} />;
      case 'Award': return <Award size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  const getCourseRoute = (course: any) => {
    const title = course.title || '';
    const lower = title.toLowerCase();
    if (lower.includes('compliance')) return '/cursos/compliance';
    if (lower.includes('datos') || lower.includes('ocpd') || lower.includes('odpc')) return '/cursos/odpc';
    return `/cursos/${course.id}`;
  };

  const go = (path: string) => {
    navigate(path);
    onCloseSidebar?.();
  };

  const getNavStyle = (path: string) => {
    const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
    return {
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      padding: '11px 15px', 
      borderRadius: '8px', 
      backgroundColor: isActive ? 'rgba(0, 78, 187, 0.15)' : 'transparent', 
      color: isActive ? '#fff' : 'var(--text-muted)', 
      textDecoration: 'none', 
      fontSize: '13px', 
      fontWeight: isActive ? 700 : 500, 
      transition: 'all 0.25s ease',
      cursor: 'pointer',
      border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
      boxShadow: isActive ? '0 0 15px rgba(0, 78, 187, 0.25)' : 'none'
    };
  };


  return (
    <>
      {/* Sliding Mobile Drawer Menu for Student */}
      {sidebarOpen && (
        <div className="mobile-drawer-overlay" onClick={onCloseSidebar} style={{ zIndex: 150 }}>
          <div className="mobile-drawer-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', color: 'var(--primary)', margin: 0, fontFamily: 'var(--font-title)', fontWeight: 800 }}>INSTITUTO PERUANO DE COMPLIANCE</h2>
              <button onClick={onCloseSidebar} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--overlay-light)', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--primary)', border: '1px solid rgba(0, 78, 187, )', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-main)', fontWeight: 700, fontSize: '14px' }}>{user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{user?.name ?? 'Estudiante'}</div>
                <div style={{ fontSize: '11px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} /> Activo
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => { go('/perfil'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
                <User size={16} /> Mi Perfil
              </button>
              <button onClick={() => { go('/mecanografia'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
                <Keyboard size={16} /> Mecanografía
              </button>
              <button onClick={() => { go('/soporte'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
                <HelpCircle size={16} /> Soporte Técnico
              </button>
              <button onClick={() => { go('/pagos'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
                <CreditCard size={16} /> Mis Pagos
              </button>
              <button onClick={() => { go('/certificados'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
                <Award size={16} /> Mis Certificados
              </button>

              <div style={{ padding: '16px 0', borderTop: '1px solid var(--overlay-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <ThemeToggle />
                <select
                  value={localStorage.getItem('ipc_lang') || 'es'}
                  onChange={(e) => {
                    localStorage.setItem('ipc_lang', e.target.value);
                    window.dispatchEvent(new Event('storage'));
                    window.location.reload();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    outline: 'none'
                  }}
                >
                  <option value="es">🇪🇸 Español</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>
              <button onClick={async () => { await logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', color: '#ef4444', background: 'none', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%', borderRadius: '8px', textAlign: 'left', marginTop: '16px' }}>
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for mobile */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={onCloseSidebar}
      />

      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              lineHeight: '1',
              color: 'var(--primary)',
              fontFamily: 'var(--font-title)',
              fontWeight: 800,
              margin: 0,
              letterSpacing: '-0.02em',
              cursor: 'pointer'
            }} onClick={() => go('/dashboard')}>
              Instituto Peruano de Compliance
            </h1>
            <p style={{
              fontSize: '8px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginTop: '4px'
            }}>
              INSTITUTIONAL ARBITRAGE MASTERY
            </p>
          </div>
          {/* Close button — only visible on mobile */}
          {onCloseSidebar && (
            <button 
              className="hamburger-btn"
              onClick={onCloseSidebar}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); go('/dashboard'); }} style={getNavStyle('/dashboard')} className={`hover-nav ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <Home size={16} /> <span>Inicio</span>
          </a>
          {(() => {
            const activeCourses = coursesList.length > 0 
              ? coursesList.filter(c => c.status === 'Publicado' && c.id !== 3)
              : [
                  { id: 1, title: 'Certificación Oficial en OCPD: Protección de Datos Personales', icon: 'GraduationCap', status: 'Publicado' },
                  { id: 2, title: 'Especialista en Compliance', icon: 'TrendingUp', status: 'Publicado' }
                ];

            return activeCourses.map(course => {
              const route = getCourseRoute(course);
              const iconComponent = getIconComponent(course.icon);
              
              let shortName = course.title;
              if (shortName.toLowerCase().includes('compliance')) {
                shortName = 'Esp. en Compliance';
              } else if (shortName.toLowerCase().includes('datos personales') || shortName.toLowerCase().includes('ocpd') || shortName.toLowerCase().includes('odpc')) {
                shortName = 'OCPD Certificado';
              }

              return (
                <a 
                  key={course.id} 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); if (route !== '#') go(route); }} 
                  style={getNavStyle(route)} 
                  className={`hover-nav ${route !== '#' && location.pathname.startsWith(route) ? 'active' : ''}`}
                >
                  {iconComponent} <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {shortName}
                    {!!course.isComingSoon && (
                      <span style={{ fontSize: '9px', backgroundColor: 'rgba(0,78,187,0.15)', color: 'var(--primary)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>PRÓX.</span>
                    )}
                  </span>
                </a>
              );
            });
          })()}
          <a href="#" onClick={(e) => { e.preventDefault(); go('/cursos/derecho-institucional'); }} style={getNavStyle('/cursos/derecho-institucional')} className={`hover-nav ${location.pathname.startsWith('/cursos/derecho-institucional') ? 'active' : ''}`}>
            <Activity size={16} /> <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Derecho Institucional <span style={{ fontSize: '9px', backgroundColor: 'rgba(0,78,187,0.15)', color: 'var(--primary)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>PRÓX.</span></span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); go('/soporte'); }} style={getNavStyle('/soporte')} className={`hover-nav mobile-hide-nav ${location.pathname === '/soporte' ? 'active' : ''}`}>
            <HelpCircle size={16} /> <span>Soporte Técnico</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); go('/pagos'); }} style={getNavStyle('/pagos')} className={`hover-nav mobile-hide-nav ${location.pathname === '/pagos' ? 'active' : ''}`}>
            <CreditCard size={16} /> <span>Mis Pagos</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); go('/certificados'); }} style={getNavStyle('/certificados')} className={`hover-nav mobile-hide-nav ${location.pathname === '/certificados' ? 'active' : ''}`}>
            <Award size={16} /> <span>Mis Certificados</span>
          </a>

          
          <div className="desktop-only" style={{ marginTop: 'auto', marginBottom: '16px' }}>
            <button
              onClick={() => go('/mecanografia')}
              style={{
                width: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: '16px', borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(0, 78, 187, 0.18) 0%, rgba(0, 40, 110, 0.28) 100%)',
                border: '1px solid rgba(0, 78, 187, 0.35)',
                boxShadow: '0 4px 16px rgba(0, 78, 187, 0.12), inset 0 1px 0 rgba(255,255,255,0.04)',
                cursor: 'pointer', transition: 'all 0.25s ease', textAlign: 'left'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 78, 187, 0.28) 0%, rgba(0, 40, 110, 0.40) 100%)';
                e.currentTarget.style.borderColor = 'rgba(0, 78, 187, 0.6)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 78, 187, 0.22), inset 0 1px 0 rgba(255,255,255,0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 78, 187, 0.18) 0%, rgba(0, 40, 110, 0.28) 100%)';
                e.currentTarget.style.borderColor = 'rgba(0, 78, 187, 0.35)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 78, 187, 0.12), inset 0 1px 0 rgba(255,255,255,0.04)';
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '4px' }}>MEJORA TU</div>
              <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 800 }}>MECANOGRAFÍA</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Iniciar práctica <ArrowUpRight size={12} />
              </div>
            </button>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '24px 16px', borderTop: '1px solid var(--overlay-light)' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); go('/perfil'); }} style={getNavStyle('/perfil')}>
            <User size={16} /> <span>Mi Perfil</span>
          </a>
          <a href="#" onClick={async (e) => { e.preventDefault(); await logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#ef4444', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
            <LogOut size={16} /> Logout
          </a>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
};
