import React, { useState } from 'react';
import { User, Lock, Palette, Sun, Moon } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };
  return (
    <div className="settings-page-container" style={{ padding: '48px 64px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-title)', color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Configuración</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Gestiona tu identidad institucional y parámetros de seguridad de la plataforma.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
        
        {/* Profile Section */}
        <section className="settings-section" style={{ backgroundColor: 'var(--overlay-light)', border: '1px solid var(--overlay-light)', borderRadius: '16px', padding: '32px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <User size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Perfil del Administrador</h2>
          </div>
          
          <div className="profile-layout" style={{ display: 'flex', gap: '64px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--overlay-light)', border: '1px dashed rgba(0, 78, 187, )', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-dim)' }}>BV</span>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em' }}>Cambiar foto de perfil</button>
            </div>
            
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>NOMBRE COMPLETO</label>
                <input type="text" defaultValue="Instituto Peruano de Compliance" style={{ width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px 16px', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>CORREO ELECTRÓNICO</label>
                <input type="email" defaultValue="contacto@ipc.edu.pe" style={{ width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px 16px', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="settings-section" style={{ backgroundColor: 'var(--overlay-light)', border: '1px solid var(--overlay-light)', borderRadius: '16px', padding: '32px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <Lock size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Seguridad</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>CONTRASEÑA ACTUAL</label>
              <input type="password" placeholder="••••••••••••" style={{ width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px 16px', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }} />
            </div>
            
            <div className="security-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>NUEVA CONTRASEÑA</label>
                <input type="password" placeholder="Mínimo 8 caracteres" style={{ width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px 16px', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>CONFIRMAR NUEVA CONTRASEÑA</label>
                <input type="password" placeholder="Repetir nueva contraseña" style={{ width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px 16px', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Interface Preferences Section */}
        <section className="settings-section" style={{ backgroundColor: 'var(--overlay-light)', border: '1px solid var(--overlay-light)', borderRadius: '16px', padding: '32px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <Palette size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Preferencias de Interfaz</h2>
          </div>
          
          <div className="preferences-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Apariencia del Sistema</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Selecciona el tema visual de tu panel administrativo.</div>
            </div>
            
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-main)', borderRadius: '99px', padding: '4px', border: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => changeTheme('light')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '99px', background: theme === 'light' ? 'var(--primary)' : 'transparent', border: 'none', color: theme === 'light' ? '#fff' : 'var(--text-muted)', fontSize: '12px', fontWeight: theme === 'light' ? 700 : 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                <Sun size={14} /> Modo Claro
              </button>
              <button 
                onClick={() => changeTheme('dark')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '99px', background: theme === 'dark' ? 'var(--primary)' : 'transparent', border: 'none', color: theme === 'dark' ? '#fff' : 'var(--text-muted)', fontSize: '12px', fontWeight: theme === 'dark' ? 700 : 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                <Moon size={14} /> Modo Oscuro
              </button>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn-primary" style={{ padding: '14px 32px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            GUARDAR CAMBIOS
          </button>
        </div>

      </div>
    </div>
  );
};
