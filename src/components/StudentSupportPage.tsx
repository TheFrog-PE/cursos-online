import React, { useState, useEffect } from 'react';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';
import { 
  Clock, CheckCircle2, MessageSquare, Mail, UploadCloud, 
  X, ExternalLink, Send, FileImage, AlertCircle 
} from 'lucide-react';
import type { TicketData } from '../types/ticket';
import { supportService } from '../services/api';

export const StudentSupportPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  
  // New ticket state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSent, setIsSent] = useState<string | false>(false);
  const [generatedLink, setGeneratedLink] = useState<string>('');

  // History & Modal state
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadTickets = async () => {
    try {
      const res = await supportService.getTickets();
      const ticketList = res.tickets || res || [];
      setTickets(ticketList.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        date: new Date(t.date).toLocaleDateString('es-PE'),
        status: t.status === 'ABIERTO' ? 'Abierto' : 'Resuelto',
        image: t.image,
        imageName: null,
        messages: t.messages?.map((m: any) => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          image: m.image,
          date: new Date(m.date).toLocaleString('es-PE'),
          devName: m.devName
        })) || [],
        adminAgreedToClose: t.adminAgreedToClose,
        devAgreedToClose: t.devAgreedToClose
      })));
    } catch (err) {
      // Fallback
    }
  };

  useEffect(() => {
    loadTickets();
  }, [activeTab]);

  const handleCreateTicket = async (method: 'whatsapp' | 'email') => {
    if (!subject.trim() || !message.trim()) return;

    if (file && file.size > 5 * 1024 * 1024) {
      showToast('El archivo adjunto supera el límite de 5MB.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', subject);
      formData.append('description', message);
      if (file) {
        formData.append('file', file);
      }

      const res = await supportService.createTicket(formData);
      const ticketId = res.ticket.id;

      const ticketUrl = `${window.location.origin}/ticket/${ticketId}`;
      setGeneratedLink(ticketUrl);

      if (method === 'whatsapp') {
        const body = `*Soporte: ${subject}*\n\nRevisa el reporte completo y la captura aquí:\n${ticketUrl}`;
        window.open(`https://wa.me/51913330912?text=${encodeURIComponent(body)}`, '_blank');
      } else {
        const body = `Revisa el reporte completo y la captura aquí:\n${ticketUrl}`;
        window.location.href = `mailto:soporte@ipc.edu.pe?subject=Soporte: ${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }

      setIsSent('sent');
      setTimeout(() => {
        setIsSent(false);
        setSubject('');
        setMessage('');
        setFile(null);
        setActiveTab('history');
      }, 4000);
    } catch (err: any) {
      const serverError = err.response?.data?.error || err.response?.data?.message || 'Error al crear el ticket';
      showToast(serverError);
    }
  };

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleSendMessage = async () => {
    if (!selectedTicket) return;
    if (!replyText.trim() && !replyFile) return;

    if (replyFile && replyFile.size > 5 * 1024 * 1024) {
      showToast('La imagen de respuesta supera el límite de 5MB.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('sender', 'Admin');
      formData.append('text', replyText);
      if (replyFile) {
        formData.append('file', replyFile);
      }

      await supportService.addMessage(selectedTicket.id, formData);
      
      setReplyText('');
      setReplyFile(null);
      loadTickets();
    } catch (err: any) {
      const serverError = err.response?.data?.error || err.response?.data?.message || 'Error al enviar mensaje';
      showToast(serverError);
    }
  };

  const handleSolveTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      await supportService.resolveTicket(selectedTicket.id);
      showToast('Ticket solucionado');
      loadTickets();
    } catch (err: any) {
      const serverError = err.response?.data?.error || err.response?.data?.message || 'Error al cerrar el ticket';
      showToast(serverError);
    }
  };


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

        {/* MODAL DEL TICKET */}
        {selectedTicket && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', border: '1px solid var(--overlay-medium)', backgroundColor: 'var(--bg-card)' }}>
              
              <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-card)', padding: '24px 32px', borderBottom: '1px solid var(--overlay-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.1em' }}>TICKET {selectedTicket.id}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: selectedTicket.status === 'Abierto' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', color: selectedTicket.status === 'Abierto' ? '#f59e0b' : '#22c55e', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700 }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                    {selectedTicket.status.toUpperCase()}
                  </span>
                </div>
                <button onClick={() => setSelectedTicketId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <div style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 16px 0', fontFamily: 'var(--font-title)' }}>
                  {selectedTicket.title}
                </h2>
                <div style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-wrap', marginBottom: '24px' }}>
                  {selectedTicket.description}
                </div>

                {selectedTicket.image && (
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileImage size={14} color="var(--primary)" /> Captura Principal</h3>
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--overlay-medium)' }}>
                      <img src={selectedTicket.image} alt="Adjunto" style={{ width: '100%', display: 'block' }} />
                    </div>
                  </div>
                )}

                {/* Chat Historial */}
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '24px' }}>Historial de Conversación</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  {(!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '24px' }}>
                      Aún no hay respuestas en este ticket.
                    </div>
                  )}
                  {selectedTicket.messages && selectedTicket.messages.map((msg) => (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'Admin' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', padding: '0 4px' }}>
                        {msg.sender === 'Admin' ? 'Tú (Estudiante)' : `${msg.devName || 'Soporte'} (Técnico)`} • {msg.date}
                      </div>
                      <div style={{ 
                        maxWidth: '80%', 
                        backgroundColor: msg.sender === 'Admin' ? 'var(--primary)' : 'var(--bg-card-alt)', 
                        border: '1px solid',
                        borderColor: msg.sender === 'Admin' ? 'var(--primary)' : 'var(--border-color)',
                        padding: '16px', 
                        borderRadius: '12px',
                        borderTopRightRadius: msg.sender === 'Admin' ? '4px' : '12px',
                        borderTopLeftRadius: msg.sender === 'Dev' ? '4px' : '12px'
                      }}>
                        {msg.text && <div style={{ fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap', color: msg.sender === 'Admin' ? '#ffffff' : 'var(--text-main)' }}>{msg.text}</div>}
                        {msg.image && (
                          <div style={{ marginTop: msg.text ? '12px' : '0', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--overlay-medium)' }}>
                            <img src={msg.image} alt="Adjunto" style={{ display: 'block', maxWidth: '100%', maxHeight: '300px' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                {selectedTicket.status === 'Abierto' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                      <div style={{ flexGrow: 1, backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--overlay-medium)', padding: '12px' }}>
                        
                        {replyFile && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '8px' }}>
                            <FileImage size={14} color="var(--primary)" />
                            <span style={{ fontSize: '12px', color: 'var(--text-main)', flexGrow: 1 }}>{replyFile.name}</span>
                            <button onClick={() => setReplyFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={14} /></button>
                          </div>
                        )}

                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Escribe tu respuesta..."
                          style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '14px', outline: 'none', resize: 'none' }}
                          rows={2}
                        />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', backgroundColor: 'var(--overlay-light)', transition: 'color 0.2s' }}>
                            <UploadCloud size={14} /> Adjuntar
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if(e.target.files) setReplyFile(e.target.files[0]) }} />
                          </label>
                          
                          <button onClick={handleSendMessage} disabled={!replyText.trim() && !replyFile} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--primary)', color: '#000', fontSize: '13px', fontWeight: 700, border: 'none', cursor: (!replyText.trim() && !replyFile) ? 'not-allowed' : 'pointer', opacity: (!replyText.trim() && !replyFile) ? 0.5 : 1 }}>
                            Enviar <Send size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--overlay-light)' }}>
                      {!selectedTicket.adminAgreedToClose ? (
                        <button onClick={handleSolveTicket} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#22c55e', color: '#000', fontSize: '13px', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                          <CheckCircle2 size={16} /> Marcar como Ticket Solucionado
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '13px', fontWeight: 600, padding: '12px', backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: '8px' }}>
                          <Clock size={16} /> Has marcado este ticket como solucionado. Esperando confirmación del Soporte.
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
        )}

        <div className="course-content-wrapper" style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px', fontWeight: 700 }}>
              ASISTENCIA TÉCNICA
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 7vw, 44px)', fontWeight: 800, margin: '0 0 16px 0', fontFamily: 'var(--font-title)', letterSpacing: '-0.02em', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2' }}>
              Soporte Institucional
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '500px', lineHeight: '1.6' }}>
              Crea un ticket de soporte para resolver cualquier inconveniente técnico o duda sobre los cursos.
            </p>
          </div>

          {/* TAB SELECTOR */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--overlay-light)', paddingBottom: '16px' }}>
            <button
              onClick={() => setActiveTab('new')}
              style={{
                background: activeTab === 'new' ? 'rgba(0, 78, 187, 0.1)' : 'transparent',
                border: 'none',
                color: activeTab === 'new' ? '#fff' : 'var(--text-dim)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-title)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Nuevo Ticket
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                background: activeTab === 'history' ? 'rgba(0, 78, 187, 0.1)' : 'transparent',
                border: 'none',
                color: activeTab === 'history' ? '#fff' : 'var(--text-dim)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-title)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Historial de Tickets
            </button>
          </div>

          <div style={{ width: '100%', maxWidth: '800px' }}>
            {activeTab === 'new' ? (
              /* Create Ticket Form Card */
              <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', border: '1px solid var(--overlay-light)', backgroundColor: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
                      TÍTULO DEL PROBLEMA O SOLICITUD
                    </label>
                    <input 
                      type="text" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Ej. Error al cargar estudiantes en el curso X"
                      style={{ width: '100%', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '14px 16px', borderRadius: '8px', color: 'var(--text-main)', fontSize: '13px', outline: 'none', fontWeight: 500 }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
                      DESCRIPCIÓN DETALLADA
                    </label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Explica qué sucedió, cómo podemos reproducir el error o qué requieres que modifiquemos..."
                      rows={6}
                      style={{ width: '100%', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '14px 16px', borderRadius: '8px', color: 'var(--text-main)', fontSize: '13px', outline: 'none', resize: 'vertical', lineHeight: '1.6', fontFamily: 'var(--font-body)', fontWeight: 500 }} 
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
                      CAPTURAS DE PANTALLA (OPCIONAL)
                    </label>
                    {!file ? (
                      <label style={{ border: '1px dashed var(--overlay-medium)', borderRadius: '10px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', backgroundColor: 'var(--bg-main)' }}>
                        <UploadCloud size={24} color="var(--primary)" />
                        <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 700 }}>
                          Haz clic para subir imagen
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>
                          PNG, JPG o GIF (Max. 5MB)
                        </div>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
                      </label>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-card)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--overlay-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertCircle size={20} color="var(--primary)" />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{file.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        </div>
                        <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'clamp(8px, 3vw, 16px)', marginTop: '12px', flexWrap: 'nowrap' }}>
                    <button 
                      type="button" 
                      onClick={() => handleCreateTicket('email')}
                      disabled={!subject.trim() || !message.trim()}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', padding: '12px clamp(8px, 3vw, 24px)', fontSize: 'clamp(11px, 2.8vw, 13px)', fontWeight: 700, cursor: (!subject.trim() || !message.trim()) ? 'not-allowed' : 'pointer', opacity: (!subject.trim() || !message.trim()) ? 0.5 : 1, flex: 1, whiteSpace: 'nowrap' }}
                    >
                      <Mail size={14} /> Enviar por Correo
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleCreateTicket('whatsapp')}
                      disabled={!subject.trim() || !message.trim()}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#25D366', border: 'none', borderRadius: '8px', color: '#000', padding: '12px clamp(8px, 3vw, 24px)', fontSize: 'clamp(11px, 2.8vw, 13px)', fontWeight: 700, cursor: (!subject.trim() || !message.trim()) ? 'not-allowed' : 'pointer', opacity: (!subject.trim() || !message.trim()) ? 0.5 : 1, flex: 1, whiteSpace: 'nowrap' }}
                    >
                      <MessageSquare size={14} /> Enviar por WhatsApp
                    </button>
                  </div>

                  {isSent && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'rgba(34,197,94,0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)', marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#22c55e', fontSize: '13px', fontWeight: 600 }}>
                        <CheckCircle2 size={16} /> Ticket generado exitosamente.
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Enlace del ticket: <a href={generatedLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{generatedLink}</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Ticket History Card */
              <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', border: '1px solid var(--overlay-light)', backgroundColor: 'var(--bg-card)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 24px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-title)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Historial de Tickets
                </h3>
                
                {tickets.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tickets.map(ticket => (
                      <div key={ticket.id} style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: '#0e0e10', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em', fontFamily: 'var(--font-title)' }}>{ticket.id}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>{ticket.date}</span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{ticket.title}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: ticket.status === 'Abierto' ? '#f59e0b' : '#4caf50' }}>
                            {ticket.status === 'Abierto' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                            {ticket.status === 'Abierto' ? 'EN REVISIÓN' : 'SOLUCIONADO'}
                          </div>
                          
                          <button 
                            onClick={() => setSelectedTicketId(ticket.id)} 
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '6px 12px', borderRadius: '6px', textDecoration: 'none',
                              backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)',
                              color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            <ExternalLink size={11} /> VER TICKET
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>
                    No tienes tickets registrados en este momento
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
        
        {/* Toast Notification */}
        {toastMessage && (
          <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#22c55e', color: '#000', padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 1000, animation: 'fadeInUp 0.3s ease-out' }}>
            <CheckCircle2 size={16} /> {toastMessage}
          </div>
        )}

      </main>
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};
