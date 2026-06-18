import React, { useState } from 'react';
import { ShieldCheck, Copy, ArrowRight, X, CreditCard, Landmark, UploadCloud, CheckCircle2, Clock, Banknote } from 'lucide-react';
import { StudentFooter } from './StudentFooter';
import { paymentService } from '../services/api';

interface CheckoutPageProps {
  onNavigateToHome: () => void;
  isModal?: boolean;
  onClose?: () => void;
  onSuccess?: (method: 'card' | 'transfer') => void;
  courseTitle?: string;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigateToHome, isModal, onClose, onSuccess, courseTitle }) => {
  const [activeTab, setActiveTab] = useState<'card' | 'transfer'>('transfer');
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [coursePrice] = useState<string>(() => {
    const saved = localStorage.getItem('ipc_courses');
    if (saved && courseTitle) {
      try {
        const list = JSON.parse(saved);
        const found = list.find((c: any) => c.title.toLowerCase().trim() === courseTitle.toLowerCase().trim());
        if (found && found.price) return found.price;
      } catch (e) {
        console.error(e);
      }
    }
    return '$150.00';
  });

  const handlePaymentSubmit = async () => {
    if (activeTab === 'card') {
      alert('Redirigiendo a pasarela IziPay...');
      if (onSuccess) onSuccess('card');
      return;
    }

    if (!voucherFile) {
      setErrorMsg('El archivo del comprobante es obligatorio.');
      return;
    }

    if (voucherFile.size > 5 * 1024 * 1024) {
      setErrorMsg('El archivo supera el límite de 5MB. Por favor suba una imagen más ligera.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const numericPrice = coursePrice.replace(/[^0-9.]/g, '');
      const parsedAmount = parseFloat(numericPrice) || 150.0;

      const formData = new FormData();
      formData.append('amount', String(parsedAmount));
      formData.append('courseTitle', courseTitle || 'Curso IPC');
      formData.append('file', voucherFile);

      await paymentService.uploadPayment(formData);

      setIsSuccess(true);
      setLoading(false);
      if (onSuccess) onSuccess('transfer');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Error al procesar el comprobante');
      setLoading(false);
    }
  };

  const isCloseButtonVisible = () => isModal || false;

  // ── SUCCESS OVERLAY ── shown instead of checkout form after successful submission
  if (isSuccess) {
    const successOverlay = (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        textAlign: 'center',
        gap: '20px',
        minHeight: isModal ? 'auto' : '60vh'
      }}>
        {/* Animated check circle */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))',
          border: '2px solid rgba(34,197,94,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 32px rgba(34,197,94,0.2)',
          animation: 'pulse 2s infinite'
        }}>
          <CheckCircle2 size={40} color="#22c55e" />
        </div>

        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 12px 0', fontFamily: 'var(--font-title)', letterSpacing: '-0.01em' }}>
            ¡Comprobante Enviado!
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '360px', margin: '0 auto' }}>
            Su comprobante ha sido recibido exitosamente. Por favor <strong style={{ color: 'var(--text-main)' }}>espere unos momentos</strong> mientras nuestro equipo revisa y valida su pago.
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 20px',
          backgroundColor: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '10px',
          fontSize: '12px', color: '#22c55e', fontWeight: 600
        }}>
          <Clock size={14} />
          Tiempo estimado de validación: <strong>24 a 48 horas hábiles</strong>
        </div>

        <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>
          Recibirás una notificación cuando tu acceso sea habilitado.
        </p>

        {isModal && onClose && (
          <button
            onClick={onClose}
            style={{
              marginTop: '8px', padding: '12px 32px', borderRadius: '10px',
              backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)',
              color: 'var(--text-muted)', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.05em', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
          >
            Cerrar
          </button>
        )}
      </div>
    );

    if (isModal) {
      return (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px'
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '480px', borderRadius: '20px',
            border: '1px solid var(--overlay-light)', backgroundColor: 'var(--bg-card)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
          }}>
            {successOverlay}
          </div>
        </div>
      );
    }
    return (
      <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{
          width: '100%', maxWidth: '480px', margin: '0 auto', borderRadius: '20px',
          border: '1px solid var(--overlay-light)', backgroundColor: 'var(--bg-card)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
        }}>
          {successOverlay}
        </div>
      </div>
    );
  }

  const content = (
    <div className="checkout-container" style={{ width: '100%', minHeight: isModal ? 'auto' : '100vh', display: 'flex', flexDirection: 'column', backgroundColor: isModal ? 'transparent' : 'var(--bg-main)' }}>
      
      {/* 1. NAVBAR (Only if not modal) */}
      {!isModal && (
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(12, 11, 11, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--overlay-light)',
          padding: '20px 8%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 800,
            fontFamily: 'var(--font-title)',
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
            cursor: 'pointer'
          }} onClick={onNavigateToHome}>
            INSTITUTO PERUANO DE COMPLIANCE
          </div>
          
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }} onClick={onNavigateToHome}>Inicio</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }} onClick={onNavigateToHome}>Cursos</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }} onClick={onNavigateToHome}>Galería</span>
            <button style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              marginLeft: '16px'
            }} onClick={onNavigateToHome}>
              <X size={24} />
            </button>
          </div>
        </header>
      )}

      {/* 2. CHECKOUT CONTENT */}
      <section style={{
        padding: isModal ? '0' : '80px 8%',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: isModal ? 'transparent' : '#0c0b0b'
      }}>
        
        {/* Header del curso a pagar (Only if not modal) */}
        {!isModal && (
          <div style={{
            width: '100%',
            maxWidth: '800px',
            display: 'flex',
            justifyContent: 'between',
            alignItems: 'flex-start',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'var(--primary)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0, 78, 187, 0.2)'
              }}>
                <ShieldCheck color="#000" size={40} />
              </div>
              <div>
                <h1 style={{ color: 'var(--text-main)', fontSize: '32px', margin: '0 0 12px 0', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                  HACKER<br/>FINANCIERO
                </h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ backgroundColor: 'var(--bg-card)', padding: '6px 12px', borderRadius: '4px', fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.05em' }}>CÓDIGO DE DESCUENTO</span>
                  <span style={{ backgroundColor: 'var(--bg-card)', padding: '6px 12px', borderRadius: '4px', fontSize: '10px', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.05em' }}>DESCUENTO -$ 0.00</span>
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', color: 'var(--text-dim)', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px' }}>
                <Banknote size={14} color="var(--primary)" /> PRECIO FINAL
              </div>
              <div style={{ color: 'var(--text-main)', fontSize: '42px', fontWeight: 800, fontFamily: 'var(--font-title)', lineHeight: 1 }}>{coursePrice}</div>
            </div>
          </div>
        )}

        {/* Tarjeta de checkout */}
        <div 
          className={isModal ? "checkout-modal-card" : "glass-panel"} 
          style={isModal ? undefined : {
            width: '100%',
            maxWidth: '800px',
            padding: '48px',
            borderRadius: '20px',
            border: '1px solid var(--overlay-light)',
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
          }}
        >
          {isCloseButtonVisible() && (
            <button onClick={onClose} style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              marginTop: '-16px',
              marginRight: '-16px'
            }}><X size={24} /></button>
          )}

          {courseTitle && (
            <div style={{
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--overlay-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>CURSO A ADQUIRIR</span>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: 800 }}>{courseTitle}</h3>
            </div>
          )}

          {/* Selector de método de pago */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--overlay-light)',
            marginBottom: isModal ? '20px' : '40px'
          }}>
            <div 
              onClick={() => setActiveTab('card')}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: isModal ? '12px' : '16px',
                cursor: 'pointer',
                color: activeTab === 'card' ? 'var(--primary)' : 'var(--text-dim)',
                borderBottom: activeTab === 'card' ? '2px solid var(--primary)' : '2px solid transparent',
                fontSize: isModal ? '11px' : '12px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <CreditCard size={14} />
              TARJETA CRÉDITO
            </div>
            <div 
              onClick={() => setActiveTab('transfer')}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: isModal ? '12px' : '16px',
                cursor: 'pointer',
                color: activeTab === 'transfer' ? 'var(--primary)' : 'var(--text-dim)',
                borderBottom: activeTab === 'transfer' ? '2px solid var(--primary)' : '2px solid transparent',
                fontSize: isModal ? '11px' : '12px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Landmark size={14} />
              TRANSFERENCIA
            </div>
          </div>

          {/* Contenido Tabs */}
          {activeTab === 'card' && (
            <div style={{ width: '100%', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: '16px' }}>Serás redirigido al entorno seguro de IziPay para procesar tu tarjeta.</p>
              <CreditCard size={48} color="var(--overlay-medium)" style={{ margin: '0 auto' }} />
            </div>
          )}

          {activeTab === 'transfer' && (
            <div style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: isModal ? '16px' : '24px' }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '10px', letterSpacing: '0.1em' }}>TITULAR: </span>
                <span style={{ color: 'var(--text-main)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>BRAIN INSTITUTO PERUANO DE COMPLIANCE SEVILLA</span>
              </div>
              
              <div className="checkout-accounts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isModal ? '16px' : '24px' }}>
                {/* Interbank Card */}
                <div style={{
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderTop: '3px solid #00A650', // Verde Interbank
                  borderRadius: '12px',
                  padding: isModal ? '16px' : '32px 24px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#00A650', fontWeight: 700, fontSize: isModal ? '14px' : '16px', marginBottom: isModal ? '16px' : '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <Landmark size={16} /> Interbank
                  </div>
                  
                  <div style={{ marginBottom: isModal ? '12px' : '20px' }}>
                    <div style={{ color: 'var(--text-dim)', fontSize: '9px', letterSpacing: '0.1em', marginBottom: '6px' }}>CUENTA EN DÓLARES</div>
                    <div style={{ color: 'var(--text-main)', fontSize: isModal ? '11px' : '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                       6003126391343 <Copy size={12} color="var(--primary)" style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText('6003126391343'); }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '9px', letterSpacing: '0.1em', marginBottom: '6px' }}>CCI</div>
                    <div style={{ color: 'var(--text-main)', fontSize: isModal ? '11px' : '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      00360001312639134349 <Copy size={12} color="var(--primary)" style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText('00360001312639134349'); }} />
                    </div>
                  </div>
                </div>

                {/* BCP Card */}
                <div style={{
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderTop: '3px solid #002A8D', // Azul BCP
                  borderRadius: '12px',
                  padding: isModal ? '16px' : '32px 24px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: isModal ? '14px' : '16px', marginBottom: isModal ? '16px' : '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#FF7A00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-main)', borderRadius: '50%' }}></div>
                    </div> 
                    BCP
                  </div>
                  
                  <div style={{ marginBottom: isModal ? '12px' : '20px' }}>
                    <div style={{ color: 'var(--text-dim)', fontSize: '9px', letterSpacing: '0.1em', marginBottom: '6px' }}>CUENTA EN DÓLARES</div>
                    <div style={{ color: 'var(--text-main)', fontSize: isModal ? '11px' : '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      57096035630140 <Copy size={12} color="var(--primary)" style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText('57096035630140'); }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '9px', letterSpacing: '0.1em', marginBottom: '6px' }}>CCI</div>
                    <div style={{ color: 'var(--text-main)', fontSize: isModal ? '11px' : '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      00257019603563014002 <Copy size={12} color="var(--primary)" style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText('00257019603563014002'); }} />
                    </div>
                  </div>
                </div>
              </div>
                 {/* Uploader de Voucher de Transferencia */}
              <div style={{ 
                margin: '24px 0', 
                padding: '24px', 
                backgroundColor: 'var(--overlay-light)', 
                borderRadius: '12px',
                border: '1px dashed var(--primary)',
                display: voucherFile ? 'grid' : 'block',
                gridTemplateColumns: voucherFile ? '1.2fr 1fr' : 'none',
                gap: voucherFile ? '20px' : '0',
                alignItems: voucherFile ? 'center' : 'stretch',
                textAlign: voucherFile ? 'left' : 'center'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: voucherFile ? 'flex-start' : 'center' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Carga tu Voucher de Pago</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px', maxWidth: '360px' }}>Envíanos la captura del depósito Interbank o BCP para habilitar tu acceso.</p>
                  
                  <input 
                    type="file" 
                    id="voucherInput" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setVoucherFile(e.target.files[0]);
                      }
                    }}
                  />
                  
                  <label 
                    htmlFor="voucherInput" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      backgroundColor: 'rgba(0, 78, 187, 0.1)',
                      border: '1px solid var(--primary)',
                      borderRadius: '8px',
                      color: 'var(--primary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <UploadCloud size={16} />
                    {voucherFile ? voucherFile.name : 'Seleccionar Comprobante'}
                  </label>
                </div>

                {voucherFile && (
                  <div style={{
                    marginTop: '0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    maxHeight: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--bg-main)',
                    position: 'relative',
                    padding: '8px'
                  }}>
                    <img 
                      src={URL.createObjectURL(voucherFile)} 
                      alt="Vista previa del comprobante" 
                      style={{
                        maxHeight: '160px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        borderRadius: '6px'
                      }} 
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setVoucherFile(null);
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                      }}
                      title="Eliminar comprobante"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-dim)' }}>
                Pago en moneda local, contáctanos <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>aquí</span>.
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{
              padding: '12px',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid #f44336',
              color: '#f44336',
              borderRadius: '8px',
              fontSize: '12px',
              textAlign: 'center',
              marginTop: '16px'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Botón de Continuar y Legales */}
          {!isSuccess && (
            <div style={{ width: '100%', marginTop: isModal ? '24px' : '48px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: '10px', lineHeight: '1.6', maxWidth: '400px', margin: isModal ? '0 auto 16px' : '0 auto 24px' }}>
                Al presionar "continuar" aceptas los términos y condiciones de pago y
                procederás al entorno seguro de IziPay.
              </p>
              
              <button onClick={handlePaymentSubmit} disabled={loading} className="btn-primary" style={{ width: '400px', maxWidth: '100%', padding: isModal ? '12px' : '16px', justifyContent: 'center', fontSize: isModal ? '12px' : '14px', letterSpacing: '0.1em', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'ENVIANDO COMPROBANTE...' : 'CONTINUAR'} {!loading && <ArrowRight size={16} />}
              </button>
              
              <p style={{ color: 'var(--text-dim)', fontSize: '10px', lineHeight: '1.6', maxWidth: '500px', margin: isModal ? '16px auto 0' : '24px auto 0' }}>
                Recuerda enviar la captura del pago a nuestro canal de asistencia para la activación <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>aquí</span>.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* 3. FOOTER FLOTANTE (Only if not modal) */}
      {!isModal && (
        <footer style={{
          background: 'var(--bg-main)',
          padding: '0 8% 40px',
          width: '100%'
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <StudentFooter />
          </div>
        </footer>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="checkout-modal-overlay">
        {content}
      </div>
    );
  }

  return content;
};