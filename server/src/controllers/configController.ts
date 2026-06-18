import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { resetDemoDatabase } from '../services/demoCleanup.js';

export const getConfig = (req: AuthenticatedRequest, res: Response): void => {
  const demoMode = process.env.DEMO_MODE !== 'false';
  res.status(200).json({ demo_mode: demoMode });
};

export const resetDemo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const isDemo = process.env.DEMO_MODE !== 'false';
  if (!isDemo) {
    res.status(403).json({ error: 'El reinicio de demo no está permitido en producción.' });
    return;
  }

  try {
    await resetDemoDatabase();
    res.status(200).json({ message: 'Base de datos demo reiniciada exitosamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al reiniciar la base de datos de demostración.' });
  }
};
