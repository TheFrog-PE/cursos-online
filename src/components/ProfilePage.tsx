import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';
import { CustomSelect } from './CustomSelect';
import { 
  Edit2, Eye, EyeOff, MapPin, Fingerprint, Lock, Headphones
} from 'lucide-react';

const ROLE_TRANSLATIONS: Record<string, string> = {
  'ADMIN': 'Administrador',
  'STUDENT': 'Estudiante',
  'EDITOR': 'Editor',
};

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(localStorage.getItem('user_avatar') || null);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+51 913330912');
  const [country, setCountry] = useState('PERÚ');
  const [dni, setDni] = useState('15879635');
  const [birthday, setBirthday] = useState('12/20/1994');
  const [gender, setGender] = useState('Masculine');
  
  const [originalValues, setOriginalValues] = useState({
    name: user?.name || '',
    lastName: '',
    email: user?.email || '',
    phone: '+51 913330912',
    country: 'PERÚ',
    dni: '15879635',
    birthday: '12/20/1994',
    gender: 'Masculine'
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        localStorage.setItem('user_avatar', base64String);
        window.dispatchEvent(new Event('storage'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setSuccessMessage('¡Información actualizada con éxito!');
    setOriginalValues({
      name,
      lastName,
      email,
      phone,
      country,
      dni,
      birthday,
      gender
    });
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const isModified = 
    name !== originalValues.name ||
    lastName !== originalValues.lastName ||
    email !== originalValues.email ||
    phone !== originalValues.phone ||
    country !== originalValues.country ||
    dni !== originalValues.dni ||
    birthday !== originalValues.birthday ||
    gender !== originalValues.gender;

  const inputStyle = {
    width: '100%',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--overlay-light)',
    padding: '12px 16px',
    borderRadius: '8px',
    color: 'var(--text-main)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'var(--font-body)'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '9px',
    color: 'var(--text-dim)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginBottom: '8px',
    fontWeight: 700
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
      
      {/* SIDEBAR */}
      {/* SIDEBAR */}
      <StudentSidebar 
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT */}
      <main className="app-main" style={{ marginLeft: '280px', flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Topbar */}
        <StudentHeader
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div style={{ padding: 'clamp(20px, 5vw, 48px) clamp(16px, 4vw, 24px) 80px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px', fontWeight: 700 }}>
              BIENVENIDO A TU PERFIL
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 6vw, 44px)', fontWeight: 800, margin: '0 0 16px 0', fontFamily: 'var(--font-title)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {user?.name || 'Usuario'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '500px', lineHeight: '1.6' }}>
              Gestiona la configuración de tu perfil de usuario y asegura tus credenciales de acceso de forma rápida.
            </p>
          </div>

          <div className="profile-responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
            
            {/* LEFT COLUMN - Personal Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Main Info Card */}
              <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <input 
                      type="file" 
                      id="avatar-input" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={handleAvatarChange} 
                    />
                    <div 
                      onClick={() => document.getElementById('avatar-input')?.click()}
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '16px', 
                        backgroundColor: 'var(--bg-card-alt)', 
                        border: '1px solid var(--overlay-medium)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {avatar ? (
                        <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>
                          {user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => document.getElementById('avatar-input')?.click()}
                      style={{ position: 'absolute', bottom: '-8px', right: '-8px', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 78, 187, 0.3)' }}
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>{user?.name || 'Nombre'}</h3>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                      TIPO DE CUENTA: <span style={{ color: 'var(--text-main)' }}>{(user?.role && ROLE_TRANSLATIONS[user.role]) || 'ESTUDIANTE'}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-inputs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>NOMBRE COMPLETO</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>APELLIDO</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>CORREO ELECTRÓNICO</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>TELÉFONO</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Localization & Biometrics */}
              <div className="profile-panels-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                {/* Localization */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ color: 'var(--primary)' }}><MapPin size={18} /></div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Localización</h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>CIUDAD / PAÍS</label>
                      <CustomSelect
                        value={country}
                        onChange={setCountry}
                        style={{ width: '100%', minWidth: '100%', height: '44px' }}
                        options={[
                          { value: "PERÚ", label: "PERÚ" },
                          { value: "MÉXICO", label: "MÉXICO" },
                          { value: "COLOMBIA", label: "COLOMBIA" }
                        ]}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>DNI</label>
                      <input type="text" value={dni} onChange={e => setDni(e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                </div>

                {/* Biometrics */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ color: 'var(--primary)' }}><Fingerprint size={18} /></div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Biometría</h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>CUMPLEAÑOS</label>
                      <input type="text" value={birthday} onChange={e => setBirthday(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>GÉNERO</label>
                      <CustomSelect
                        value={gender}
                        onChange={setGender}
                        style={{ width: '100%', minWidth: '100%', height: '44px' }}
                        options={[
                          { value: "Masculine", label: "Masculino" },
                          { value: "Feminine", label: "Femenino" },
                          { value: "Other", label: "Otro" }
                        ]}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Success Notification message */}
              {successMessage && (
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(34,197,94,0.12)',
                  color: '#22c55e',
                  border: '1px solid rgba(34,197,94,0.2)',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <CheckCircleIcon /> {successMessage}
                </div>
              )}

              {/* Save Button */}
              <button 
                disabled={!isModified}
                onClick={handleSave}
                className="btn-primary" 
                style={{ 
                  padding: '18px', 
                  borderRadius: '12px', 
                  fontSize: '13px', 
                  fontWeight: 700, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px',
                  opacity: isModified ? 1 : 0.5,
                  cursor: isModified ? 'pointer' : 'not-allowed',
                  border: 'none',
                  color: '#fff',
                  width: '100%'
                }}
              >
                <CheckCircleIcon /> GUARDAR INFORMACIÓN PERSONAL
              </button>

            </div>

            {/* RIGHT COLUMN - Security & Support */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Security Card */}
              <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                  <div style={{ color: 'var(--primary)' }}><Lock size={18} /></div>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Seguridad _</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <label style={labelStyle}>CONTRASEÑA ACTUAL</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPassword ? "text" : "password"} defaultValue="password123" style={inputStyle} />
                      <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>NUEVA CONTRASEÑA</label>
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                      <input type={showNewPassword ? "text" : "password"} placeholder="Nueva contraseña" style={inputStyle} />
                      <button onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {/* Security meter */}
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      <div style={{ height: '2px', flex: 1, backgroundColor: 'var(--primary)' }} />
                      <div style={{ height: '2px', flex: 1, backgroundColor: 'var(--overlay-medium)' }} />
                      <div style={{ height: '2px', flex: 1, backgroundColor: 'var(--overlay-medium)' }} />
                      <div style={{ height: '2px', flex: 1, backgroundColor: 'var(--overlay-medium)' }} />
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
                      Requisito de seguridad: Mínimo 12 caracteres, 1 símbolo especial.
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>REPETIR NUEVA CONTRASEÑA</label>
                    <input type="password" placeholder="Confirmar contraseña" style={inputStyle} />
                  </div>

                  <button style={{ padding: '14px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, backgroundColor: 'var(--bg-card-alt)', border: '1px solid var(--overlay-light)', color: 'var(--text-main)', cursor: 'pointer', marginTop: '8px' }}>
                    ACTUALIZAR CONTRASEÑA
                  </button>
                </div>
              </div>

              {/* Support Card */}
              <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: '16px', border: '1px solid rgba(0, 78, 187, )' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0' }}>Contacta con SOPORTE</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                  ¿Tienes problemas con tu perfil de usuario? Nuestros analistas están disponibles 24/7 para la conciliación de cuentas.
                </p>
                <button onClick={() => navigate('/soporte')} className="btn-primary" style={{ padding: '14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}>
                  <Headphones size={16} /> CONTACTAR A SOPORTE
                </button>
              </div>

            </div>

          </div>

          <div style={{ marginTop: '80px', borderTop: '1px solid var(--overlay-light)', paddingTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'var(--font-title)' }}>Instituto Peruano de Compliance</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Te ayudaré a empezar a rentabilizar ahora.</p>
              <div style={{ marginTop: '24px', fontSize: '10px', color: 'var(--text-dim)' }}>© 2022 - 2026 Instituto Peruano de Compliance. Todos los derechos reservados.</div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

