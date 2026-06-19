import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

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

// Helper: fetch profile data from Supabase
const fetchProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as 'ADMIN' | 'EDITOR' | 'STUDENT',
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode] = useState(false);

  useEffect(() => {
    // Sync localStorage courses (kept for local demo data)
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

    // Check existing Supabase session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const profile = await fetchProfile(data.user.id);
    if (!profile) throw new Error('No se encontró el perfil del usuario.');

    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
