export interface Course {
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
  description?: string;
  badge?: string;
  icon?: string;
  thumbnail?: string;
  descriptionTop?: string;
  descriptionBottom?: string;
  topicsJson?: string;
  isComingSoon?: boolean;
  modulesJson?: string;
}

export const initialCourses: Course[] = [
  {
    id: 1,
    title: 'Certificación Oficial en OCPD: Protección de Datos Personales',
    category: 'Legal',
    instructor: 'Instituto Peruano de Compliance',
    students: 0,
    duration: '36h 00m',
    rating: 4.8,
    status: 'Publicado',
    price: '99.00',
    modules: 9,
    lastUpdated: 'Ahora',
    description: 'Obtén tu certificación oficial como Oficial de Datos Personales con nuestro curso especializado en protección de datos personales.',
    icon: 'GraduationCap',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=60',
    descriptionTop: 'Conviértete en Oficial de Datos Personales certificado. Domina la Ley N° 29733, el Reglamento LPDP y el RGPD europeo. Obtén la habilitación profesional para gestionar y proteger datos personales en cualquier organización.',
    descriptionBottom: 'El programa OCPD está diseñado para habilitar a profesionales como Oficiales de Datos Personales, con un enfoque integral que cubre desde la normativa peruana (Ley 29733) hasta el RGPD europeo. Incluye un módulo de evaluación de acreditación con simulacros reales, preparándote para ejercer como DPO certificado en cualquier organización.',
    topicsJson: JSON.stringify([
      { title: "Ley N° 29733", desc: "Domina completamente la Ley de Protección de Datos Personales del Perú y su reglamento.", icon: "ShieldAlert" },
      { title: "RGPD Europeo", desc: "Comprende el Reglamento General de Protección de Datos y aplica sus mejores prácticas.", icon: "BookOpen" },
      { title: "Gestión de Brechas", desc: "Aprende a detectar, contener y notificar incidentes de seguridad de datos correctamente.", icon: "Activity" },
      { title: "Derechos ARCO", desc: "Domina el procedimiento de atención de derechos de Acceso, Rectificación, Cancelación y Oposición.", icon: "FileText" },
      { title: "Simulacros ANPD", desc: "Practica con simulacros basados en casos reales resueltos por la Autoridad Nacional de Protección de Datos.", icon: "MonitorPlay" },
      { title: "Acreditación OCPD", desc: "Obtén la certificación habilitante como Oficial de Datos Personales reconocida en el mercado peruano.", icon: "CheckCircle2" }
    ])
  },
  {
    id: 2,
    title: 'Especialista en Compliance',
    category: 'Legal',
    instructor: 'Instituto Peruano de Compliance',
    students: 0,
    duration: '28h 00m',
    rating: 4.9,
    status: 'Publicado',
    price: '120.00',
    modules: 7,
    lastUpdated: 'Ahora',
    description: 'Conviértete en Especialista en Compliance, uno de los roles más demandados en Perú y LATAM. Obtén doble certificación acreditada por IPC.',
    icon: 'TrendingUp',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=60',
    descriptionTop: 'Forma profesionales capaces de diseñar, implementar y supervisar Sistemas de Gestión de Compliance alineados a ISO 37301 y la normativa peruana vigente.',
    descriptionBottom: 'El programa de Especialización en Compliance está enfocado en brindar herramientas teórico-prácticas para prevenir riesgos penales, implementar modelos de prevención eficaces, gestionar canales de denuncia y liderar la cultura ética organizacional.',
    topicsJson: JSON.stringify([
      { title: "Marco ISO 37301", desc: "Implementa sistemas de compliance bajo el estándar internacional más reconocido a nivel global.", icon: "ShieldAlert" },
      { title: "Normativa Peruana", desc: "Domina la Ley N° 30424, el DL 1352 y toda la regulación sectorial vigente en el Perú.", icon: "BookOpen" },
      { title: "Gestión de Riesgos", desc: "Aprende a identificar, evaluar y mitigar riesgos legales y regulatorios en tu organización.", icon: "Activity" },
      { title: "Canal de Denuncias", desc: "Diseña e implementa canales efectivos de whistleblowing y mecanismos de reporte.", icon: "FileText" },
      { title: "Casos Prácticos", desc: "Aplica los conocimientos en casos reales de empresas peruanas e internacionales.", icon: "MonitorPlay" },
      { title: "Certificación Oficial", desc: "Obtén el certificado respaldado por el Instituto Peruano de Compliance.", icon: "CheckCircle2" }
    ])
  },
  {
    id: 3,
    title: 'Derecho Institucional y Gobierno Corporativo',
    category: 'Legal',
    instructor: 'Instituto Peruano de Compliance',
    students: 0,
    duration: '24h 00m',
    rating: 5.0,
    status: 'Publicado',
    price: '820.00',
    modules: 1,
    lastUpdated: 'Ahora',
    description: 'Curso de Derecho Institucional y Gobierno Corporativo.',
    icon: 'Activity',
    thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=60',
    isComingSoon: true,
    descriptionTop: 'Curso de Derecho Institucional y Gobierno Corporativo.',
    descriptionBottom: 'Curso de Derecho Institucional y Gobierno Corporativo.',
    topicsJson: JSON.stringify([
      { title: "Gobierno Corporativo", desc: "Aprende a estructurar un gobierno corporativo ético y legal.", icon: "BookOpen" }
    ]),
    modulesJson: JSON.stringify([
      {
        title: "Módulo 1: Introducción",
        lessons: 1,
        description: "Introducción al Derecho Institucional",
        subModules: [
          { id: 1, title: "Lección 1.1", description: "Conceptos clave" }
        ]
      }
    ])
  }
];
