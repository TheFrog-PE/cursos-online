import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Edit2,
  Ban,
  Check,
  ChevronDown,
  LayoutGrid,
  List,
  Trash2,
  User as UserIcon,
  Mail,
  GraduationCap,
  Shield,
  Play,
  Award,
  Download,
  BookOpen,
  MoreVertical
} from 'lucide-react';

import { USERS } from '../types/users';
import type { User } from '../types/users';
import { demoService, authService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface AdminUsersPageProps {
  initialViewingUser?: User | null;
  initialShowCreateModal?: boolean;
  onCloseCreateModal?: () => void;
}

const ROLE_OPTIONS = ['Todos', 'EDITOR', 'STUDENT', 'ADMIN'];
const ROLE_TRANSLATIONS: Record<string, string> = {
  'ADMIN': 'ADMINISTRADOR',
  'STUDENT': 'ESTUDIANTE',
  'EDITOR': 'EDITOR',
  'Todos': 'Todos los Roles'
};

const STATUS_OPTIONS = ['Cualquier Estado', 'Activo', 'Pendiente', 'Inactivo'];

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    '#ff6f00', '#3b82f6', '#8b5cf6', '#10b981',
    '#f59e0b', '#ef4444', '#06b6d4', '#ec4899',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getUserAvatar(user: any): string | null {
  if (!user) return null;
  return user.avatarUrl || localStorage.getItem('user_avatar_' + user.email) || localStorage.getItem('user_avatar_' + user.id);
}

const roleBadgeStyle = (role: User['role']): React.CSSProperties => {
  const map: Record<User['role'], React.CSSProperties> = {
    EDITOR:  { backgroundColor: 'rgba(0, 78, 187, )',  color: 'var(--primary)' },
    STUDENT: { backgroundColor: 'rgba(59,130,246,0.12)', color: '#60a5fa'        },
    ADMIN:   { backgroundColor: 'rgba(168,85,247,0.12)', color: '#c084fc'        },
  };
  return map[role];
};

const statusDotColor = (status: User['status']): string => {
  const map: Record<User['status'], string> = {
    Activo:    '#22c55e',
    Pendiente: '#f59e0b',
    Inactivo:  '#ef4444',
  };
  return map[status];
};


/* ── Custom Select ── */
interface CustomSelectProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
}

