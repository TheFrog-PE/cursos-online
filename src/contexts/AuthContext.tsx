import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, configService } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'STUDENT';
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ipc_courses');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        const hasDerecho = list.some((c: any) => c.id === 3 || c.title.toLowerCase().includes('derecho institucional'));
        if (!hasDerecho) {
          list.push({
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
          });
          localStorage.setItem('ipc_courses', JSON.stringify(list));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {
        console.error('Error synching localStorage courses:', e);
      }
    }

    const checkSession = async () => {
      try {
        const res = await authService.me();
        if (res.user) {
          setUser(res.user);
          localStorage.setItem('user_session', JSON.stringify(res.user));
        }
      } catch {
        setUser(null);
        localStorage.removeItem('user_session');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchConfig = async () => {
      try {
        const res = await configService.getDemoConfig();
        setIsDemoMode(!!res.demo_mode);
      } catch (err) {
        console.error('Error fetching demo mode config:', err);
      }
    };

    checkSession();
    fetchConfig();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authService.login({ email, password });
    setUser(res.user);
    localStorage.setItem('user_session', JSON.stringify(res.user));
    return res.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // safe to ignore
    }
    setUser(null);
    localStorage.removeItem('user_session');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isDemoMode, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
