import React, { useState, useRef } from 'react';
import {
  ArrowLeft, Play, Plus, ChevronDown, ChevronUp, CheckCircle2,
  GraduationCap, TrendingUp, BarChart2, Clock,
  UploadCloud, File, Trash2, BookOpen, X, Star, Users,
  FolderOpen, Folder, Shield, Award, Image, Banknote,
  ShieldAlert, Activity, FileText, MonitorPlay, Bold, Italic, List
} from 'lucide-react';
import { initialCourses } from '../types/courses';
import { demoService } from '../services/api';
interface UploadedFile {
  name: string;
  size: string;
}

const handleToolbarAction = (
  textarea: HTMLTextAreaElement | null,
  text: string,
  onChange: (val: string) => void,
  action: 'bold' | 'italic' | 'list'
) => {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = text.substring(start, end);
  let replacement = '';

  if (action === 'bold') {
    replacement = `**${selectedText || 'texto'}**`;
  } else if (action === 'italic') {
    replacement = `*${selectedText || 'texto'}*`;
  } else if (action === 'list') {
    if (selectedText.includes('\n')) {
      replacement = selectedText
        .split('\n')
        .map(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
            return line;
          }
          return `- ${line}`;
        })
        .join('\n');
    } else {
      replacement = `- ${selectedText || 'punto'}`;
    }
  }

  const newText = text.substring(0, start) + replacement + text.substring(end);
  onChange(newText);

  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + replacement.length, start + replacement.length);
  }, 0);
};

const TextFormatterToolbar: React.FC<{
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  text: string;
  onChange: (val: string) => void;
}> = ({ textareaRef, text, onChange }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      backgroundColor: 'var(--overlay-light)',
      border: '1px solid var(--border-color)',
      borderBottom: 'none',
      borderTopLeftRadius: '10px',
      borderTopRightRadius: '10px',
      padding: '8px 12px',
      alignItems: 'center'
    }}>
      <button
        type="button"
        onClick={() => handleToolbarAction(textareaRef.current, text, onChange, 'bold')}
        title="Negrita (Word-like)"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--overlay-medium)'; e.currentTarget.style.color = 'var(--text-main)'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <Bold size={14} />
      </button>
      <button
        type="button"
        onClick={() => handleToolbarAction(textareaRef.current, text, onChange, 'italic')}
        title="Cursiva (Word-like)"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--overlay-medium)'; e.currentTarget.style.color = 'var(--text-main)'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <Italic size={14} />
      </button>
      <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
      <button
        type="button"
        onClick={() => handleToolbarAction(textareaRef.current, text, onChange, 'list')}
        title="Lista en puntos (Word-like)"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--overlay-medium)'; e.currentTarget.style.color = 'var(--text-main)'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <List size={14} />
      </button>
    </div>
  );
};

interface SubModule {
  id: number;
  title: string;
  status: 'EDITANDO' | 'BORRADOR';
  description?: string;
}

interface Module {
  id: number;
  title: string;
  description?: string;
  expanded: boolean;
  subModules: SubModule[];
}

interface AdminCourseEditorProps {
  courseName?: string;
  onBack: () => void;
}

interface Course {
  id: number;
  title: string;
  category: string;
  instructor: string;
  students: number;
  duration: string;
  rating: number;
  status: 'Publicado' | 'Borrador' | 'Archivado';
  price: string;
  modules: number;
  lastUpdated: string;
}

interface CourseListItem {
  id: number;
  name: string;
  icon: string;
  thumbnail: string;
  price?: string;
  descriptionTop?: string;
  descriptionBottom?: string;
  topicsJson?: string;
  modulesJson?: string;
  isComingSoon?: boolean;
}

interface CoursePreviewModalProps {
  course: Course;
  onClose: () => void;
}

const getMockSyllabus = (title: string) => {
  const map: Record<string, { title: string; lessons: string[] }[]> = {
    'Especialización en Compliance': [
      { title: 'Módulo 1: Fundamentos del Compliance y Gobierno Corporativo', lessons: ['Evolución, concepto moderno y función estratégica del compliance.', 'Ética empresarial y control interno.', 'Gobierno corporativo (hard law y soft law), principios OCDE y buenas prácticas.', 'Rol del Directorio, Alta Dirección y el modelo de las tres líneas.', 'Tone at the Top y cultura de cumplimiento.', 'Análisis comparado: enfoque anglosajón, europeo y latinoamericano.'] },
      { title: 'Módulo 2: Responsabilidad Penal de la Persona Jurídica y Modelo de Prevención', lessons: ['Evolución y régimen peruano de responsabilidad empresarial (marco legal y principales delitos).', 'Responsabilidad de directores, gerentes y administradores.', 'Concepto, finalidad y relación del modelo de prevención con el compliance.', 'Factores de exención, atenuación y cooperación eficaz.', 'Defensa penal corporativa.'] },
      { title: 'Módulo 3: Gestión de Riesgos de Compliance', lessons: ['Principios y estructura de la norma ISO 31000.', 'Procesos: identificación, análisis, tratamiento y monitoreo de riesgos.', 'Matriz de riesgos y herramientas prácticas (con caso aplicado a empresas peruanas).'] },
      { title: 'Módulo 4: Sistema Integrado de Gestión y Políticas Internas', lessons: ['Enfoque de sistemas de gestión (ISO 37301 e ISO 37001 antisoborno).', 'Contexto organizacional, liderazgo y roles.', 'Diseño de políticas internas: regalos, conflictos de interés, donaciones, relación con terceros.', 'Criterios de autorización, matrices de excepciones y Due Diligence de terceros.', 'Capacitación, comunicación interna y evaluación de desempeño (indicadores de cumplimiento).', 'Taller práctico: Gestión de riesgos y plan de mitigación.'] },
      { title: 'Módulo 5: Canales de Denuncia e Investigaciones Internas', lessons: ['Diseño, implementación y tipología de denuncias (whistleblowing).', 'Gestión de alertas y procedimiento de investigación interna.', 'Preservación de evidencias, confidencialidad y protección al denunciante.', 'Coordinación legal y buenas prácticas internacionales.'] },
      { title: 'Módulo 6: Formación y Funciones del Oficial de Cumplimiento', lessons: ['Rol, perfil, competencias e independencia del Compliance Officer.', 'Ubicación en el organigrama y prevención de conflictos internos.', 'Elaboración del plan anual y del informe anual de compliance.', 'Métricas de cumplimiento (KPI / KRI).', 'Comunicación de valor: ROI cualitativo y prevención de riesgos reputacionales.'] },
      { title: 'Módulo 7: Prevención de Lavado de Activos y Financiamiento del Terrorismo (SPLAFT)', lessons: ['Definición de delitos LA/FT y marco para Sujetos Obligados.', 'Rol del Oficial de Cumplimiento en este ámbito.', 'Debida diligencia, calificación de riesgo de clientes y beneficiario final.', 'Monitoreo transaccional, señales de alerta y gestión continua del SPLAFT.', 'Caso práctico integral.'] },
    ],
    'Especialista en Compliance': [
      { title: 'Módulo 1: Fundamentos del Compliance y Gobierno Corporativo', lessons: ['Evolución, concepto moderno y función estratégica del compliance.', 'Ética empresarial y control interno.', 'Gobierno corporativo y buenas prácticas.'] },
      { title: 'Módulo 2: Responsabilidad Penal de la Persona Jurídica', lessons: ['Régimen peruano de responsabilidad autónoma.', 'Modelo de prevención e integración estratégica.', 'Exención y cooperación eficaz.'] }
    ],
    'Certificación Oficial en OCPD: Protección de Datos Personales': [
      { title: 'Módulo 1: Fundamentos de la Protección de Datos', lessons: ['Introducción a la Ley N° 29733.', 'Principios rectores de la privacidad y consentimiento.', 'El Registro Nacional de Protección de Datos Personales.'] },
      { title: 'Módulo 2: Derechos ARCO y Medidas de Seguridad', lessons: ['Derechos de Acceso, Rectificación, Cancelación y Oposición.', 'Medidas de seguridad técnicas, directivas y organizativas.', 'Flujos transfronterizos de datos.'] }
    ]
  };
  return map[title] || [
    { title: 'Módulo 1: Conceptos Básicos e Introducción', lessons: ['1.1 Introducción al tema principal', '1.2 Glosario de términos clave', '1.3 Primeros pasos y configuración'] },
    { title: 'Módulo 2: Estrategias Prácticas y Flujo de Trabajo', lessons: ['2.1 Flujo de trabajo profesional', '2.2 Optimización de procesos cotidianos', '2.3 Resolución de problemas frecuentes'] },
  ];
};

