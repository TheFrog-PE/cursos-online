import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, AlertCircle, FileImage, Download, Send, CheckCircle2, UploadCloud, X } from 'lucide-react';
import type { TicketData } from '../types/ticket';
import { supportService } from '../services/api';

export const TicketViewerPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Chat state
  const [newMessage, setNewMessage] = useState('');
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [devName, setDevName] = useState(() => localStorage.getItem('ipc_dev_name') || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadTicket = useCallback(async () => {
    try {
      const res = await supportService.getTicketById(ticketId || '');
      const data = res.ticket || res;
      setTicket({
        id: data.id,
        title: data.title,
        description: data.description,
        date: new Date(data.date).toLocaleDateString('es-PE'),
        status: data.status === 'ABIERTO' ? 'Abierto' : 'Resuelto',
        image: data.image,
        imageName: null,
        messages: data.messages?.map((m: any) => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          image: m.image,
          date: new Date(m.date).toLocaleString('es-PE'),
          devName: m.devName
        })) || [],
        adminAgreedToClose: data.adminAgreedToClose,
        devAgreedToClose: data.devAgreedToClose
      });
    } catch {
      // Safe to ignore
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    let active = true;
    const fetchTicket = async () => {
      if (active) {
        await loadTicket();
      }
    };
    fetchTicket();
    return () => {
      active = false;
    };
  }, [loadTicket]);

  const handleSendMessage = async () => {
    if (!ticket) return;
    if (!devName.trim() || (!newMessage.trim() && !chatFile)) return;

    if (chatFile && chatFile.size > 5 * 1024 * 1024) {
      showToast('El archivo supera el límite de 5MB.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('sender', 'Dev');
      formData.append('text', newMessage);
      formData.append('devName', devName.trim());
      if (chatFile) {
        formData.append('file', chatFile);
      }

      await supportService.addMessage(ticket.id, formData);
      localStorage.setItem('ipc_dev_name', devName.trim());
      setNewMessage('');
      setChatFile(null);
      loadTicket();
    } catch {
      showToast('Error al enviar mensaje');
    }
  };

  const handleSolveTicket = async () => {
    if (!ticket) return;
    
    try {
      await supportService.resolveTicket(ticket.id);
      showToast('Ticket solucionado');
      loadTicket();
    } catch {
      showToast('Error al cerrar el ticket');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };


  if (loading) return <div style={{ color: 'var(--text-main)', padding: '40px', textAlign: 'center' }}>Cargando ticket...</div>;

  if (!ticket) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Ticket no encontrado</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>El ticket {ticketId} no existe o ha sido eliminado.</p>
        <button onClick={handleBack} style={{ padding: '10px 20px', backgroundColor: 'var(--overlay-medium)', color: 'var(--text-main)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'var(--font-body)', padding: '40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--overlay-light)' }}>
          {/* Header del Ticket */}
          <div style={{ padding: '32px', borderBottom: '1px solid var(--overlay-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.1em' }}>TICKET {ticket.id}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: ticket.status === 'Abierto' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', color: ticket.status === 'Abierto' ? '#f59e0b' : '#22c55e', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700 }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                    {ticket.status.toUpperCase()}
                  </span>
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-title)' }}>
                  {ticket.title}
                </h1>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Clock size={14} /> {ticket.date}
              </div>
            </div>
            
            <div style={{ marginTop: '24px', padding: '24px', backgroundColor: 'var(--overlay-heavy)', borderRadius: '12px', fontSize: '15px', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
              {ticket.description}
            </div>
          </div>

          {ticket.image && (
            <div style={{ padding: '32px', backgroundColor: 'var(--overlay-light)', borderBottom: '1px solid var(--overlay-light)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileImage size={16} color="var(--primary)" /> Captura Principal
              </h3>
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--overlay-medium)', backgroundColor: '#000' }}>
                <img src={ticket.image} alt="Captura de error" style={{ width: '100%', display: 'block', maxHeight: '500px', objectFit: 'contain' }} />
                <a href={ticket.image} download={ticket.imageName || 'captura.png'} style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'var(--text-main)', textDecoration: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: '1px solid var(--overlay-heavy)' }}>
                  <Download size={14} /> Descargar
                </a>
              </div>
            </div>
          )}

          {/* Historial de Chat */}
          <div style={{ padding: '32px', backgroundColor: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '24px' }}>Historial de Conversación</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {(!ticket.messages || ticket.messages.length === 0) && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '24px' }}>
                  Aún no hay mensajes en este ticket.
                </div>
              )}
              {ticket.messages && ticket.messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'Dev' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', padding: '0 4px' }}>
                    {msg.sender === 'Dev' ? `Tú (${msg.devName || 'Técnico'})` : 'Administrador'} • {msg.date}
                  </div>
                  <div style={{ 
                    maxWidth: '80%', 
                    backgroundColor: msg.sender === 'Dev' ? 'rgba(0, 78, 187, )' : '#1a1a1a', 
                    border: '1px solid',
                    borderColor: msg.sender === 'Dev' ? 'rgba(0, 78, 187, )' : 'var(--overlay-medium)',
                    padding: '16px', 
                    borderRadius: '12px',
                    borderTopRightRadius: msg.sender === 'Dev' ? '4px' : '12px',
                    borderTopLeftRadius: msg.sender === 'Admin' ? '4px' : '12px'
                  }}>
                    {msg.text && <div style={{ fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>{msg.text}</div>}
                    
                    {msg.image && (
                      <div style={{ marginTop: msg.text ? '12px' : '0', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--overlay-medium)' }}>
                        <img src={msg.image} alt="Adjunto" style={{ display: 'block', maxWidth: '100%', maxHeight: '300px' }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form & Resolution */}
            {ticket.status === 'Abierto' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flexGrow: 1, backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--overlay-medium)', padding: '16px' }}>
                    
                    <div style={{ paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid var(--overlay-light)' }}>
                      <input
                        type="text"
                        value={devName}
                        onChange={e => setDevName(e.target.value)}
                        placeholder="Ingresa tu nombre (Obligatorio)..."
                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '13px', outline: 'none', fontWeight: 600 }}
                      />
                    </div>

                    {chatFile && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '8px' }}>
                        <FileImage size={14} color="var(--primary)" />
                        <span style={{ fontSize: '12px', color: 'var(--text-main)', flexGrow: 1 }}>{chatFile.name}</span>
                        <button onClick={() => setChatFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={14} /></button>
                      </div>
                    )}

                    <textarea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje de respuesta..."
                      style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '14px', outline: 'none', resize: 'none' }}
                      rows={2}
                    />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', backgroundColor: 'var(--overlay-light)', transition: 'color 0.2s' }}>
                        <UploadCloud size={14} /> Adjuntar
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if(e.target.files) setChatFile(e.target.files[0]) }} />
                      </label>
                      
                      <button 
                        onClick={handleSendMessage} 
                        disabled={!devName.trim() || (!newMessage.trim() && !chatFile)} 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--primary)', color: '#000', fontSize: '13px', fontWeight: 700, border: 'none', cursor: (!devName.trim() || (!newMessage.trim() && !chatFile)) ? 'not-allowed' : 'pointer', opacity: (!devName.trim() || (!newMessage.trim() && !chatFile)) ? 0.5 : 1 }}
                      >
                        Enviar <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--overlay-light)' }}>
                  {!ticket.devAgreedToClose ? (
                    <button onClick={handleSolveTicket} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#22c55e', color: '#000', fontSize: '13px', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                      <CheckCircle2 size={16} /> Marcar como Ticket Solucionado
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '13px', fontWeight: 600, padding: '12px', backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: '8px' }}>
                      <Clock size={16} /> Has marcado este ticket como solucionado. Esperando confirmación del Administrador.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px', backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', borderRadius: '8px', fontWeight: 600, fontSize: '14px' }}>
                <CheckCircle2 size={18} /> Este ticket ha sido resuelto y cerrado.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#22c55e', color: '#000', padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 1000, animation: 'fadeInUp 0.3s ease-out' }}>
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};
