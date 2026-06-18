import React, { useState, useEffect } from 'react';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';
import { StudentFooter } from './StudentFooter';
import { useAuth } from '../contexts/AuthContext';
import { paymentService, progressService } from '../services/api';
import { renderFormattedDescription } from '../utils/markdownRenderer';
import { useParams, useNavigate } from 'react-router-dom';

import {
  Play, Star, CheckCircle2, MonitorPlay, ChevronDown, ChevronUp,
  Download, ArrowRight, Lock, PlayCircle, ShieldAlert, Activity, BookOpen, FileText, Banknote,
  Award, GraduationCap, TrendingUp, BarChart2, Clock
} from 'lucide-react';
import { CheckoutPage } from './CheckoutPage';

const PaymentPendingBox: React.FC<{ submittedAt?: string }> = ({ submittedAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const submittedDate = submittedAt ? new Date(submittedAt) : new Date();
      const targetDate = new Date(submittedDate.getTime() + 24 * 60 * 60 * 1000);
      const diff = targetDate.getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft('Activación en proceso...');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [submittedAt]);

  return (
    <div style={{
      padding: '24px',
      borderRadius: '16px',
      backgroundColor: 'rgba(245, 158, 11, 0.06)',
      border: '1px solid rgba(245, 158, 11, 0.25)',
      color: '#f59e0b',
      marginBottom: '24px',
      boxShadow: '0 8px 32px rgba(245, 158, 11, 0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', animation: 'pulse 2s infinite' }}></span>
        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Pago en Revisión
        </h4>
      </div>
      <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        El administrador está validando su comprobante. Su acceso será habilitado automáticamente una vez procesado.
      </p>
      <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
        Tiempo máximo de activación
      </div>
      <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'monospace', color: '#f59e0b' }}>
        {timeLeft}
      </div>
    </div>
  );
};

