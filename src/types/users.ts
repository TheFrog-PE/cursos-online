export interface User {
  id: number;
  name: string;
  email: string;
  role: 'EDITOR' | 'STUDENT' | 'ADMIN';
  status: 'Activo' | 'Pendiente' | 'Inactivo';
  lastActivity: string;
  avatarUrl?: string;
}

export const USERS: User[] = [];
