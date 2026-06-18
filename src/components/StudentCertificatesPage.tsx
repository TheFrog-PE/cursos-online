import React, { useEffect, useState } from 'react';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';
import { StudentFooter } from './StudentFooter';
import { useAuth } from '../contexts/AuthContext';
import { progressService } from '../services/api';
import { Award, Download, AlertCircle } from 'lucide-react';

interface Certificate {
  id: string;
  courseTitle: string;
  issueDate: string;
  grade: string;
  downloadUrl: string;
}

export const StudentCertificatesPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedCerts, setCompletedCerts] = useState<Certificate[]>([]);
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertsAndProgress = async () => {
      try {
        setIsLoading(true);
        // List default mock certificate databases matching the student user profile
        const activeCerts: Certificate[] = [];
        const pending: any[] = [];

        // Check Especialista en Compliance (Course ID 2)
        try {
          const complianceRes = await progressService.getProgress('2');
          const totalLessonsCompliance = 68; // Modules 1 to 12 sum up to 68 lessons
          const completedCompliance = complianceRes.completedLessons?.length || 0;
          const pct = Math.round((completedCompliance / totalLessonsCompliance) * 100);

          if (pct === 100) {
            activeCerts.push({
              id: 'CERT-2',
              courseTitle: 'Especialista en Compliance y Gestión de Integridad (ISO 37301)',
              issueDate: 'Habilitado hoy',
              grade: '10.0/10',
              downloadUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop'
            });
          } else if (completedCompliance > 0) {
            pending.push({
              title: 'Especialista en Compliance',
              progress: pct,
              status: 'En curso'
            });
          }
        } catch (e) {
          console.error(e);
        }

        // Check Oficial de Datos Personales (Course ID 1)
        try {
          const odpcRes = await progressService.getProgress('1');
          const totalLessonsOdpc = 56; // Modules 1 to 10 sum up to 56 lessons
          const completedOdpc = odpcRes.completedLessons?.length || 0;
          const pct = Math.round((completedOdpc / totalLessonsOdpc) * 100);

          if (pct === 100) {
            activeCerts.push({
              id: 'CERT-1',
              courseTitle: 'Certificación Oficial en OCPD: Protección de Datos Personales',
              issueDate: 'Habilitado hoy',
              grade: '9.6/10',
              downloadUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop'
            });
          } else if (completedOdpc > 0) {
            pending.push({
              title: 'Oficial de Datos Personales (OCPD)',
              progress: pct,
              status: 'En curso'
            });
          }
        } catch (e) {
          console.error(e);
        }

        // Default mock certificates for profile demo
        if (activeCerts.length === 0) {
          activeCerts.push({
            id: 'CERT-003',
            courseTitle: 'Fundamentos de Estafas Digitales y Phishing',
            issueDate: 'Emitido el 12 de Enero, 2024',
            grade: '9.8/10',
            downloadUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop'
          });
          activeCerts.push({
            id: 'CERT-004',
            courseTitle: 'Gestión de Riesgos y Derivados Corporativos',
            issueDate: 'Emitido el 05 de Diciembre, 2023',
            grade: '10.0/10',
            downloadUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop'
          });
        }

        setCompletedCerts(activeCerts);
        setPendingCourses(pending);
      } catch (e) {
        console.error('Error fetching certificates:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertsAndProgress();
  }, [user]);

  const handleDownload = (cert: Certificate) => {
    const link = document.createElement('a');
    link.href = cert.downloadUrl;
    link.download = `Certificado_${cert.courseTitle.replace(/\s+/g, '_')}.jpg`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-body)' }}>
      {/* SIDEBAR */}
      <StudentSidebar 
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT */}
      <main className="app-main" style={{ marginLeft: '280px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <StudentHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <div style={{ padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px) 80px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px', fontWeight: 700 }}>
              LOGROS INSTITUCIONALES
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 6vw, 40px)', fontWeight: 800, margin: '0 0 16px 0', fontFamily: 'var(--font-title)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              MIS CERTIFICADOS
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '600px', lineHeight: '1.6' }}>
              Aquí se listan las acreditaciones oficiales y certificaciones digitales que has obtenido tras completar satisfactoriamente los cursos del Instituto.
            </p>
          </div>

          {isLoading ? (
            <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando acreditaciones...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Active Certificates Panel */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Award size={20} color="var(--primary)" /> Certificados Obtenidos ({completedCerts.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {completedCerts.map((cert) => (
                    <div 
                      key={cert.id}
                      className="glass-panel"
                      style={{
                        padding: '24px',
                        borderRadius: '16px',
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto auto',
                        alignItems: 'center',
                        gap: '24px',
                        borderLeft: '4px solid #4caf50'
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(76, 175, 80, 0.12)',
                        color: '#4caf50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Award size={24} />
                      </div>

                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)' }}>{cert.courseTitle}</h4>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cert.issueDate} • ID: {cert.id}</div>
                      </div>

                      <div style={{ textAlign: 'right', paddingRight: '16px' }}>
                        <div style={{ fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: '4px' }}>CALIFICACIÓN</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>{cert.grade}</div>
                      </div>

                      <button
                        onClick={() => handleDownload(cert)}
                        className="btn-primary"
                        style={{
                          padding: '12px 20px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          backgroundColor: '#4caf50',
                          border: 'none',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 16px rgba(76, 175, 80, 0.2)'
                        }}
                      >
                        <Download size={14} /> Descargar PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Courses / In progress */}
              {pendingCourses.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                    <AlertCircle size={18} /> Cursos en Curso ({pendingCourses.length})
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pendingCourses.map((item, idx) => (
                      <div 
                        key={idx}
                        className="glass-panel"
                        style={{
                          padding: '20px 24px',
                          borderRadius: '16px',
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          alignItems: 'center',
                          gap: '24px',
                          opacity: 0.85
                        }}
                      >
                        <div>
                          <h4 style={{ fontSize: '14.5px', fontWeight: 600, margin: '0 0 8px 0' }}>{item.title}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '150px', height: '4px', backgroundColor: 'var(--overlay-medium)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${item.progress}%`, height: '100%', backgroundColor: 'var(--primary)' }} />
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{item.progress}% completado</span>
                          </div>
                        </div>

                        <button
                          disabled
                          style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: 'var(--overlay-medium)',
                            border: 'none',
                            color: 'var(--text-dim)',
                            cursor: 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <AlertCircle size={14} /> Completa al 100% para descargar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
          
          <footer style={{ marginTop: '80px', borderTop: '1px solid var(--overlay-light)', paddingTop: '40px' }}>
            <StudentFooter />
          </footer>
        </div>
      </main>
    </div>
  );
};
