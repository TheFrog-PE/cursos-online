import React, { useState, useEffect } from 'react';
import { Search, X, Home, BookOpen, GraduationCap, Keyboard, User, HelpCircle, ArrowUpRight, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { configService } from '../services/api';

interface StudentHeaderProps {
  onMenuClick?: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  onMenuClick,
}) => {
  const navigate = useNavigate();
  const { user, isDemoMode } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSearchingMobile, setIsSearchingMobile] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(localStorage.getItem('user_avatar') || null);

  useEffect(() => {
    const handleStorageChange = () => {
      setAvatar(localStorage.getItem('user_avatar') || null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const searchItems = [
    { label: 'Inicio - Dashboard Principal', action: () => navigate('/dashboard'), type: 'sección', icon: <Home size={14} /> },
    { label: 'Especialista en Compliance - Programa Activo', action: () => navigate('/cursos/compliance'), type: 'curso', icon: <BookOpen size={14} /> },
    { label: 'Certificación Oficial en OCPD: Protección de Datos Personales - Programa Activo', action: () => navigate('/cursos/odpc'), type: 'curso', icon: <GraduationCap size={14} /> },
    { label: 'Derecho Institucional y Gobierno Corporativo - Próximamente', action: () => {}, type: 'curso', icon: <GraduationCap size={14} /> },
    { label: 'Práctica de Mecanografía', action: () => navigate('/mecanografia'), type: 'sección', icon: <Keyboard size={14} /> },
    { label: 'Mi Perfil de Usuario', action: () => navigate('/perfil'), type: 'sección', icon: <User size={14} /> },
    { label: 'Soporte Técnico y Ayuda', action: () => navigate('/soporte'), type: 'sección', icon: <HelpCircle size={14} /> },
    { label: 'Mis Pagos - Historial', action: () => navigate('/pagos'), type: 'sección', icon: <DollarSign size={14} /> },
  ];

  const filteredSearch = searchItems.filter(item =>
    item.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const renderSearchResults = () => (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: 0,
        width: '100%',
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-glass)',
        zIndex: 150
      }}
      onMouseDown={e => e.preventDefault()} /* Prevents blur on input */
    >
      <div style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', borderBottom: '1px solid var(--overlay-light)' }}>
        RESULTADOS EN EL PORTAL
      </div>
      {filteredSearch.length > 0 ? (
        filteredSearch.map(item => (
          <button
            key={item.label}
            onClick={() => {
              item.action();
              setSearchValue('');
              setIsSearchingMobile(false);
              setIsFocused(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '13px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 78, 187, )';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {item.icon}
            </div>
            <div style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span style={{ opacity: 0.7, marginRight: '4px' }}>
                {item.type === 'sección' ? 'Ir a:' : 'Curso:'}
              </span>
              <span style={{ fontWeight: 600 }}>{item.label}</span>
            </div>
            <ArrowUpRight size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
          </button>
        ))
      ) : (
        <div style={{ padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Search size={24} style={{ opacity: 0.2 }} />
          No se encontraron resultados
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="app-student-header" style={{ height: '72px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, backgroundColor: 'var(--bg-main)', zIndex: 140 }}>
        {isSearchingMobile ? (
          /* Mobile Search Mode Header */
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px', position: 'relative' }}>
            <Search size={18} color="var(--primary)" />
            <input
              type="text"
              autoFocus
              placeholder="Buscar en el portal..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              style={{
                flexGrow: 1,
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none',
                fontWeight: 600,
                padding: '8px 0'
              }}
            />
            <button
              onClick={() => {
                setIsSearchingMobile(false);
                setSearchValue('');
                setIsFocused(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px'
              }}
            >
              <X size={20} />
            </button>
            
            {/* Mobile Global Search Results Overlay Panel */}
            {isFocused && searchValue && renderSearchResults()}
          </div>
        ) : (
          /* Normal Header Mode (Standard / Mobile Tablet) */
          <>
            {/* Left Side: Hamburger & Desktop Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexGrow: 1 }}>
              {/* Hamburger Menu & Brand title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={onMenuClick}
                  className="student-hamburger"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '5px',
                    width: '40px',
                    height: '40px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    alignSelf: 'center'
                  }}
                >
                  <span style={{ display: 'block', width: '20px', height: '2px', backgroundColor: 'var(--text-main)', borderRadius: '2px' }} />
                  <span style={{ display: 'block', width: '20px', height: '2px', backgroundColor: 'var(--text-main)', borderRadius: '2px' }} />
                  <span style={{ display: 'block', width: '20px', height: '2px', backgroundColor: 'var(--text-main)', borderRadius: '2px' }} />
                </button>
                <span className="mobile-drawer-brand-txt" style={{ fontFamily: 'var(--font-title)', fontWeight: 800, color: 'var(--primary)', fontSize: '18px', display: 'none' }}>
                  Instituto Peruano de Compliance
                </span>
              </div>

              {/* Desktop Search input block */}
              <div className="desktop-only-search" style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
                <Search size={15} color={isFocused ? 'var(--primary)' : 'var(--text-muted)'} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', transition: 'color 0.2s' }} />
                <input
                  type="text"
                  placeholder="Buscar en el portal (Ej. cursos, lecciones)..."
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--overlay-light)',
                    border: `1px solid ${isFocused ? 'var(--primary)' : 'var(--overlay-light)'}`,
                    borderRadius: '9999px',
                    padding: '10px 14px 10px 42px',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: isFocused ? '0 0 0 2px rgba(0, 78, 187, )' : 'none'
                  }}
                />
                {/* Desktop Global Search Results Overlay Panel */}
                {isFocused && searchValue && renderSearchResults()}
              </div>
            </div>

            {/* Mobile Only Search Trigger Icon */}
            <button
              className="mobile-only-search-trigger"
              onClick={() => setIsSearchingMobile(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                marginLeft: 'auto',
                marginRight: '12px'
              }}
            >
              <Search size={20} />
            </button>

            {/* Right Side: Photo Avatar only (No text!) */}
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div
                onClick={() => navigate('/perfil')}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: avatar ? 'transparent' : 'var(--bg-main)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  border: '1px solid rgba(0, 78, 187, )',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  overflow: 'hidden'
                }}
              >
                {avatar ? (
                  <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'
                )}
              </div>
            </div>
          </>
        )}
      </header>
      {isDemoMode && (
        <div
          className="demo-badge"
          onClick={async () => {
            if (window.confirm('¿Deseas reiniciar todos los datos de la demo? Esto restaurará la base de datos a su estado original y limpiará el almacenamiento local.')) {
              try {
                await configService.resetDemo();
                localStorage.removeItem('ipc_admin_notifications');
                localStorage.removeItem('ipc_courses');
                // Clear all avatar images stored in localStorage
                Object.keys(localStorage).forEach(key => {
                  if (key.startsWith('user_avatar')) {
                    localStorage.removeItem(key);
                  }
                });
                window.location.reload();
              } catch (err) {
                alert('Error al reiniciar la base de datos de demostración.');
              }
            }
          }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#ffb300',
            color: '#1a1a1a',
            padding: '10px 18px',
            borderRadius: '50px',
            fontWeight: 800,
            fontSize: '11px',
            letterSpacing: '0.08em',
            boxShadow: '0 6px 20px rgba(255, 179, 0, 0.45)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '2px solid #1a1a1a',
            userSelect: 'none',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            animation: 'pulse 2s infinite',
            cursor: 'pointer'
          }}
        >
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1a1a1a' }}></span>
          🟡 Click para reiniciar demo
        </div>
      )}
    </>
  );
};
