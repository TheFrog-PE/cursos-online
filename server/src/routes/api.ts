import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

import { register, login, logout, me, createDemoUser, getUsers } from '../controllers/authController.js';
import { getCourses, getCourseLessons, createCourse } from '../controllers/courseController.js';
import { createPayment, getPayments, updatePaymentStatus, getUserPayments } from '../controllers/paymentController.js';
import { createTicket, getTickets, getAllTickets, getTicketById, addTicketMessage, resolveTicket } from '../controllers/supportController.js';
import { getConfig, resetDemo } from '../controllers/configController.js';
import { getProgress, saveProgress } from '../controllers/progressController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

import { loginSchema, registerSchema } from '../schemas/authSchemas.js';
import { createTicketSchema, addTicketMessageSchema } from '../schemas/ticketSchemas.js';
import { updatePaymentStatusSchema } from '../schemas/paymentSchemas.js';
import { createDemoUserSchema, createCourseSchema } from '../schemas/demoSchemas.js';

// ─── Cloudinary upload ───────────────────────────────────────────────────────
import { uploadVoucher, uploadTicket } from '../config/cloudinary.js';
import { demoLoginLimit, demoTicketLimit, demoPaymentLimit, demoTrackActivity } from '../middlewares/demoLimits.js';

const router = Router();

// ─── RATE LIMITING ───────────────────────────────────────────────────────────
interface IpLimitState {
  failedCount: number;
  blockCount: number;
  blockedUntil: number | null;
}

const loginIpStore = new Map<string, IpLimitState>();

/** Custom login rate limiter with progressive/scaled block duration */
const loginLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  if (!loginIpStore.has(ip)) {
    loginIpStore.set(ip, { failedCount: 0, blockCount: 0, blockedUntil: null });
  }
  
  const state = loginIpStore.get(ip)!;
  
  // Bypass in local development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    next();
    return;
  }

  // If currently blocked, check if block has expired
  if (state.blockedUntil && now < state.blockedUntil) {
    const remainingMs = state.blockedUntil - now;
    const remainingMin = Math.ceil(remainingMs / (60 * 1000));
    const unit = remainingMin === 1 ? 'minuto' : 'minutos';
    res.status(429).json({ error: `Demasiados intentos de acceso. Intenta nuevamente en ${remainingMin} ${unit}.` });
    return;
  }
  
  // If block has expired, clear the block timestamp but keep blockCount for escalation
  if (state.blockedUntil && now >= state.blockedUntil) {
    state.blockedUntil = null;
  }
  
  const originalJson = res.json;
  res.json = function (body: any) {
    // If the response is an error or includes an error field, treat as failed login attempt
    if (res.statusCode >= 400 || body?.error) {
      state.failedCount += 1;
      // Block after 3 consecutive failed attempts
      if (state.failedCount >= 3) {
        state.blockCount = Math.min(state.blockCount + 1, 15);
        state.blockedUntil = Date.now() + state.blockCount * 60 * 1000;
        state.failedCount = 0; // reset count for next block cycle
        
        res.status(429);
        const unit = state.blockCount === 1 ? 'minuto' : 'minutos';
        body = { error: `Demasiados intentos de acceso. Intenta nuevamente en ${state.blockCount} ${unit}.` };
      }
    } else {
      // On successful login, clear rate limiting state completely
      loginIpStore.delete(ip);
    }
    return originalJson.call(this, body);
  };
  
  next();
};

/** Máximo 5 registros por IP por hora */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de registro. Intenta nuevamente más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── AUTHENTICATION ROUTES ───────────────────────────────────────────────────
router.post('/auth/register', registerLimiter, validate(registerSchema), register);
router.post('/auth/login',    demoLoginLimit, loginLimiter, validate(loginSchema), login);
router.post('/auth/logout', logout);
router.get('/auth/me', requireAuth, demoTrackActivity, me);
router.get('/users', requireAuth, demoTrackActivity, requireRole(['ADMIN', 'EDITOR']), getUsers);

// ─── COURSES ROUTES ──────────────────────────────────────────────────────────
router.get('/courses', getCourses);
router.get('/courses/:id/lessons', requireAuth, demoTrackActivity, getCourseLessons);
router.get('/progress/:courseId', requireAuth, demoTrackActivity, getProgress);
router.post('/progress/:courseId', requireAuth, demoTrackActivity, saveProgress);

// ─── PAYMENTS ROUTES ─────────────────────────────────────────────────────────
router.post('/payments/upload',    requireAuth, demoTrackActivity, demoPaymentLimit, uploadVoucher.single('file'), createPayment);
router.get('/payments',            requireAuth, demoTrackActivity, requireRole(['ADMIN', 'EDITOR']), getPayments);
router.get('/payments/user',       requireAuth, demoTrackActivity, getUserPayments);
router.put('/payments/:id/status', requireAuth, demoTrackActivity, requireRole(['ADMIN', 'EDITOR']), validate(updatePaymentStatusSchema), updatePaymentStatus);

// ─── SUPPORT TICKETS ROUTES ──────────────────────────────────────────────────
router.post('/tickets/create',      requireAuth, demoTrackActivity, demoTicketLimit, uploadTicket.single('file'), validate(createTicketSchema), createTicket);
router.get('/tickets/user',         requireAuth, demoTrackActivity, getTickets);
router.get('/tickets',              requireAuth, demoTrackActivity, requireRole(['ADMIN', 'EDITOR']), getAllTickets);

// Ticket viewer público — para que soporte técnico externo pueda ver sin login
router.get('/tickets/:id', getTicketById);

// Acciones sobre tickets — públicas (para visor de tickets público)
router.post('/tickets/:id/message', demoTrackActivity, uploadTicket.single('file'), validate(addTicketMessageSchema), addTicketMessage);
router.put('/tickets/:id/resolve',  demoTrackActivity,  resolveTicket);

// ─── CONFIG & DEMO MANAGEMENT ROUTES ─────────────────────────────────────────
router.get('/config/demo-mode', getConfig);
router.post('/config/reset-demo', resetDemo);
router.post('/auth/demo-users', requireAuth, demoTrackActivity, requireRole(['ADMIN']), validate(createDemoUserSchema), createDemoUser);
router.post('/courses', requireAuth, demoTrackActivity, requireRole(['ADMIN', 'EDITOR']), validate(createCourseSchema), createCourse);

export default router;