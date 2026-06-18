import React, { useState, useEffect } from 'react';
import {
  DollarSign, Clock, UserCheck, ChevronLeft, ChevronRight,
  ExternalLink, CheckCircle, CheckCircle2, LayoutGrid, List, ChevronDown
} from 'lucide-react';
import { AdminPaymentModal } from './AdminPaymentModal';
import { paymentService } from '../services/api';

export interface Payment {
  id: string;
  userName: string;
  userEmail: string;
  initials: string;
  avatarColor: string;
  course: string;
  amount: string;
  date: string;
  status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  avatarUrl?: string;
}

const statusConfig: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  PENDIENTE:    { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', dot: '#f59e0b', label: 'PENDIENTE' },
  APROBADO:       { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e', dot: '#22c55e', label: 'APROBADO'    },
  RECHAZADO:  { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', dot: '#ef4444', label: 'RECHAZADO' },
};

const tabs = ['Todos', 'Pendientes', 'Activos', 'Desactivados'];

interface AdminPaymentsPageProps {
  initialOpenPaymentId?: string | null;
}

export const AdminPaymentsPage: React.FC<AdminPaymentsPageProps> = ({ initialOpenPaymentId }) => {
  const [activeTab, setActiveTab] = useState('Pendientes');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(!!initialOpenPaymentId);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(initialOpenPaymentId || null);
  const [isActivating, setIsActivating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getPayments();
      const backendPayments = (res.payments || []).map((p: any) => ({
        id: p.id,
        userName: p.user?.name || 'Alumno',
        userEmail: p.user?.email || 'email@email.com',
        initials: (p.user?.name || 'A').split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase(),
        avatarColor: '#3b82f6',
        course: p.courseTitle || 'Curso IPC',
        amount: `$${p.amount}`,
        date: new Date(p.date).toLocaleDateString('es-PE'),
        status: p.status,
        comprobanteUrl: p.comprobanteUrl,
        source: 'backend'
      }));
      setPaymentsList(backendPayments);
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleActivate = () => {
    setIsActivating(true);
    setTimeout(() => {
      setIsActivating(false);
    }, 2500);
  };

  const filtered = paymentsList.filter(p => {
    if (activeTab === 'Todos') return true;
    if (activeTab === 'Pendientes') return p.status === 'PENDIENTE';
    if (activeTab === 'Activos') return p.status === 'APROBADO';
    if (activeTab === 'Desactivados') return p.status === 'RECHAZADO';
    return true;
  });

  const totalPending = paymentsList.filter(p => p.status === 'PENDIENTE').length;
  const totalCollected = paymentsList.reduce((s, p) => s + parseFloat(p.amount.replace('$', '').replace(',', '')), 0);
  const toActivate = paymentsList.filter(p => p.status === 'PENDIENTE').length;


  if (loading) {
    return <div style={{ color: 'var(--text-main)', padding: '40px', textAlign: 'center' }}>Cargando validador de pagos...</div>;
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-title)', margin: '0 0 6px 0', letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--text-main)' }}>
          Validador de Pagos
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
          Gestión institucional de transacciones y activaciones de curso.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        
        {/* Pagos Pendientes */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '14px', border: '1px solid var(--overlay-light)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.06 }}>
            <Clock size={80} />
          </div>
          <div style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase' }}>PAGOS PENDIENTES</div>
          <div style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>{totalPending}</div>
          <div style={{ fontSize: '11px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
            +2 desde ayer
          </div>
        </div>

        {/* Total Recaudado */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '14px', border: '1px solid var(--overlay-light)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.06 }}>
            <DollarSign size={80} />
          </div>
          <div style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase' }}>TOTAL RECAUDADO (MES)</div>
          <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: 'var(--primary)' }}>
            ${totalCollected.toLocaleString('en', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↑</span> Aumentó un 20% este mes
          </div>
        </div>

        {/* Perfiles por Activar */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '14px', border: '1px solid var(--overlay-light)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.06 }}>
            <UserCheck size={80} />
          </div>
          <div style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase' }}>PERFILES POR ACTIVAR</div>
          <div style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>{toActivate}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Usuarios pendientes de activar
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
                {tab === 'Pendientes' && (
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
              <span>{activeTab === 'Pendientes' ? `Pendientes (${totalPending})` : activeTab}</span>
              <ChevronDown size={14} color="var(--primary)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>

            {isDropdownOpen && (
              <>
                {/* Overlay helper to close on click outside */}
                <div 
                  onClick={() => setIsDropdownOpen(false)} 
                  style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                />
                
                {/* Floating list */}
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
                  <style>
                    {`
                      @keyframes fadeInSlide {
                        0% { opacity: 0; transform: translateY(-4px); }
                        100% { opacity: 1; transform: translateY(0); }
                      }
                    `}
                  </style>
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
                        {tab === 'Pendientes' && (
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
                  {['USUARIO', 'CURSO', 'MONTO', 'FECHA', 'ESTADO', 'ACCIONES'].map(h => (
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
                      {/* User */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {payment.avatarUrl ? (
                            <img src={payment.avatarUrl} alt={payment.userName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              backgroundColor: payment.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'var(--text-main)', fontSize: '11px', fontWeight: 700
                            }}>
                              {payment.initials}
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{payment.userName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{payment.userEmail}</div>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {payment.course}
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
                          padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em'
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot, boxShadow: `0 0 5px ${sc.dot}` }} />
                          {sc.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => { setSelectedPaymentId(payment.id); setIsModalOpen(true); }} style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '6px 12px', borderRadius: '6px',
                            backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)',
                            color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                          }}>
                            <ExternalLink size={11} /> VER DETALLE
                          </button>
                          {payment.status === 'Pendiente' && (
                            <button onClick={handleActivate} className="btn-primary" style={{
                              display: 'flex', alignItems: 'center', gap: '5px',
                              padding: '6px 12px', borderRadius: '6px',
                              fontSize: '11px', fontWeight: 700, cursor: 'pointer', justifyContent: 'center'
                            }}>
                              <CheckCircle size={11} /> ACTIVAR
                            </button>
                          )}
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
                  {/* Fila principal: Usuario, Monto y Estado */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {payment.avatarUrl ? (
                        <img src={payment.avatarUrl} alt={payment.userName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          backgroundColor: payment.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-main)', fontSize: '11px', fontWeight: 700
                        }}>
                          {payment.initials}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{payment.userName}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{payment.userEmail}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>{payment.amount}</span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        backgroundColor: sc.bg, color: sc.color,
                        padding: '2px 8px', borderRadius: '20px', fontSize: '8px', fontWeight: 700, letterSpacing: '0.06em'
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
                    {/* Detalles del curso y fecha */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={payment.course}>
                        {payment.course}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        Fecha de pago: {payment.date}
                      </span>
                    </div>

                    {/* Acciones compactas (Iconos) alineadas a la derecha */}
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button onClick={() => { setSelectedPaymentId(payment.id); setIsModalOpen(true); }} style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s',
                        padding: 0, boxSizing: 'border-box'
                      }} title="Ver Detalle">
                        <ExternalLink size={16} />
                      </button>
                      {payment.status === 'PENDIENTE' && (
                        <button onClick={() => { setSelectedPaymentId(payment.id); setIsModalOpen(true); }} style={{
                          width: '36px', height: '36px', borderRadius: '8px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: 'var(--primary)', border: 'none',
                          color: '#0c0b0b', cursor: 'pointer', transition: 'all 0.2s',
                          padding: 0, boxSizing: 'border-box'
                        }} title="Activar Usuario">
                          <CheckCircle size={18} style={{ strokeWidth: 2.5 }} />
                        </button>
                      )}
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
              <div key={payment.id} className="glass-panel" style={{ borderRadius: '16px', padding: '24px', border: '1px solid var(--overlay-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {payment.avatarUrl ? (
                      <img src={payment.avatarUrl} alt={payment.userName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: payment.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', fontSize: '13px', fontWeight: 700 }}>
                        {payment.initials}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{payment.userName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{payment.userEmail}</div>
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: sc.bg, color: sc.color, padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot, boxShadow: `0 0 5px ${sc.dot}` }} />
                    {sc.label}
                  </span>
                </div>

                <div style={{ backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Curso Adquirido</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600, marginBottom: '12px' }}>{payment.course}</div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Monto</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>{payment.amount}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Fecha de pago</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{payment.date}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: payment.status === 'PENDIENTE' ? '1fr 1fr' : '1fr', gap: '8px' }}>
                  <button onClick={() => { setSelectedPaymentId(payment.id); setIsModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                    <ExternalLink size={13} /> VER DETALLES
                  </button>
                  {payment.status === 'PENDIENTE' && (
                    <button onClick={() => { setSelectedPaymentId(payment.id); setIsModalOpen(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                      <CheckCircle size={13} /> ACTIVAR
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Clock size={32} style={{ opacity: 0.2 }} />
              No hay comprobantes con este filtro.
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
          {[1, 2, 3].map(p => (
            <button 
              key={p} 
              onClick={() => setCurrentPage(p)} 
              className={`app-pagination-btn ${p === currentPage ? 'active' : ''}`}
            >
              {p}
            </button>
          ))}
          <button 
            onClick={() => setCurrentPage(p => Math.min(3, p + 1))} 
            disabled={currentPage === 3}
            className="app-pagination-btn"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Detail Modal Placeholder - shown for pending items */}
      <div className="glass-panel" style={{ borderRadius: '14px', padding: '20px 24px', border: '1px solid rgba(0, 78, 187, )', backgroundColor: 'rgba(0, 78, 187, )' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
          <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.08em' }}>
            {totalPending} PAGOS REQUIEREN ACCIÓN
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
          Revisa los pagos pendientes y activa los perfiles de usuario correspondientes. Los estudiantes recibirán acceso inmediato al curso tras la activación.
        </p>
      </div>

      {isModalOpen && selectedPaymentId && (
        <AdminPaymentModal 
          payment={paymentsList.find(p => p.id === selectedPaymentId)} 
          onClose={() => { setIsModalOpen(false); setSelectedPaymentId(null); }} 
          onStatusUpdate={() => {
            loadPayments();
          }}
        />
      )}

      {isActivating && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20,21,21,0.95)', zIndex: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '24px', textAlign: 'center' }}>
          <style>
            {`
              @keyframes ping {
                0% { transform: scale(1); opacity: 0.8; }
                100% { transform: scale(2); opacity: 0; }
              }
              @keyframes bounceIn {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes slideUpFade {
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
              }
            `}
          </style>
          <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.2)', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
            <div style={{ position: 'absolute', inset: '15px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.15)' }} />
            <CheckCircle2 size={60} color="#22c55e" style={{ position: 'relative', zIndex: 10, animation: 'bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) both' }} />
          </div>
          <h3 style={{ marginTop: '32px', fontSize: 'clamp(20px, 6vw, 32px)', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.02em', textTransform: 'uppercase', fontFamily: 'var(--font-title)', animation: 'slideUpFade 0.6s ease-out 0.2s both', lineHeight: 1.3, maxWidth: '100%' }}>
            Usuario Activado
          </h3>
          <p style={{ color: '#22c55e', fontSize: 'clamp(13px, 4vw, 15px)', fontWeight: 500, marginTop: '12px', animation: 'slideUpFade 0.6s ease-out 0.4s both', lineHeight: 1.4, maxWidth: '90%' }}>
            Acceso institucional concedido exitosamente.
          </p>
        </div>
      )}
    </div>
  );
};
