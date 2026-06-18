import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';
import { StudentFooter } from './StudentFooter';

import { 
  TrendingUp,
  AlertTriangle, RefreshCw, BookOpen, Keyboard, CheckCircle2, Gamepad2, Activity, X
} from 'lucide-react';

export const TypingPracticePage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'elite'>('beginner');
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  
  // Helper to generate initial sequence
  const getInitialSequence = (lvl: 'beginner' | 'intermediate' | 'elite') => {
    const beginnerWords = ['ley', 'dpo', 'odpc', 'smv', 'anpd', 'bcp', 'sepa', 'sbs', 'uif', 'data', 'etica', 'norma', 'canal', 'multa', 'riesgo', 'pago', 'caja', 'tasa'];
    const intermediateWords = ['empresa', 'delito', 'fraude', 'sistema', 'sancion', 'oficial', 'proceso', 'control', 'lavado', 'activos', 'derecho', 'privado', 'valores', 'vigente', 'reporte'];
    const eliteWords = ['compliance', 'auditoria', 'regulador', 'prevencion', 'integridad', 'reglamento', 'privacidad', 'juridico', 'legalidad', 'seguridad', 'evaluacion', 'acreditacion', 'informacion', 'transparencia'];

    const wordBank = lvl === 'beginner' ? beginnerWords : lvl === 'intermediate' ? intermediateWords : eliteWords;
    return Array.from({ length: 20 }, () => {
      return wordBank[Math.floor(Math.random() * wordBank.length)];
    });
  };

  const [sequence, setSequence] = useState<string[]>(() => getInitialSequence('beginner'));
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  
  const [totalCharsTyped, setTotalCharsTyped] = useState(0);
  const [correctCharsTyped, setCorrectCharsTyped] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate sequence based on level
  const generateSequence = (lvl: 'beginner' | 'intermediate' | 'elite') => {
    const beginnerWords = ['ley', 'dpo', 'odpc', 'smv', 'anpd', 'bcp', 'sepa', 'sbs', 'uif', 'data', 'etica', 'norma', 'canal', 'multa', 'riesgo', 'pago', 'caja', 'tasa'];
    const intermediateWords = ['empresa', 'delito', 'fraude', 'sistema', 'sancion', 'oficial', 'proceso', 'control', 'lavado', 'activos', 'derecho', 'privado', 'valores', 'vigente', 'reporte'];
    const eliteWords = ['compliance', 'auditoria', 'regulador', 'prevencion', 'integridad', 'reglamento', 'privacidad', 'juridico', 'legalidad', 'seguridad', 'evaluacion', 'acreditacion', 'informacion', 'transparencia'];

    const wordBank = lvl === 'beginner' ? beginnerWords : lvl === 'intermediate' ? intermediateWords : eliteWords;
    const newSeq = Array.from({ length: 20 }, () => {
      return wordBank[Math.floor(Math.random() * wordBank.length)];
    });
    setSequence(newSeq);
    setCurrentBlockIndex(0);
    setInputText('');
  };

  const handleSelectLevel = (lvl: 'beginner' | 'intermediate' | 'elite') => {
    if (gameStatus === 'idle') {
      setLevel(lvl);
      generateSequence(lvl);
      setTimeLeft(60);
      setTotalCharsTyped(0);
      setCorrectCharsTyped(0);
    }
  };

  // Timer logic
  useEffect(() => {
    let timer: any;
    if (gameStatus === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameStatus('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStatus, timeLeft]);

  // Handle typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameStatus === 'idle') {
      setGameStatus('playing');
    }
    setInputText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = sequence[currentBlockIndex];
      const typed = inputText.trim();
      
      setTotalCharsTyped(prev => prev + target.length);
      
      if (typed === target) {
        setCorrectCharsTyped(prev => prev + target.length);
      }
      
      setInputText('');
      
      if (currentBlockIndex === sequence.length - 1) {
        generateSequence(level!);
      } else {
        setCurrentBlockIndex(prev => prev + 1);
      }
    }
  };

  // Stats calculation
  const elapsedMinutes = (60 - timeLeft) / 60;
  const currentKPH = elapsedMinutes > 0 ? Math.round(correctCharsTyped / elapsedMinutes) : 0;
  const precision = totalCharsTyped > 0 ? Math.round((correctCharsTyped / totalCharsTyped) * 100) : 100;

  const getTargetKPH = () => {
    if (level === 'beginner') return 6000;
    if (level === 'intermediate') return 9000;
    if (level === 'elite') return 12000;
    return 0;
  };

  const targetKPH = getTargetKPH();
  const passed = currentKPH >= targetKPH;

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
        
        <div style={{ padding: 'clamp(16px, 5vw, 48px) clamp(12px, 4vw, 24px) 80px', maxWidth: '1000px', width: '100%', margin: '0 auto', filter: gameStatus === 'finished' ? 'blur(8px)' : 'none', transition: 'filter 0.3s' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: 'var(--primary)' }}><Keyboard size={24} /></div>
              <h2 style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>Mecanografía</h2>
            </div>
            
            {/* X Close Button (Always visible on both Mobile and Desktop) */}
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ 
                width: '36px', height: '36px', borderRadius: '50%', 
                backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', 
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', transition: 'all 0.2s', padding: 0
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.backgroundColor = 'var(--overlay-medium)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'var(--overlay-light)'; }}
              title="Salir de la práctica"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nivel Selector */}
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px', fontWeight: 700 }}>CONFIGURACIÓN DE ENTRENAMIENTO</p>
            <h3 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 700, margin: '0 0 24px 0' }}>Selecciona tu Nivel</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* Beginner */}
              <div 
                onClick={() => handleSelectLevel('beginner')}
                className="glass-panel" 
                style={{ 
                  padding: '12px 8px', 
                  borderRadius: '12px', 
                  border: level === 'beginner' ? '1px solid var(--primary)' : '1px solid var(--border-color)', 
                  cursor: gameStatus === 'idle' ? 'pointer' : 'default', 
                  opacity: gameStatus === 'playing' && level !== 'beginner' ? 0.5 : 1,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <div style={{ backgroundColor: 'var(--overlay-light)', padding: '6px', borderRadius: '6px', display: 'inline-flex' }}>
                  <Gamepad2 size={14} color={level === 'beginner' ? 'var(--primary)' : 'var(--text-muted)'} />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                  Principiante
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600 }}>
                  6,000 KPH
                </div>
              </div>

              {/* Intermediate */}
              <div 
                onClick={() => handleSelectLevel('intermediate')}
                className="glass-panel" 
                style={{ 
                  padding: '12px 8px', 
                  borderRadius: '12px', 
                  border: level === 'intermediate' ? '1px solid var(--primary)' : '1px solid var(--border-color)', 
                  cursor: gameStatus === 'idle' ? 'pointer' : 'default', 
                  opacity: gameStatus === 'playing' && level !== 'intermediate' ? 0.5 : 1,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  position: 'relative'
                }}
              >
                {/* Indicador sutil para recomendado */}
                <div style={{ position: 'absolute', top: '6px', right: '6px', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f6b896' }} title="Recomendado" />
                
                <div style={{ backgroundColor: 'rgba(0, 78, 187, 0.1)', padding: '6px', borderRadius: '6px', display: 'inline-flex' }}>
                  <TrendingUp size={14} color="var(--primary)" />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                  Intermedio
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600 }}>
                  9,000 KPH
                </div>
              </div>

              {/* Elite */}
              <div 
                onClick={() => handleSelectLevel('elite')}
                className="glass-panel" 
                style={{ 
                  padding: '12px 8px', 
                  borderRadius: '12px', 
                  border: level === 'elite' ? '1px solid var(--primary)' : '1px solid var(--border-color)', 
                  cursor: gameStatus === 'idle' ? 'pointer' : 'default', 
                  opacity: gameStatus === 'playing' && level !== 'elite' ? 0.5 : 1,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <div style={{ backgroundColor: 'var(--overlay-light)', padding: '6px', borderRadius: '6px', display: 'inline-flex' }}>
                  <Activity size={14} color={level === 'elite' ? 'var(--primary)' : 'var(--text-muted)'} />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                  Elite
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600 }}>
                  12,000 KPH
                </div>
              </div>
            </div>
          </div>

          {/* Área de Entrenamiento */}
          <div style={{ opacity: level ? 1 : 0.3, transition: 'opacity 0.3s', pointerEvents: level ? 'auto' : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '6px' }}>
                  SIMULADOR V2.4 <span style={{ backgroundColor: 'var(--overlay-medium)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>{level?.toUpperCase() || 'NIVEL'}</span>
                </div>
                <h3 style={{ fontSize: 'clamp(22px, 6vw, 32px)', fontWeight: 800, margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-title)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Área de Entrenamiento _</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%' }}>
                <div className="glass-panel" style={{ padding: '12px 8px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '8px', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '4px' }}>KPH ACTUAL</div>
                  <div style={{ fontSize: 'clamp(16px, 5vw, 24px)', fontWeight: 700, color: 'var(--text-main)' }}>{currentKPH}</div>
                </div>
                <div className="glass-panel" style={{ padding: '12px 8px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '8px', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '4px' }}>PRECISIÓN</div>
                  <div style={{ fontSize: 'clamp(16px, 5vw, 24px)', fontWeight: 700, color: 'var(--text-main)' }}>{precision}%</div>
                </div>
                <div className="glass-panel" style={{ padding: '12px 8px', borderRadius: '12px', textAlign: 'center', backgroundColor: 'var(--primary)' }}>
                  <div style={{ fontSize: '8px', color: 'rgba(0,0,0,0.5)', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '4px' }}>TIEMPO</div>
                  <div style={{ fontSize: 'clamp(16px, 5vw, 24px)', fontWeight: 800, color: 'var(--bg-main)' }}>
                    0:{timeLeft.toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Canvas */}
            <div className="glass-panel" style={{ padding: 'clamp(20px, 6vw, 48px)', borderRadius: '24px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
              
              {/* Secuencia Visual */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '16px', fontSize: 'clamp(32px, 7vw, 56px)', fontWeight: 800, fontFamily: 'var(--font-title)', letterSpacing: '0.05em', marginBottom: '32px', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
                
                {/* Previous Block */}
                {sequence.slice(currentBlockIndex, currentBlockIndex + 4).map((block, idx) => {
                  const isCurrent = idx === 0;
                  return (
                    <div key={currentBlockIndex + idx} style={{ 
                      color: isCurrent ? '#fff' : 'transparent',
                      WebkitTextStroke: isCurrent ? 'none' : '2px var(--overlay-heavy)',
                      position: 'relative',
                      display: 'inline-block'
                    }}>
                      {block}
                      {isCurrent && (
                        <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '4px', backgroundColor: 'var(--primary)' }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flexGrow: 1, position: 'relative' }}>
                  <input 
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe aquí..."
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--overlay-light)',
                      padding: 'clamp(14px, 4vw, 24px) clamp(16px, 5vw, 32px)',
                      borderRadius: '16px',
                      color: 'var(--text-main)',
                      fontSize: 'clamp(16px, 4vw, 20px)',
                      fontFamily: 'monospace',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    disabled={gameStatus === 'finished'}
                  />
                  <div className="desktop-only" style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700, backgroundColor: 'var(--bg-card-alt)', padding: '6px 12px', borderRadius: '6px' }}>
                    ENTER PARA ENVIAR
                  </div>
                </div>
                <button 
                  onClick={() => { setGameStatus('idle'); if(level) handleSelectLevel(level); }}
                  className="glass-panel" 
                  style={{ width: '56px', height: 'auto', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', color: 'var(--text-main)' }}>
                  <RefreshCw size={18} />
                </button>
              </div>

            </div>

            {/* Footer Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: 'clamp(20px, 5vw, 32px)', borderRadius: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--primary)' }}><BookOpen size={20} /></div>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Guía Técnica de Ejecución</h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '20px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--overlay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>1</div>
                    <span>Escribe la parte resaltada y presiona Enter para avanzar.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--overlay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>2</div>
                    <span>Mantén los dedos base en la fila central (ASDF - JKLÑ).</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--overlay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>3</div>
                    <span>Usa el dedo meñique derecho para presionar Enter.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--overlay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>4</div>
                    <span>Evita mirar el teclado para fomentar la memoria muscular.</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: 'clamp(20px, 5vw, 32px)', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0' }}>Relevancia Estratégica</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                  La velocidad de mecanografía es vital para procesar y documentar actas de compliance y auditorías de forma fluida y sin errores.
                </p>
                <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--overlay-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px', letterSpacing: '0.1em' }}>
                    <span>TU META DE VELOCIDAD</span>
                    <span style={{ color: 'var(--text-main)' }}>{targetKPH.toLocaleString()} KPH</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--overlay-light)', borderRadius: '2px' }}>
                    <div style={{ width: `${Math.min(100, (currentKPH / (targetKPH || 1)) * 100)}%`, height: '100%', backgroundColor: passed ? 'var(--primary)' : 'var(--overlay-heavy)', borderRadius: '2px', transition: 'width 0.3s' }} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="admin-footer-wrapper" style={{ marginTop: '64px', width: '100%' }}>
            <StudentFooter />
          </div>
        </div>

      </main>

      {/* RESULT MODAL OVERLAY */}
      {gameStatus === 'finished' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: 'clamp(20px, 6vw, 40px)', borderRadius: '24px', border: passed ? '1px solid var(--primary)' : '1px solid var(--overlay-medium)', textAlign: 'center', backgroundColor: 'var(--bg-card)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ color: passed ? '#4caf50' : '#f6b896', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              {passed ? <CheckCircle2 size={44} /> : <AlertTriangle size={44} />}
            </div>
            
            <h2 style={{ fontSize: 'clamp(18px, 5.5vw, 24px)', fontWeight: 800, margin: '0 0 12px 0', color: 'var(--text-main)', lineHeight: 1.3, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
              {passed ? 'ENTRENAMIENTO EXITOSO' : 'ENTRENAMIENTO INSUFICIENTE'}
            </h2>
            
            <div style={{ display: 'inline-block', border: '1px solid var(--overlay-medium)', padding: '6px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {passed ? 'ESTÁNDARES SUPERADOS' : 'DESEMPEÑO BAJO LOS ESTÁNDARES'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(8px, 3vw, 16px)', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'var(--bg-main)', padding: 'clamp(10px, 3vw, 16px) 6px', borderRadius: '12px', border: '1px solid var(--overlay-light)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '4px' }}>KPH</div>
                <div style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 700, color: 'var(--text-main)' }}>{currentKPH.toLocaleString()}</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-main)', padding: 'clamp(10px, 3vw, 16px) 6px', borderRadius: '12px', border: '1px solid var(--overlay-light)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '4px' }}>PRECISIÓN</div>
                <div style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 700, color: passed ? '#4caf50' : '#f44336' }}>{precision}%</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-main)', padding: 'clamp(10px, 3vw, 16px) 6px', borderRadius: '12px', border: '1px solid var(--overlay-light)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '4px' }}>CARACTERES</div>
                <div style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 700, color: 'var(--text-main)' }}>{correctCharsTyped}</div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '28px' }}>
              {passed 
                ? 'Tu velocidad cumple con los estándares de mecanografía. Estás listo para redactar informes de compliance y documentos legales de manera ágil.'
                : 'Tu velocidad actual no cumple con los estándares de mecanografía. Sigue practicando para mejorar tu agilidad y precisión en la redacción jurídica.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => { setGameStatus('idle'); if(level) handleSelectLevel(level); }}
                className="btn-primary" style={{ padding: '16px', borderRadius: '12px', fontSize: '13px', width: '100%', justifyContent: 'center' }}
              >
                REINTENTAR ENTRENAMIENTO
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                style={{ padding: '16px', borderRadius: '12px', fontSize: '13px', width: '100%', justifyContent: 'center', backgroundColor: 'transparent', border: '1px solid var(--overlay-medium)', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                VOLVER AL INICIO
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