export const EspecialistaCompliancePage: React.FC = () => {
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [pendingSubmittedAt, setPendingSubmittedAt] = useState<string | undefined>(undefined);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [courseData, setCourseData] = useState<any>(null);
  const [currentModuleIdx, setCurrentModuleIdx] = useState<number>(0);
  const [currentLessonIdx, setCurrentLessonIdx] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setCompletedLessons([]);
      return;
    }
    const loadProgress = async () => {
      try {
        const res = await progressService.getProgress(courseData?.id || '2');
        if (res.completedLessons) {
          setCompletedLessons(res.completedLessons);
        }
      } catch (err) {
        console.error('Error fetching progress from database, falling back to localStorage:', err);
        const key = `ipc_completed_${user?.id || 'guest'}_${courseData?.id || 2}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            setCompletedLessons(JSON.parse(saved));
          } catch {
            setCompletedLessons([]);
          }
        }
      }
    };
    loadProgress();
  }, [user, courseData]);

  const markLessonCompleted = async (mIdx: number, lIdx: number) => {
    const lessonKey = `${mIdx}_${lIdx}`;
    const key = `ipc_completed_${user?.id || 'guest'}_${courseData?.id || 2}`;
    
    // Optimistic UI update
    setCompletedLessons(prev => {
      if (prev.includes(lessonKey)) return prev;
      const updated = [...prev, lessonKey];
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });

    try {
      await progressService.saveProgress(courseData?.id || '2', lessonKey, true);
    } catch (err) {
      console.error('Failed to save progress to DB:', err);
    }
  };

  const toggleLessonCompleted = async (mIdx: number, lIdx: number) => {
    const lessonKey = `${mIdx}_${lIdx}`;
    const key = `ipc_completed_${user?.id || 'guest'}_${courseData?.id || 2}`;
    const isCompleted = completedLessons.includes(lessonKey);

    // Optimistic UI update
    setCompletedLessons(prev => {
      const updated = prev.includes(lessonKey)
        ? prev.filter(k => k !== lessonKey)
        : [...prev, lessonKey];
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });

    try {
      await progressService.saveProgress(courseData?.id || '2', lessonKey, !isCompleted);
    } catch (err) {
      console.error('Failed to toggle progress in DB:', err);
    }
  };


  useEffect(() => {
    const loadCourseData = () => {
      const saved = localStorage.getItem('ipc_courses');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          let found = null;
          if (courseId) {
            const num = Number(courseId);
            if (!isNaN(num)) {
              found = list.find((c: any) => c.id === num);
            } else {
              const cleanParam = courseId.replace(/-/g, ' ').toLowerCase();
              found = list.find((c: any) => c.title.toLowerCase().includes(cleanParam));
            }
          }
          if (!found) {
            found = list.find((c: any) => c.id === 2 || c.title.toLowerCase().includes('compliance'));
          }
          if (found) {
            setCourseData(found);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    loadCourseData();
    window.addEventListener('storage', loadCourseData);
    return () => window.removeEventListener('storage', loadCourseData);
  }, [courseId]);

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN' || user.role === 'EDITOR') {
        setIsPurchased(true);
        setIsPending(false);
        return;
      }

      const checkAccess = async () => {
        try {
          const targetTitle = (courseData?.title || 'Especialista en Compliance').toLowerCase();
          // Verificar pagos aprobados en la base de datos para este curso
          const res = await paymentService.getUserPayments();
          
          const hasApprovedPayment = res.payments?.some(
            (p: any) => p.status === 'APROBADO' && 
                       (p.courseTitle || '').toLowerCase() === targetTitle
          );
          if (hasApprovedPayment) {
            setIsPurchased(true);
            setIsPending(false);
            return;
          }

          const dbPending = res.payments?.find(
            (p: any) => p.status === 'PENDIENTE' && 
                       (p.courseTitle || '').toLowerCase() === targetTitle
          );
          if (dbPending) {
            setIsPurchased(false);
            setIsPending(true);
            setPendingSubmittedAt(dbPending.date);
            return;
          }

          // Si no tiene nada aprobado ni pendiente
          setIsPurchased(false);
          setIsPending(false);
        } catch (err) {
          console.error('Error al verificar acceso al curso:', err);
        }
      };

      checkAccess();
    }
  }, [user, courseData]);

  const handlePurchaseSuccess = (method: 'card' | 'transfer') => {
    if (method === 'card') {
      setIsPurchased(true);
      setIsPending(false);
    } else {
      setIsPurchased(false);
      setIsPending(true);
      setPendingSubmittedAt(new Date().toISOString());
    }
    setShowPaymentModal(false);
    window.scrollTo(0, 0);
  };

  const modules = [
    { title: "Módulo 1: Fundamentos del Compliance", lessons: 5 },
    { title: "Módulo 2: Marco Normativo Peruano", lessons: 6 },
    { title: "Módulo 3: ISO 37301 - Sistema de Gestión", lessons: 5 },
    { title: "Módulo 4: Gestión de Riesgos de Compliance", lessons: 7 },
    { title: "Módulo 5: Diseño del Programa de Compliance", lessons: 6 },
    { title: "Módulo 6: Canal de Denuncias y Whistleblowing", lessons: 4 },
    { title: "Módulo 7: Prevención de Lavado de Activos", lessons: 6 },
    { title: "Módulo 8: Anticorrupción y Soborno", lessons: 5 },
    { title: "Módulo 9: Compliance Laboral y RRHH", lessons: 5 },
    { title: "Módulo 10: Compliance Digital y Ciberseguridad", lessons: 6 },
    { title: "Módulo 11: Due Diligence y Terceros", lessons: 5 },
    { title: "Módulo 12: Auditoría y Mejora Continua", lessons: 8 },
  ];

  const activeMods = React.useMemo(() => {
    let list = [];
    if (courseData?.modulesJson) {
      try {
        list = JSON.parse(courseData.modulesJson);
      } catch (e) {
        console.error(e);
      }
    }
    if (list.length === 0) {
      list = modules.map((m, idx) => {
        const numLessons = m.lessons || 3;
        const subModules = Array.from({ length: numLessons }, (_, sIdx) => {
          return {
            id: sIdx + 1,
            title: `Lección ${idx + 1}.${sIdx + 1}`,
            description: `Contenido detallado correspondiente a la lección ${sIdx + 1} del Módulo ${idx + 1}.`,
            duration: `${10 + (sIdx * 4) + (idx * 2)}:15`
          };
        });
        
        return {
          id: idx,
          title: m.title,
          description: '',
          subModules: subModules
        };
      });
    }
    return list;
  }, [courseData]);

  const currentModule = activeMods[currentModuleIdx] || activeMods[0];
  const currentLesson = currentModule?.subModules?.[currentLessonIdx] || currentModule?.subModules?.[0];

  const totalLessons = React.useMemo(() => {
    return activeMods.reduce((acc: number, m: any) => acc + (m.subModules?.length || 0), 0);
  }, [activeMods]);

  const completedCount = completedLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const isLessonUnlocked = (mIdx: number, lIdx: number) => {
    if (mIdx === 0 && lIdx === 0) return true;
    if (lIdx > 0) {
      return completedLessons.includes(`${mIdx}_${lIdx - 1}`);
    }
    const prevMod = activeMods[mIdx - 1];
    const prevModLastLessonIdx = (prevMod?.subModules?.length || 1) - 1;
    return completedLessons.includes(`${mIdx - 1}_${prevModLastLessonIdx}`);
  };


  const benefits = [
    { icon: <ShieldAlert size={20} />, title: "Marco ISO 37301", desc: "Implementa sistemas de compliance bajo el estándar internacional más reconocido a nivel global." },
    { icon: <BookOpen size={20} />, title: "Normativa Peruana", desc: "Domina la Ley N° 30424, el DL 1352 y toda la regulación sectorial vigente en el Perú." },
    { icon: <Activity size={20} />, title: "Gestión de Riesgos", desc: "Aprende a identificar, evaluar y mitigar riesgos legales y regulatorios en tu organización." },
    { icon: <FileText size={20} />, title: "Canal de Denuncias", desc: "Diseña e implementa canales efectivos de whistleblowing y mecanismos de reporte." },
    { icon: <MonitorPlay size={20} />, title: "Casos Prácticos", desc: "Aplica los conocimientos en casos reales de empresas peruanas e internacionales." },
    { icon: <CheckCircle2 size={20} />, title: "Certificación Oficial", desc: "Obtén el certificado respaldado por el Instituto Peruano de Compliance." },
  ];

  const testimonios = [
    { text: "El programa más completo que he encontrado sobre compliance en el Perú. Los módulos de ISO 37301 y normativa local son invaluables para mi trabajo.", author: "Compliance Officer en empresa minera" },
    { text: "Gracias a esta especialización pude implementar el programa de compliance en mi empresa y superar la auditoría de la SMV sin observaciones.", author: "Gerente Legal en empresa financiera" },
    { text: "Las sesiones de casos prácticos son lo mejor del programa. Aprendes a aplicar todo lo teórico en situaciones reales del mercado peruano.", author: "Oficial de Cumplimiento en banco" },
    { text: "Excelente estructura curricular, equilibrada entre teoría y práctica. Recomiendo al 100% a cualquier profesional del área legal y compliance.", author: "Abogado corporativo" },
  ];

  const otrosCursos = React.useMemo(() => {
    const saved = localStorage.getItem('ipc_courses');
    let list: any[] = [];
    try {
      list = saved ? JSON.parse(saved) : [];
    } catch {
      list = [];
    }
    if (list.length === 0) {
      list = [
        { id: 1, title: 'Certificación Oficial en OCPD: Protección de Datos Personales', status: 'Publicado', price: 'S/ 750', isComingSoon: false },
        { id: 2, title: 'Especialista en Compliance', status: 'Publicado', price: 'S/ 890', isComingSoon: false },
        { id: 3, title: 'Derecho Institucional y Gobierno Corporativo', status: 'Publicado', price: 'S/ 820', isComingSoon: true }
      ];
    }

    const currentId = courseData?.id;
    const currentTitle = (courseData?.title || '').toLowerCase();

    return list
      .filter((c: any) => c.status === 'Publicado')
      .filter((c: any) => {
        if (currentId && c.id === currentId) return false;
        if (currentTitle && c.title.toLowerCase() === currentTitle) return false;
        return true;
      })
      .map((c: any) => {
        let priceStr = c.price;
        if (priceStr && !String(priceStr).startsWith('S/') && !String(priceStr).startsWith('$')) {
          priceStr = `S/ ${priceStr}`;
        }
        if (!priceStr) priceStr = 'S/ 750';

        let path = '';
        if (c.title.toLowerCase().includes('compliance')) {
          path = '/cursos/compliance';
        } else if (c.title.toLowerCase().includes('datos') || c.title.toLowerCase().includes('ocpd') || c.title.toLowerCase().includes('odpc')) {
          path = '/cursos/odpc';
        } else {
          path = `/cursos/${c.id}`;
        }

        return {
          id: c.id,
          t: c.title,
          rating: c.isComingSoon ? 'Próximamente' : '4.8/5',
          price: priceStr,
          thumbnail: c.thumbnail,
          isComingSoon: !!c.isComingSoon,
          path: path
        };
      });
  }, [courseData]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>

      {/* SIDEBAR */}
      <StudentSidebar
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT */}
      <main className="app-main" style={{ marginLeft: '280px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <StudentHeader
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="course-content-wrapper">

          {courseData?.isComingSoon ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '80px 24px',
              maxWidth: '800px',
              margin: '0 auto',
              minHeight: '60vh'
            }}>
              <div style={{ fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '24px', border: '1px solid var(--primary)', padding: '6px 12px', borderRadius: '4px', display: 'inline-block' }}>
                Próximamente
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px', fontFamily: 'var(--font-title)', textTransform: 'uppercase', color: 'var(--text-main)' }}>
                {courseData?.title}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '40px', maxWidth: '600px' }}>
                El curso o certificado estará habilitado próximamente, contactanos para mayor información
              </p>
              
              <a 
                href={`https://wa.me/51913330912?text=Hola,%20deseo%20mayor%20informaci%C3%B3n%20sobre%20el%20curso%20${encodeURIComponent(courseData?.title || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary" 
                style={{
                  padding: '14px 40px',
                  fontSize: '13px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(0, 78, 187, 0.3)',
                  cursor: 'pointer'
                }}
              >
                Contactar
              </a>
            </div>
          ) : (
            <>
              {!isPurchased ? (
            <>
              <div className="hacker-course-hero-grid">
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '16px', display: 'inline-block', border: '1px solid var(--primary)', padding: '4px 8px', borderRadius: '4px' }}>PROGRAMA DE ESPECIALIZACIÓN</div>
                  <h2 className="course-hero-title" style={{ textTransform: 'uppercase' }}>
                    {courseData?.title || "ESPECIALISTA EN COMPLIANCE"}: <br/><span style={{ color: 'var(--primary)' }}>DISEÑA E IMPLEMENTA SISTEMAS DE GESTIÓN ALINEADOS A ISO 37301</span>
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                    {courseData?.descriptionTop || "Domina el diseño e implementación de Sistemas de Gestión de Compliance. Obtén las herramientas para proteger tu organización y liderar procesos de integridad alineados a ISO 37301 y la normativa peruana vigente."}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', color: 'var(--primary)' }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>4.9/5 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(1,800 valoraciones)</span></span>
                  </div>

                  {isPending ? (
                    <div style={{ maxWidth: '360px' }}>
                      <PaymentPendingBox submittedAt={pendingSubmittedAt} />
                    </div>
                  ) : (
                    <div className="desktop-only-flex" style={{ display: 'flex', gap: '16px' }}>
                      <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ padding: '14px 32px', fontSize: '13px', borderRadius: '9999px', fontWeight: 700 }}>ADQUIRIR AHORA — {courseData?.price || "S/ 890"}</button>
                      <button style={{ padding: '14px 32px', fontSize: '13px', borderRadius: '9999px', backgroundColor: 'transparent', border: '1px solid var(--overlay-medium)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700 }}>
                        <Play size={14} /> Ver introducción
                      </button>
                    </div>
                  )}
                </div>

                <div className="desktop-only-specs-card" style={{ position: 'relative' }}>
                  <div style={{ 
                    width: '100%', 
                    aspectRatio: '16/9', 
                    backgroundColor: 'var(--bg-card)', 
                    backgroundImage: courseData?.thumbnail ? `url("${courseData.thumbnail}")` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '16px', 
                    overflow: 'hidden', 
                    border: '1px solid var(--overlay-light)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <button style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-main)', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0, 78, 187, 0.4)' }}>
                      <Play size={24} fill="currentColor" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mobile-only-hero-video-cta" style={{ flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                <div style={{ 
                  width: '100%', 
                  aspectRatio: '16/9', 
                  backgroundColor: 'var(--bg-card)', 
                  backgroundImage: courseData?.thumbnail ? `url("${courseData.thumbnail}")` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  border: '1px solid var(--overlay-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  position: 'relative' 
                }}>
                  <button style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-main)', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0, 78, 187, 0.4)' }}>
                    <Play size={20} fill="currentColor" />
                  </button>
                </div>
                {isPending ? (
                   <PaymentPendingBox submittedAt={pendingSubmittedAt} />
                 ) : (
                   <div className="course-cta-buttons" style={{ width: '100%' }}>
                     <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ justifyContent: 'center', padding: '14px 16px', fontSize: '13px', borderRadius: '9999px', fontWeight: 700 }}>ADQUIRIR AHORA — {courseData?.price || "S/ 890"}</button>
                     <button style={{ justifyContent: 'center', padding: '14px 16px', fontSize: '13px', borderRadius: '9999px', backgroundColor: 'transparent', border: '1px solid var(--overlay-medium)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700 }}>
                       <Play size={12} /> Ver intro
                     </button>
                   </div>
                 )}
              </div>

              {/* Stats Row */}
              <div className="course-stats-grid" style={{ padding: '32px 0', borderTop: '1px solid var(--overlay-light)', borderBottom: '1px solid var(--overlay-light)', marginBottom: '64px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px', color: 'var(--primary)', fontFamily: 'var(--font-title)' }}>1,284</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>ALUMNOS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px', color: 'var(--primary)', fontFamily: 'var(--font-title)' }}>12</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>MÓDULOS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px', color: 'var(--primary)', fontFamily: 'var(--font-title)' }}>68</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>LECCIONES</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px', color: 'var(--primary)', fontFamily: 'var(--font-title)' }}>24/7</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>SOPORTE</div>
                </div>
              </div>

              {/* Beneficios */}
              <div style={{ marginBottom: '64px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>
                  ¿QUÉ APRENDERÁS <span style={{ color: 'var(--primary)' }}>EN ESTE PROGRAMA?</span>
                </h3>
                <div className="course-benefits-grid">
                  {(() => {
                    let activeTopics = [];
                    try {
                      activeTopics = courseData?.topicsJson ? JSON.parse(courseData.topicsJson) : [];
                    } catch (e) {
                      activeTopics = [];
                    }
                    if (activeTopics.length === 0) {
                      activeTopics = benefits;
                    }
                    
                    const getIcon = (iconName: string) => {
                      switch (iconName) {
                        case 'ShieldAlert': return <ShieldAlert size={20} />;
                        case 'BookOpen': return <BookOpen size={20} />;
                        case 'Activity': return <Activity size={20} />;
                        case 'FileText': return <FileText size={20} />;
                        case 'MonitorPlay': return <MonitorPlay size={20} />;
                        case 'CheckCircle2': return <CheckCircle2 size={20} />;
                        case 'Award': return <Award size={20} />;
                        case 'GraduationCap': return <GraduationCap size={20} />;
                        case 'TrendingUp': return <TrendingUp size={20} />;
                        case 'BarChart2': return <BarChart2 size={20} />;
                        case 'Clock': return <Clock size={20} />;
                        default: return <BookOpen size={20} />;
                      }
                    };

                    return activeTopics.map((topic: any, i: number) => (
                      <div key={i} style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--overlay-light)', backgroundColor: 'var(--overlay-light)' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(0, 78, 187, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                          {topic.icon ? getIcon(topic.icon) : (i < 6 ? getIcon(['ShieldAlert', 'BookOpen', 'Activity', 'FileText', 'MonitorPlay', 'CheckCircle2'][i]) : <BookOpen size={20} />)}
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0' }}>{topic.title}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>{topic.desc}</p>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Temario y Sticky Card */}
              <div className="course-layout" style={{ marginBottom: '80px' }}>

                {/* Left Content */}
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>SOBRE ESTE PROGRAMA</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '48px' }}>
                    {courseData?.descriptionBottom || "La Especialización en Compliance está diseñada para profesionales del derecho, la auditoría y la gestión que buscan liderar la función de cumplimiento en sus organizaciones. Aprenderás a implementar programas robustos de compliance alineados a estándares internacionales como la ISO 37301 y la normativa peruana vigente incluyendo la Ley N° 30424 y el DL 1352."}
                  </p>

                  {/* Mobile-only Specs Card */}
                  <div className="mobile-only-specs-card-wrapper" style={{ marginBottom: '48px' }}>
                    <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '180px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <div className="img-placeholder" style={{ width: '100%', height: '100%' }}></div>
                        <button style={{ position: 'absolute', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
                          <Play size={20} fill="currentColor" />
                        </button>
                      </div>
                      <div style={{ padding: '24px' }}>
                         {isPending ? (
                           <PaymentPendingBox submittedAt={pendingSubmittedAt} />
                         ) : (
                           <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '14px', borderRadius: '8px', marginBottom: '24px' }}>
                             ADQUIRIR AHORA
                           </button>
                         )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={16} /> Nivel</span>
                            <span style={{ color: 'var(--text-main)' }}>Intermedio - Avanzado</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MonitorPlay size={16} /> Duración</span>
                            <span style={{ color: 'var(--text-main)' }}>40h 00m</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Banknote size={16} /> Precio</span>
                            <span style={{ color: 'var(--text-main)' }}>{courseData?.price || "S/ 890"}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} /> Certificado</span>
                            <span style={{ color: 'var(--text-main)' }}>Digital + Físico</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>TEMARIO DEL PROGRAMA</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(() => {


                      let activeMods = [];
                      if (courseData?.modulesJson) {
                        try {
                          activeMods = JSON.parse(courseData.modulesJson);
                        } catch (e) {
                          console.error(e);
                        }
                      }
                      if (activeMods.length === 0) {
                        activeMods = modules.map((m, idx) => ({
                          id: idx,
                          title: m.title,
                          description: '',
                          subModules: [
                            { id: 1, title: "Conceptos y marco teórico", description: "" },
                            { id: 2, title: "Aplicación práctica y casos", description: "" },
                            { id: 3, title: "Herramientas y recursos", description: "" }
                          ]
                        }));
                      }

                      return activeMods.map((mod: any, idx: number) => (
                        <div key={idx} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--overlay-light)' }}>
                          <div
                            onClick={() => setOpenModule(openModule === idx ? null : idx)}
                            style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--overlay-light)' }}
                          >
                            <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{mod.title}</h4>
                            {openModule === idx ? <ChevronUp size={16} color="var(--primary)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                          </div>
                          {openModule === idx && (
                            <div style={{ padding: '0 20px 20px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', backgroundColor: 'var(--overlay-light)' }}>
                              <div style={{ marginTop: '16px' }}>
                                {mod.description ? renderFormattedDescription(mod.description) : (
                                  <p style={{ margin: '8px 0', color: 'var(--text-muted)' }}>
                                    Este módulo contiene {mod.subModules?.length || 0} lecciones esenciales sobre compliance y gestión de integridad corporativa.
                                  </p>
                                )}
                                <ul style={{ marginTop: '12px', paddingLeft: '20px', listStyleType: 'decimal' }}>
                                  {(mod.subModules || []).map((sub: any, sIdx: number) => (
                                    <li key={sIdx} style={{ marginBottom: '12px' }}>
                                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{sub.title}</span>
                                      {sub.description && (
                                        <div style={{ marginTop: '6px', color: 'var(--text-muted)', fontSize: '12.5px', fontWeight: 'normal' }}>
                                          {renderFormattedDescription(sub.description)}
                                        </div>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Right Sticky Content (Desktop Only) */}
                <div className="desktop-only-specs-card" style={{ position: 'sticky', top: '100px', alignSelf: 'start' }}>
                  <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <div className="img-placeholder" style={{ width: '100%', height: '100%' }}></div>
                      <button style={{ position: 'absolute', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
                        <Play size={20} fill="currentColor" />
                      </button>
                    </div>
                    <div style={{ padding: '32px' }}>
                      <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '14px', borderRadius: '8px', marginBottom: '24px' }}>
                        ADQUIRIR AHORA
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={16} /> Nivel</span>
                          <span style={{ color: 'var(--text-main)' }}>Intermedio - Avanzado</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MonitorPlay size={16} /> Duración</span>
                          <span style={{ color: 'var(--text-main)' }}>40h 00m</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Banknote size={16} /> Precio</span>
                          <span style={{ color: 'var(--text-main)' }}>{courseData?.price || "S/ 890"}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} /> Certificado</span>
                          <span style={{ color: 'var(--text-main)' }}>Digital + Físico</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Testimonios */}
              <div style={{ marginBottom: '80px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>OPINIONES DE ALUMNOS</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--bg-main)', backgroundColor: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '12px' }}>
                    4.9 <Star size={12} fill="currentColor" />
                  </div>
                </div>

                <div className="reviews-horizontal-scroll">
                  {testimonios.map((t, i) => (
                    <div key={i} style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--overlay-light)', backgroundColor: 'var(--overlay-light)' }}>
                      <div style={{ display: 'flex', color: 'var(--primary)', marginBottom: '16px' }}>
                        {[...Array(5)].map((_, idx) => <Star key={idx} size={12} fill="currentColor" />)}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px', fontStyle: 'italic' }}>
                        "{t.text}"
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--bg-card-alt)' }} />
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{t.author}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Banner */}
              <div style={{ padding: '64px 48px', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--overlay-light)', backgroundColor: 'var(--overlay-light)', margin: '0 auto', maxWidth: '800px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px', fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>
                  ¿LISTO PARA LIDERAR EL COMPLIANCE <br/><span style={{ color: 'var(--primary)' }}>EN TU ORGANIZACIÓN?</span>
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
                  Únete a más de 1,000 profesionales que ya están transformando la cultura de integridad en sus empresas.
                </p>
                 {isPending ? (
                   <div style={{ maxWidth: '360px', margin: '0 auto' }}>
                     <PaymentPendingBox submittedAt={pendingSubmittedAt} />
                   </div>
                 ) : (
                   <div className="course-cta-buttons">
                     <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ padding: '14px 32px', fontSize: '13px', borderRadius: '9999px', fontWeight: 700 }}>EMPEZAR AHORA</button>
                     <button style={{ padding: '14px 32px', fontSize: '13px', borderRadius: '9999px', backgroundColor: 'transparent', border: '1px solid var(--overlay-medium)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 700 }}>
                       Hablar con un Asesor
                     </button>
                   </div>
                 )}
              </div>
            </>
          ) : (
            <>
              {/* ACTIVE COURSE VIEW */}
              <div className="player-header">
                <div className="player-header-title-wrap">
                  <span style={{ backgroundColor: 'rgba(0, 78, 187, 0.15)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em' }}>LIVE</span>
                  <h2 className="player-header-title">
                    Lección Actual: {currentModuleIdx + 1}.{currentLessonIdx + 1} {currentLesson?.title || "Lección"}
                  </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>PROGRESO DEL CURSO</span>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>{progressPercent}%</div>
                </div>
              </div>

              <div className="player-main-grid">
                {/* Video Player & Info */}
                <div>
                  <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#0a0a0a', borderRadius: '16px', border: '1px solid var(--overlay-light)', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div className="img-placeholder" style={{ width: '100%', height: '100%', opacity: 0.6 }}></div>
                    <button style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-main)', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0, 78, 187, 0.4)' }}>
                      <Play size={24} fill="currentColor" />
                    </button>
                    {/* Fake progress bar */}
                    <div style={{ position: 'absolute', bottom: '16px', left: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>06:20 / {currentLesson?.duration || '15:20'}</div>
                      <div style={{ flexGrow: 1, height: '4px', backgroundColor: 'var(--overlay-heavy)', borderRadius: '2px' }}>
                        <div style={{ width: '40%', height: '100%', backgroundColor: 'var(--primary)', borderRadius: '2px' }} />
                      </div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>
                    {currentModuleIdx + 1}.{currentLessonIdx + 1} {currentLesson?.title || "Lección"}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
                    {currentLesson?.description || "En esta lección estudiaremos a profundidad los temas planteados en el temario del programa de especialización."}
                  </p>

                  <div className="player-actions-row">
                    <button style={{ padding: '14px 24px', borderRadius: '8px', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--overlay-medium)', color: 'var(--text-main)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <Download size={16} /> Material de Apoyo
                    </button>
                    <button 
                      onClick={() => toggleLessonCompleted(currentModuleIdx, currentLessonIdx)}
                      style={{ 
                        padding: '14px 24px', 
                        borderRadius: '8px', 
                        backgroundColor: completedLessons.includes(`${currentModuleIdx}_${currentLessonIdx}`) ? 'rgba(76, 175, 80, 0.15)' : 'var(--overlay-light)', 
                        border: '1px solid ' + (completedLessons.includes(`${currentModuleIdx}_${currentLessonIdx}`) ? '#4caf50' : 'var(--overlay-medium)'), 
                        color: completedLessons.includes(`${currentModuleIdx}_${currentLessonIdx}`) ? '#4caf50' : 'var(--text-main)', 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        cursor: 'pointer' 
                      }}
                    >
                      <CheckCircle2 size={16} /> 
                      {completedLessons.includes(`${currentModuleIdx}_${currentLessonIdx}`) ? 'Completado' : 'Marcar Completado'}
                    </button>
                    <button 
                      onClick={() => {
                        markLessonCompleted(currentModuleIdx, currentLessonIdx);
                        const currentMod = activeMods[currentModuleIdx];
                        if (currentLessonIdx < (currentMod?.subModules?.length || 0) - 1) {
                          setCurrentLessonIdx(prev => prev + 1);
                        } else if (currentModuleIdx < activeMods.length - 1) {
                          setCurrentModuleIdx(prev => prev + 1);
                          setCurrentLessonIdx(0);
                        }
                      }}
                      className="btn-primary" 
                      style={{ padding: '14px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      SIGUIENTE LECCIÓN <ArrowRight size={16} />
                    </button>
                  </div>

                  {/* CERTIFICATE DOWNLOAD SECTION */}
                  <div style={{
                    marginTop: '40px',
                    padding: '32px',
                    borderRadius: '16px',
                    border: '1px solid ' + (progressPercent === 100 ? 'rgba(76, 175, 80, 0.3)' : 'var(--overlay-light)'),
                    backgroundColor: progressPercent === 100 ? 'rgba(76, 175, 80, 0.05)' : 'var(--overlay-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: progressPercent === 100 ? '0 8px 32px rgba(76, 175, 80, 0.05)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: progressPercent === 100 ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: progressPercent === 100 ? '#4caf50' : 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Award size={24} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Certificado Oficial de Especialización</h4>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                          {progressPercent === 100 
                            ? '¡Felicitaciones! Has completado el 100% de las lecciones del curso. Ya puedes descargar tu certificado.' 
                            : `Completa todas las lecciones del curso para habilitar tu certificado. Progreso actual: ${progressPercent}%`}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                      <button
                        disabled={progressPercent < 100}
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop';
                          link.download = `Certificado_Compliance_${user?.name?.replace(/\s+/g, '_') || 'Estudiante'}.jpg`;
                          link.target = '_blank';
                          link.click();
                        }}
                        className="btn-primary"
                        style={{
                          padding: '14px 28px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 700,
                          backgroundColor: progressPercent === 100 ? '#4caf50' : 'var(--overlay-medium)',
                          color: progressPercent === 100 ? '#ffffff' : 'var(--text-dim)',
                          border: 'none',
                          cursor: progressPercent === 100 ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: progressPercent === 100 ? '0 4px 16px rgba(76, 175, 80, 0.2)' : 'none'
                        }}
                      >
                        <Download size={16} /> Descargar Certificado (PDF/JPG)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Playlist Sidebar */}
                <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', alignSelf: 'start', border: '1px solid var(--overlay-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>
                      Módulo {currentModuleIdx + 1} <span style={{ color: 'var(--text-muted)', fontWeight: 500, display: 'block', fontSize: '11px', textTransform: 'none', marginTop: '4px' }}>{currentModule?.title?.split(': ')[1] || currentModule?.title}</span>
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{currentModule?.subModules?.length || 0} Lecciones</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '380px', overflowY: 'auto' }}>
                    {(currentModule?.subModules || []).map((sub: any, sIdx: number) => {
                      const isCurrent = sIdx === currentLessonIdx;
                      const isCompleted = completedLessons.includes(`${currentModuleIdx}_${sIdx}`);
                      const isLocked = !isLessonUnlocked(currentModuleIdx, sIdx);
                      return (
                        <div 
                          key={sIdx} 
                          onClick={() => {
                            if (!isLocked) {
                              setCurrentLessonIdx(sIdx);
                            }
                          }}
                          style={{ 
                            padding: '12px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            color: isCurrent ? 'var(--text-main)' : isLocked ? 'var(--text-dim)' : 'var(--text-muted)', 
                            backgroundColor: isCurrent ? 'rgba(0, 78, 187, 0.1)' : 'transparent', 
                            border: isCurrent ? '1px solid rgba(0, 78, 187, 0.2)' : '1px solid transparent', 
                            cursor: isLocked ? 'not-allowed' : 'pointer',
                            opacity: isLocked ? 0.5 : 1
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {isCurrent ? (
                                <PlayCircle size={14} color="var(--primary)" />
                              ) : isCompleted ? (
                                <CheckCircle2 size={14} color="#4caf50" />
                              ) : isLocked ? (
                                <Lock size={14} color="var(--text-dim)" />
                              ) : (
                                <PlayCircle size={14} color="var(--text-dim)" />
                              )}
                              <span style={{ fontSize: '12.5px', fontWeight: isCurrent ? 600 : 400 }}>
                                {currentModuleIdx + 1}.{sub.id || sIdx + 1} {sub.title}
                              </span>
                            </div>
                            {/* Lesson progress bar */}
                            <div style={{ width: '100%', height: '2px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '1px', overflow: 'hidden', marginTop: '2px' }}>
                              <div style={{ 
                                width: isCompleted ? '100%' : isCurrent ? '40%' : '0%', 
                                height: '100%', 
                                backgroundColor: isCompleted ? '#4caf50' : 'var(--primary)', 
                                transition: 'width 0.3s ease' 
                              }} />
                            </div>
                          </div>
                          <span style={{ fontSize: '10.5px', color: isCurrent ? 'var(--primary)' : 'var(--text-dim)', marginLeft: '12px' }}>
                            {sub.duration || '15:20'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Módulos Accordion */}
              <div style={{ marginBottom: '64px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', fontFamily: 'var(--font-title)' }}>Módulos del Programa</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeMods.map((mod: any, idx: number) => {
                    const isOpen = openModule === idx;
                    const isCurrentMod = idx === currentModuleIdx;
                    const modCompletedCount = (mod.subModules || []).filter((_: any, sIdx: number) => 
                      completedLessons.includes(`${idx}_${sIdx}`)
                    ).length;
                    const modTotalCount = mod.subModules?.length || 0;
                    const isModFullyCompleted = modTotalCount > 0 && modCompletedCount === modTotalCount;

                    return (
                      <div key={idx} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--overlay-light)' }}>
                        <div
                          onClick={() => setOpenModule(isOpen ? null : idx)}
                          style={{ 
                            padding: '16px 20px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            cursor: 'pointer', 
                            backgroundColor: isCurrentMod ? 'rgba(0, 78, 187, 0.05)' : 'var(--overlay-light)',
                            borderLeft: isCurrentMod ? '4px solid var(--primary)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>MOD {idx + 1}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: isCurrentMod ? 'var(--primary)' : 'var(--text-main)' }}>
                                {mod.title.split(': ')[1] || mod.title}
                              </h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                <div style={{ width: '80px', height: '3px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '1.5px', overflow: 'hidden' }}>
                                  <div style={{ 
                                    width: `${modTotalCount > 0 ? (modCompletedCount / modTotalCount) * 100 : 0}%`, 
                                    height: '100%', 
                                    backgroundColor: isModFullyCompleted ? '#4caf50' : 'var(--primary)', 
                                    transition: 'width 0.3s ease' 
                                  }} />
                                </div>
                                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                                  {Math.round(modTotalCount > 0 ? (modCompletedCount / modTotalCount) * 100 : 0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '12px', color: isModFullyCompleted ? '#4caf50' : 'var(--text-muted)', fontWeight: isModFullyCompleted ? 600 : 400 }}>
                              {modCompletedCount}/{modTotalCount} {isModFullyCompleted ? 'Completado' : 'Lecciones'}
                            </span>
                            {isOpen ? <ChevronUp size={16} color="var(--primary)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                          </div>
                        </div>
                        {isOpen && (
                          <div style={{ padding: '12px 20px', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--overlay-light)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {(mod.subModules || []).map((sub: any, sIdx: number) => {
                                const isSel = isCurrentMod && sIdx === currentLessonIdx;
                                const isSubCompleted = completedLessons.includes(`${idx}_${sIdx}`);
                                const isLocked = !isLessonUnlocked(idx, sIdx);
                                return (
                                  <div 
                                    key={sIdx}
                                    onClick={() => {
                                      if (!isLocked) {
                                        setCurrentModuleIdx(idx);
                                        setCurrentLessonIdx(sIdx);
                                      }
                                    }}
                                    style={{ 
                                      padding: '10px 12px', 
                                      borderRadius: '6px', 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center', 
                                      cursor: isLocked ? 'not-allowed' : 'pointer', 
                                      backgroundColor: isSel ? 'rgba(0, 78, 187, 0.1)' : 'transparent',
                                      color: isSel ? 'var(--primary)' : isLocked ? 'var(--text-dim)' : 'var(--text-muted)',
                                      opacity: isLocked ? 0.5 : 1
                                    }}
                                  >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                        {isSel ? (
                                          <PlayCircle size={14} color="var(--primary)" />
                                        ) : isSubCompleted ? (
                                          <CheckCircle2 size={14} color="#4caf50" />
                                        ) : isLocked ? (
                                          <Lock size={14} color="var(--text-dim)" />
                                        ) : (
                                          <PlayCircle size={14} color="var(--text-dim)" />
                                        )}
                                        <span>{idx + 1}.{sIdx + 1} {sub.title}</span>
                                      </div>
                                      {/* Lesson progress bar */}
                                      <div style={{ width: '100%', height: '2px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '1px', overflow: 'hidden', marginTop: '2px' }}>
                                        <div style={{ 
                                          width: isSubCompleted ? '100%' : isSel ? '40%' : '0%', 
                                          height: '100%', 
                                          backgroundColor: isSubCompleted ? '#4caf50' : 'var(--primary)', 
                                          transition: 'width 0.3s ease' 
                                        }} />
                                      </div>
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '12px' }}>{sub.duration || '15:20'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Testimonios */}
              <div style={{ marginBottom: '80px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, fontFamily: 'var(--font-title)' }}>Opiniones de alumnos</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--bg-main)', backgroundColor: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '12px' }}>
                    4.9 <Star size={12} fill="currentColor" />
                  </div>
                </div>

                <div className="reviews-horizontal-scroll">
                  {testimonios.map((t, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--overlay-light)' }}>
                      <div style={{ display: 'flex', color: 'var(--primary)', marginBottom: '16px' }}>
                        {[...Array(5)].map((_, idx) => <Star key={idx} size={12} fill="currentColor" />)}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px', fontStyle: 'italic' }}>
                        "{t.text}"
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--bg-card-alt)' }} />
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{t.author}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Otros Cursos */}
              <div style={{ marginTop: '80px', marginBottom: '80px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', fontFamily: 'var(--font-title)' }}>Otros Cursos</h3>
                <div className="other-courses-grid">
                  {otrosCursos.map((c, i) => (
                    <div key={i} className="other-course-card">
                      <div className="other-course-img" style={{ 
                        backgroundImage: c.thumbnail ? `url("${c.thumbnail}")` : 'none'
                      }}></div>
                      <div className="other-course-content">
                        <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', minHeight: '40px' }}>{c.t}</h4>
                        <div className="other-course-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.rating}</span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>{c.price}</span>
                        </div>
                        <button 
                          onClick={() => navigate(c.path)}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--overlay-light)', color: 'var(--text-main)', fontSize: '12px', fontWeight: 600, border: '1px solid var(--overlay-medium)', cursor: 'pointer' }}
                        >
                          CONOCER MÁS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </>
          )}
        </>
      )}

          {/* Footer */}
          <footer className="admin-footer-wrapper" style={{ marginTop: '80px', padding: 0 }}>
            <StudentFooter />
          </footer>

        </div>
      </main>

      {/* Checkout Modal */}
      {showPaymentModal && (
        <CheckoutPage
          onNavigateToHome={() => setShowPaymentModal(false)}
          isModal={true}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePurchaseSuccess}
          courseTitle="Especialista en Compliance"
        />
      )}
    </div>
  );
};
