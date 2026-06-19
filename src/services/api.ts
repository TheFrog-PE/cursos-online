import { supabase } from './supabase';

// Auth endpoints
export const authService = {
  register: async (_data: any): Promise<{ user: any }> => {
    throw new Error('Registration via Supabase Admin is server-side only.');
  },
  login: async (_data: any): Promise<{ user: any }> => {
    throw new Error('Use AuthContext.login() instead');
  },
  logout: async () => { await supabase.auth.signOut(); },
  me: async () => { const { data } = await supabase.auth.getUser(); return { user: data.user }; },
  getUsers: async (): Promise<{ users: any[] }> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) return { users: [] };
    return { users: data ?? [] };
  }
};

// Courses endpoints (localStorage-based)
export const courseService = {
  getCourses: async (): Promise<{ courses: any[] }> => ({ courses: [] }),
  getCourseLessons: async (_courseId: string): Promise<any[]> => []
};

// Payments endpoints
export const paymentService = {
  uploadPayment: async (_formData: FormData) => { throw new Error('Not implemented with Supabase yet'); },

  getPayments: async (): Promise<{ payments: any[] }> => {
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (error) return { payments: [] };
    return { payments: data ?? [] };
  },

  getUserPayments: async (): Promise<{ payments: any[] }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { payments: [] };
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return { payments: [] };
    return { payments: data ?? [] };
  },

  updatePaymentStatus: async (paymentId: string, status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO') => {
    const { data, error } = await supabase.from('payments').update({ status }).eq('id', paymentId).select().single();
    if (error) throw error;
    return data;
  }
};

// Support / Ticket endpoints
export const supportService = {
  createTicket: async (formData: FormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File | null;
    let imageUrl: string | null = null;
    if (file) {
      const ext = file.name.split('.').pop();
      const path = `tickets/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('support-files').upload(path, file);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('support-files').getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }
    const { data, error } = await supabase
      .from('tickets')
      .insert({ title, description, image: imageUrl, status: 'ABIERTO', user_id: user?.id ?? null })
      .select().single();
    if (error) throw error;
    return { ticket: data };
  },

  getTickets: async (): Promise<{ tickets: any[] }> => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('tickets')
      .select('*, ticket_messages(*)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    if (error) return { tickets: [] };
    return { tickets: data ?? [] };
  },

  getAllTickets: async (): Promise<{ tickets: any[] }> => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, ticket_messages(*), profiles(name, email)')
      .order('created_at', { ascending: false });
    if (error) return { tickets: [] };
    return { tickets: data ?? [] };
  },

  getTicketById: async (ticketId: string) => {
    const { data, error } = await supabase
      .from('tickets').select('*, ticket_messages(*)').eq('id', ticketId).single();
    if (error) throw error;
    return data;
  },

  addMessage: async (ticketId: string, formData: FormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    const text = formData.get('text') as string;
    const file = formData.get('file') as File | null;
    let imageUrl: string | null = null;
    if (file) {
      const ext = file.name.split('.').pop();
      const path = `tickets/messages/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('support-files').upload(path, file);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('support-files').getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({ ticket_id: ticketId, sender: user?.email, text, image: imageUrl })
      .select().single();
    if (error) throw error;
    return data;
  },

  resolveTicket: async (ticketId: string) => {
    const { data, error } = await supabase
      .from('tickets').update({ status: 'RESUELTO' }).eq('id', ticketId).select().single();
    if (error) throw error;
    return data;
  }
};

// Progress endpoints
export const progressService = {
  getProgress: async (_courseId: string): Promise<{ completedLessons: string[] }> => ({
    completedLessons: []
  }),
  saveProgress: async (_courseId: string, _lessonKey: string, _completed: boolean) => ({})
};

// Config & Demo Services
export const configService = {
  getDemoConfig: async () => ({ demo_mode: false }),
  resetDemo: async () => ({})
};

export const demoService = {
  createDemoUser: async (data: { name: string; email: string; role: string }): Promise<{ user: any }> => {
    return {
      user: {
        id: crypto.randomUUID(),
        email: data.email,
        name: data.name,
        role: data.role,
        password_temp: 'Temporal123!'
      }
    };
  },
  createCourse: async (_data: { title: string; description: string; price: number; lessons: number }) => ({})
};

// Legacy stub
export const api = {
  get: async (_url: string) => ({ data: {} }),
  post: async (_url: string, _data?: any) => ({ data: {} }),
  put: async (_url: string, _data?: any) => ({ data: {} }),
};
