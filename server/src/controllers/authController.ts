import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bV9xW3@Kp#mL7nTqZfR2sE8uYdA5cGjH!iN4oP6wX1yB0vQ_ipc_2026_production_secure';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Ensure JWT_SECRET is set in production
if (!process.env.JWT_SECRET) {
  if (NODE_ENV === 'production') {
    throw new Error('[CRITICAL SECURITY ERROR] JWT_SECRET environment variable is required in production mode!');
  } else {
    console.warn('[SECURITY WARNING] JWT_SECRET is not set in environment variables. Using development fallback. Set JWT_SECRET in your .env file before deploying.');
  }
}

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'STUDENT'
      }
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor al registrar el usuario.' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    return;
  }

  const emailLower = email.toLowerCase().trim();

  try {
    // Check if user exists in the database
    const dbUser = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    if (dbUser) {
      // Validate password
      const passwordMatch = await bcrypt.compare(password, dbUser.password);
      if (!passwordMatch) {
        res.status(400).json({ error: 'Contraseña incorrecta.' });
        return;
      }

      const token = jwt.sign(
        { id: dbUser.id, email: dbUser.email, role: dbUser.role },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        message: 'Inicio de sesión exitoso.',
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role
        }
      });
      return;
    }

    res.status(404).json({ error: 'Usuario no encontrado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor al iniciar sesión.' });
  }
};

export const logout = (req: AuthenticatedRequest, res: Response): void => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado.' });
    return;
  }

  // Para usuarios sintéticos del MVP, retornar directamente sin buscar en BD
  if (req.user.id.startsWith('mvp-')) {
    res.status(200).json({ user: req.user });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

export const createDemoUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const isDemo = process.env.DEMO_MODE !== 'false';
  if (!isDemo) {
    res.status(403).json({ error: 'No disponible en producción.' });
    return;
  }

  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
      return;
    }

    // Generate random 8 character password
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role as 'STUDENT' | 'EDITOR' | 'ADMIN'
      }
    });

    res.status(201).json({
      message: 'Usuario demo creado exitosamente.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password_temp: tempPassword,
        created_at: newUser.createdAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el usuario demo.' });
  }
};

export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los usuarios.' });
  }
};

