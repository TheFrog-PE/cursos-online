import React, { useState } from 'react';
import { 
  ShieldCheck, X, ZoomIn, RotateCw, Printer, Ban, CheckCircle2, Landmark, Banknote
} from 'lucide-react';
import { paymentService } from '../services/api';

interface AdminPaymentModalProps {
  payment: any;
  onClose: () => void;
  onStatusUpdate?: (newStatus?: string) => void;
}

export const AdminPaymentModal: React.FC<AdminPaymentModalProps> = ({ payment, onClose, onStatusUpdate }) => {
  const [isActivating, setIsActivating] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      if (payment?.source !== 'local') {
        await paymentService.updatePaymentStatus(payment.id, 'APROBADO');
      }
      setTimeout(() => {
        if (onStatusUpdate) onStatusUpdate('approved');
        onClose();
      }, 2000);
    } catch (err) {
      setIsActivating(false);
      alert('Error al aprobar el pago.');
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      if (payment?.source !== 'local') {
        await paymentService.updatePaymentStatus(payment.id, 'RECHAZADO');
      }
      setTimeout(() => {
        if (onStatusUpdate) onStatusUpdate('rejected');
        onClose();
      }, 2000);
    } catch (err) {
      setIsRejecting(false);
      alert('Error al rechazar el pago.');
    }
  };


  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      
      <div className="payment-modal-container" style={{ position: 'relative', width: '960px', maxWidth: '95vw', maxHeight: '90vh', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {isActivating && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--bg-card)', opacity: 0.97, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.2)', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              <div style={{ position: 'absolute', inset: '20px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.15)' }} />
              <CheckCircle2 size={72} color="#22c55e" style={{ position: 'relative', zIndex: 10, animation: 'bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) both' }} />
            </div>
            <h3 style={{ marginTop: '40px', fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.02em', textTransform: 'uppercase', animation: 'slideUpFade 0.6s ease-out 0.2s both' }}>
              Usuario Activado
            </h3>
            <p style={{ color: '#22c55e', fontSize: '16px', fontWeight: 500, marginTop: '12px', animation: 'slideUpFade 0.6s ease-out 0.4s both' }}>
              Acceso institucional concedido exitosamente.
            </p>
          </div>
        )}

        {isRejecting && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--bg-card)', opacity: 0.97, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.2)', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              <div style={{ position: 'absolute', inset: '20px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.15)' }} />
              <Ban size={72} color="#ef4444" style={{ position: 'relative', zIndex: 10, animation: 'bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) both' }} />
            </div>
            <h3 style={{ marginTop: '40px', fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.02em', textTransform: 'uppercase', animation: 'slideUpFade 0.6s ease-out 0.2s both' }}>
              Pago Rechazado
            </h3>
            <p style={{ color: '#ef4444', fontSize: '16px', fontWeight: 500, marginTop: '12px', animation: 'slideUpFade 0.6s ease-out 0.4s both' }}>
              El comprobante fue denegado y la solicitud ha sido archivada.
            </p>
          </div>
        )}
        
        {/* Header */}
        <div className="payment-modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--overlay-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>Detalle de Validación de Pago</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="payment-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '32px', padding: '32px' }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* User Info */}
            <section>
              <h3 style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.15em', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px' }}>INFORMACIÓN DEL USUARIO</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                {payment.avatarUrl ? (
                  <img src={payment.avatarUrl} alt={payment.userName} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', 
                    backgroundColor: payment.avatarColor + '22', border: `1px solid ${payment.avatarColor}44`, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: payment.avatarColor, fontWeight: 700, fontSize: '16px' 
                  }}>
                    {payment.initials}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>{payment.userName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{payment.userEmail}</div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID de Usuario</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>#USR-002{payment.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fecha Registro</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>21 Ago 2024</span>
                </div>
              </div>
            </section>

            {/* Course Details */}
            <section>
              <h3 style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.15em', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px' }}>DETALLES DEL CURSO</h3>
              
              <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>{payment.course}</div>
                  <span style={{ fontSize: '10px', color: 'var(--primary)', backgroundColor: 'rgba(0, 78, 187, 0.15)', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={10} /> Programa Élite
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Banknote size={14} color="var(--primary)" /> Precio del Curso
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{payment.amount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fecha Transacción</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{payment.date} · 14:30</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Método</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Landmark size={12} color="var(--text-muted)" /> Transferencia SEPA
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Warning Note */}
            <div style={{ backgroundColor: 'rgba(0, 78, 187, 0.08)', border: '1px solid rgba(0, 78, 187, 0.2)', borderRadius: '12px', padding: '16px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, fontWeight: 500 }}>
                <strong style={{ color: 'var(--primary)' }}>Nota del Sistema:</strong> El usuario ha subido el comprobante hace 14 minutos. Por favor, verifique el número de operación con el portal bancario antes de activar.
              </p>
            </div>
          </div>

          {/* Right Column: Receipt Image */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.15em', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>VISUALIZACIÓN DE COMPROBANTE</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'var(--overlay-light)', border: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ZoomIn size={14} /></button>
                <button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'var(--overlay-light)', border: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><RotateCw size={14} /></button>
                <button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'var(--overlay-light)', border: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Printer size={14} /></button>
              </div>
            </div>
            
            <div style={{ flexGrow: 1, backgroundColor: 'var(--bg-main)', border: '1px solid var(--overlay-light)', borderRadius: '16px', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {payment.comprobanteUrl ? (
                <img src={payment.comprobanteUrl} alt="Comprobante" style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Sin imagen adjunta</span>
              )}
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="payment-modal-footer" style={{ padding: '24px 32px', backgroundColor: 'var(--bg-main)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onClose} style={{ padding: '12px 24px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--overlay-medium)', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            Cerrar
          </button>
          <div className="payment-modal-footer-actions" style={{ display: 'flex', gap: '16px' }}>
            <button onClick={handleReject} style={{ padding: '12px 24px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ban size={16} /> Rechazar Pago
            </button>
            <button onClick={handleActivate} className="btn-primary" style={{ padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> Validar y Activar Acceso
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
