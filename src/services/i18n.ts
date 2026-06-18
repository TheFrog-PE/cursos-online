import { useState } from 'react';

const translations = {
  es: {
    dashboard: 'Dashboard',
    courses: 'Cursos',
    mecanografia: 'Mecanografía',
    soporte: 'Soporte',
    pagos: 'Pagos',
    admin_portal: 'Portal de Administración',
    logout: 'Cerrar Sesión',
    loading_session: 'Verificando sesión...',
    course_hero_subtitle: 'DISEÑA E IMPLEMENTA SISTEMAS DE GESTIÓN ALINEADOS A ISO 37301',
    purchase_now: 'ADQUIRIR AHORA',
    syllabus: 'TEMARIO DEL PROGRAMA',
    opinions: 'Opiniones de alumnos',
  },
  en: {
    dashboard: 'Dashboard',
    courses: 'Courses',
    mecanografia: 'Typing',
    soporte: 'Support',
    pagos: 'Payments',
    admin_portal: 'Admin Portal',
    logout: 'Log Out',
    loading_session: 'Checking session...',
    course_hero_subtitle: 'DESIGN AND IMPLEMENT MANAGEMENT SYSTEMS ALIGNED TO ISO 37301',
    purchase_now: 'PURCHASE NOW',
    syllabus: 'PROGRAM SYLLABUS',
    opinions: 'Student reviews',
  }
};

type Language = 'es' | 'en';

export const useTranslation = () => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('ipc_lang') as Language) || 'es';
  });

  const t = (key: keyof typeof translations['es']): string => {
    return translations[lang][key] || translations['es'][key] || key;
  };

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('ipc_lang', newLang);
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  };

  return { t, lang, changeLanguage };
};
