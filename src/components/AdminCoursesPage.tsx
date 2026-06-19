import React, { useState, useEffect } from 'react';
import {
  Plus, Search, ChevronDown, BookOpen,
  Eye, Edit2, Trash2, Users, Star, X, Upload, ChevronLeft, ChevronRight, LayoutGrid, List, Clock, Play,
  GraduationCap, TrendingUp, BarChart2, Shield, Award, Banknote, ArrowLeft
} from 'lucide-react';

import { initialCourses } from '../types/courses';
import type { Course } from '../types/courses';
import { demoService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CustomSelect } from './CustomSelect';
const statusColors: Record<string, { bg: string; color: string; dot: string }> = {
  'Publicado': { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', dot: '#22c55e' },
  'Borrador':  { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', dot: '#f59e0b' },
  'Archivado': { bg: 'rgba(239,68,68,0.1)',  color: '#ef4444', dot: '#ef4444' },
};

interface CoursePreviewModalProps {
  course: Course;
  onClose: () => void;
}

const getMockSyllabus = (title: string) => {
  const map: Record<string, { title: string; lessons: string[] }[]> = {
    'Especialista en Compliance': [
      { title: 'Módulo 1: Fundamentos del Compliance y Gobierno Corporativo', lessons: ['1.1 Evolución, concepto y función del compliance', '1.2 Ética empresarial y control interno', '1.3 Gobierno corporativo y buenas prácticas'] },
      { title: 'Módulo 2: Responsabilidad Penal de la Persona Jurídica', lessons: ['2.1 Régimen peruano de responsabilidad autónoma', '2.2 Concepto y finalidad del modelo de prevención', '2.3 Factores de exención y atenuación'] },
      { title: 'Módulo 3: Gestión de Riesgos de Compliance', lessons: ['3.1 Estructura e implementación de ISO 31000', '3.2 Procesos de identificación y análisis de riesgos', '3.3 Elaboración de la matriz de riesgos'] }
    ],
    'Certificación Oficial en OCPD: Protección de Datos Personales': [
      { title: 'Módulo 1: Fundamentos de la Protección de Datos', lessons: ['1.1 Introducción a la Ley N° 29733', '1.2 Principios rectores del derecho a la privacidad', '1.3 Banco de datos personales y su registro'] },
      { title: 'Módulo 2: Derechos ARCO y Medidas de Seguridad', lessons: ['2.1 Acceso, Rectificación, Cancelación y Oposición', '2.2 Medidas de seguridad directivas y organizativas', '2.3 Seguridad técnica y flujos de transferencia transfronteriza'] }
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

interface AdminCoursesPageProps {
  onEditCourse?: (courseName: string) => void;
}

export const AdminCoursesPage: React.FC<AdminCoursesPageProps> = ({ onEditCourse }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterCat, setFilterCat] = useState('Todas');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('ipc_courses');
    const rawCourses: Course[] = saved ? JSON.parse(saved) : initialCourses;
    try {
      const stored = JSON.parse(localStorage.getItem('ipc_admin_notifications') || '[]');
      const approvedNotifs = stored.filter((n: any) => n.type === 'payment_voucher' && n.status === 'approved');
      return rawCourses.map(course => {
        const count = approvedNotifs.filter((n: any) => {
          const courseTitle = n.courseTitle || '';
          return courseTitle.toLowerCase().includes(course.title.toLowerCase()) || 
                 course.title.toLowerCase().includes(courseTitle.toLowerCase());
        }).length;
        return { ...course, students: count };
      });
    } catch (e) {
      return rawCourses;
    }
  });

  useEffect(() => {
    localStorage.setItem('ipc_courses', JSON.stringify(courses));
  }, [courses]);

  const [previewingCourse, setPreviewingCourse] = useState<Course | null>(null);

  const { isDemoMode } = useAuth();

  // Form state
  const [form, setForm] = useState({ title: '', category: 'Finanzas', instructor: 'Instituto Peruano de Compliance', price: '', status: 'Borrador' as Course['status'], modules: '', duration: '', description: '' });
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);
  
  const [showTrash, setShowTrash] = useState(false);
  const [trash, setTrash] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('ipc_courses_trash');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.filter((c: any) => {
        const deletedAt = new Date(c.deletedAt);
        const diffTime = Date.now() - deletedAt.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays < 7;
      });
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ipc_courses_trash', JSON.stringify(trash));
  }, [trash]);

  const getDaysRemaining = (deletedAtStr: string) => {
    const deletedAt = new Date(deletedAtStr);
    const diffTime = Date.now() - deletedAt.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remaining = 7 - diffDays;
    return remaining > 0 ? remaining : 0;
  };

  const handleRestore = (id: number) => {
    const courseToRestore = trash.find(c => c.id === id);
    if (courseToRestore) {
      const { deletedAt, ...rest } = courseToRestore;
      setCourses(prev => [...prev, rest]);
      setTrash(prev => prev.filter(c => c.id !== id));
    }
  };

  const handlePermanentDelete = (id: number) => {
    setTrash(prev => prev.filter(c => c.id !== id));
  };

  const categories = ['Todas', 'Finanzas', 'Arbitraje', 'Legal', 'Seguridad'];
  const statuses = ['Todos', 'Publicado', 'Borrador', 'Archivado'];

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'Todos' || c.status === filterStatus;
    const matchCat = filterCat === 'Todas' || c.category === filterCat;
    return matchSearch && matchStatus && matchCat;
  });

  const openCreate = () => {
    if (onEditCourse) {
      onEditCourse('Nuevo Curso');
      return;
    }
    setEditCourse(null);
    setForm({ title: '', category: 'Finanzas', instructor: 'Instituto Peruano de Compliance', price: '', status: 'Borrador', modules: '', duration: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (c: Course) => {
    if (onEditCourse) {
      onEditCourse(c.title);
      return;
    }
    setEditCourse(c);
    setForm({ title: c.title, category: c.category, instructor: c.instructor, price: c.price, status: c.status, modules: String(c.modules), duration: c.duration, description: '' });
    setShowModal(true);
    setOpenMenu(null);
  };

  const handleDelete = (id: number) => {
    const courseToDelete = courses.find(c => c.id === id);
    if (courseToDelete) {
      const trashedItem = {
        ...courseToDelete,
        deletedAt: new Date().toISOString()
      };
      setTrash(prev => [...prev, trashedItem]);
    }
    setCourses(prev => prev.filter(c => c.id !== id));
    setDeletingCourseId(null);
    setOpenMenu(null);
  };

  const handleToggleStatus = (id: number) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Publicado' ? 'Borrador' : 'Publicado' } : c));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;

    if (isDemoMode && !editCourse) {
      try {
        await demoService.createCourse({
          title: form.title,
          description: form.description || "Curso creado dinámicamente en demo",
          price: parseFloat(form.price.toString().replace('$', '')) || 0,
          lessons: Number(form.modules) || 5
        });
      } catch (err) {
        console.error("Error al crear el curso en demo:", err);
      }
    }

    if (editCourse) {
      setCourses(prev => prev.map(c => c.id === editCourse.id ? { ...c, ...form, modules: Number(form.modules), lastUpdated: 'Ahora' } : c));
    } else {
      setCourses(prev => [...prev, {
        id: Date.now(), title: form.title, category: form.category, instructor: form.instructor,
        students: 0, duration: form.duration || '0h 00m', rating: 0, status: form.status,
        price: form.price, modules: Number(form.modules) || 0, lastUpdated: 'Ahora'
      }]);
    }
    setShowModal(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-title)', margin: '0 0 8px 0', textTransform: 'uppercase', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Gestión de Catálogo
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
          Administra y publica los cursos de la plataforma institucional.
        </p>
      </div>

      {/* Stats Row */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: 'Cursos Publicados', value: courses.filter(c => c.status === 'Publicado').length, color: '#22c55e' },
          { label: 'En Borrador', value: courses.filter(c => c.status === 'Borrador').length, color: '#f59e0b' },
          { label: 'Total Estudiantes', value: courses.reduce((s, c) => s + c.students, 0).toLocaleString(), color: 'var(--primary)' },
          { label: 'Calificación Prom.', value: (courses.filter(c=>c.rating>0).reduce((s,c)=>s+c.rating,0)/courses.filter(c=>c.rating>0).length||0).toFixed(1)+'★', color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--overlay-light)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        {/* Category filter */}
        <div style={{ position: 'relative', zIndex: 30 }}>
          <CustomSelect
            value={filterCat}
            onChange={setFilterCat}
            style={{ width: '200px' }}
            options={categories.map(c => ({
              value: c,
              label: c === 'Todas' ? 'Todas las Categorías' : c
            }))}
          />
        </div>

        {/* Status filter */}
        <div style={{ position: 'relative', zIndex: 20 }}>
          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: '200px' }}
            options={statuses.map(s => ({
              value: s,
              label: s === 'Todos' ? 'Cualquier Estado' : s
            }))}
          />
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flexGrow: 1, minWidth: 260 }}>
          <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', transition: 'color 0.2s' }} />
          <input
            type="text"
            placeholder="Buscar por título o instructor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 40px 10px 40px', color: 'var(--text-main)', fontSize: '13px', outline: 'none',
              transition: 'all 0.2s ease', boxSizing: 'border-box'
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.backgroundColor = 'var(--overlay-light)';
              e.target.style.boxShadow = '0 0 0 2px rgba(0, 78, 187, )';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--overlay-light)';
              e.target.style.backgroundColor = 'var(--overlay-light)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <div style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            backgroundColor: 'var(--overlay-light)', color: 'var(--text-muted)',
            padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, pointerEvents: 'none', letterSpacing: '1px'
          }}>
            ⌘F
          </div>
        </div>

        <div style={{ display: 'flex', backgroundColor: 'var(--overlay-light)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2px', gap: '2px' }}>
          <button
            onClick={() => setViewMode('list')}
            style={{
              background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 10px',
              color: viewMode === 'list' ? '#ffffff' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Vista de Lista"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 10px',
              color: viewMode === 'grid' ? '#ffffff' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Vista de Cuadrícula"
          >
            <LayoutGrid size={16} />
          </button>
        </div>

        {/* Basurero Toggle Button */}
        <button 
          onClick={() => setShowTrash(!showTrash)} 
          style={{ 
            padding: '10px 16px', 
            borderRadius: '8px', 
            fontSize: '12px', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            whiteSpace: 'nowrap',
            backgroundColor: showTrash ? '#16a34a' : (trash.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--overlay-light)'), 
            border: showTrash ? 'none' : (trash.length > 0 ? '1px solid #ef4444' : '1px solid var(--border-color)'),
            color: showTrash ? '#ffffff' : (trash.length > 0 ? '#ef4444' : 'var(--text-main)'),
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {showTrash ? (
            <><ArrowLeft size={16} /> Ver Cursos Activos</>
          ) : (
            <><Trash2 size={16} /> Basurero ({trash.length})</>
          )}
        </button>

        {/* Create button */}
        <button onClick={openCreate} className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <Plus size={16} /> Nuevo Curso
        </button>
      </div>

      {/* View Content */}
      {showTrash ? (
        <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--overlay-light)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={18} color="#ef4444" /> Basurero (Cursos eliminados temporalmente)
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Los cursos se eliminarán permanentemente después de 7 días.</span>
          </div>
          <div className="table-scroll-wrap" style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['CURSO', 'CATEGORÍA', 'ELIMINADO EL', 'DÍAS RESTANTES', 'ACCIONES'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.1em', fontWeight: 700, textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trash.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                      El basurero está vacío.
                    </td>
                  </tr>
                ) : (
                  trash.map((course) => {
                    const daysRemaining = getDaysRemaining(course.deletedAt);
                    return (
                      <tr key={course.id} style={{ borderBottom: '1px solid var(--overlay-light)' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14px' }}>{course.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>por {course.instructor}</div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>{course.category}</td>
                        <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(course.deletedAt).toLocaleDateString('es-PE')}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            {daysRemaining} {daysRemaining === 1 ? 'día restante' : 'días restantes'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleRestore(course.id)} 
                              className="btn-primary" 
                              style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', backgroundColor: 'var(--primary)', color: '#fff', border: 'none' }}
                            >
                              Restaurar
                            </button>
                            <button 
                              onClick={() => handlePermanentDelete(course.id)} 
                              style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}
                            >
                              Eliminar permanente
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--overlay-light)' }}>
          <div className="table-scroll-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['CURSO', 'CATEGORÍA', 'ESTUDIANTES', 'MÓDULOS', 'PRECIO', 'ESTADO', 'ACCIONES'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.1em', fontWeight: 700, textAlign: 'left' }}>
                    {h === 'PRECIO' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Banknote size={12} /> {h}
                      </span>
                    ) : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((course) => {
                const sc = statusColors[course.status];
                const isDeleting = deletingCourseId === course.id;

                if (isDeleting) {
                  return (
                    <tr key={course.id} style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderBottom: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      <td colSpan={7} style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <span style={{ color: '#fca5a5', fontWeight: 600, fontSize: '13px' }}>
                            ¿Estás seguro de querer eliminar el curso &ldquo;{course.title}&rdquo;?
                          </span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setDeletingCourseId(null)} style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 12px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                            >
                              Cancelar
                            </button>
                            <button onClick={() => handleDelete(course.id)} style={{ backgroundColor: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 12px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}
                            >
                              Sí, eliminar
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={course.id} style={{ borderBottom: '1px solid var(--overlay-light)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--overlay-light)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Course info */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(0, 78, 187, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {(() => {
                            if (course.icon === 'GraduationCap') return <GraduationCap size={16} color="var(--primary)" />;
                            if (course.icon === 'TrendingUp') return <TrendingUp size={16} color="var(--primary)" />;
                            if (course.icon === 'BarChart2') return <BarChart2 size={16} color="var(--primary)" />;
                            if (course.icon === 'BookOpen') return <BookOpen size={16} color="var(--primary)" />;
                            if (course.icon === 'Shield') return <Shield size={16} color="var(--primary)" />;
                            if (course.icon === 'Award') return <Award size={16} color="var(--primary)" />;
                            return <BookOpen size={16} color="var(--primary)" />;
                          })()}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '2px' }}>{course.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{course.instructor} · {course.duration}</div>
                          {course.rating > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                              <Star size={10} fill="#f59e0b" color="#f59e0b" />
                              <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 600 }}>{course.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--overlay-light)', padding: '4px 8px', borderRadius: '4px' }}>{course.category}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontSize: '13px', fontWeight: 600 }}>
                        <Users size={13} color="var(--text-muted)" />
                        {course.students.toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-main)', fontWeight: 600 }}>
                      {course.modules}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--primary)', fontWeight: 700 }}>
                      {course.price}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: sc.bg, color: sc.color, padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, width: 'fit-content' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sc.dot }} />
                        {course.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="action-tooltip" data-tooltip="Vista previa">
                          <button onClick={() => setPreviewingCourse(course)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--overlay-light)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                          >
                            <Eye size={15} />
                          </button>
                        </span>
                        <span className="action-tooltip" data-tooltip="Editar">
                          <button onClick={() => openEdit(course)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--overlay-light)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                          >
                            <Edit2 size={15} />
                          </button>
                        </span>
                        <span className="action-tooltip" data-tooltip={course.status === 'Publicado' ? 'Despublicar' : 'Publicar'}>
                          <button onClick={() => handleToggleStatus(course.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--overlay-light)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                          >
                            <Upload size={15} />
                          </button>
                        </span>
                        <span className="action-tooltip" data-tooltip="Eliminar">
                          <button onClick={() => setDeletingCourseId(course.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No se encontraron cursos con los filtros aplicados.
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filtered.map(course => {
            const sc = statusColors[course.status];
            const isDeleting = deletingCourseId === course.id;

            if (isDeleting) {
              return (
                <div key={course.id} className="glass-panel" style={{ borderRadius: '16px', padding: '24px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '280px', transition: 'all 0.3s' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Trash2 size={24} color="#ef4444" />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>¿Eliminar este curso?</h3>
                  <p style={{ fontSize: '12px', color: '#fca5a5', margin: '0 0 20px 0', lineHeight: '1.5' }}>¿Estás seguro de querer eliminar el curso &ldquo;{course.title}&rdquo;? Esta acción no se puede deshacer.</p>
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button onClick={() => setDeletingCourseId(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                    >
                      Cancelar
                    </button>
                    <button onClick={() => handleDelete(course.id)} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#ef4444', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}
                    >
                      Sí, eliminar
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={course.id} className="glass-panel" style={{ borderRadius: '16px', padding: '24px', border: '1px solid var(--overlay-light)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(0, 78, 187, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(() => {
                      if (course.icon === 'GraduationCap') return <GraduationCap size={20} color="var(--primary)" />;
                      if (course.icon === 'TrendingUp') return <TrendingUp size={20} color="var(--primary)" />;
                      if (course.icon === 'BarChart2') return <BarChart2 size={20} color="var(--primary)" />;
                      if (course.icon === 'BookOpen') return <BookOpen size={20} color="var(--primary)" />;
                      if (course.icon === 'Shield') return <Shield size={20} color="var(--primary)" />;
                      if (course.icon === 'Award') return <Award size={20} color="var(--primary)" />;
                      return <BookOpen size={20} color="var(--primary)" />;
                    })()}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="action-tooltip" data-tooltip="Vista previa">
                      <button onClick={() => setPreviewingCourse(course)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--overlay-light)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <Eye size={15} />
                      </button>
                    </span>
                    <span className="action-tooltip" data-tooltip="Editar">
                      <button onClick={() => openEdit(course)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--overlay-light)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <Edit2 size={15} />
                      </button>
                    </span>
                    <span className="action-tooltip" data-tooltip={course.status === 'Publicado' ? 'Despublicar' : 'Publicar'}>
                      <button onClick={() => handleToggleStatus(course.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--overlay-light)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <Upload size={15} />
                      </button>
                    </span>
                    <span className="action-tooltip" data-tooltip="Eliminar">
                      <button onClick={() => setDeletingCourseId(course.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </span>
                  </div>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-main)' }}>{course.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>{course.instructor}</p>
                
                <div className="admin-course-meta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Estudiantes</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                      <Users size={12} color="var(--text-muted)" /> {course.students.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Rating</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                      <Star size={12} fill="#f59e0b" color="#f59e0b" /> {course.rating > 0 ? course.rating : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      <Banknote size={12} color="var(--primary)" /> Precio
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{course.price}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Categoría</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{course.category}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--overlay-light)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: sc.bg, color: sc.color, padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sc.dot }} />
                    {course.status}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{course.modules} mód. · {course.duration}</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', backgroundColor: 'var(--overlay-light)', borderRadius: '16px', border: '1px dashed var(--overlay-medium)' }}>
              No se encontraron cursos con los filtros aplicados.
            </div>
          )}
        </div>
      )}

      {/* Pagination footer */}
      <div style={{ marginTop: '24px', padding: '16px 24px', backgroundColor: 'var(--overlay-light)', borderRadius: '16px', border: '1px solid var(--overlay-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Mostrando {filtered.length} de {courses.length} cursos</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button className="app-pagination-btn" style={{ minWidth: '28px', height: '28px' }}><ChevronLeft size={16} /></button>
          {[1, 2, 3].map(p => (
            <button key={p} className={`app-pagination-btn ${p === 1 ? 'active' : ''}`} style={{ minWidth: '28px', height: '28px' }}>{p}</button>
          ))}
          <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>...</span>
          <button className="app-pagination-btn" style={{ minWidth: '28px', height: '28px' }}>6</button>
          <button className="app-pagination-btn" style={{ minWidth: '28px', height: '28px' }}><ChevronRight size={16} /></button>
        </div>
      </div>
      {/* Create/Edit Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="glass-panel" style={{ backgroundColor: 'var(--bg-card)', borderRadius: '20px', padding: '40px', width: '480px', border: '1px solid var(--border-color)', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '28px' }}>
              {editCourse ? 'Editar Curso' : 'Nuevo Curso'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Título del Curso', key: 'title', type: 'text', placeholder: 'Ej. Derecho Corporativo y Compliance' },
                { label: 'Descripción', key: 'description', type: 'text', placeholder: 'Descripción del curso...' },
                { label: 'Instructor', key: 'instructor', type: 'text', placeholder: 'Nombre del instructor' },
                { label: 'Precio', key: 'price', type: 'text', placeholder: 'Ej. $150' },
                { label: 'Duración', key: 'duration', type: 'text', placeholder: 'Ej. 15h 30m' },
                { label: 'N° de Módulos', key: 'modules', type: 'number', placeholder: 'Ej. 14' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {field.label === 'Precio' && <Banknote size={12} color="var(--primary)" />}
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{ width: '100%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px 14px', color: 'var(--text-main)', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              ))}

              <div className="resp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categoría</label>
                  <CustomSelect
                    value={form.category}
                    onChange={(val) => setForm(p => ({ ...p, category: val }))}
                    style={{ width: '100%', minWidth: '100%' }}
                    options={['Finanzas', 'Arbitraje', 'Legal', 'Seguridad'].map(c => ({ value: c, label: c }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Estado</label>
                  <CustomSelect
                    value={form.status}
                    onChange={(val) => setForm(p => ({ ...p, status: val as Course['status'] }))}
                    style={{ width: '100%', minWidth: '100%' }}
                    options={['Publicado', 'Borrador', 'Archivado'].map(s => ({ value: s, label: s }))}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '10px', backgroundColor: 'transparent', border: '2px solid var(--text-main)', color: 'var(--text-main)', fontSize: '14px', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s' }}>
                Cancelar
              </button>
              <button onClick={handleSave} style={{ flex: 1, padding: '14px', borderRadius: '10px', backgroundColor: 'var(--text-main)', color: 'var(--bg-card)', border: 'none', fontSize: '14px', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
                {editCourse ? 'Guardar Cambios' : 'Crear Curso'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {openMenu !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpenMenu(null)} />
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
