import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bV9xW3@Kp#mL7nTqZfR2sE8uYdA5cGjH!iN4oP6wX1yB0vQ_ipc_2026_production_secure';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'EDITOR' | 'STUDENT';
  };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Acceso no autorizado. Token faltante.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'ADMIN' | 'EDITOR' | 'STUDENT' };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Sesión inválida o expirada.' });
  }
};

export const requireRole = (roles: Array<'ADMIN' | 'EDITOR' | 'STUDENT'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Acceso no autorizado.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acceso denegado. Privilegios insuficientes.' });
      return;
    }

    next();
  };
};
