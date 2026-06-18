import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';

interface ActiveSession {
  lastActivity: number;
}

// Global active sessions map
export const activeSessions = new Map<string, ActiveSession>();

// Clean up expired sessions (> 30 min)
const cleanExpiredSessions = () => {
  const now = Date.now();
  for (const [email, session] of activeSessions.entries()) {
    if (now - session.lastActivity > 30 * 60 * 1000) {
      activeSessions.delete(email);
    }
  }
};

/**
 * Limit concurrent logged-in users to 10 in demo mode
 */
export const demoLoginLimit = (req: Request, res: Response, next: NextFunction): void => {
  const isDemo = process.env.DEMO_MODE !== 'false';
  if (!isDemo) {
    next();
    return;
  }

  cleanExpiredSessions();

  const email = req.body.email?.toLowerCase().trim();
  if (email) {
    // If the user is already active, let them log in again
    if (activeSessions.has(email)) {
      next();
      return;
    }

    // If we reached the limit of 10 concurrent users, reject
    if (activeSessions.size >= 10) {
      res.status(429).json({ error: 'Máximo 10 usuarios simultáneos en demo.' });
      return;
    }

    // Register active session
    activeSessions.set(email, { lastActivity: Date.now() });
  }

  next();
};

/**
 * Limit tickets to 3 open/active tickets per user in demo mode
 */
export const demoTicketLimit = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  const isDemo = process.env.DEMO_MODE !== 'false';
  if (!isDemo) {
    next();
    return;
  }

  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'No autenticado.' });
    return;
  }

  try {
    const openTicketsCount = await prisma.supportTicket.count({
      where: {
        userId,
        status: 'ABIERTO'
      }
    });

    if (openTicketsCount >= 3) {
      res.status(400).json({ error: 'Máximo 3 tickets simultáneos en demo.' });
      return;
    }
  } catch (error) {
    console.error('Error validating ticket limit in demo:', error);
  }

  next();
};

/**
 * Configure timeout limits for file/payment uploads in demo mode
 */
export const demoPaymentLimit = (req: Request, res: Response, next: NextFunction): void => {
  const isDemo = process.env.DEMO_MODE !== 'false';
  if (!isDemo) {
    next();
    return;
  }

  // Set timeout to 5 minutes (300,000ms) for upload endpoints
  req.setTimeout(5 * 60 * 1000);
  res.setTimeout(5 * 60 * 1000);

  next();
};

/**
 * Track user activity to extend their active session expiration
 */
export const demoTrackActivity = (req: any, res: Response, next: NextFunction): void => {
  const isDemo = process.env.DEMO_MODE !== 'false';
  if (isDemo && req.user?.email) {
    const email = req.user.email.toLowerCase().trim();
    activeSessions.set(email, { lastActivity: Date.now() });
  }
  next();
};
