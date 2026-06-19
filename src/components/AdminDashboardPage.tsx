import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, LayoutDashboard, Users, BookOpen, CreditCard, 
  Settings, HelpCircle, UsersRound, ArrowUpRight,
  Clock, Book, DollarSign, UploadCloud, CheckCircle2,
  FileText, Edit2, Trash2, ChevronLeft, ChevronRight, UserPlus, LogOut, LayoutGrid, List, X
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AdminUsersPage } from './AdminUsersPage';
import { AdminCoursesPage } from './AdminCoursesPage';
import { StudentFooter } from './StudentFooter';
import { CustomSelect } from './CustomSelect';
import { AdminCourseEditorPage } from './AdminCourseEditorPage';
import { AdminPaymentsPage } from './AdminPaymentsPage';
import { AdminSettingsPage } from './AdminSettingsPage';
import { AdminSupportPage } from './AdminSupportPage';
import type { User } from '../types/users';
import { authService, courseService, paymentService, configService } from '../services/api';

type AdminSection = 'dashboard' | 'users' | 'courses' | 'payments' | 'settings' | 'support';

const ROLE_TRANSLATIONS: Record<string, string> = {
  'ADMIN': 'Administrador',
  'STUDENT': 'Estudiante',
  'EDITOR': 'Editor',
};

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isDemoMode } = useAuth();
  const role = user?.role === 'EDITOR' ? 'EDITOR' : 'ADMIN';

  const [section, setSection] = useState<AdminSection>(role === 'EDITOR' ? 'courses' : 'dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [dashboardViewingUser, setDashboardViewingUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashUserView, setDashUserView] = useState<'list' | 'cards'>('list');
  const [dashRoleFilter, setDashRoleFilter] = useState<string>('Todos');
  const [dashStatusFilter, setDashStatusFilter] = useState<string>('Todos');
  const [paymentsInitialOpenId, setPaymentsInitialOpenId] = useState<string | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [dbPayments, setDbPayments] = useState<any[]>([]);
  const [dismissedNotifs, setDismissedNotifs] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ipc_dismissed_notifications') || '[]');
    } catch { return []; }
  });

  // Derived state for adminNotifications based on dbUsers and dbPayments
  const adminNotifications = React.useMemo(() => {
    const notifs: any[] = [];
    
    // 1. Map payments from database
    dbPayments.forEach((p: any) => {
      const isDismissed = dismissedNotifs.includes(p.id);
      if (!isDismissed) {
        notifs.push({
          id: p.id,
          type: 'payment_voucher',
          studentName: p.user?.name || 'Estudiante',
          studentEmail: p.user?.email || '',
          fileName: p.imageName || 'voucher_subido',
          voucherBase64: p.comprobanteUrl, // Cloudinary URL
          submittedAt: p.date,
          read: p.status !== 'PENDIENTE',
          status: p.status === 'PENDIENTE' ? 'pending' : p.status === 'APROBADO' ? 'approved' : 'rejected',
          courseTitle: p.courseTitle || 'Curso IPC'
        });
      }
    });

    // 2. Map student users
    dbUsers.forEach((u: any) => {
      if (u.role === 'STUDENT') {
        const isDismissed = dismissedNotifs.includes(u.id);
        if (!isDismissed) {
          notifs.push({
            id: u.id,
            type: 'new_user',
            studentName: u.name,
            studentEmail: u.email,
            submittedAt: u.createdAt,
            read: false,
            status: 'unread'
          });
        }
      }
    });

    // Sort by submittedAt descending
    return notifs.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [dbUsers, dbPayments, dismissedNotifs]);

  const markNotifRead = (id: string) => {
    const updated = [...dismissedNotifs, id];
    setDismissedNotifs(updated);
    localStorage.setItem('ipc_dismissed_notifications', JSON.stringify(updated));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersData = await authService.getUsers();
        const mappedUsers = (usersData.users || []).map((u: any) => ({
          ...u,
          status: u.status || 'Activo',
          lastActivity: u.lastActivity || 'Hoy'
        }));
        setDbUsers(mappedUsers);
      } catch (e) {
        console.error('Error loading users:', e);
      }
      try {
        const coursesData = await courseService.getCourses();
        setDbCourses(coursesData.courses || []);
      } catch (e) {
        console.error('Error loading courses:', e);
      }
      try {
        const paymentsData = await paymentService.getPayments();
        setDbPayments(paymentsData.payments || []);
      } catch (e) {
        console.error('Error loading payments:', e);
      }
    };
    loadData();
  }, []);

  const searchItems = [
    { label: 'Dashboard Principal', action: () => { setSection('dashboard'); setDashboardViewingUser(null); }, icon: <LayoutDashboard size={14} />, type: 'section', adminOnly: true },
    { label: 'Usuarios y Roles', action: () => { setSection('users'); setDashboardViewingUser(null); }, icon: <Users size={14} />, type: 'section', adminOnly: true },
    { label: 'Creación de Cursos', action: () => { setSection('courses'); setDashboardViewingUser(null); }, icon: <BookOpen size={14} />, type: 'section' },
    { label: 'Control de Pagos', action: () => { setSection('payments'); setDashboardViewingUser(null); }, icon: <CreditCard size={14} />, type: 'section', adminOnly: true },
    { label: 'Soporte y Tickets', action: () => { setSection('support'); setDashboardViewingUser(null); }, icon: <HelpCircle size={14} />, type: 'section', adminOnly: true },
    { label: 'Ajustes de Sistema', action: () => { setSection('settings'); setDashboardViewingUser(null); }, icon: <Settings size={14} />, type: 'section', adminOnly: true },
    ...dbUsers.map(u => ({ 
      label: `${u.name} - ${u.email} (${ROLE_TRANSLATIONS[u.role] || u.role})`, 
      action: () => { 
        setDashboardViewingUser(u);
        setSection('users'); 
      }, 
      icon: <UserPlus size={14} />, 
      type: 'user',
      adminOnly: true
    })),
    ...dbCourses.map(c => ({ label: `${c.title}`, action: () => setSection('courses'), icon: <Book size={14} />, type: 'course' }))
  ];

  const filteredSearch = searchItems
    .filter(item => role === 'ADMIN' || !('adminOnly' in item && item.adminOnly))
    .filter(item => {
      if (role === 'EDITOR' && (item.action.toString().includes("setSection('users')") || item.action.toString().includes("setSection('payments')") || item.action.toString().includes("setSection('support')"))) {
        return false;
      }
      return item.label.toLowerCase().includes(globalSearch.toLowerCase());
    });

  const navItems: { id: AdminSection; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, adminOnly: true },
    { id: 'users',     label: 'Usuarios y Roles', icon: <Users size={16} />, adminOnly: true },
    { id: 'courses',   label: 'Creación de Cursos', icon: <BookOpen size={16} /> },
    { id: 'payments',  label: 'Pagos', icon: <CreditCard size={16} />, adminOnly: true },
  ];

  const visibleNavItems = navItems.filter(item => role === 'ADMIN' || !item.adminOnly);

  // Removing early return so the main sidebar is preserved

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
      
      {/* Backdrop for mobile */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sliding Mobile Drawer Menu */}
      {sidebarOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setSidebarOpen(false)}>
          <div className="mobile-drawer-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', color: 'var(--primary)', margin: 0, fontFamily: 'var(--font-title)', fontWeight: 800 }}>IPC</h2>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--overlay-light)', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--primary)', border: '1px solid rgba(118,192,227,1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-main)', fontWeight: 700, fontSize: '14px' }}>AD</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>Admin User</div>
                <div style={{ fontSize: '11px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} /> Activo
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => { setSection('support'); setSidebarOpen(false); setShowCreateUserModal(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '8px', backgroundColor: section === 'support' ? 'var(--overlay-light)' : 'transparent', color: section === 'support' ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
                <HelpCircle size={16} /> Soporte
              </button>
              <button onClick={() => { setSection('settings'); setSidebarOpen(false); setShowCreateUserModal(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '8px', backgroundColor: section === 'settings' ? 'var(--overlay-light)' : 'transparent', color: section === 'settings' ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
                <Settings size={16} /> Configuración
              </button>
              <div style={{ borderTop: '1px solid var(--overlay-light)', margin: '16px 0 8px' }} />
              <ThemeToggle />
              <button onClick={async () => { await logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', color: '#ef4444', background: 'none', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%', borderRadius: '8px', textAlign: 'left', marginTop: '16px' }}>
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '32px 24px' }}>
          <h1 style={{ fontSize: '24px', lineHeight: '1', color: 'var(--primary)', fontFamily: 'var(--font-title)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Instituto Peruano de Compliance
          </h1>
          <p style={{ fontSize: '8px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '4px' }}>
            INSTITUTIONAL PORTAL
          </p>
        </div>

        <nav style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1, marginTop: '8px' }}>
          {visibleNavItems.map(item => {
            const isActive = section === item.id;
            return (
              <button
                key={item.id}
                className={isActive ? 'active' : ''}
                onClick={() => {
                  setSection(item.id);
                  if (item.id === 'payments') setPaymentsInitialOpenId(null);
                  if (item.id === 'courses') setEditingCourse(null);
                  setShowCreateUserModal(false);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 15px', borderRadius: '8px',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'rgba(0, 78, 187, 0.15)' : 'transparent',
                  border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 15px rgba(0, 78, 187, 0.25)' : 'none',
                  fontSize: '13px', fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  background: 'none',
                  width: '100%', textAlign: 'left', transition: 'all 0.25s ease'
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid var(--overlay-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-main)', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>AD</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Admin User</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} /> Active
              </div>
            </div>
          </div>
          <div style={{ padding: '16px 0', borderTop: '1px solid var(--overlay-light)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {role === 'ADMIN' && (
              <>
                <button onClick={() => { setSection('support'); setShowCreateUserModal(false); }} className={section === 'support' ? 'active' : ''} style={{
                   display: 'flex', alignItems: 'center', gap: '12px',
                   padding: '11px 15px', borderRadius: '8px',
                   backgroundColor: section === 'support' ? 'rgba(0, 78, 187, 0.15)' : 'transparent',
                   color: section === 'support' ? '#fff' : 'var(--text-muted)',
                   border: section === 'support' ? '1px solid var(--primary)' : '1px solid transparent',
                   boxShadow: section === 'support' ? '0 0 15px rgba(0, 78, 187, 0.25)' : 'none',
                   fontSize: '13px', fontWeight: section === 'support' ? 700 : 500,
                   cursor: 'pointer', textAlign: 'left', transition: 'all 0.25s ease'
                 }}>
                   <HelpCircle size={16} /> Soporte
                 </button>
                 <button onClick={() => { setSection('settings'); setShowCreateUserModal(false); }} className={section === 'settings' ? 'active' : ''} style={{
                   display: 'flex', alignItems: 'center', gap: '12px',
                   padding: '11px 15px', borderRadius: '8px',
                   backgroundColor: section === 'settings' ? 'rgba(0, 78, 187, 0.15)' : 'transparent',
                   color: section === 'settings' ? '#fff' : 'var(--text-muted)',
                   border: section === 'settings' ? '1px solid var(--primary)' : '1px solid transparent',
                   boxShadow: section === 'settings' ? '0 0 15px rgba(0, 78, 187, 0.25)' : 'none',
                   fontSize: '13px', fontWeight: section === 'settings' ? 700 : 500,
                   cursor: 'pointer', textAlign: 'left', transition: 'all 0.25s ease'
                 }}>
                   <Settings size={16} /> Settings
                 </button>
              </>
            )}
            <button onClick={async () => { await logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', color: '#ef4444', background: 'none', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%', borderRadius: '8px', marginTop: '4px' }}>
              <LogOut size={16} /> Cerrar Sesión
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="app-main" style={{ marginLeft: '280px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Topbar */}
        <header className="admin-topbar" style={{ height: '72px', borderBottom: '1px solid var(--overlay-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', position: 'sticky', top: 0, backgroundColor: 'var(--bg-main)', zIndex: 40 }}>
          {/* Left Side: Hamburger & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexGrow: 1 }}>
            {/* Hamburger for mobile */}
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
              <span/><span/><span/>
            </button>
            <div className="mobile-logo-text" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-title)', letterSpacing: '-0.02em' }}>
              IPC
            </div>
            <div className="header-search-container" style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
              <Search size={15} color={isSearchFocused ? 'var(--primary)' : 'var(--text-muted)'} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', transition: 'color 0.2s' }} />
              <input 
                type="text" 
                placeholder="Buscar en el portal (Ej. usuarios, cursos)..." 
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                style={{ 
                  width: '100%', backgroundColor: 'var(--overlay-light)', 
                  border: `1px solid ${isSearchFocused ? 'var(--primary)' : 'var(--overlay-light)'}`, 
                  borderRadius: '9999px', padding: '10px 14px 10px 42px', color: 'var(--text-main)', fontSize: '13px', outline: 'none',
                  transition: 'all 0.2s ease', boxShadow: isSearchFocused ? '0 0 0 2px rgba(118,192,227,1)' : 'none'
                }} 
              />
              {isSearchFocused && globalSearch && (
                <div style={{ position: 'absolute', top: 'calc(100% + 12px)', left: 0, width: '100%', backgroundColor: 'var(--bg-card)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-glass)', zIndex: 100 }}>
                  <div style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', borderBottom: '1px solid var(--overlay-light)' }}>RESULTADOS GLOBALES</div>
                  {filteredSearch.length > 0 ? (
                    filteredSearch.map(item => (
                      <button
                        key={item.label}
                        onClick={() => {
                          item.action();
                          setGlobalSearch('');
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '13px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = 'rgba(118,192,227,1)';
                          e.currentTarget.style.color = 'var(--text-main)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-main)';
                        }}
                      >
                        <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.icon}
                        </div>
                        <div style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ opacity: 0.7, marginRight: '4px' }}>
                            {item.type === 'section' ? 'Ir a:' : item.type === 'user' ? 'Usuario:' : 'Curso:'}
                          </span>
                          <span style={{ fontWeight: 600 }}><span>{item.label}</span></span>
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
              )}
            </div>
          </div>
          <div className="header-user-container" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            <div className="header-user-text" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Nombre de Usuario</div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em' }}>ADMIN</div>
            </div>
            <div className="header-user-avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-main)', fontWeight: 700, fontSize: '12px' }}>AD</div>
          </div>
        </header>

        {/* Page content */}
        <div className="admin-content-pad" style={{ flexGrow: 1 }}>

          {/* ─── DASHBOARD ─── */}
          {section === 'dashboard' && (
            <>
              <div className="admin-header-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px' }}>DASHBOARD INSTITUCIONAL</div>
                  <h2 className="admin-hero-title" style={{ fontSize: '36px', fontWeight: 800, margin: 0, fontFamily: 'var(--font-title)', textTransform: 'uppercase', letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
                    Bienvenido, <span style={{ color: 'var(--primary)' }}>Instituto Peruano de Compliance</span>
                  </h2>
                </div>
                <button onClick={() => { setSection('users'); setShowCreateUserModal(true); }} className="btn-primary" style={{ padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus size={16} /> Nuevo Usuario
                </button>
              </div>



              {/* KPI Cards */}
              <div className="kpi-grid" style={{ marginBottom: '48px' }}>
                {[
                  { label: 'Total Estudiantes', value: String(dbUsers.filter(u => u.role === 'STUDENT').length), badge: '0%', badgeColor: 'var(--text-muted)', icon: <UsersRound size={20} color="var(--text-muted)" />, iconBg: 'var(--overlay-light)' },
                  { label: 'Pagos Pendientes', value: String(dbPayments.filter(p => p.status === 'PENDIENTE').length), badge: '0%', badgeColor: 'var(--text-muted)', icon: <Clock size={20} color="var(--text-muted)" />, iconBg: 'var(--overlay-light)' },
                  { label: 'Cursos Activos', value: String(dbCourses.length), badge: '0%', badgeColor: 'var(--text-muted)', icon: <Book size={20} color="var(--text-muted)" />, iconBg: 'var(--overlay-light)' },
                  { label: 'Ingresos del Mes', value: '$' + dbPayments.filter(p => p.status === 'APROBADO').reduce((sum, p) => sum + p.amount, 0).toLocaleString(), badge: '0%', badgeColor: 'var(--text-muted)', icon: <DollarSign size={20} color="var(--primary)" />, iconBg: 'rgba(0, 78, 187, 0.15)' },
                ].map((kpi, i) => (
                  <div key={i} className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--overlay-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: kpi.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{kpi.icon}</div>
                      <span style={{ fontSize: '11px', color: kpi.badgeColor, fontWeight: 600 }}>{kpi.badge}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{kpi.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: 800 }}>{kpi.value}</div>
                  </div>
                ))}
              </div>

              <div className="admin-dashboard-grid" style={{ marginBottom: '32px' }}>
                
                {/* Left */}
                <div>
                  <h3 className="admin-section-heading" style={{ marginBottom: '24px' }}>Atajos</h3>
                  <div className="admin-shortcuts-grid" style={{ marginBottom: '48px' }}>
                    {[
                      { icon: <UserPlus size={20} />, label: 'Crear Nuevo\nUsuario', action: () => { setSection('users'); setShowCreateUserModal(true); } },
                      { icon: <UploadCloud size={20} />, label: 'Subir Lección', action: () => { setSection('courses'); setEditingCourse('Nuevo Curso'); } },
                      { icon: <CheckCircle2 size={20} />, label: 'Validar\nPagos', action: () => setSection('payments') },
                      { icon: <FileText size={20} />, label: 'Generar\nReporte', action: () => setSection('support') },
                    ].map((btn, i) => (
                      <button 
                        key={i} 
                        onClick={btn.action} 
                        className="glass-panel admin-shortcut-btn"
                      >
                        {btn.icon}
                        <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', whiteSpace: 'pre-line' }}>{btn.label}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <h3 className="admin-section-heading" style={{ marginBottom: '4px' }}>Directorio de Usuarios</h3>
                      <button onClick={() => setSection('users')} style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                        Ver directorio <ArrowUpRight size={14} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {/* Rol Filter */}
                      <div style={{ position: 'relative', zIndex: 30 }}>
                        <CustomSelect
                          value={dashRoleFilter}
                          onChange={setDashRoleFilter}
                          options={[
                            { value: "Todos", label: "Rol: Todos" },
                            { value: "EDITOR", label: "Rol: Editor" },
                            { value: "STUDENT", label: "Rol: Estudiante" },
                            { value: "ADMIN", label: "Rol: Administrador" }
                          ]}
                        />
                      </div>

                      {/* Estado Filter */}
                      <div style={{ position: 'relative', zIndex: 20 }}>
                        <CustomSelect
                          value={dashStatusFilter}
                          onChange={setDashStatusFilter}
                          options={[
                            { value: "Todos", label: "Estado: Todos" },
                            { value: "Activo", label: "Estado: Activo" },
                            { value: "Pendiente", label: "Estado: Pendiente" },
                            { value: "Inactivo", label: "Estado: Inactivo" }
                          ]}
                        />
                      </div>

                      {/* Vista Toggle */}
                      <div style={{ display: 'flex', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '2px', gap: '2px' }}>
                        <button
                          onClick={() => setDashUserView('list')}
                          style={{
                            background: dashUserView === 'list' ? 'rgba(118,192,227,1)' : 'transparent',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 8px',
                            color: dashUserView === 'list' ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                          title="Vista de Lista"
                        >
                          <List size={14} />
                        </button>
                        <button
                          onClick={() => setDashUserView('cards')}
                          style={{
                            background: dashUserView === 'cards' ? 'rgba(118,192,227,1)' : 'transparent',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 8px',
                            color: dashUserView === 'cards' ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                          title="Vista de Tarjetas"
                        >
                          <LayoutGrid size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── Table/Cards Container ── */}
                  <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--overlay-light)' }}>
                    {dashUserView === 'list' ? (
                      <div className="table-scroll-wrap" style={{ overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--overlay-light)' }}>
                              {['USUARIO', 'ROL', 'ESTADO', 'ACCIONES'].map(h => (
                                <th key={h} style={{ padding: '14px 24px', fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.1em', fontWeight: 700 }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const filtered = dbUsers.filter(u => {
                                const matchRole = dashRoleFilter === 'Todos' || u.role === dashRoleFilter;
                                const matchStatus = dashStatusFilter === 'Todos' || u.status === dashStatusFilter;
                                return matchRole && matchStatus;
                              });

                              if (filtered.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={4} style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                      No se encontraron usuarios con los filtros aplicados.
                                    </td>
                                  </tr>
                                );
                              }

                              return filtered.slice(0, 3).map((user: User) => {
                                const initials = user.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
                                const avatarColor = (() => {
                                  const colors = ['#ff6f00', '#3b82f6', '#8b5cf6', '#10b981'];
                                  let hash = 0;
                                  for (let i = 0; i < user.name.length; i++) hash = user.name.charCodeAt(i) + ((hash << 5) - hash);
                                  return colors[Math.abs(hash) % colors.length];
                                })();

                                const badgeStyle = (() => {
                                  const map: Record<'ADMIN' | 'EDITOR' | 'STUDENT', { backgroundColor: string; color: string }> = {
                                    EDITOR:  { backgroundColor: 'rgba(118,192,227,1)',  color: 'var(--primary)' },
                                    STUDENT: { backgroundColor: 'rgba(59,130,246,0.12)', color: '#60a5fa'        },
                                    ADMIN:   { backgroundColor: 'rgba(168,85,247,0.12)', color: '#c084fc'        },
                                  };
                                  return map[user.role] || map.STUDENT;
                                })();

                                const dotColor = ({ Activo: '#22c55e', Pendiente: '#f59e0b', Inactivo: '#ef4444' } as Record<string, string>)[user.status] || '#22c55e';

                                return (
                                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '14px 24px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {user.avatarUrl ? (
                                          <img src={user.avatarUrl} alt={user.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                        ) : (
                                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: avatarColor + '22', border: `1px solid ${avatarColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: avatarColor, fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                                            {initials}
                                          </div>
                                        )}
                                        <div>
                                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{user.name}</div>
                                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td style={{ padding: '14px 24px' }}>
                                      <span style={{ padding: '4px 8px', borderRadius: '4px', ...badgeStyle, fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>{ROLE_TRANSLATIONS[user.role] || user.role}</span>
                                    </td>
                                    <td style={{ padding: '14px 24px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dotColor }} /> {user.status}
                                      </div>
                                    </td>
                                    <td style={{ padding: '14px 24px' }}>
                                      <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)' }}>
                                        <Edit2 size={14} style={{ cursor: 'pointer' }} onClick={() => { setDashboardViewingUser(user); setSection('users'); }} />
                                        <Trash2 size={14} style={{ cursor: 'pointer' }} />
                                      </div>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', borderBottom: '1px solid var(--overlay-light)' }}>
                        {(() => {
                          const filtered = dbUsers.filter(u => {
                            const matchRole = dashRoleFilter === 'Todos' || u.role === dashRoleFilter;
                            const matchStatus = dashStatusFilter === 'Todos' || u.status === dashStatusFilter;
                            return matchRole && matchStatus;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div style={{ gridColumn: '1 / -1', padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                No se encontraron usuarios con los filtros aplicados.
                              </div>
                            );
                          }

                          return filtered.slice(0, 3).map((user: User) => {
                            const initials = user.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
                            const avatarColor = (() => {
                              const colors = ['#ff6f00', '#3b82f6', '#8b5cf6', '#10b981'];
                              let hash = 0;
                              for (let i = 0; i < user.name.length; i++) hash = user.name.charCodeAt(i) + ((hash << 5) - hash);
                              return colors[Math.abs(hash) % colors.length];
                            })();

                            const badgeStyle = (() => {
                              const map: Record<'ADMIN' | 'EDITOR' | 'STUDENT', { backgroundColor: string; color: string }> = {
                                EDITOR:  { backgroundColor: 'rgba(118,192,227,1)',  color: 'var(--primary)' },
                                STUDENT: { backgroundColor: 'rgba(59,130,246,0.12)', color: '#60a5fa'        },
                                ADMIN:   { backgroundColor: 'rgba(168,85,247,0.12)', color: '#c084fc'        },
                              };
                              return map[user.role] || map.STUDENT;
                            })();

                            const dotColor = ({ Activo: '#22c55e', Pendiente: '#f59e0b', Inactivo: '#ef4444' } as Record<string, string>)[user.status] || '#22c55e';

                            return (
                              <div
                                key={user.id}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 12,
                                  padding: '16px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '12px',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ padding: '3px 6px', borderRadius: '4px', ...badgeStyle, fontSize: '9px', fontWeight: 700 }}>{ROLE_TRANSLATIONS[user.role] || user.role}</span>
                                  <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)' }}>
                                    <Edit2 size={12} style={{ cursor: 'pointer' }} onClick={() => { setDashboardViewingUser(user); setSection('users'); }} />
                                    <Trash2 size={12} style={{ cursor: 'pointer' }} />
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                  ) : (
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: avatarColor + '22', border: `1px solid ${avatarColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: avatarColor, fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                                      {initials}
                                    </div>
                                  )}
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--overlay-light)', fontSize: '10px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: dotColor }} /> {user.status}
                                  </div>
                                  <span style={{ color: 'var(--text-muted)' }}>{user.lastActivity}</span>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                    <div style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--overlay-light)' }}>
                      {(() => {
                        const totalFiltered = dbUsers.filter(u => {
                          const matchRole = dashRoleFilter === 'Todos' || u.role === dashRoleFilter;
                          const matchStatus = dashStatusFilter === 'Todos' || u.status === dashStatusFilter;
                          return matchRole && matchStatus;
                        }).length;

                        return (
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                            Mostrando {Math.min(3, totalFiltered)} de {totalFiltered} usuarios
                          </span>
                        );
                      })()}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><ChevronLeft size={15} /></button>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><ChevronRight size={15} /></button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right (Notifications) */}
                <div className="admin-alerts-panel-wrapper">
                  <div className="glass-panel admin-alerts-panel" style={{ padding: '28px 24px', borderRadius: '16px', border: '1px solid var(--overlay-light)' }}>
                    <h3 className="admin-section-heading" style={{ marginBottom: '24px' }}>Notificaciones</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {adminNotifications.filter((n: any) => !n.read).length === 0 ? (
                        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                          Sin notificaciones pendientes.
                        </div>
                      ) : (
                        adminNotifications.filter((n: any) => !n.read).map((notif: any) => {
                          const initials = notif.studentName ? notif.studentName.split(' ').slice(0, 2).map((s: string) => s[0]).join('').toUpperCase() : 'U';
                          if (notif.type === 'new_user') {
                            return (
                              <div key={notif.id} className="admin-alert-item" style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                                  <div style={{ 
                                    width: '36px', height: '36px', borderRadius: '50%', 
                                    backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-main)', fontWeight: 700, fontSize: '12px', flexShrink: 0
                                  }}>
                                    {initials}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '9px', color: '#22c55e', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '2px' }}>NUEVO REGISTRO</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 600, marginBottom: '2px' }}>Nuevo usuario registrado</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{notif.studentName}</span> ({notif.studentEmail})
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                                      {new Date(notif.submittedAt).toLocaleDateString('es-PE')}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button 
                                    onClick={() => { setSection('users'); markNotifRead(notif.id); }} 
                                    style={{ 
                                      flex: 1,
                                      padding: '8px', 
                                      borderRadius: '8px', 
                                      backgroundColor: 'var(--primary)', 
                                      color: '#ffffff', 
                                      border: 'none', 
                                      fontSize: '11px', 
                                      fontWeight: 600, 
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                    }}
                                  >
                                    Ver Usuario
                                  </button>
                                  <button 
                                    onClick={() => markNotifRead(notif.id)} 
                                    style={{ 
                                      padding: '8px 12px', 
                                      borderRadius: '8px', 
                                      backgroundColor: 'transparent', 
                                      color: 'var(--text-muted)', 
                                      border: '1px solid var(--border-color)', 
                                      fontSize: '11px', 
                                      fontWeight: 600, 
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Descartar
                                  </button>
                                </div>
                              </div>
                            );
                          } else {
                            // payment_voucher notification
                            return (
                              <div key={notif.id} className="admin-alert-item urgent" style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                                  <div style={{ 
                                    width: '36px', height: '36px', borderRadius: '50%', 
                                    backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#f59e0b', fontWeight: 700, fontSize: '12px', flexShrink: 0
                                  }}>
                                    {initials}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '9px', color: '#f59e0b', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '2px' }}>PAGO PENDIENTE</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 600, marginBottom: '2px' }}>
                                      {notif.courseTitle || 'Comprobante de pago'}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{notif.studentName}</span> ({notif.studentEmail})
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                                      Archivo: {notif.fileName}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button 
                                    onClick={() => { setPaymentsInitialOpenId(notif.id); setSection('payments'); }} 
                                    style={{ 
                                      flex: 1,
                                      padding: '8px', 
                                      borderRadius: '8px', 
                                      backgroundColor: 'var(--primary)', 
                                      color: '#ffffff', 
                                      border: 'none', 
                                      fontSize: '11px', 
                                      fontWeight: 600, 
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                    }}
                                  >
                                    Revisar Pago
                                  </button>
                                  <button 
                                    onClick={() => markNotifRead(notif.id)} 
                                    style={{ 
                                      padding: '8px 12px', 
                                      borderRadius: '8px', 
                                      backgroundColor: 'transparent', 
                                      color: 'var(--text-muted)', 
                                      border: '1px solid var(--border-color)', 
                                      fontSize: '11px', 
                                      fontWeight: 600, 
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Descartar
                                  </button>
                                </div>
                              </div>
                            );
                          }
                        })
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* ─── USUARIOS Y ROLES ─── */}
          {section === 'users' && (
            <AdminUsersPage 
              initialViewingUser={dashboardViewingUser} 
              initialShowCreateModal={showCreateUserModal}
              onCloseCreateModal={() => setShowCreateUserModal(false)}
            />
          )}

          {/* ─── CREACIÓN DE CURSOS ─── */}
          {section === 'courses' && !editingCourse && (
            <AdminCoursesPage onEditCourse={(name) => setEditingCourse(name)} />
          )}

          {/* ─── COURSE EDITOR ─── */}
          {section === 'courses' && editingCourse && (
            <div className="admin-course-editor-wrapper">
              <AdminCourseEditorPage
                courseName={editingCourse}
                onBack={() => setEditingCourse(null)}
              />
            </div>
          )}

          {/* ─── PAGOS ─── */}
          {section === 'payments' && <AdminPaymentsPage initialOpenPaymentId={paymentsInitialOpenId} />}

          {/* ─── SETTINGS ─── */}
          {section === 'settings' && <AdminSettingsPage />}

          {/* ─── SUPPORT ─── */}
          {section === 'support' && <AdminSupportPage />}

        </div>

        {/* Footer */}
        <div className="admin-footer-wrapper" style={{ margin: '64px auto 48px', maxWidth: '1200px', width: '100%', padding: '0 48px' }}>
          <StudentFooter />
        </div>
      </main>
      {isDemoMode && (
        <div
          className="demo-badge"
          onClick={async () => {
            if (window.confirm('¿Deseas reiniciar todos los datos de la de la demo? Esto restaurará la base de datos a su estado original y limpiará el almacenamiento local.')) {
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
    </div>
  );
};

