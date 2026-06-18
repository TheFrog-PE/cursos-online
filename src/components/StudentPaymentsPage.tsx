import React, { useState, useEffect } from 'react';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';
import { DollarSign, Clock, BookOpen, ChevronLeft, ChevronRight, LayoutGrid, List, ChevronDown, X, User as UserIcon, Phone, Mail, FileText } from 'lucide-react';
import { paymentService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const statusConfig: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  PENDIENTE: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', dot: '#f59e0b', label: 'EN REVISIÓN' },
  APROBADO: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', dot: '#22c55e', label: 'APROBADO' },
  RECHAZADO: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', dot: '#ef4444', label: 'RECHAZADO' },
};

const tabs = ['Todos', 'En Revisión', 'Aprobados', 'Rechazados'];

const getInitials = (title: string) => {
  if (!title) return 'IP';
  return title
    .replace('Certificación Oficial en ', '')
    .replace('Especialista en ', '')
    .replace('Curso Online de ', '')
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

export const StudentPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const loadPayments = async () => {
    try {
      const res = await paymentService.getUserPayments();
      setPaymentsList(res.payments.map((p: any) => ({
        id: p.id,
        course: p.courseTitle || 'Curso Adquirido',
        amount: `S/ ${p.amount}`,
        date: new Date(p.date).toLocaleDateString('es-PE'),
        status: p.status,
        comprobanteUrl: p.comprobanteUrl
      })));
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filtered = paymentsList.filter(p => {
    if (activeTab === 'Todos') return true;
    if (activeTab === 'En Revisión') return p.status === 'PENDIENTE';
    if (activeTab === 'Aprobados') return p.status === 'APROBADO';
    if (activeTab === 'Rechazados') return p.status === 'RECHAZADO';
    return true;
  });

  const totalPending = paymentsList.filter(p => p.status === 'PENDIENTE').length;
  const totalApproved = paymentsList.filter(p => p.status === 'APROBADO').length;
  const totalInvested = paymentsList
    .filter(p => p.status === 'APROBADO')
    .reduce((s, p) => {
      const val = parseFloat(p.amount.replace(/[^0-9.]/g, ''));
      return s + (isNaN(val) ? 0 : val);
    }, 0);

  if (loading) {
    return <div style={{ color: 'var(--text-main)', padding: '40px', textAlign: 'center' }}>Cargando tus pagos...</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
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

        <div className="course-content-wrapper" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-title)', margin: '0 0 6px 0', letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--text-main)' }}>
              Historial de Pagos
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
              Revisa el estado de tus comprobantes enviados.
            </p>
          </div>

          {/* KPI Cards (3 cols layout) */}
          <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
            {/* EN REVISION */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '14px', border: '1px solid var(--overlay-light)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.06 }}>
                <Clock size={80} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase' }}>EN REVISIÓN</div>
              <div style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>{totalPending}</div>
              <div style={{ fontSize: '11px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                Esperando validación
              </div>
            </div>

            {/* TOTAL INVERTIDO */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '14px', border: '1px solid var(--overlay-light)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.06 }}>
                <DollarSign size={80} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase' }}>TOTAL INVERTIDO</div>
              <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: 'var(--primary)' }}>
                S/ {totalInvested.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '11px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Pagos confirmados
              </div>
            </div>

            {/* CURSOS ADQUIRIDOS */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '14px', border: '1px solid var(--overlay-light)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.06 }}>
                <BookOpen size={80} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase' }}>CURSOS ADQUIRIDOS</div>
              <div style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>{totalApproved}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Cursos activos en tu cuenta
              </div>
            </div>
          </div>

          {/* Tabs + Filters Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
            
            {/* Desktop Tabs */}
            <div className="desktop-filter-tabs" style={{ gap: '4px', backgroundColor: 'var(--overlay-light)', padding: '4px', borderRadius: '10px', border: '1px solid var(--overlay-light)' }}>
              {tabs.map(tab => {
                const isSelected = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                    style={{
                      padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '12px', fontWeight: isSelected ? 700 : 600, transition: 'all 0.15s',
                      backgroundColor: isSelected ? 'rgba(0, 78, 187, 0.15)' : 'transparent',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                      color: isSelected ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {tab}
                    {tab === 'En Revisión' && (
                      <span style={{ 
                        marginLeft: '6px', 
                        backgroundColor: '#f59e0b', 
                        color: '#0c0b0b', 
                        fontSize: '9px', 
                        fontWeight: 800, 
                        padding: '2px 5px', 
                        borderRadius: '10px' 
                      }}>
                        {totalPending}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right side container: Mobile select dropdown & View Mode Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
              
              {/* Custom Select Dropdown for Mobile */}
              <div className="mobile-filter-select" style={{ position: 'relative', display: 'none' }}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    minWidth: '130px',
                    outline: 'none'
                  }}
                >
                  <span>{activeTab === 'En Revisión' ? `En Revisión (${totalPending})` : activeTab}</span>
                  <ChevronDown size={14} color="var(--primary)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>

                {isDropdownOpen && (
                  <>
                    <div 
                      onClick={() => setIsDropdownOpen(false)} 
                      style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                    />
                    
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      boxShadow: 'var(--shadow-glass)',
                      padding: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      zIndex: 100,
                      minWidth: '145px',
                      backdropFilter: 'blur(16px)',
                      animation: 'fadeInSlide 0.2s ease-out'
                    }}>
                      {tabs.map(tab => {
                        const isSelected = activeTab === tab;
                        return (
                          <button
                            key={tab}
                            onClick={() => {
                              setActiveTab(tab);
                              setCurrentPage(1);
                              setIsDropdownOpen(false);
                            }}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: isSelected ? 'rgba(0, 78, 187, 0.12)' : 'transparent',
                              color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                              fontSize: '12px',
                              fontWeight: isSelected ? 700 : 500,
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.15s',
                              width: '100%',
                              minWidth: '135px'
                            }}
                          >
                            <span>{tab}</span>
                            {tab === 'En Revisión' && (
                              <span style={{ 
                                backgroundColor: '#f59e0b', 
                                color: 'var(--bg-main)', 
                                fontSize: '9px', 
                                fontWeight: 800, 
                                padding: '1px 5px', 
                                borderRadius: '10px',
                                marginLeft: '6px'
                              }}>
                                {totalPending}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* View mode toggle */}
              <div style={{ display: 'flex', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px', height: '32px', alignItems: 'center' }}>
                <button onClick={() => setViewMode('list')} style={{ background: viewMode === 'list' ? 'var(--overlay-medium)' : 'transparent', border: 'none', padding: '4px 6px', borderRadius: '4px', color: viewMode === 'list' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', height: '100%' }}>
                  <List size={16} />
                </button>
                <button onClick={() => setViewMode('grid')} style={{ background: viewMode === 'grid' ? 'var(--overlay-medium)' : 'transparent', border: 'none', padding: '4px 6px', borderRadius: '4px', color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', height: '100%' }}>
                  <LayoutGrid size={16} />
                </button>
              </div>

            </div>
          </div>

          {viewMode === 'list' ? (
            <>
              {/* Desktop Table View */}
              <div className="desktop-table-view glass-panel table-scroll-wrap" style={{ borderRadius: '16px', overflow: 'auto', border: '1px solid var(--overlay-light)', marginBottom: '32px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {['CURSO', 'MONTO', 'FECHA DE PAGO', 'ESTADO', 'ACCIONES'].map(h => (
                        <th key={h} style={{ padding: '14px 20px', fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.1em', fontWeight: 700, textAlign: 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((payment, idx) => {
                      const sc = statusConfig[payment.status];
                      return (
                        <tr
                          key={payment.id}
                          style={{
                            borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid var(--overlay-light)',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--overlay-light)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {/* Course */}
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                backgroundColor: 'rgba(0, 78, 187, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--primary)', fontSize: '11px', fontWeight: 700, flexShrink: 0
                              }}>
                                {getInitials(payment.course)}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{payment.course}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {payment.id.split('-')[0]}</div>
                              </div>
                            </div>
                          </td>

                          {/* Amount */}
                          <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                            {payment.amount}
                          </td>

                          {/* Date */}
                          <td style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            {payment.date}
                          </td>

                          {/* Status */}
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              backgroundColor: sc.bg, color: sc.color,
                              padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em',
                              whiteSpace: 'nowrap', flexShrink: 0
                            }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot, boxShadow: `0 0 5px ${sc.dot}` }} />
                              {sc.label}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <button
                                onClick={() => setSelectedPayment(payment)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--primary)',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                Ver Detalle
                              </button>
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = payment.comprobanteUrl || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop';
                                  link.target = '_blank';
                                  link.download = `Comprobante_${payment.id.split('-')[0]}.pdf`;
                                  link.click();
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    No hay pagos con este filtro.
                  </div>
                )}
              </div>

              {/* Mobile Card List View (Table Row-based style) */}
              <div className="mobile-list-view" style={{ display: 'none', flexDirection: 'column', borderRadius: '16px', border: '1px solid var(--overlay-light)', overflow: 'hidden', backgroundColor: 'var(--bg-card)', marginBottom: '32px' }}>
                {filtered.map((payment, idx) => {
                  const sc = statusConfig[payment.status];
                  return (
                    <div key={payment.id} style={{ 
                      padding: '16px', 
                      borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid var(--overlay-light)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px' 
                    }}>
                      {/* Fila principal: Curso, Monto y Estado */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: 'rgba(0, 78, 187, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--primary)', fontSize: '11px', fontWeight: 700, flexShrink: 0
                          }}>
                            {getInitials(payment.course)}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{payment.course}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ID: {payment.id.split('-')[0]}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>{payment.amount}</span>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            backgroundColor: sc.bg, color: sc.color,
                            padding: '2px 8px', borderRadius: '20px', fontSize: '8px', fontWeight: 700, letterSpacing: '0.06em',
                            whiteSpace: 'nowrap', flexShrink: 0
                          }}>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: sc.dot }} />
                            {sc.label}
                          </span>
                        </div>
                      </div>

                      {/* Fila del curso, fecha y acciones compactas alineadas */}
                      <div style={{ 
                        backgroundColor: 'var(--bg-main)', 
                        padding: '12px 14px', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        {/* Detalles de fecha */}
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                            Fecha de pago: {payment.date}
                          </span>
                        </div>
                        {/* Botón de descarga móvil */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            style={{
                              background: 'var(--overlay-light)',
                              border: '1px solid var(--overlay-medium)',
                              color: 'var(--text-main)',
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            Detalle
                          </button>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = payment.comprobanteUrl || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop';
                              link.target = '_blank';
                              link.download = `Comprobante_${payment.id.split('-')[0]}.pdf`;
                              link.click();
                            }}
                            style={{
                              background: 'var(--primary)',
                              border: 'none',
                              color: '#fff',
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No hay pagos con este filtro.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {filtered.map(payment => {
                const sc = statusConfig[payment.status];
                return (
                  <div key={payment.id} className="glass-panel" style={{ borderRadius: '16px', padding: '24px', border: '1px solid var(--overlay-light)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(0, 78, 187, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                          {getInitials(payment.course)}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{payment.course}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {payment.id.split('-')[0]}</div>
                        </div>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: sc.bg, color: sc.color, padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot, boxShadow: `0 0 5px ${sc.dot}` }} />
                        {sc.label}
                      </span>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Monto Pagado</div>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>{payment.amount}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Fecha de pago</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{payment.date}</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--overlay-light)',
                          border: '1px solid var(--overlay-medium)',
                          color: 'var(--text-main)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        Ver Detalle
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = payment.comprobanteUrl || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop';
                          link.target = '_blank';
                          link.download = `Comprobante_${payment.id.split('-')[0]}.pdf`;
                          link.click();
                        }}
                        className="btn-primary"
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        Descargar PDF
                      </button>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', backgroundColor: 'var(--overlay-light)', borderRadius: '16px', border: '1px dashed var(--overlay-medium)' }}>
                  No hay pagos con este filtro.
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          <div style={{ padding: '16px 24px', backgroundColor: 'var(--overlay-light)', borderRadius: '16px', border: '1px solid var(--overlay-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Mostrando {filtered.length} de {paymentsList.length} resultados
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="app-pagination-btn"
              >
                <ChevronLeft size={14} />
              </button>
              {[1].map(p => (
                <button 
                  key={p} 
                  onClick={() => setCurrentPage(p)} 
                  className={`app-pagination-btn ${p === currentPage ? 'active' : ''}`}
                >
                  {p}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(1, p + 1))} 
                disabled={currentPage === 1}
                className="app-pagination-btn"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Alert Message for Student (similar to Admin's action required alert) */}
          {totalPending > 0 && (
            <div className="glass-panel" style={{ borderRadius: '14px', padding: '20px 24px', border: '1px solid rgba(245,158,11,0.2)', backgroundColor: 'rgba(245,158,11,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
                <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.08em' }}>
                  {totalPending} PAGO(S) EN REVISIÓN
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                Estamos verificando tus comprobantes de pago. Una vez aprobados, tendrás acceso inmediato a los cursos correspondientes.
              </p>
            </div>
          )}

        </div>
      </main>

      {/* DETAIL MODAL */}
      {selectedPayment && (() => {
        const sc = statusConfig[selectedPayment.status];
        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Click outside to close */}
            <div onClick={() => setSelectedPayment(null)} style={{ position: 'absolute', inset: 0, zIndex: 1001 }} />
            
            <div className="glass-panel" style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-glass)',
              position: 'relative',
              zIndex: 1002,
              padding: 'clamp(20px, 4vw, 32px)',
              animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              {/* Close Button */}
              <button 
                onClick={() => setSelectedPayment(null)}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '20px',
                  background: 'var(--overlay-light)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--overlay-light)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FileText size={20} color="var(--primary)" />
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Comprobante de Pago Electrónico
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Detalles de la Transacción
                </h3>
              </div>

              {/* Grid content */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px'
              }}>
                {/* Left Side: Information */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Curso Adquirido</h4>
                    <p style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-main)', lineHeight: '1.4' }}>{selectedPayment.course}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {selectedPayment.id}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'var(--overlay-light)', padding: '16px', borderRadius: '12px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Monto Pagado</span>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>{selectedPayment.amount}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Fecha</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{selectedPayment.date}</span>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 10px 0', borderBottom: '1px solid var(--overlay-light)', paddingBottom: '6px' }}>
                      Datos del Alumno
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                        <UserIcon size={14} color="var(--primary)" />
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user?.name || 'Estudiante de Prueba'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                        <Mail size={14} color="var(--primary)" />
                        <span style={{ color: 'var(--text-muted)' }}>{user?.email || 'estudiante@ipdcompliance.com'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                        <Phone size={14} color="var(--primary)" />
                        <span style={{ color: 'var(--text-muted)' }}>+51 913 330 912</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Estado de Verificación</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: sc.bg,
                        color: sc.color,
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.06em'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sc.dot, boxShadow: `0 0 6px ${sc.dot}` }} />
                        {sc.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Receipt Capture */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                    Captura de la Transferencia
                  </h4>
                  <div style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    aspectRatio: '3/4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={selectedPayment.comprobanteUrl || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop'} 
                      alt="Captura de Transferencia" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      insetInline: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <a 
                        href={selectedPayment.comprobanteUrl || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop'} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{
                          backgroundColor: 'var(--primary)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0, 78, 187, 0.3)'
                        }}
                      >
                        Ver Pantalla Completa
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