function CustomSelect({ value, options, onChange, placeholder }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          backgroundColor: 'var(--overlay-light)',
          border: '1px solid var(--border-color)',
          borderRadius: 10,
          color: 'var(--text-main)',
          fontSize: 13,
          padding: '8px 14px',
          outline: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          minWidth: '160px'
        }}
      >
        <span>{value === 'Todos' ? (placeholder || 'Todos') : (ROLE_TRANSLATIONS[value] || value)}</span>
        <ChevronDown size={14} color="var(--text-muted)" />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          backgroundColor: '#1a1c22', border: '1px solid var(--border-color)',
          borderRadius: 12, minWidth: '100%', zIndex: 100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden',
        }}>
          {options.map(item => (
            <button
              key={item}
              onClick={() => { onChange(item); setOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'none', border: 'none', padding: '10px 14px',
                color: '#d1d5db', fontSize: 13, cursor: 'pointer',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--overlay-light)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
            >
              {item === 'Todos' ? (placeholder || 'Todos') : (ROLE_TRANSLATIONS[item] || item)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Action Dropdown ── */
interface ActionMenuProps {
  user: User;
  onViewProfile: (user: User) => void;
  onEditProfile: (user: User) => void;
  onDeactivate: (user: User) => void;
  onActivate: (user: User) => void;
  onDelete: (user: User) => void;
}

function ActionMenu({ user, onViewProfile, onEditProfile, onDeactivate, onActivate, onDelete }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="action-menu-btn"
        style={{
          background: 'var(--overlay-light)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          color: 'var(--text-muted)',
          padding: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            backgroundColor: '#1a1c22',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            minWidth: '180px',
            zIndex: 150,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <button
            onClick={() => { onViewProfile(user); setIsOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              background: 'none', border: 'none', padding: '8px 12px',
              color: '#d1d5db', fontSize: 13, cursor: 'pointer', borderRadius: 8,
              textAlign: 'left', transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--overlay-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <Eye size={14} /> Ver Perfil
          </button>
          <button
            onClick={() => { onEditProfile(user); setIsOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              background: 'none', border: 'none', padding: '8px 12px',
              color: '#d1d5db', fontSize: 13, cursor: 'pointer', borderRadius: 8,
              textAlign: 'left', transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--overlay-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <Edit2 size={14} /> Editar Información
          </button>
          {user.status === 'Activo' ? (
            <button
              onClick={() => { onDeactivate(user); setIsOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                background: 'none', border: 'none', padding: '8px 12px',
                color: '#ef4444', fontSize: 13, cursor: 'pointer', borderRadius: 8,
                textAlign: 'left', transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <Ban size={14} /> Desactivar
            </button>
          ) : (
            <button
              onClick={() => { onActivate(user); setIsOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                background: 'none', border: 'none', padding: '8px 12px',
                color: '#22c55e', fontSize: 13, cursor: 'pointer', borderRadius: 8,
                textAlign: 'left', transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <Check size={14} /> Activar
            </button>
          )}
          <button
            onClick={() => { onDelete(user); setIsOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              background: 'none', border: 'none', padding: '8px 12px',
              color: '#ef4444', fontSize: 13, cursor: 'pointer', borderRadius: 8,
              textAlign: 'left', transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Create User Modal ── */
interface CreateUserModalProps {
  onClose: () => void;
  onCreateSuccess?: (newUser: any) => void;
}

function CreateUserModal({ onClose, onCreateSuccess }: CreateUserModalProps) {
  const { isDemoMode } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'EDITOR' | 'ADMIN'>('ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ email: string; password_temp: string; role: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(6px)',
    zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  };

  const inputWrapStyle: React.CSSProperties = {
    position: 'relative', width: '100%',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    backgroundColor: 'var(--overlay-light)',
    border: '1px solid var(--overlay-medium)',
    borderRadius: 10, color: 'var(--text-main)', fontSize: 14,
    padding: '12px 14px 12px 42px', outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 10, color: 'var(--text-dim)',
    marginBottom: 8, letterSpacing: '0.12em', fontWeight: 700,
  };

  const roles: { key: 'STUDENT' | 'EDITOR' | 'ADMIN'; label: string; icon: React.ReactNode }[] = [
    { key: 'STUDENT', label: 'ESTUDIANTE', icon: <GraduationCap size={20} /> },
    { key: 'EDITOR',  label: 'EDITOR',     icon: <Edit2 size={20} /> },
    { key: 'ADMIN',   label: 'ADMINISTRADOR',      icon: <Shield size={20} /> },
  ];

  const handleCreate = async () => {
    if (!form.name || !form.email) {
      setError('El nombre y el email son obligatorios.');
      return;
    }

    if (isDemoMode) {
      setIsLoading(true);
      setError(null);
      try {
        const res = await demoService.createDemoUser({
          name: form.name,
          email: form.email,
          role: selectedRole
        });
        setSuccessData({
          email: res.user.email,
          password_temp: res.user.password_temp,
          role: res.user.role
        });
        if (onCreateSuccess) {
          onCreateSuccess({
            id: res.user.id || Date.now(),
            name: form.name,
            email: form.email,
            role: selectedRole,
            status: 'Activo',
            avatarUrl: undefined,
            lastActivity: 'Ahora mismo'
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al crear el usuario de demostración.');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (onCreateSuccess) {
        onCreateSuccess({
          id: Date.now(),
          name: form.name,
          email: form.email,
          role: selectedRole,
          status: 'Activo',
          avatarUrl: undefined,
          lastActivity: 'Ahora mismo'
        });
      }
      onClose();
    }
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose(); }}>
      <div style={{
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 20, padding: '32px', width: '100%', maxWidth: 520,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)', position: 'relative',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-title)' }}>
                {successData ? 'Credenciales Temporales' : 'Agregar Nuevo Usuario'}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {successData ? 'Copie los datos de acceso del usuario demo creado.' : 'Configure los parámetros de identidad y acceso.'}
              </p>
            </div>
            {!isLoading && (
              <button onClick={onClose} style={{ background: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, flexShrink: 0 }}>
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#ef4444', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {successData ? (
          <div>
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e', margin: '0 0 12px 0' }}>✓ Usuario Creado Exitosamente</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-main)', fontFamily: 'monospace', backgroundColor: 'var(--bg-card-alt)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div><strong>Email:</strong> {successData.email}</div>
                <div><strong>Contraseña:</strong> {successData.password_temp}</div>
                <div><strong>Rol:</strong> {ROLE_TRANSLATIONS[successData.role] || successData.role}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Email: ${successData.email}\nContraseña: ${successData.password_temp}\nRol: ${ROLE_TRANSLATIONS[successData.role] || successData.role}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{ flex: 1, padding: '12px', borderRadius: 10, backgroundColor: 'var(--primary)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                {copied ? '¡Copiado!' : 'Copiar Credenciales'}
              </button>
              <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>NOMBRE COMPLETO</label>
                <div style={inputWrapStyle}>
                  <UserIcon size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input type="text" placeholder="Ej. Julian Casablancas" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>CORREO ELECTRÓNICO</label>
                <div style={inputWrapStyle}>
                  <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input type="email" placeholder="julian@apex.finance" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              {/* Password */}
              {!isDemoMode && (
                <div>
                  <label style={labelStyle}>CONTRASEÑA</label>
                  <div style={inputWrapStyle}>
                    <input type="password" placeholder="••••••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} style={{ ...inputStyle, paddingLeft: 14 }} />
                  </div>
                </div>
              )}

              {/* Role selector */}
              <div>
                <label style={labelStyle}>ASIGNAR ROL INSTITUCIONAL</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {roles.map(r => (
                    <button
                      key={r.key}
                      onClick={() => setSelectedRole(r.key)}
                      style={{
                        padding: '16px 8px', borderRadius: 10, cursor: 'pointer',
                        border: selectedRole === r.key ? '1.5px solid var(--primary)' : '1.5px solid var(--overlay-medium)',
                        backgroundColor: selectedRole === r.key ? 'var(--primary)' : 'var(--overlay-light)',
                        color: selectedRole === r.key ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', transition: 'all 0.15s',
                      }}
                    >
                      {r.icon}
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={onClose} disabled={isLoading} style={{ flex: 1, padding: '12px', borderRadius: 10, backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={isLoading} className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, justifyContent: 'center', opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── User Profile Modal ── */
interface UserProfileModalProps {
  user: User;
  isEditMode: boolean;
  initialConfirmDeactivate?: boolean;
  initialConfirmActivate?: boolean;
  onClose: () => void;
  onSave: (updatedUser: User, phone: string) => void;
  onStatusChange: (userId: number, newStatus: User['status']) => void;
}

const userProfiles: Record<string | number, { phone: string; joinDate: string; title: string; courses: { name: string; progress: number }[]; certs: { name: string; date: string; grade: string }[] }> = {
  1: { phone: '+34 692 881 204', joinDate: '14 de Noviembre, 2023', title: 'Estudiante Elite de IPC', courses: [{ name: 'Especialista en Compliance', progress: 68 }, { name: 'Certificación Oficial en OCPD: Protección de Datos Personales', progress: 12 }], certs: [{ name: 'Introducción al Compliance', date: 'Completado el 12 de Enero, 2024', grade: '9.8/10' }, { name: 'Gestión de Riesgos', date: 'Completado el 05 de Diciembre, 2023', grade: '10.0/10' }] },
  2: { phone: '+1 555 302 8812', joinDate: '24 Oct 2024', title: 'Editor Institucional', courses: [{ name: 'Especialista en Compliance', progress: 45 }], certs: [] },
  3: { phone: '+52 55 1234 5678', joinDate: '15 de Marzo, 2024', title: 'Estudiante Activo', courses: [{ name: 'Certificación Oficial en OCPD: Protección de Datos Personales', progress: 80 }], certs: [{ name: 'Certificación Oficial en OCPD: Protección de Datos Personales', date: 'Completado el 20 de Febrero, 2024', grade: '8.5/10' }] },
  4: { phone: '+49 301 234 5678', joinDate: '02 de Febrero, 2024', title: 'Editor Senior', courses: [{ name: 'Especialista en Compliance', progress: 95 }], certs: [{ name: 'Especialista en Compliance', date: 'Completado el 10 de Marzo, 2024', grade: '10.0/10' }] },
  5: { phone: '+34 611 223 344', joinDate: '30 de Octubre, 2024', title: 'Estudiante Activo', courses: [{ name: 'Especialista en Compliance', progress: 22 }], certs: [] },
  6: { phone: '+52 33 9876 5432', joinDate: '15 de Agosto, 2024', title: 'Estudiante en Proceso', courses: [{ name: 'Certificación Oficial en OCPD: Protección de Datos Personales', progress: 15 }], certs: [] },
  7: { phone: '+34 699 112 233', joinDate: '10 de Enero, 2024', title: 'Editor de Contenido', courses: [{ name: 'Especialista en Compliance', progress: 60 }], certs: [{ name: 'Especialista en Compliance', date: 'Completado el 05 de Febrero, 2024', grade: '9.5/10' }] },
  8: { phone: '+39 02 1234 5678', joinDate: '01 de Enero, 2024', title: 'Administradora del Sistema', courses: [], certs: [{ name: 'Certificación Admin', date: 'Completado el 15 de Enero, 2024', grade: '10.0/10' }] },
};

function UserProfileModal({ user, isEditMode: initialEditMode, initialConfirmDeactivate = false, initialConfirmActivate = false, onClose, onSave, onStatusChange }: UserProfileModalProps) {
  const profile = userProfiles[user.id] || userProfiles[1];
  const [isEditMode, setIsEditMode] = useState(initialEditMode);
  const [confirmDeactivate, setConfirmDeactivate] = useState(initialConfirmDeactivate);
  const [confirmActivate, setConfirmActivate] = useState(initialConfirmActivate);

  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPhone, setEditPhone] = useState(profile.phone);

  useEffect(() => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(profile.phone);
    setIsEditMode(initialEditMode);
    setConfirmDeactivate(initialConfirmDeactivate);
    setConfirmActivate(initialConfirmActivate);
  }, [user, initialEditMode, initialConfirmDeactivate, initialConfirmActivate]);

  const avatarColor = getAvatarColor(user.name);
  const statusDot = statusDotColor(user.status);
  const idCode = `#AF-${(user.id * 11111 + 10000).toString().slice(0, 5)}`;

  if (confirmActivate) {
    return (
      <div
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div style={{ backgroundColor: '#064e3b', border: '1px solid #34d399', borderRadius: 20, width: '100%', maxWidth: 500, padding: '40px', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 32, color: '#fff', fontWeight: 'bold' }}>✓</span>
          </div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-title)' }}>¿ACTIVAR USUARIO?</h2>
          <p style={{ fontSize: 13, color: '#a7f3d0', margin: '0 0 28px 0', lineHeight: 1.6 }}>
            ¿Estás seguro de querer activar a <strong>{user.name}</strong>? Esto restablecerá su acceso completo al portal institucional de inmediato.
          </p>
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <button onClick={() => setConfirmActivate(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
            >
              Cancelar
            </button>
            <button onClick={() => { onStatusChange(user.id, 'Activo'); setConfirmActivate(false); onClose(); }} style={{ flex: 1, padding: '12px', borderRadius: 10, backgroundColor: '#22c55e', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#16a34a'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#22c55e'}
            >
              Sí, activar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (confirmDeactivate) {
    return (
      <div
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div style={{ backgroundColor: '#7f1d1d', border: '1px solid #f87171', borderRadius: 20, width: '100%', maxWidth: 500, padding: '40px', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Ban size={32} color="#fff" />
          </div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-title)' }}>¿DESACTIVAR USUARIO?</h2>
          <p style={{ fontSize: 13, color: '#fca5a5', margin: '0 0 28px 0', lineHeight: 1.6 }}>
            ¿Estás seguro de querer desactivar a <strong>{user.name}</strong>? Esta acción suspenderá su acceso al portal institucional de inmediato.
          </p>
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <button onClick={() => setConfirmDeactivate(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
            >
              Cancelar
            </button>
            <button onClick={() => { onStatusChange(user.id, 'Inactivo'); setConfirmDeactivate(false); onClose(); }} style={{ flex: 1, padding: '12px', borderRadius: 10, backgroundColor: '#ef4444', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              Sí, desactivar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, width: '100%', maxWidth: 780, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', position: 'relative' }}>
        
        {/* Top hero section */}
        <div style={{ padding: '32px 32px 0', display: 'flex', alignItems: 'flex-start', gap: '20px', position: 'relative' }}>
          {/* Avatar */}
          {getUserAvatar(user) ? (
            <img src={getUserAvatar(user)!} alt={editName} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${avatarColor}55`, flexShrink: 0 }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: avatarColor + '33', border: `3px solid ${avatarColor}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: avatarColor, flexShrink: 0 }}>
              {getInitials(editName)}
            </div>
          )}

          <div style={{ paddingTop: 4 }}>
            {/* ID badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'rgba(0, 78, 187, )', border: '1px solid rgba(0, 78, 187, )', color: 'var(--primary)', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>
              ID: {idCode}
            </div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-title)', color: 'var(--text-main)', lineHeight: 1.2 }}>{editName}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: 'var(--text-muted)', fontSize: 13 }}>
              <Check size={14} color="var(--primary)" /> {profile.title}
            </div>
          </div>

          {/* Close */}
          <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30 }}>
            <X size={15} />
          </button>
        </div>

        {/* Body - Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 0, padding: '24px 32px 32px' }}>
          
          {/* Left: Personal Info */}
          <div style={{ paddingRight: 24, borderRight: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <UserIcon size={15} color="var(--primary)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>Información Personal</span>
            </div>
            
            {[
              { label: 'NOMBRE COMPLETO', key: 'name', value: editName, onChange: setEditName },
              { label: 'CORREO ELECTRÓNICO', key: 'email', value: editEmail, onChange: setEditEmail },
              { label: 'TELÉFONO', key: 'phone', value: editPhone, onChange: setEditPhone },
            ].map(field => (
              <div key={field.label} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 4 }}>{field.label}</div>
                {isEditMode ? (
                  <input
                    type="text"
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--overlay-light)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      color: 'var(--text-main)',
                      fontSize: 13,
                      padding: '8px 10px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.4, wordBreak: 'break-all' }}>{field.value}</div>
                )}
              </div>
            ))}

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 4 }}>FECHA DE REGISTRO</div>
              <div style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.4 }}>{profile.joinDate}</div>
            </div>

            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 8 }}>ESTADO DE CUENTA</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                  onClick={() => { 
                    if (user.status === 'Activo') {
                      setConfirmDeactivate(true); 
                    } else {
                      setConfirmActivate(true);
                    }
                  }}
                  style={{ 
                    backgroundColor: statusDot + '22', 
                    color: statusDot, 
                    border: `1px solid ${statusDot}44`, 
                    padding: '4px 12px', 
                    borderRadius: 20, 
                    fontSize: 11, 
                    fontWeight: 700, 
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  title={user.status === 'Activo' ? "Haga clic para desactivar" : "Haga clic para activar"}
                >
                  {user.status.toUpperCase()}
                </span>
                
                {user.status === 'Activo' ? (
                  <button 
                    onClick={() => setConfirmDeactivate(true)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: '2px 4px', textDecoration: 'underline' }}
                  >
                    Desactivar
                  </button>
                ) : (
                  <button 
                    onClick={() => setConfirmActivate(true)}
                    style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: '2px 4px', textDecoration: 'underline' }}
                  >
                    Activar
                  </button>
                )}
              </div>
            </div>

            {isEditMode && (
              <button
                onClick={() => onSave({ ...user, name: editName, email: editEmail }, editPhone)}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  marginTop: 20,
                  justifyContent: 'center'
                }}
              >
                Guardar Cambios
              </button>
            )}
          </div>

          {/* Right: Courses + Certs */}
          <div style={{ paddingLeft: 24 }}>
            
             {/* Courses */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Play size={12} fill="var(--primary)" color="var(--primary)" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Cursos Suscritos</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', backgroundColor: 'var(--overlay-light)', padding: '3px 8px', borderRadius: 6 }}>
                  {profile.courses.length} Cursos
                </span>
              </div>
              
              {profile.courses.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>Sin cursos suscritos aún.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {profile.courses.map((course, i) => (
                    <div key={i} style={{ backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: 'rgba(0, 78, 187, )', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={18} color="var(--primary)" />
                      </div>
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>{course.name}</div>
                        <a href="#" style={{ fontSize: 11, color: 'var(--primary)', textDecoration: 'none' }}>Ver Detalle</a>
                      </div>
                      <div style={{ flexShrink: 0, minWidth: 100 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
                          <span>Progreso</span>
                          <span style={{ color: course.progress > 50 ? '#22c55e' : 'var(--primary)', fontWeight: 700 }}>{course.progress}%</span>
                        </div>
                        <div style={{ height: 4, backgroundColor: 'var(--overlay-light)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${course.progress}%`, backgroundColor: course.progress > 50 ? '#22c55e' : 'var(--primary)', borderRadius: 2 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certificates */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Check size={14} color="var(--primary)" />
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Certificados</span>
              </div>
              
              {profile.certs.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0', backgroundColor: 'var(--overlay-light)', borderRadius: 10, border: '1px solid var(--border-color)' }}>Sin certificados obtenidos aún.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '220px', overflowY: 'auto', paddingRight: '6px' }}>
                  {profile.certs.map((cert, i) => (
                    <div key={i} style={{ backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderLeft: '3px solid var(--primary)', borderRadius: 10, padding: '14px 18px', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(0, 78, 187, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={18} color="var(--primary)" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-word' }}>{cert.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{cert.date}</div>
                      </div>
                      <div style={{ textAlign: 'right', paddingLeft: '8px', paddingRight: '8px', minWidth: '80px' }}>
                        <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: 2 }}>CALIFICACIÓN</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>{cert.grade}</div>
                      </div>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop';
                          link.download = `Certificado_${cert.name.replace(/\s+/g, '_')}.jpg`;
                          link.target = '_blank';
                          link.click();
                        }}
                        style={{ background: 'var(--primary)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, justifySelf: 'end' }}
                      >
                        <Download size={12} /> Descargar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page Component ── */
const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ 
  initialViewingUser = null,
  initialShowCreateModal = false,
  onCloseCreateModal
}) => {
  const [roleFilter, setRoleFilter]     = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Cualquier Estado');
  const [searchText, setSearchText]     = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [showModal, setShowModal]       = useState(initialShowCreateModal);

  useEffect(() => {
    if (initialShowCreateModal) {
      setShowModal(true);
    }
  }, [initialShowCreateModal]);
  const [users, setUsers]               = useState<User[]>(USERS);
  const [viewingUser, setViewingUser]   = useState<User | null>(initialViewingUser);
  const [isModalEditMode, setIsModalEditMode] = useState(false);
  const [confirmDeactivateUserId, setConfirmDeactivateUserId] = useState<number | null>(null);
  const [confirmActivateUserId, setConfirmActivateUserId] = useState<number | null>(null);
  const [viewType, setViewType]         = useState<'list' | 'cards'>('list');
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await authService.getUsers();
        const mapped = (res.users || []).map((u: any) => ({
          ...u,
          status: u.status || 'Activo',
          lastActivity: u.lastActivity || 'Hoy'
        }));
        setUsers(mapped);
      } catch (err) {
        console.error('Error loading users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeletingUserId(null);
  };

  const lastLoadedIdRef = useRef<number | null>(initialViewingUser?.id || null);

  useEffect(() => {
    if (initialViewingUser && initialViewingUser.id !== lastLoadedIdRef.current) {
      setViewingUser(initialViewingUser);
      lastLoadedIdRef.current = initialViewingUser.id;
    } else if (!initialViewingUser) {
      setViewingUser(null);
      lastLoadedIdRef.current = null;
    }
  }, [initialViewingUser]);

  const TOTAL_RESULTS = users.length;
  const TOTAL_PAGES   = Math.ceil(users.length / 10) || 1;

  const filtered = users.filter((u) => {
    const matchRole   = roleFilter === 'Todos' || u.role === roleFilter;
    const matchStatus = statusFilter === 'Cualquier Estado' || u.status === statusFilter;
    const q           = searchText.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchRole && matchStatus && matchSearch;
  });

  const pageNumbers: (number | '...')[] = [];
  if (TOTAL_PAGES <= 7) {
    for (let i = 1; i <= TOTAL_PAGES; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) pageNumbers.push('...');
    const start = Math.max(2, currentPage - 1);
    const end   = Math.min(TOTAL_PAGES - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    if (currentPage < TOTAL_PAGES - 2) pageNumbers.push('...');
    pageNumbers.push(TOTAL_PAGES);
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            margin: 0,
            fontSize: '36px',
            fontFamily: 'var(--font-title)',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          Directorio de Usuarios
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
          Gestiona el acceso, roles y estados de cuenta de la comunidad institucional.
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        {/* Group filters to stay in a single row on mobile */}
        <div className="admin-filters-row" style={{ display: 'flex', gap: 10 }}>
          {/* Role filter */}
          <CustomSelect
            value={roleFilter}
            options={ROLE_OPTIONS}
            onChange={(val) => { setRoleFilter(val); setCurrentPage(1); }}
            placeholder="Todos los Roles"
          />

          {/* Status filter */}
          <CustomSelect
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
          />
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
              transition: 'color 0.2s',
            }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              backgroundColor: 'var(--overlay-light)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              color: 'var(--text-main)',
              fontSize: 13,
              padding: '8px 40px 8px 36px',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.backgroundColor = 'var(--overlay-light)';
              e.target.style.boxShadow = '0 0 0 2px rgba(0, 78, 187, )';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--overlay-light)';
              e.target.style.backgroundColor = 'var(--overlay-light)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <div style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            backgroundColor: 'var(--overlay-light)', color: 'var(--text-muted)',
            padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, pointerEvents: 'none', letterSpacing: '1px'
          }}>
            ⌘F
          </div>
        </div>

        {/* Vista Toggle */}
        <div style={{ display: 'flex', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2px', gap: '2px' }}>
          <button
            onClick={() => setViewType('list')}
            style={{
              background: viewType === 'list' ? 'var(--primary)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 10px',
              color: viewType === 'list' ? '#ffffff' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Vista de Lista"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewType('cards')}
            style={{
              background: viewType === 'cards' ? 'var(--primary)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 10px',
              color: viewType === 'cards' ? '#ffffff' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Vista de Tarjetas"
          >
            <LayoutGrid size={16} />
          </button>
        </div>

        {/* Crear Perfil */}
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 13,
            padding: '8px 18px',
            borderRadius: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <UserPlus size={15} />
          Crear Perfil
        </button>
      </div>

      {/* ── Table ── */}
      <div
        className="glass-panel"
        style={{
          border: '1px solid var(--overlay-light)',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {viewType === 'list' ? (
          <div className="table-scroll-wrap" style={{ overflow: 'auto' }}>
            <table className="admin-users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['INFORMACIÓN DE USUARIO', 'ESTADO', 'ACCIONES'].map((h, i) => {
                    const widths = ['60%', '20%', '20%'];
                    return (
                      <th key={h} style={{ padding: '14px 20px', fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.1em', fontWeight: 700, textAlign: 'left', width: widths[i] }}>{h}</th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr className="no-results-row">
                    <td
                      colSpan={3}
                      style={{
                        textAlign: 'center',
                        padding: '48px 20px',
                        color: 'var(--text-muted)',
                        fontSize: 14,
                      }}
                    >
                      No se encontraron usuarios con los filtros aplicados.
                      </td>
                  </tr>
                ) : (
                  filtered.map((user, idx) => {
                    const avatarColor = getAvatarColor(user.name);
                    const badgeStyle  = roleBadgeStyle(user.role);
                    const dotColor    = statusDotColor(user.status);
                    const isLast      = idx === filtered.length - 1;
                    const isDeleting  = deletingUserId === user.id;

                    if (isDeleting) {
                      return (
                        <tr key={user.id} className="deleting-row" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderBottom: '1px solid rgba(239, 68, 68, 0.3)' }}>
                          <td colSpan={3} style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <span style={{ color: '#fca5a5', fontWeight: 600, fontSize: '13px' }}>
                                ¿Estás seguro de querer eliminar al usuario &ldquo;{user.name}&rdquo;?
                              </span>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setDeletingUserId(null)} style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 12px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                                >
                                  Cancelar
                                </button>
                                <button onClick={() => handleDeleteUser(user.id)} style={{ backgroundColor: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 12px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
                                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}
                                >
                                  Sí, eliminar
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={user.id}
                        style={{
                          borderBottom: isLast ? 'none' : '1px solid var(--overlay-light)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLTableRowElement).style.background = 'var(--overlay-light)')
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')
                        }
                      >
                        {/* User info */}
                        <td style={{ padding: '16px 20px' }}>
                          <div className="user-info-flex" style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                            {getUserAvatar(user) ? (
                              <img src={getUserAvatar(user)!} alt={user.name} className="user-avatar-img" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                              <div
                                className="avatar-placeholder"
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  backgroundColor: avatarColor + '22',
                                  border: `1.5px solid ${avatarColor}55`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: avatarColor,
                                  flexShrink: 0,
                                  letterSpacing: '0.02em',
                                }}
                              >
                                {getInitials(user.name)}
                              </div>
                            )}
                            <div className="user-info-details">
                              <div className="user-info-name" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.3 }}>
                                {user.name}
                              </div>
                              <div style={{ marginTop: 4, marginBottom: 4 }}>
                                <span
                                  className="role-badge"
                                  style={{
                                    ...badgeStyle,
                                    display: 'inline-block',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: '0.08em',
                                    padding: '2px 8px',
                                    borderRadius: 20,
                                  }}
                                >
                                  {ROLE_TRANSLATIONS[user.role] || user.role}
                                </span>
                              </div>
                              <div className="user-info-email" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                {user.email}
                              </div>
                              {/* Status & activity row - ONLY visible on mobile */}
                              <div className="mobile-status-activity-row" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                  <span
                                    style={{
                                      width: 7,
                                      height: 7,
                                      borderRadius: '50%',
                                      backgroundColor: dotColor,
                                      boxShadow: `0 0 6px ${dotColor}80`,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <span style={{ fontSize: 12, color: '#d1d5db' }}>{user.status}</span>
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-dim, var(--overlay-heavy))' }}>
                                  Última actividad: {user.lastActivity}
                                </div>
                              </div>
                              <div className="user-info-activity" style={{ fontSize: 11, color: 'var(--text-dim, var(--overlay-heavy))', marginTop: 3 }}>
                                Última actividad: {user.lastActivity}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                backgroundColor: dotColor,
                                boxShadow: `0 0 6px ${dotColor}80`,
                                flexShrink: 0,
                              }}
                            />
                            <span className="status-text" style={{ fontSize: 13, color: '#d1d5db' }}>{user.status}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 20px' }}>
                          <ActionMenu 
                            user={user} 
                            onViewProfile={(u) => { setViewingUser(u); setIsModalEditMode(false); setConfirmDeactivateUserId(null); setConfirmActivateUserId(null); }} 
                            onEditProfile={(u) => { setViewingUser(u); setIsModalEditMode(true); setConfirmDeactivateUserId(null); setConfirmActivateUserId(null); }}
                            onDeactivate={(u) => { setViewingUser(u); setIsModalEditMode(false); setConfirmDeactivateUserId(u.id); setConfirmActivateUserId(null); }}
                            onActivate={(u) => { setViewingUser(u); setIsModalEditMode(false); setConfirmDeactivateUserId(null); setConfirmActivateUserId(u.id); }}
                            onDelete={(u) => setDeletingUserId(u.id)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', borderBottom: '1px solid var(--overlay-light)' }}>
            {filtered.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                No se encontraron usuarios con los filtros aplicados.
              </div>
            ) : (
              filtered.map((user) => {
                const avatarColor = getAvatarColor(user.name);
                const badgeStyle  = roleBadgeStyle(user.role);
                const dotColor    = statusDotColor(user.status);
                const isDeleting  = deletingUserId === user.id;

                if (isDeleting) {
                  return (
                    <div key={user.id} className="glass-panel" style={{ borderRadius: '14px', padding: '20px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '180px', transition: 'all 0.3s' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                        <Trash2 size={20} color="#ef4444" />
                      </div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0', color: '#fff' }}>¿Eliminar usuario?</h3>
                      <p style={{ fontSize: '11px', color: '#fca5a5', margin: '0 0 16px 0', lineHeight: '1.4' }}>Esta acción no se puede deshacer.</p>
                      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <button onClick={() => setDeletingUserId(null)} style={{ flex: 1, padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                        >
                          Cancelar
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} style={{ flex: 1, padding: '8px', borderRadius: '6px', backgroundColor: '#ef4444', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}
                        >
                          Sí, eliminar
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={user.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 14,
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.backgroundColor = 'var(--overlay-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    }}
                  >
                    {/* Top row: badge & action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          ...badgeStyle,
                          display: 'inline-block',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          padding: '3px 8px',
                          borderRadius: 20,
                        }}
                      >
                        {ROLE_TRANSLATIONS[user.role] || user.role}
                      </span>
                      <ActionMenu 
                        user={user} 
                        onViewProfile={(u) => { setViewingUser(u); setIsModalEditMode(false); setConfirmDeactivateUserId(null); setConfirmActivateUserId(null); }} 
                        onEditProfile={(u) => { setViewingUser(u); setIsModalEditMode(true); setConfirmDeactivateUserId(null); setConfirmActivateUserId(null); }}
                        onDeactivate={(u) => { setViewingUser(u); setIsModalEditMode(false); setConfirmDeactivateUserId(u.id); setConfirmActivateUserId(null); }}
                        onActivate={(u) => { setViewingUser(u); setIsModalEditMode(false); setConfirmDeactivateUserId(null); setConfirmActivateUserId(u.id); }}
                        onDelete={(u) => setDeletingUserId(u.id)}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {getUserAvatar(user) ? (
                        <img src={getUserAvatar(user)!} alt={user.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            backgroundColor: avatarColor + '22',
                            border: `1.5px solid ${avatarColor}55`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 700,
                            color: avatarColor,
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(user.name)}
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                          {user.email}
                        </div>
                      </div>
                    </div>

                    {/* Bottom: status & active */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--overlay-light)', fontSize: 11 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: dotColor,
                            boxShadow: `0 0 5px ${dotColor}80`,
                          }}
                        />
                        <span style={{ color: 'var(--text-main)' }}>{user.status}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>Actividad: {user.lastActivity}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Pagination Footer ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderTop: '1px solid var(--overlay-light)',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Mostrando <strong style={{ color: 'var(--text-main)' }}>{filtered.length}</strong> de{' '}
            <strong style={{ color: 'var(--text-main)' }}>{TOTAL_RESULTS}</strong> resultados
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Prev */}
            <PaginationBtn
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={15} />
            </PaginationBtn>

            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span
                  key={`ellipsis-${i}`}
                  style={{ color: 'var(--overlay-heavy)', fontSize: 13, padding: '0 4px' }}
                >
                  …
                </span>
              ) : (
                <PaginationBtn
                  key={p}
                  active={p === currentPage}
                  onClick={() => setCurrentPage(p as number)}
                >
                  {p}
                </PaginationBtn>
              )
            )}

            {/* Next */}
            <PaginationBtn
              onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
              disabled={currentPage === TOTAL_PAGES}
              aria-label="Página siguiente"
            >
              <ChevronRight size={15} />
            </PaginationBtn>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showModal && (
        <CreateUserModal
          onClose={() => {
            setShowModal(false);
            if (onCloseCreateModal) onCloseCreateModal();
          }}
          onCreateSuccess={(newUser) => {
            setUsers((prev) => [
              ...prev,
              {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status || 'Activo',
                avatarUrl: newUser.avatarUrl,
                lastActivity: newUser.lastActivity || 'Ahora mismo'
              }
            ]);
          }}
        />
      )}
      {viewingUser && (
        <UserProfileModal
          user={viewingUser}
          isEditMode={isModalEditMode}
          initialConfirmDeactivate={confirmDeactivateUserId === viewingUser.id}
          initialConfirmActivate={confirmActivateUserId === viewingUser.id}
          onClose={() => { setViewingUser(null); setConfirmDeactivateUserId(null); setConfirmActivateUserId(null); }}
          onSave={(updatedUser, updatedPhone) => {
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            if (userProfiles[updatedUser.id]) {
              userProfiles[updatedUser.id].phone = updatedPhone;
            }
            setViewingUser(updatedUser);
            setIsModalEditMode(false);
          }}
          onStatusChange={(userId, newStatus) => {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            setViewingUser((prev: User | null) => prev && prev.id === userId ? { ...prev, status: newStatus } : prev);
          }}
        />
      )}
    </div>
  );
};

/* ── Pagination Button ── */
interface PaginationBtnProps {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
}

function PaginationBtn({ children, onClick, active = false, disabled = false, 'aria-label': ariaLabel }: PaginationBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`app-pagination-btn ${active ? 'active' : ''}`}
    >
      {children}
    </button>
  );
}

export default AdminUsersPage;
export { AdminUsersPage };
