import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CustomSelect } from './CustomSelect';


export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recover'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('');
  const [regDni, setRegDni] = useState('');
  const [regBirthdate, setRegBirthdate] = useState('');
  const [regGender, setRegGender] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Carrusel de testimonios — un solo testimonio visible, rota automáticamente
  const testimonials = [
    {
      text: "Participar en el Programa de Especialización en Compliance ha sido una experiencia muy valiosa, que me está permitiendo fortalecer la visión estratégica del Modelo de Cumplimiento de mi organización. Desde mi rol en control interno, compliance, protección de datos y ciberseguridad, considero que esta especialización es relevante para entender y seguir promoviendo culturas organizacionales basadas en la integridad, la transparencia y el cumplimiento de estándares, leyes y regulaciones aplicables.",
      author: "Diana Aponte",
      role: "Jefe de Control Interno en Toyota del Peru S.A",
      color: "var(--primary)",
      icon: <GraduationCap size={18} />
    },
    {
      text: "Me alegra compartir un nuevo logro en mi camino profesional. He culminado con éxito el Programa de Especialización en Compliance, dictado el IPC – Instituto Peruano de Compliance. Este aprendizaje fortalece mi propósito de seguir contribuyendo a la construcción de entornos empresariales más íntegros, responsables y alineados con las mejores prácticas internacionales.",
      author: "Jackeline Acuña",
      role: "Lead de Compliance Manager en Betsson Group",
      color: "var(--accent)",
      icon: <GraduationCap size={18} />
    },
    {
      text: "El programa más completo que he encontrado sobre compliance en el Perú. Los módulos de ISO 37301 y normativa local son invaluables. En tres meses implementé el sistema de gestión de compliance en mi empresa y superamos la auditoría de la SMV sin observaciones.",
      author: "Carlos Mendoza",
      role: "Gerente Legal en empresa del sector financiero",
      color: "var(--primary)",
      icon: <GraduationCap size={18} />
    },
    {
      text: "Aprobé la evaluación OCPD a la primera. El programa prepara muy bien para el examen y, sobre todo, para la práctica real. Hoy soy Oficial de Datos Personales certificado en OCPD y aplico estos conocimientos diariamente en mi organización.",
      author: "Andrea Torres",
      role: "DPO en empresa de telecomunicaciones",
      color: "var(--accent)",
      icon: <GraduationCap size={18} />
    }
  ];

  const [testiIndex, setTestiIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const goTo = (idx: number) => {
    if (idx === testiIndex) return;
    setVisible(false);
    setTimeout(() => {
      setTestiIndex(idx);
      setVisible(true);
    }, 350);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setTestiIndex((prev) => (prev + 1) % testimonials.length);
        setVisible(true);
      }, 350);
    }, 7000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const currentTestimonial = testimonials[testiIndex];

  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length > 5) strength += 1;
    if (pass.length > 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      if (authMode === 'login') {
        const user = await login(email, password);
        if (user.role === 'ADMIN' || user.role === 'EDITOR') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else if (authMode === 'register') {
        if (regPassword !== regConfirmPassword) {
          throw new Error('Las contraseñas no coinciden.');
        }
        const res = await authService.register({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: 'STUDENT'
        });
        localStorage.setItem('user_session', JSON.stringify(res.user));
        navigate('/dashboard');
      } else {
        alert('Enlace de recuperación enviado al correo.');
        setAuthMode('login');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 20px',
    fontSize: '13px', 
    textAlign: 'center' as const,
    backgroundColor: 'transparent',
    border: '1px solid var(--primary)',
    borderRadius: '9999px',
    color: 'var(--text-main)',
    outline: 'none'
  };

  return (
    <div className="login-layout theme-dark" data-theme="dark" style={{
      width: '100%',
      height: '100vh',
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)'
    }}>
      


      {/* PANEL IZQUIERDO (Información Institucional / Testimonios) */}
      <div style={{
        padding: '60px 8%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #131419 0%, #08090c 100%)',
        borderRight: '1px solid var(--overlay-light)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow de fondo decorativo */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '50%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(0, 78, 187, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto'
        }}>
          {/* Logo Principal en Benzi Bold / Alternativa Syne */}
          <h1 style={{
            fontSize: '32px',
            lineHeight: '1.1',
            color: 'var(--primary)',
            fontFamily: 'var(--font-title)',
            fontWeight: 800,
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em',
            textAlign: 'center'
          }}>
            INSTITUTO PERUANO<br/>DE COMPLIANCE
          </h1>
          <p style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: '60px',
            textAlign: 'center'
          }}>
            CORPORATE GOVERNANCE & RISK MANAGEMENT
          </p>

          {/* Carrusel de testimonio único */}
          <div style={{ width: '100%' }}>

            {/* Tarjeta del testimonio activo */}
            <div
              className="glass-panel"
              style={{
                padding: '32px',
                borderLeft: `4px solid ${currentTestimonial.color}`,
                borderRadius: '0 16px 16px 0',
                backgroundColor: 'rgba(22, 23, 27, 0.55)',
                textAlign: 'left',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(10px)',
              }}
            >
              {/* Comillas decorativas */}
              <div style={{ fontSize: '56px', lineHeight: '0.6', color: currentTestimonial.color, opacity: 0.3, fontFamily: 'Georgia, serif', marginBottom: '8px', userSelect: 'none' }}>"</div>

              <p style={{
                color: 'var(--text-main)',
                fontSize: '14px',
                lineHeight: '1.65',
                fontStyle: 'italic',
                marginBottom: '24px',
                flexGrow: 1
              }}>
                {currentTestimonial.text}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: `${currentTestimonial.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentTestimonial.color,
                  flexShrink: 0
                }}>
                  {currentTestimonial.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 2px 0' }}>{currentTestimonial.author}</h4>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em', margin: 0 }}>{currentTestimonial.role}</p>
                </div>
              </div>
            </div>

            {/* Indicadores de punto */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  style={{
                    width: idx === testiIndex ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: idx === testiIndex ? currentTestimonial.color : 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.35s ease'
                  }}
                />
              ))}
            </div>

          </div>
        </div>

        {/* Footer info izquierda */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '8%',
          fontSize: '10px',
          color: 'var(--text-dim)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          &copy; {new Date().getFullYear()} INSTITUTO PERUANO DE COMPLIANCE SYSTEMS. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* PANEL DERECHO (Formulario de Login) */}
      <div style={{
        padding: '60px 10%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--bg-card)',
        position: 'relative'
      }}>
        
        <div style={{ width: '100%', maxWidth: authMode === 'register' ? '700px' : '560px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Card Dinámica (Login, Register, Recover) */}
          <div className="glass-panel" style={{
            width: '100%',
            padding: '48px',
            backgroundColor: 'rgba(16, 17, 21, 0.75)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 78, 187, 0.03)',
            borderRadius: '16px',
            border: '1px solid rgba(0, 78, 187, 0.08)'
          }}>
            <h2 style={{
              fontSize: '28px',
              color: 'var(--text-main)',
              textAlign: 'center',
              marginBottom: '32px',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              letterSpacing: '0'
            }}>
              {authMode === 'login' && 'Acceso Seguro'}
              {authMode === 'register' && 'Registro'}
              {authMode === 'recover' && <>Recuperar<br/>Contraseña</>}
            </h2>

            <form onSubmit={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {errorMsg && (
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                  color: '#f44336',
                  fontSize: '13px',
                  textAlign: 'center'
                }}>
                  {errorMsg}
                </div>
              )}

              {authMode === 'login' && (
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={12} style={{ color: 'var(--primary)' }} /> EMAIL
                    </label>
                    <input 
                      type="email" 
                      className="form-input" 
                      required
                      placeholder="usuario@ipc.edu.pe"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ fontSize: '13.5px' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={12} style={{ color: 'var(--primary)' }} /> PASSWORD
                      </label>
                      <span onClick={() => setAuthMode('recover')} style={{
                        fontSize: '10px',
                        color: '#d8650c',
                        cursor: 'pointer',
                        fontWeight: 600,
                        letterSpacing: '0.02em'
                      }}>
                        ¿Olvidaste tu contraseña?
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="form-input" 
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ fontSize: '13.5px', width: '100%' }}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '8px', marginTop: '12px', fontSize: '13px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'CARGANDO...' : 'INICIAR SESIÓN'}
                  </button>
                </>
              )}

              {authMode === 'recover' && (
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input 
                      type="email" 
                      required
                      placeholder="Correo electrónico"
                      style={{ 
                        width: '100%',
                        padding: '16px 24px',
                        fontSize: '14px', 
                        textAlign: 'center',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--primary)',
                        borderRadius: '9999px',
                        color: 'var(--text-main)',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                  <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', borderRadius: '9999px', marginTop: '16px', fontSize: '14px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'CARGANDO...' : 'INICIAR'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <span onClick={() => setAuthMode('login')} style={{ fontSize: '13px', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>Volver</span>
                  </div>
                </>
              )}

              {authMode === 'register' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input type="text" required placeholder="Nombres y Apellidos" style={inputStyle} value={regName} onChange={(e) => setRegName(e.target.value)} />
                    <input type="email" required placeholder="Correo electrónico" style={inputStyle} value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                    <input type="text" required placeholder="Teléfono" style={inputStyle} value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
                    
                    <div className="resp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <input type="text" required placeholder="País" style={inputStyle} value={regCountry} onChange={(e) => setRegCountry(e.target.value)} />
                      <input type="text" required placeholder="Documento de Identidad" style={inputStyle} value={regDni} onChange={(e) => setRegDni(e.target.value)} />
                    </div>
                    
                    <div className="resp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <input type="date" required style={{...inputStyle, color: 'var(--text-muted)'}} value={regBirthdate} onChange={(e) => setRegBirthdate(e.target.value)} />
                      <CustomSelect
                        value={regGender}
                        onChange={setRegGender}
                        placeholder="Género"
                        style={{ width: '100%', minWidth: '100%', height: '52px' }}
                        options={[
                          { value: "m", label: "Masculino" },
                          { value: "f", label: "Femenino" },
                          { value: "o", label: "Otro" }
                        ]}
                      />
                    </div>

                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showRegPassword ? "text" : "password"} 
                        required 
                        placeholder="Contraseña" 
                        style={inputStyle}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)} 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        style={{
                          position: 'absolute',
                          right: '20px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Medidor de seguridad de contraseña */}
                    {regPassword.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', height: '4px', marginTop: '-8px', marginBottom: '8px', padding: '0 16px' }}>
                        {[1, 2, 3, 4, 5].map((level) => {
                          const strength = getPasswordStrength(regPassword);
                          let bgColor = 'var(--overlay-medium)';
                          if (level <= strength) {
                            if (strength <= 2) bgColor = '#f44336'; // Rojo - Débil
                            else if (strength <= 3) bgColor = '#ff9800'; // Naranja - Media
                            else bgColor = '#4caf50'; // Verde - Fuerte
                          }
                          return (
                            <div key={level} style={{ flex: 1, backgroundColor: bgColor, borderRadius: '2px', transition: 'all 0.3s' }} />
                          );
                        })}
                      </div>
                    )}

                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showRegPassword ? "text" : "password"} 
                        required 
                        placeholder="Repetir Contraseña" 
                        style={inputStyle} 
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', borderRadius: '9999px', marginTop: '24px', fontSize: '14px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'CARGANDO...' : 'REGISTRARSE'}
                  </button>
                </>
              )}


            </form>
          </div>

          {/* Links debajo de la tarjeta */}
          {authMode !== 'recover' && (
            <div style={{ marginTop: '28px', textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {authMode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes una cuenta? '}
                <span onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                  {authMode === 'login' ? 'Regístrate aquí' : 'Inicia Sesión aquí'}
                </span>
              </span>
            </div>
          )}

          <div style={{
            marginTop: '48px',
            display: 'flex',
            gap: '20px',
            fontSize: '10px',
            color: 'var(--text-dim)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 700
          }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Términos</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacidad</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Soporte</a>
          </div>

        </div>

      </div>

    </div>
  );
};
