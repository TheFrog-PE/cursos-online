import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load components
const LoginPage = lazy(() => import('./components/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./components/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TypingPracticePage = lazy(() => import('./components/TypingPracticePage').then(m => ({ default: m.TypingPracticePage })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(m => ({ default: m.ProfilePage })));
const HackerFinancieroPage = lazy(() => import('./components/HackerFinancieroPage').then(m => ({ default: m.HackerFinancieroPage })));
const EspecialistaCompliancePage = lazy(() => import('./components/EspecialistaCompliancePage').then(m => ({ default: m.EspecialistaCompliancePage })));
const ODPCPage = lazy(() => import('./components/ODPCPage').then(m => ({ default: m.ODPCPage })));
const AdminDashboardPage = lazy(() => import('./components/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const TicketViewerPage = lazy(() => import('./components/TicketViewerPage').then(m => ({ default: m.TicketViewerPage })));
const StudentSupportPage = lazy(() => import('./components/StudentSupportPage').then(m => ({ default: m.StudentSupportPage })));
const StudentPaymentsPage = lazy(() => import('./components/StudentPaymentsPage').then(m => ({ default: m.StudentPaymentsPage })));
const StudentCertificatesPage = lazy(() => import('./components/StudentCertificatesPage').then(m => ({ default: m.StudentCertificatesPage })));


const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh', 
      color: 'var(--text-muted)', 
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      letterSpacing: '0.05em'
    }}>
      Cargando página...
    </div>
  }>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  // Raíz — redirige según sesión
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // ── Rutas públicas ────────────────────────────────────────
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },
  {
    path: '/ticket/:ticketId',
    element: withSuspense(TicketViewerPage),
  },

  // ── Rutas protegidas (estudiante) ─────────────────────────
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        {withSuspense(DashboardPage)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/cursos/compliance',
    element: (
      <ProtectedRoute>
        {withSuspense(EspecialistaCompliancePage)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/cursos/odpc',
    element: (
      <ProtectedRoute>
        {withSuspense(ODPCPage)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/cursos/hacker-financiero',
    element: (
      <ProtectedRoute>
        {withSuspense(HackerFinancieroPage)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/cursos/:courseId',
    element: (
      <ProtectedRoute>
        {withSuspense(EspecialistaCompliancePage)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/perfil',
    element: (
      <ProtectedRoute>
        {withSuspense(ProfilePage)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/mecanografia',
    element: (
      <ProtectedRoute>
        {withSuspense(TypingPracticePage)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/soporte',
    element: (
      <ProtectedRoute>
        {withSuspense(StudentSupportPage)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/pagos',
    element: (
      <ProtectedRoute>
        {withSuspense(StudentPaymentsPage)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/certificados',
    element: (
      <ProtectedRoute>
        {withSuspense(StudentCertificatesPage)}
      </ProtectedRoute>
    ),
  },


  // ── Rutas protegidas (admin / editor) ─────────────────────
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
        {withSuspense(AdminDashboardPage)}
      </ProtectedRoute>
    ),
  },

  // ── Fallback ──────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