function CoursePreviewModal({ course, onClose }: CoursePreviewModalProps) {
  const syllabus = getMockSyllabus(course.title);
  const [activeModuleIdx, setActiveModuleIdx] = useState<number | null>(0);

  const getCategoryImage = (category: string) => {
    const map: Record<string, string> = {
      'Finanzas': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=60',
      'Arbitraje': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=60',
      'Legal': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=60',
      'Seguridad': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=60',
    };
    return map[category] || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=60';
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', zIndex: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', position: 'relative' }}>
        
        {/* Cover image & Title */}
        <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden' }}>
          <img src={getCategoryImage(course.category)} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to bottom, rgba(19,21,26,0), var(--bg-card))' }} />
          
          <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, zIndex: 10 }}>
            <X size={16} />
          </button>
          
          <div style={{ position: 'absolute', bottom: 20, left: 32, right: 32 }}>
            <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: 'var(--primary)', color: '#fff', padding: '4px 10px', borderRadius: 20, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {course.category}
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '12px 0 6px 0', fontFamily: 'var(--font-title)', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
              {course.title}
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Instructor: <strong style={{ color: 'var(--text-main)' }}>{course.instructor}</strong>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ padding: '0 32px 32px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '16px', marginBottom: '28px' }}>
            {[
              { label: 'ESTUDIANTES', value: course.students.toLocaleString(), icon: <Users size={16} color="var(--primary)" /> },
              { label: 'MÓDULOS', value: course.modules || syllabus.length, icon: <BookOpen size={16} color="var(--primary)" /> },
              { label: 'DURACIÓN', value: course.duration, icon: <Clock size={16} color="var(--primary)" /> },
              { label: 'VALORACIÓN', value: course.rating > 0 ? `${course.rating} ★` : 'N/A', icon: <Star size={16} fill={course.rating > 0 ? "var(--primary)" : "none"} color="var(--primary)" /> },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {item.icon}
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>{item.label}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Syllabus Accordions */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', letterSpacing: '0.02em' }}>
              Plan de Estudio ({syllabus.length} Módulos)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {syllabus.map((mod, modIdx) => {
                const isOpen = activeModuleIdx === modIdx;
                return (
                  <div key={modIdx} style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', backgroundColor: 'var(--overlay-light)' }}>
                    <button
                      onClick={() => setActiveModuleIdx(isOpen ? null : modIdx)}
                      style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700, textAlign: 'left' }}>{mod.title}</span>
                      <ChevronDown size={16} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    
                    {isOpen && (
                      <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                        {mod.lessons.map((lesson, lessonIdx) => (
                          <div key={lessonIdx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '12px', color: 'var(--text-muted)' }}>
                            <Play size={10} fill="var(--primary)" color="var(--primary)" />
                            <span>{lesson}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* Price & Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>VALOR DEL CURSO</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{course.price}</div>
            </div>
            <button onClick={onClose} className="btn-primary" style={{ padding: '12px 28px', borderRadius: 8, fontSize: '13px', fontWeight: 700 }}>
              Cerrar Vista Previa
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

const getInitialModules = (courseName: string): Module[] => {
  const normName = courseName.trim().toLowerCase();
  if (normName.includes('compliance')) {
    return [
      {
        id: 1,
        title: 'Módulo 1: Fundamentos del Compliance y Gobierno Corporativo',
        description: 'Evolución, concepto moderno y función estratégica del compliance.',
        expanded: true,
        subModules: [
          { id: 101, title: 'Evolución, concepto moderno y función estratégica del compliance.', status: 'BORRADOR', description: 'Función estratégica del compliance y su evolución moderna.' },
          { id: 102, title: 'Ética empresarial y control interno.', status: 'BORRADOR', description: 'Marcos de ética empresarial y mecanismos de control interno.' },
          { id: 103, title: 'Gobierno corporativo (hard law y soft law), principios OCDE y buenas prácticas.', status: 'BORRADOR', description: 'Gobierno corporativo bajo enfoques hard y soft law y principios OCDE.' },
          { id: 104, title: 'Rol del Directorio, Alta Dirección y el modelo de las tres líneas.', status: 'BORRADOR', description: 'Modelo de las tres líneas y responsabilidades de la alta dirección.' },
          { id: 105, title: 'Tone at the Top y cultura de cumplimiento.', status: 'BORRADOR', description: 'Liderazgo moral desde la alta dirección y cultura de cumplimiento.' },
          { id: 106, title: 'Análisis comparado: enfoque anglosajón, europeo y latinoamericano.', status: 'BORRADOR', description: 'Análisis y contraste de los modelos regionales de compliance.' },
        ]
      },
      {
        id: 2,
        title: 'Módulo 2: Responsabilidad Penal de la Persona Jurídica y Modelo de Prevención',
        description: 'Evolución y régimen peruano de responsabilidad empresarial.',
        expanded: false,
        subModules: [
          { id: 201, title: 'Evolución y régimen peruano de responsabilidad empresarial (marco legal y principales delitos).', status: 'BORRADOR', description: 'Marco legal peruano y delitos imputables a personas jurídicas.' },
          { id: 202, title: 'Responsabilidad de directores, gerentes y administradores.', status: 'BORRADOR', description: 'Responsabilidades penales y civiles de directivos y gerentes.' },
          { id: 203, title: 'Concepto, finalidad y relación del modelo de prevención con el compliance.', status: 'BORRADOR', description: 'Modelos de prevención y su integración estratégica con compliance.' },
          { id: 204, title: 'Factores de exención, atenuación y cooperación eficaz.', status: 'BORRADOR', description: 'Criterios eximentes, atenuantes y la figura de cooperación eficaz.' },
          { id: 205, title: 'Defensa penal corporativa.', status: 'BORRADOR', description: 'Estrategias de defensa penal corporativa en el marco legal.' },
        ]
      },
      {
        id: 3,
        title: 'Módulo 3: Gestión de Riesgos de Compliance',
        description: 'Principios y estructura de la norma ISO 31000.',
        expanded: false,
        subModules: [
          { id: 301, title: 'Principios y estructura de la norma ISO 31000.', status: 'BORRADOR', description: 'Estructura general de la norma internacional ISO 31000.' },
          { id: 302, title: 'Procesos: identificación, análisis, tratamiento y monitoreo de riesgos.', status: 'BORRADOR', description: 'Etapas del proceso de gestión del riesgo corporativo.' },
          { id: 303, title: 'Matriz de riesgos y herramientas prácticas (con caso aplicado a empresas peruanas).', status: 'BORRADOR', description: 'Diseño e implementación de matrices de riesgo aplicadas a la realidad peruana.' },
        ]
      },
      {
        id: 4,
        title: 'Módulo 4: Sistema Integrado de Gestión y Políticas Internas',
        description: 'Enfoque de sistemas de gestión (ISO 37301 e ISO 37001 antisoborno).',
        expanded: false,
        subModules: [
          { id: 401, title: 'Enfoque de sistemas de gestión (ISO 37301 e ISO 37001 antisoborno).', status: 'BORRADOR', description: 'Sistemas de gestión basados en normas ISO 37301 e ISO 37001.' },
          { id: 402, title: 'Contexto organizacional, liderazgo y roles.', status: 'BORRADOR', description: 'Liderazgo, asignación de roles y contexto del sistema de gestión.' },
          { id: 403, title: 'Diseño de políticas internas: regalos, conflictos de interés, donaciones, relación con terceros.', status: 'BORRADOR', description: 'Políticas antisoborno, regalos y manejo de conflictos de interés.' },
          { id: 404, title: 'Criterios de autorización, matrices de excepciones y Due Diligence de terceros.', status: 'BORRADOR', description: 'Due diligence y procesos de aprobación e investigación de terceros.' },
          { id: 405, title: 'Capacitación, comunicación interna y evaluación de desempeño.', status: 'BORRADOR', description: 'Indicadores de cumplimiento, comunicación y capacitación interna.' },
          { id: 406, title: 'Taller práctico: Gestión de riesgos y plan de mitigación.', status: 'BORRADOR', description: 'Taller práctico para formulación de plan de mitigación y gestión de riesgos.' },
        ]
      },
      {
        id: 5,
        title: 'Módulo 5: Canales de Denuncia e Investigaciones Internas',
        description: 'Diseño, implementación y tipología de denuncias (whistleblowing).',
        expanded: false,
        subModules: [
          { id: 501, title: 'Diseño, implementación y tipología de denuncias (whistleblowing).', status: 'BORRADOR', description: 'Canales éticos de denuncia (whistleblowing) y su diseño.' },
          { id: 502, title: 'Gestión de alertas y procedimiento de investigación interna.', status: 'BORRADOR', description: 'Procedimientos y protocolos de investigación interna corporativa.' },
          { id: 503, title: 'Preservación de evidencias, confidencialidad y protección al denunciante.', status: 'BORRADOR', description: 'Medidas de confidencialidad, no represalias y resguardo de evidencia.' },
          { id: 504, title: 'Coordinación legal y buenas prácticas internacionales.', status: 'BORRADOR', description: 'Estándares internacionales en coordination legal para investigaciones.' },
        ]
      },
      {
        id: 6,
        title: 'Módulo 6: Formación y Funciones del Oficial de Cumplimiento',
        description: 'Rol, perfil, competencias e independencia del Compliance Officer.',
        expanded: false,
        subModules: [
          { id: 601, title: 'Rol, perfil, competencias e independencia del Compliance Officer.', status: 'BORRADOR', description: 'Perfil profesional, independencia y competencias clave del Oficial de Cumplimiento.' },
          { id: 602, title: 'Ubicación en el organigrama y prevención de conflictos internos.', status: 'BORRADOR', description: 'Gobierno del compliance officer y su posición orgánica.' },
          { id: 603, title: 'Elaboración del plan anual y del informe anual de compliance.', status: 'BORRADOR', description: 'Diseño de plan operativo anual y reporte anual para la alta dirección.' },
          { id: 604, title: 'Métricas de cumplimiento (KPI / KRI).', status: 'BORRADOR', description: 'Indicadores clave de rendimiento (KPI) e indicadores clave de riesgo (KRI).' },
          { id: 605, title: 'Comunicación de valor: ROI cualitativo y prevención de riesgos reputacionales.', status: 'BORRADOR', description: 'Medición de valor cualitativo y resguardo de reputación corporativa.' },
        ]
      },
      {
        id: 7,
        title: 'Módulo 7: Prevención de Lavado de Activos y Financiamiento del Terrorismo (SPLAFT)',
        description: 'Definición de delitos LA/FT y marco para Sujetos Obligados.',
        expanded: false,
        subModules: [
          { id: 701, title: 'Definición de delitos LA/FT y marco para Sujetos Obligados.', status: 'BORRADOR', description: 'Marco normativo para la prevención del lavado de activos y financiamiento del terrorismo.' },
          { id: 702, title: 'Rol del Oficial de Cumplimiento en este ámbito.', status: 'BORRADOR', description: 'Funciones específicas del Oficial de Cumplimiento SPLAFT.' },
          { id: 703, title: 'Debida diligencia, calificación de riesgo de clientes y beneficiario final.', status: 'BORRADOR', description: 'Due diligence de clientes y beneficiarios finales bajo metodología de riesgo.' },
          { id: 704, title: 'Monitoreo transaccional, señales de alerta y gestión continua del SPLAFT.', status: 'BORRADOR', description: 'Señales de alerta, alertas inusuales y operaciones sospechosas.' },
          { id: 705, title: 'Caso práctico integral.', status: 'BORRADOR', description: 'Resolución de caso práctico SPLAFT.' },
        ]
      }
    ];
  }

  return [
    {
      id: 1,
      title: 'INTRODUCCIÓN AL MERCADO',
      description: 'En esta lección cubriremos los pilares fundamentales del trading...',
      expanded: true,
      subModules: [
        { id: 1, title: '1.1 Fundamentos', status: 'EDITANDO', description: '' },
        { id: 2, title: '1.2 Psicología Inversora', status: 'BORRADOR', description: '' },
      ]
    },
    {
      id: 2,
      title: 'SIN TÍTULO',
      expanded: false,
      subModules: []
    }
  ];
};



export const AdminCourseEditorPage: React.FC<AdminCourseEditorProps> = ({ courseName = 'Especialista en Compliance', onBack }) => {
  const [modules, setModules] = useState<Module[]>(() => getInitialModules(courseName));
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [activeSubModule, setActiveSubModule] = useState<number | null>(1);
  const [courseDuration, setCourseDuration] = useState('20:15');
  const [showToast, setShowToast] = useState(false);
  const showToastMsg = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  const [previewingCourse, setPreviewingCourse] = useState<Course | null>(null);
  const [generalConfigExpanded, setGeneralConfigExpanded] = useState(true);
  const [modulesExpanded, setModulesExpanded] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isPublished, setIsPublished] = useState<boolean>(() => {
    const saved = localStorage.getItem('ipc_courses');
    if (saved) {
      const list = JSON.parse(saved);
      const found = list.find((c: any) => c.title.toLowerCase().trim() === courseName.toLowerCase().trim());
      if (found) return found.status === 'Publicado';
    }
    return false;
  });

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moduleDescRef = useRef<HTMLTextAreaElement>(null);
  const subModuleDescRef = useRef<HTMLTextAreaElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: UploadedFile[] = Array.from(files).map(f => ({
      name: f.name,
      size: f.size > 1024 * 1024
        ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(f.size / 1024).toFixed(0)} KB`
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    // Reset input so the same file can be re-uploaded if needed
    e.target.value = '';
  };

  const handleDeleteFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const [coursesList, setCoursesList] = useState<CourseListItem[]>(() => {
    const saved = localStorage.getItem('ipc_courses');
    let list = [];
    if (saved) {
      list = JSON.parse(saved);
    } else {
      list = JSON.parse(JSON.stringify(initialCourses));
    }

    const isNew = courseName.trim().toLowerCase() === 'nuevo curso';
    const hasNew = list.some((c: any) => c.title.toLowerCase().trim() === 'nuevo curso');

    if (isNew && !hasNew) {
      const newId = Date.now();
      const newCourseObj = {
        id: newId,
        title: 'Nuevo Curso',
        category: 'Legal',
        instructor: 'Instituto Peruano de Compliance',
        students: 0,
        duration: '12h 00m',
        rating: 5.0,
        status: 'Borrador',
        price: '150.00',
        modules: 1,
        lastUpdated: 'Ahora',
        icon: 'BookOpen',
        thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=60',
        descriptionTop: 'Forma profesionales con el nuevo curso.',
        descriptionBottom: 'Detalles del nuevo programa de especialización.',
        topicsJson: JSON.stringify([
          { title: "Tema 1", desc: "Descripción del primer tema del nuevo curso.", icon: "BookOpen" }
        ]),
        modulesJson: JSON.stringify([
          {
            title: "Módulo 1: Introducción",
            lessons: 1,
            description: "Descripción del Módulo 1",
            subModules: [
              { id: 1, title: "Lección 1.1", description: "Detalle de la lección 1.1" }
            ]
          }
        ])
      };
      list.push(newCourseObj);
      localStorage.setItem('ipc_courses', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
    } else if (!saved) {
      localStorage.setItem('ipc_courses', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
    }

    return list.map((c: any) => ({
      id: c.id,
      name: c.title,
      icon: c.icon || 'BookOpen',
      thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=60',
      price: c.price || '$150',
      descriptionTop: c.descriptionTop || '',
      descriptionBottom: c.descriptionBottom || '',
      topicsJson: c.topicsJson || '',
      modulesJson: c.modulesJson || '',
      isComingSoon: !!c.isComingSoon
    }));
  });
  const [activeCourseId, setActiveCourseId] = useState<number>(() => {
    const saved = localStorage.getItem('ipc_courses');
    if (saved) {
      const list = JSON.parse(saved);
      const found = list.find((c: any) => c.title.toLowerCase().trim() === courseName.toLowerCase().trim());
      if (found) return found.id;
    }
    return 1;
  });
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [editingSubModuleId, setEditingSubModuleId] = useState<number | null>(null);

  const activeCourse = coursesList.find((c: CourseListItem) => c.id === activeCourseId) || coursesList[0];

  React.useEffect(() => {
    const saved = localStorage.getItem('ipc_courses');
    if (saved) {
      const list = JSON.parse(saved);
      const found = list.find((c: any) => c.id === activeCourseId);
      if (found) {
        setIsPublished(found.status === 'Publicado');
        if (found.modulesJson) {
          try {
            setModules(JSON.parse(found.modulesJson));
          } catch (e) {
            console.error('Failed to parse dynamic modulesJson:', e);
          }
        } else {
          setModules(getInitialModules(found.title));
        }
      }
    }
  }, [activeCourseId]);

  const handleSave = (preventCollapseGeneral = false, statusOverride?: 'Publicado' | 'Borrador') => {
    const saved = localStorage.getItem('ipc_courses');
    let list = [];
    if (saved) {
      list = JSON.parse(saved);
    } else {
      list = [...initialCourses];
    }
    
    const updatedList = [...list];
    const targetStatus = statusOverride !== undefined ? statusOverride : (isPublished ? 'Publicado' : 'Borrador');
    
    coursesList.forEach((cl: any) => {
      const index = updatedList.findIndex((c: any) => c.id === cl.id);
      if (index !== -1) {
        const statusToSave = cl.id === activeCourseId ? targetStatus : (cl.status || updatedList[index].status || 'Borrador');
        updatedList[index] = {
          ...updatedList[index],
          title: cl.name,
          icon: cl.icon,
          thumbnail: cl.thumbnail || updatedList[index].thumbnail,
          price: cl.price || updatedList[index].price || '$150',
          status: statusToSave,
          isComingSoon: !!cl.isComingSoon,
          descriptionTop: cl.descriptionTop || '',
          descriptionBottom: cl.descriptionBottom || '',
          topicsJson: cl.topicsJson || '',
          modulesJson: cl.id === activeCourseId ? JSON.stringify(modules) : (cl.modulesJson || updatedList[index].modulesJson || '')
        };
      } else {
        updatedList.push({
          id: cl.id,
          title: cl.name,
          category: 'Finanzas',
          instructor: 'Instituto Peruano de Compliance',
          price: cl.price || '$150',
          rating: 5,
          students: 0,
          modules: modules.length,
          duration: '12h 00m',
          icon: cl.icon || 'BookOpen',
          thumbnail: cl.thumbnail || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=60',
          status: cl.id === activeCourseId ? targetStatus : 'Borrador',
          isComingSoon: !!cl.isComingSoon,
          descriptionTop: cl.descriptionTop || '',
          descriptionBottom: cl.descriptionBottom || '',
          topicsJson: cl.topicsJson || '',
          modulesJson: cl.id === activeCourseId ? JSON.stringify(modules) : ''
        });
      }
    });

    localStorage.setItem('ipc_courses', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('storage'));

    // Also, trigger connection/sync with the backend
    try {
      const activeC = coursesList.find(c => c.id === activeCourseId) || coursesList[0];
      const numericPrice = activeC.price ? parseFloat(activeC.price.replace(/[^0-9.]/g, '')) : 150.0;
      demoService.createCourse({
        title: activeC.name,
        description: (activeC.descriptionTop || '') + '\n\n' + (activeC.descriptionBottom || ''),
        price: isNaN(numericPrice) ? 150.0 : numericPrice,
        lessons: modules.length
      }).catch(err => {
        console.error('Backend sync error:', err);
      });
    } catch (e) {
      console.error('Error parsing price for backend sync:', e);
    }

    showToastMsg('Cambios guardados correctamente', 'success');
    if (!preventCollapseGeneral) {
      setGeneralConfigExpanded(false);
    }
  };

  const toggleModuleExpanded = (modId: number) => {
    setModules(prev => prev.map(m => m.id === modId ? { ...m, expanded: !m.expanded } : m));
    const targetMod = modules.find(m => m.id === modId);
    if (targetMod && targetMod.expanded) {
      handleSave(true);
    }
  };

  const updateModuleTitle = (newTitle: string, modId?: number) => {
    const targetId = modId !== undefined ? modId : activeModuleId;
    setModules(prev => prev.map(m => m.id === targetId ? { ...m, title: newTitle } : m));
  };

  const updateModuleDescription = (newDesc: string) => {
    setModules(prev => prev.map(m => m.id === activeModuleId ? { ...m, description: newDesc } : m));
  };

  const updateSubModuleTitle = (subId: number, newTitle: string) => {
    setModules(prev => prev.map(m => ({
      ...m,
      subModules: m.subModules.map(s => s.id === subId ? { ...s, title: newTitle } : s)
    })));
  };

  const updateSubModuleDescription = (subId: number, newDesc: string) => {
    setModules(prev => prev.map(m => ({
      ...m,
      subModules: m.subModules.map(s => s.id === subId ? { ...s, description: newDesc } : s)
    })));
  };

  const addModule = () => {
    const newModId = Date.now();
    const newSubId = Date.now() + 1;
    setModules(prev => [...prev, {
      id: newModId,
      title: 'SIN TÍTULO',
      expanded: true,
      subModules: [{ id: newSubId, title: 'Sin título', status: 'BORRADOR', description: '' }]
    }]);
    setActiveModuleId(newModId);
    setActiveSubModule(newSubId);
  };

  const addSubModule = (moduleId: number) => {
    const newSubId = Date.now();
    setModules(prev => prev.map(m => m.id === moduleId ? {
      ...m,
      expanded: true,
      subModules: [...m.subModules, { id: newSubId, title: 'Sin título', status: 'BORRADOR', description: '' }]
    } : m));
    setActiveSubModule(newSubId);
  };

  const activeModule = modules.find(m => m.id === activeModuleId) || modules[0];
  const activeModuleIndex = modules.findIndex(m => m.id === activeModuleId);
  const displayModuleNumber = activeModuleIndex !== -1 ? activeModuleIndex + 1 : 1;

  return (
    <div className="admin-editor-container" style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-body)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* ── MAIN CONTENT ── */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '40px 16px', overflowY: 'auto', width: '100%' }}>
        
        <div style={{ maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {/* Breadcrumb Category & Back Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
              MIS CURSOS <ChevronRightIcon /> <span style={{ color: 'var(--text-main)', textTransform: 'uppercase' }}>{activeCourse.name}</span>
            </div>
            <button
              onClick={onBack}
              className="btn-volver-admin"
            >
              <ArrowLeft size={12} /> Volver
            </button>
          </div>

          {/* ── RESPONSIVE TWO-COLUMN EDITOR LAYOUT ── */}
          <div className="admin-editor-grid-layout">
            
            {/* ── LEFT COLUMN: COURSES & MODULES SIDEBAR ── */}
            <div className="editor-left-column" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* MIS CURSOS PANEL */}
              <div className="glass-panel admin-courses-panel" style={{ borderRadius: '16px', border: '1px solid var(--overlay-light)', backgroundColor: 'var(--bg-card)', overflow: 'hidden' }}>
                <button
                  onClick={() => setGeneralConfigExpanded(!generalConfigExpanded)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    backgroundColor: 'var(--overlay-light)',
                    border: 'none',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    outline: 'none',
                    textAlign: 'left'
                  }}
                >
                  {generalConfigExpanded ? (
                    <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-title)' }}>
                      MIS CURSOS
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        {(() => {
                          if (activeCourse.icon === 'GraduationCap') return <GraduationCap size={16} />;
                          if (activeCourse.icon === 'TrendingUp') return <TrendingUp size={16} />;
                          if (activeCourse.icon === 'BarChart2') return <BarChart2 size={16} />;
                          if (activeCourse.icon === 'BookOpen') return <BookOpen size={16} />;
                          if (activeCourse.icon === 'Shield') return <Shield size={16} />;
                          if (activeCourse.icon === 'Award') return <Award size={16} />;
                          return <BookOpen size={16} />;
                        })()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '8px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          MIS CURSOS
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.02em', fontFamily: 'var(--font-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                          {activeCourse.name}
                        </div>
                      </div>
                    </div>
                  )}
                  {generalConfigExpanded ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRightIcon />}
                </button>
                
                {generalConfigExpanded && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--overlay-light)' }}>
                    {coursesList.map((courseItem) => {
                      const isSelected = courseItem.id === activeCourseId;
                      const IconComponent = (() => {
                        if (courseItem.icon === 'GraduationCap') return <GraduationCap size={16} />;
                        if (courseItem.icon === 'TrendingUp') return <TrendingUp size={16} />;
                        if (courseItem.icon === 'BarChart2') return <BarChart2 size={16} />;
                        if (courseItem.icon === 'BookOpen') return <BookOpen size={16} />;
                        if (courseItem.icon === 'Shield') return <Shield size={16} />;
                        if (courseItem.icon === 'Award') return <Award size={16} />;
                        return <BookOpen size={16} />;
                      })();
                      
                      return (
                        <div
                          key={courseItem.id}
                          onClick={() => setActiveCourseId(courseItem.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 14px',
                            borderRadius: '10px',
                            backgroundColor: isSelected ? 'rgba(0, 78, 187, )' : 'var(--overlay-light)',
                            border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                            color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ color: isSelected ? 'var(--primary)' : 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
                            {IconComponent}
                          </div>
                          {editingCourseId === courseItem.id ? (
                            <input
                              type="text"
                              value={courseItem.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCoursesList(prev => prev.map(c => c.id === courseItem.id ? { ...c, name: val } : c));
                              }}
                              onBlur={() => setEditingCourseId(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setEditingCourseId(null);
                                }
                              }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                flexGrow: 1,
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: 'var(--text-main)',
                                padding: 0,
                                margin: 0,
                                width: '100%'
                              }}
                            />
                          ) : (
                            <span 
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingCourseId(courseItem.id);
                              }}
                              style={{ fontSize: '12px', fontWeight: 700, flexGrow: 1 }}
                            >
                              {courseItem.name}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Dashed button to add a new course */}
                    <button
                      onClick={() => {
                        const newId = Date.now();
                        setCoursesList(prev => [...prev, { id: newId, name: 'Nuevo Curso', icon: 'BookOpen', thumbnail: '' }]);
                        setActiveCourseId(newId);
                      }}
                      className="btn-nuevo-curso-admin"
                    >
                      <Plus size={12} /> NUEVO CURSO
                    </button>
                  </div>
                )}
              </div>

              {/* MÓDULOS PANEL */}
              <div className="glass-panel admin-modules-panel" style={{ borderRadius: '16px', border: '1px solid var(--overlay-light)', backgroundColor: 'var(--bg-card)', overflow: 'hidden' }}>
                <button
                  onClick={() => {
                    if (modulesExpanded) {
                      handleSave(true);
                      setModulesExpanded(false);
                    } else {
                      setModulesExpanded(true);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    backgroundColor: 'var(--overlay-light)',
                    border: 'none',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    outline: 'none',
                    textAlign: 'left'
                  }}
                >
                  {modulesExpanded ? (
                    <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-title)' }}>
                      MÓDULOS
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FolderOpen size={14} color="var(--primary)" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '8px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          MÓDULOS
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.02em', fontFamily: 'var(--font-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                          {activeModule?.title || 'SIN TÍTULO'}
                        </div>
                      </div>
                    </div>
                  )}
                  {modulesExpanded ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRightIcon />}
                </button>
                
                {modulesExpanded && (
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid var(--overlay-light)' }}>
                    
                    {/* Modules list & folders tree */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                      {modules.map((mod) => {
                        const isModuleActive = mod.id === activeModuleId;
                        return (
                          <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            
                            {/* Folder Header */}
                            <div
                              onClick={() => {
                                setActiveModuleId(mod.id);
                                if (mod.subModules.length > 0) {
                                  setActiveSubModule(mod.subModules[0].id);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                color: isModuleActive ? 'var(--primary)' : 'var(--text-main)',
                                fontSize: '12px',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                              }}
                            >
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleModuleExpanded(mod.id);
                                }}
                                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                              >
                                {mod.expanded ? (
                                  <FolderOpen size={14} color={isModuleActive ? 'var(--primary)' : 'var(--text-muted)'} />
                                ) : (
                                  <Folder size={14} color={isModuleActive ? 'var(--primary)' : 'var(--text-muted)'} />
                                )}
                              </span>
                              {editingModuleId === mod.id ? (
                                <input
                                  type="text"
                                  value={mod.title}
                                  onChange={(e) => updateModuleTitle(e.target.value, mod.id)}
                                  onBlur={() => setEditingModuleId(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      setEditingModuleId(null);
                                    }
                                  }}
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'var(--text-main)',
                                    padding: 0,
                                    margin: 0,
                                    textTransform: 'uppercase',
                                    width: '100%'
                                  }}
                                />
                              ) : (
                                <span
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setEditingModuleId(mod.id);
                                  }}
                                >
                                  {mod.title}
                                </span>
                              )}
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleModuleExpanded(mod.id);
                                }}
                                style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '4px' }}
                              >
                                {mod.expanded ? (
                                  <ChevronDown size={12} color="var(--text-muted)" />
                                ) : (
                                  <ChevronRightIcon />
                                )}
                              </span>
                            </div>

                            {/* Folder Lessons Items */}
                            {mod.expanded && (
                              <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '1px solid var(--border-color)', marginLeft: '6px', marginTop: '4px' }}>
                                {mod.subModules.map((sub) => {
                                  const isLessonActive = sub.id === activeSubModule;
                                  return (
                                    <div
                                      key={sub.id}
                                      onClick={() => {
                                        setActiveModuleId(mod.id);
                                        setActiveSubModule(sub.id);
                                      }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 10px',
                                        borderRadius: '6px',
                                        backgroundColor: isLessonActive ? 'rgba(0, 78, 187, )' : 'transparent',
                                        color: isLessonActive ? 'var(--primary)' : 'var(--text-muted)',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s'
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Play size={10} fill={isLessonActive ? 'var(--primary)' : 'none'} color={isLessonActive ? 'var(--primary)' : 'var(--text-dim)'} />
                                        {editingSubModuleId === sub.id ? (
                                          <input
                                            type="text"
                                            value={sub.title}
                                            onChange={(e) => updateSubModuleTitle(sub.id, e.target.value)}
                                            onBlur={() => setEditingSubModuleId(null)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                setEditingSubModuleId(null);
                                              }
                                            }}
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                              fontSize: '11px',
                                              fontWeight: 600,
                                              background: 'transparent',
                                              border: 'none',
                                              outline: 'none',
                                              color: 'var(--text-main)',
                                              padding: 0,
                                              margin: 0,
                                              width: '100%'
                                            }}
                                          />
                                        ) : (
                                          <span
                                            onDoubleClick={(e) => {
                                              e.stopPropagation();
                                              setEditingSubModuleId(sub.id);
                                            }}
                                          >
                                            {sub.title}
                                          </span>
                                        )}
                                      </div>
                                      <span style={{
                                        fontSize: '8px',
                                        fontWeight: 800,
                                        backgroundColor: sub.status === 'EDITANDO' ? 'rgba(0, 78, 187, )' : 'rgba(255,255,255,0.05)',
                                        color: sub.status === 'EDITANDO' ? 'var(--primary)' : 'var(--text-dim)',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        letterSpacing: '0.05em'
                                      }}>
                                        {sub.status}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Dashed Module Add Button */}
                    <button
                      onClick={addModule}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'transparent',
                        border: '1px dashed var(--overlay-medium)',
                        borderRadius: '10px',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        letterSpacing: '0.05em'
                      }}
                    >
                      <Plus size={12} /> NUEVO MÓDULO
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* ── RIGHT COLUMN: ACTIVE MODULE EDITOR ── */}
            <div className="editor-right-column" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              
              {/* ── CONFIGURACIÓN GENERAL DEL CURSO ── */}
              <div className="glass-panel admin-general-config-panel" style={{
                borderRadius: '16px',
                border: '1px solid var(--overlay-light)',
                backgroundColor: 'var(--bg-card)',
                marginBottom: '40px',
                overflow: 'hidden'
              }}>
                {/* Collapsible Header */}
                <button
                  className="admin-editor-collapsible-header"
                  onClick={() => {
                    if (generalConfigExpanded) {
                      handleSave();
                    } else {
                      setGeneralConfigExpanded(true);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: generalConfigExpanded ? '20px 24px' : '12px 24px',
                    backgroundColor: 'var(--overlay-light)',
                    border: 'none',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    outline: 'none',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  {generalConfigExpanded ? (
                    <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--primary)', textTransform: 'uppercase', fontFamily: 'var(--font-title)' }}>
                      MIS CURSOS / CONFIGURACIÓN GENERAL DEL CURSO
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {activeCourse.thumbnail ? (
                        <img 
                          src={activeCourse.thumbnail} 
                          alt="Curso" 
                          style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)', flexShrink: 0 }} 
                        />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BookOpen size={16} color="var(--primary)" />
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>
                          CONFIGURACIÓN GENERAL
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.02em', fontFamily: 'var(--font-title)' }}>
                          {activeCourse.name}
                        </div>
                      </div>
                    </div>
                  )}
                  {generalConfigExpanded ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRightIcon />}
                </button>
                
                {generalConfigExpanded && (
                  <div className="admin-editor-collapsible-body" style={{ padding: '24px', borderTop: '1px solid var(--overlay-light)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Top Row: Basic Info & Thumbnail */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'start' }}>
                      {/* Left Column: Name, Icon, Price */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Course Name */}
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                            Nombre del Curso
                          </label>
                          <input
                            type="text"
                            value={activeCourse.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoursesList(prev => prev.map(c => c.id === activeCourseId ? { ...c, name: val } : c));
                            }}
                            style={{ width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 16px', color: 'var(--text-main)', fontSize: '13px', outline: 'none', fontWeight: 600 }}
                          />
                        </div>
 
                        {/* Course Icon Selector */}
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                            Icono del Curso
                          </label>
                          <div className="admin-editor-icon-grid" style={{ display: 'flex', gap: '10px' }}>
                            {[
                              { name: 'GraduationCap', component: <GraduationCap size={16} /> },
                              { name: 'TrendingUp', component: <TrendingUp size={16} /> },
                              { name: 'BarChart2', component: <BarChart2 size={16} /> },
                              { name: 'BookOpen', component: <BookOpen size={16} /> },
                              { name: 'Shield', component: <Shield size={16} /> },
                              { name: 'Award', component: <Award size={16} /> },
                            ].map(iconOpt => {
                              const isSelected = activeCourse.icon === iconOpt.name;
                              return (
                                <button
                                  key={iconOpt.name}
                                  onClick={() => {
                                    setCoursesList(prev => prev.map(c => c.id === activeCourseId ? { ...c, icon: iconOpt.name } : c));
                                  }}
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                                    backgroundColor: isSelected ? 'rgba(0, 78, 187, 0.12)' : 'var(--overlay-light)',
                                    color: isSelected ? 'var(--primary)' : 'var(--text-muted)'
                                  }}
                                  title={iconOpt.name}
                                >
                                  {iconOpt.component}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Course Price */}
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                            <Banknote size={14} color="var(--primary)" /> Precio del Curso
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. $150 o S/ 500"
                            value={activeCourse.price || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoursesList(prev => prev.map(c => c.id === activeCourseId ? { ...c, price: val } : c));
                            }}
                            style={{ width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 16px', color: 'var(--text-main)', fontSize: '13px', outline: 'none', fontWeight: 600 }}
                          />
                        </div>

                        {/* Coming Soon Switch */}
                        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--overlay-light)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Modo Próximamente</span>
                            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Oculta contenido y habilita botón de Pre-inscripción (WhatsApp)</span>
                          </div>
                          <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={!!activeCourse.isComingSoon}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setCoursesList(prev => prev.map(c => c.id === activeCourseId ? { ...c, isComingSoon: val } : c));
                              }}
                              style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                              position: 'absolute',
                              inset: 0,
                              backgroundColor: activeCourse.isComingSoon ? 'var(--primary)' : 'var(--overlay-medium)',
                              transition: '0.3s',
                              borderRadius: '24px'
                            }}>
                              <span style={{
                                position: 'absolute',
                                content: '""',
                                height: '16px',
                                width: '16px',
                                left: activeCourse.isComingSoon ? '24px' : '4px',
                                bottom: '4px',
                                backgroundColor: '#fff',
                                transition: '0.3s',
                                borderRadius: '50%'
                              }} />
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Right Column: Thumbnail */}
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                          Miniatura del Curso
                        </label>
                        <div style={{
                          width: '100%',
                          height: '228px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          position: 'relative',
                          backgroundColor: '#0a0a0c',
                          border: '1px dashed var(--overlay-medium)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}>
                          {activeCourse.thumbnail ? (
                            <>
                              <img src={activeCourse.thumbnail} alt="Curso" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <UploadCloud size={24} color="#fff" />
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reemplazar Miniatura</span>
                              </div>
                            </>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                              <Image size={24} />
                              <span style={{ fontSize: '11px', fontWeight: 700 }}>Subir Imagen</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Descriptions side-by-side */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                      {/* Course Description Top */}
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                          Descripción Corta (Parte Superior)
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Descripción resumida para la parte superior de la página del curso..."
                          value={activeCourse.descriptionTop || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCoursesList(prev => prev.map(c => c.id === activeCourseId ? { ...c, descriptionTop: val } : c));
                          }}
                          style={{ width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 16px', color: 'var(--text-main)', fontSize: '13px', outline: 'none', fontWeight: 500, resize: 'vertical', fontFamily: 'var(--font-body)', height: '120px' }}
                        />
                      </div>

                      {/* Course Description Bottom */}
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                          Descripción Detallada (Parte Inferior)
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Descripción extendida para la parte inferior de la página del curso..."
                          value={activeCourse.descriptionBottom || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCoursesList(prev => prev.map(c => c.id === activeCourseId ? { ...c, descriptionBottom: val } : c));
                          }}
                          style={{ width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 16px', color: 'var(--text-main)', fontSize: '13px', outline: 'none', fontWeight: 500, resize: 'vertical', fontFamily: 'var(--font-body)', height: '120px' }}
                        />
                      </div>
                    </div>

                    {/* Topics Row: Dynamic Editable Topics with Icon Selector and Add Card option */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                      <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase' }}>
                        ¿QUÉ APRENDERÁS EN ESTA CERTIFICACIÓN? (TEMAS / CARTAS DE CONTENIDO)
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        {(() => {
                          let currentTopics = [];
                          try {
                            currentTopics = activeCourse.topicsJson ? JSON.parse(activeCourse.topicsJson) : [];
                          } catch (e) {
                            currentTopics = [];
                          }
                          if (currentTopics.length === 0) {
                            currentTopics = [
                              { title: "Tema 1", desc: "Descripción del tema 1", icon: "ShieldAlert" }
                            ];
                          }
                          
                          const availableIcons = ['ShieldAlert', 'BookOpen', 'Activity', 'FileText', 'MonitorPlay', 'CheckCircle2', 'Award', 'GraduationCap', 'TrendingUp', 'BarChart2', 'Clock'];

                          return (
                            <>
                              {currentTopics.map((topic: any, tIdx: number) => (
                                <div key={tIdx} style={{ backgroundColor: 'var(--overlay-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary)' }}>CARTA {tIdx + 1}</span>
                                    {currentTopics.length > 1 && (
                                      <button
                                        onClick={() => {
                                          const updatedTopics = currentTopics.filter((_: any, idx: number) => idx !== tIdx);
                                          setCoursesList(prev => prev.map(c => c.id === activeCourseId ? { ...c, topicsJson: JSON.stringify(updatedTopics) } : c));
                                        }}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                                      >
                                        <Trash2 size={10} /> Eliminar
                                      </button>
                                    )}
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Título</label>
                                    <input
                                      type="text"
                                      value={topic.title || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const updatedTopics = [...currentTopics];
                                        updatedTopics[tIdx] = { ...updatedTopics[tIdx], title: val };
                                        setCoursesList(prev => prev.map(c => c.id === activeCourseId ? { ...c, topicsJson: JSON.stringify(updatedTopics) } : c));
                                      }}
                                      style={{ width: '100%', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'var(--text-main)', fontSize: '12px', outline: 'none', fontWeight: 600 }}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Descripción</label>
                                    <textarea
                                      rows={2}
                                      value={topic.desc || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const updatedTopics = [...currentTopics];
                                        updatedTopics[tIdx] = { ...updatedTopics[tIdx], desc: val };
                                        setCoursesList(prev => prev.map(c => c.id === activeCourseId ? { ...c, topicsJson: JSON.stringify(updatedTopics) } : c));
                                      }}
                                      style={{ width: '100%', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'var(--text-main)', fontSize: '12px', outline: 'none', fontWeight: 500, resize: 'none', fontFamily: 'var(--font-body)' }}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Icono</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                      {availableIcons.map((icoName) => {
                                        const isSel = (topic.icon || 'BookOpen') === icoName;
                                        const RenderIcon = (() => {
                                          switch (icoName) {
                                            case 'ShieldAlert': return <ShieldAlert size={14} />;
                                            case 'BookOpen': return <BookOpen size={14} />;
                                            case 'Activity': return <Activity size={14} />;
                                            case 'FileText': return <FileText size={14} />;
                                            case 'MonitorPlay': return <MonitorPlay size={14} />;
                                            case 'CheckCircle2': return <CheckCircle2 size={14} />;
                                            case 'Award': return <Award size={14} />;
                                            case 'GraduationCap': return <GraduationCap size={14} />;
                                            case 'TrendingUp': return <TrendingUp size={14} />;
                                            case 'BarChart2': return <BarChart2 size={14} />;
                                            case 'Clock': return <Clock size={14} />;
                                            default: return <BookOpen size={14} />;
                                          }
                                        })();
                                        return (
                                          <button
                                            key={icoName}
                                            onClick={() => {
                                              const updatedTopics = [...currentTopics];
                                              updatedTopics[tIdx] = { ...updatedTopics[tIdx], icon: icoName };
                                              setCoursesList(prev => prev.map(c => c.id === activeCourseId ? { ...c, topicsJson: JSON.stringify(updatedTopics) } : c));
                                            }}
                                            style={{
                                              width: '32px',
                                              height: '32px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              border: isSel ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                                              backgroundColor: isSel ? 'rgba(0, 78, 187, 0.15)' : 'var(--bg-main)',
                                              color: isSel ? 'var(--primary)' : 'var(--text-muted)',
                                              borderRadius: '6px',
                                              cursor: 'pointer',
                                              transition: 'all 0.15s'
                                            }}
                                            title={icoName}
                                          >
                                            {RenderIcon}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Dashed placeholder card to Add New Card */}
                              <div
                                onClick={() => {
                                  const updatedTopics = [...currentTopics, { title: `Tema ${currentTopics.length + 1}`, desc: "", icon: "BookOpen" }];
                                  setCoursesList(prev => prev.map(c => c.id === activeCourseId ? { ...c, topicsJson: JSON.stringify(updatedTopics) } : c));
                                }}
                                style={{
                                  backgroundColor: 'transparent',
                                  padding: '24px',
                                  borderRadius: '12px',
                                  border: '2px dashed var(--overlay-medium)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '10px',
                                  cursor: 'pointer',
                                  color: 'var(--text-muted)',
                                  minHeight: '180px'
                                }}
                              >
                                <Plus size={24} />
                                <span style={{ fontSize: '12px', fontWeight: 700 }}>AGREGAR NUEVA CARTA</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                  </div>
                )}
              </div>
              
              {/* Module Edit Header Section */}
              <div className="admin-edit-zone-wrapper" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '11px', color: 'var(--primary)', letterSpacing: '0.2em', fontWeight: 800, marginBottom: '12px', textTransform: 'uppercase', fontFamily: 'var(--font-title)' }}>
                  EDITANDO MÓDULO {displayModuleNumber}
                </div>
                <h1 style={{ fontSize: 'clamp(20px, 5.5vw, 28px)', fontWeight: 800, margin: '0 0 24px 0', letterSpacing: '-0.01em', color: 'var(--text-main)', fontFamily: 'var(--font-title)', textTransform: 'uppercase', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2' }}>
                  {activeModule?.title || 'SIN TÍTULO'}
                </h1>
                
                <div className="editor-action-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setPreviewingCourse({
                      id: activeCourseId,
                      title: activeCourse.name,
                      category: activeCourseId === 1 || activeCourseId === 2 ? 'Arbitraje' : 'Finanzas',
                      instructor: 'Instituto Peruano de Compliance',
                      students: activeCourseId === 1 ? 1284 : activeCourseId === 2 ? 842 : 1284,
                      duration: activeCourseId === 1 ? '15h 30m' : activeCourseId === 2 ? '12h 00m' : '15h 30m',
                      rating: activeCourseId === 1 ? 4.9 : activeCourseId === 2 ? 4.8 : 4.9,
                      status: 'Publicado',
                      price: activeCourseId === 1 ? '$150' : activeCourseId === 2 ? '$200' : '$150',
                      modules: modules.length,
                      lastUpdated: 'Ahora'
                    })}
                    style={{ background: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', padding: '12px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    Vista Previa
                  </button>
                  <button onClick={() => handleSave()} className="btn-primary" style={{ padding: '12px 32px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    Guardar Cambios
                  </button>
                </div>
              </div>

              {/* Video Player Card */}
              <div className="admin-video-card" style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', position: 'relative', backgroundColor: '#0c0b0b', border: '1px solid var(--overlay-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=60")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3, filter: 'grayscale(50%)' }} />
                
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  {/* Play Button (Mockup style orange box) */}
                  <button style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0, 78, 187, )' }}>
                    <Play size={24} fill="#000" color="#000" style={{ marginLeft: '4px' }} />
                  </button>
                  
                  {/* File Info */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                      video_fundamentos_01.mp4
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      452MB • 1080p • <span style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>Reemplazar archivo</span>
                    </div>
                  </div>
                </div>

                {/* Time badge */}
                <div style={{ position: 'absolute', bottom: '20px', right: '20px', backgroundColor: '#000', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                  24:15
                </div>
              </div>

              {/* Lesson Metadata */}
              <div className="admin-metadata-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>TÍTULO DE LA LECCIÓN</label>
                  <input
                    type="text"
                    value={activeModule?.title || ''}
                    onChange={e => updateModuleTitle(e.target.value)}
                    style={{ width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 16px', color: 'var(--text-main)', fontSize: '13px', outline: 'none', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>DURACIÓN DE TODO EL CURSO</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={courseDuration}
                      onChange={e => setCourseDuration(e.target.value)}
                      style={{ width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 16px 14px 16px', color: 'var(--text-main)', fontSize: '13px', outline: 'none', fontWeight: 600 }}
                    />
                    <Clock size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>DESCRIPCIÓN DE LA LECCIÓN</label>
                <TextFormatterToolbar
                  textareaRef={moduleDescRef}
                  text={activeModule?.description || ''}
                  onChange={updateModuleDescription}
                />
                <textarea
                  ref={moduleDescRef}
                  value={activeModule?.description || ''}
                  onChange={e => updateModuleDescription(e.target.value)}
                  rows={4}
                  placeholder="Describa el contenido o los objetivos de este módulo..."
                  style={{ width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderTop: 'none', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', borderTopLeftRadius: '0', borderTopRightRadius: '0', padding: '16px', color: 'var(--text-main)', fontSize: '13px', outline: 'none', resize: 'vertical', lineHeight: '1.6', fontFamily: 'var(--font-body)' }}
                />
              </div>

              {/* Sub-modules Accordion */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {activeModule?.subModules.map((sub) => (
                  <div key={sub.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
                    <button
                      onClick={() => setActiveSubModule(activeSubModule === sub.id ? null : sub.id)}
                      style={{ width: '100%', padding: '20px 24px', backgroundColor: 'var(--overlay-light)', border: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', outline: 'none' }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-title)' }}>
                        {sub.title}
                      </div>
                      <ChevronDown size={16} color="var(--text-muted)" style={{ transform: activeSubModule === sub.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>

                    {activeSubModule === sub.id && (
                      <div style={{ padding: '24px', borderTop: '1px solid var(--overlay-light)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>TÍTULO DEL SUB-MÓDULO</label>
                          <input
                            type="text"
                            value={sub.title}
                            onChange={(e) => updateSubModuleTitle(sub.id, e.target.value)}
                            style={{ width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 16px', color: 'var(--text-main)', fontSize: '13px', outline: 'none', fontWeight: 600 }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>DESCRIPCIÓN DEL SUB-MÓDULO</label>
                          <TextFormatterToolbar
                            textareaRef={subModuleDescRef}
                            text={sub.description || ''}
                            onChange={(val) => updateSubModuleDescription(sub.id, val)}
                          />
                          <textarea
                            ref={subModuleDescRef}
                            value={sub.description || ''}
                            onChange={(e) => updateSubModuleDescription(sub.id, e.target.value)}
                            rows={3}
                            placeholder="Describa el contenido o los objetivos de este sub-módulo..."
                            style={{ width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderTop: 'none', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', borderTopLeftRadius: '0', borderTopRightRadius: '0', padding: '14px 16px', color: 'var(--text-main)', fontSize: '13px', outline: 'none', fontWeight: 500, resize: 'vertical', fontFamily: 'var(--font-body)' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>VIDEO DEL SUB-MÓDULO</label>
                          
                          <div style={{
                            width: '100%',
                            height: '112px',
                            backgroundColor: '#0a0a0c',
                            borderRadius: '12px',
                            border: '1px dashed var(--overlay-medium)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--overlay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UploadCloud size={18} color="var(--text-muted)" />
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                SUBIR VIDEO DE SUB-MÓDULO
                              </div>
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Sub-module button */}
              <button onClick={() => activeModule && addSubModule(activeModule.id)} style={{ width: '100%', padding: '18px', marginBottom: '32px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700, letterSpacing: '0.05em' }}>
                <Plus size={14} /> AÑADIR NUEVO SUB-MÓDULO
              </button>

              {/* Recursos del Curso Card */}
              <div className="glass-panel" style={{
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--overlay-light)',
                backgroundColor: 'var(--bg-card)',
                marginBottom: '32px'
              }}>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.mp4,.mov"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', letterSpacing: '0.15em', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-title)' }}>
                    RECURSOS DEL CURSO
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: 'transparent', border: '1px solid var(--primary)', borderRadius: '8px', color: 'var(--primary)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0,78,187,0.12)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                  >
                    <UploadCloud size={14} /> SUBIR
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {uploadedFiles.length === 0 ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '32px 16px', border: '1px dashed var(--overlay-medium)', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-muted)', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--overlay-medium)'; }}
                    >
                      <UploadCloud size={28} color="var(--text-dim)" />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>Arrastra o haz clic para subir</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>PDF, DOC, PPT, imágenes, videos...</div>
                      </div>
                    </div>
                  ) : (
                    uploadedFiles.map((file, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'var(--overlay-light)', borderRadius: '10px', border: '1px solid var(--overlay-light)', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--overlay-light)'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <File size={16} color="#ef4444" />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{file.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{file.size}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteFile(i)}
                          title="Eliminar recurso"
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                          onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = 'rgba(239,68,68,0.1)'; b.style.color = '#ef4444'; }}
                          onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = 'transparent'; b.style.color = 'var(--text-muted)'; }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Final Action Buttons — dynamic based on publish state */}
              <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', marginBottom: '64px' }}>
                {isPublished ? (
                  // ── PUBLISHED STATE: Save + Archive (side by side)
                  <>
                    <button
                      className="btn-primary"
                      onClick={() => handleSave()}
                      style={{ flex: 1, padding: '16px', borderRadius: '10px', fontSize: '14px', fontWeight: 800, justifyContent: 'center', letterSpacing: '0.05em' }}
                    >
                      GUARDAR CAMBIOS
                    </button>
                    <button
                      onClick={() => {
                        setIsPublished(false);
                        handleSave(true, 'Borrador');
                        showToastMsg('Curso archivado. Volvió a estado borrador.', 'warning');
                      }}
                      style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--overlay-light)',
                        color: 'var(--text-muted)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#f59e0b'; b.style.color = '#f59e0b'; b.style.backgroundColor = 'rgba(245,158,11,0.08)'; }}
                      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--border-color)'; b.style.color = 'var(--text-muted)'; b.style.backgroundColor = 'var(--overlay-light)'; }}
                    >
                      ARCHIVAR CURSO
                    </button>
                  </>
                ) : (
                  // ── DRAFT STATE: Publish + Delete (side by side)
                  <>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        setIsPublished(true);
                        handleSave(true, 'Publicado');
                        showToastMsg('¡Curso publicado exitosamente!', 'success');
                      }}
                      style={{ flex: 1, padding: '16px', borderRadius: '10px', fontSize: '14px', fontWeight: 800, justifyContent: 'center', letterSpacing: '0.05em' }}
                    >
                      PUBLICAR CURSO
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Estás seguro de que deseas eliminar el curso "${activeCourse.name}"? Esta acción no se puede deshacer.`)) {
                          const saved = localStorage.getItem('ipc_courses');
                          if (saved) {
                            const list = JSON.parse(saved);
                            const updated = list.filter((c: any) => c.id !== activeCourseId);
                            localStorage.setItem('ipc_courses', JSON.stringify(updated));
                          }
                          showToastMsg('Curso eliminado.', 'error');
                          setTimeout(() => onBack(), 1500);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        border: '1px solid rgba(239,68,68,0.3)',
                        backgroundColor: 'rgba(239,68,68,0.06)',
                        color: '#ef4444',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = 'rgba(239,68,68,0.14)'; b.style.borderColor = 'rgba(239,68,68,0.6)'; }}
                      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = 'rgba(239,68,68,0.06)'; b.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                    >
                      BORRAR CURSO
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>

          </div>
        </div>

      </main>

      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          backgroundColor: toastType === 'success' ? '#22c55e' : toastType === 'warning' ? '#f59e0b' : '#ef4444',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: toastType === 'success'
            ? '0 8px 24px rgba(34,197,94,0.25)'
            : toastType === 'warning'
            ? '0 8px 24px rgba(245,158,11,0.25)'
            : '0 8px 24px rgba(239,68,68,0.25)',
          zIndex: 100,
          animation: 'slideInRight 0.3s ease'
        }}>
          <CheckCircle2 size={20} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}

      {previewingCourse && (
        <CoursePreviewModal
          course={previewingCourse}
          onClose={() => setPreviewingCourse(null)}
        />
      )}
    </div>
  );
};

// Chevron helper
function ChevronRightIcon() {
  return <ChevronUp size={16} color="var(--text-muted)" style={{ transform: 'rotate(90deg)' }} />;
}
