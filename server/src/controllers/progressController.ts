import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

/**
 * Get completed lessons list for a specific course
 */
export const getProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;

  if (!req.user) {
    res.status(401).json({ error: 'Acceso denegado. No autenticado.' });
    return;
  }

  try {
    const progressList = await prisma.userProgress.findMany({
      where: {
        userId: req.user.id,
        courseId: String(courseId),
        completed: true
      }
    });

    const completedLessons = progressList.map(p => p.lessonKey);
    res.status(200).json({ completedLessons });
  } catch (err) {
    console.error('Error in getProgress:', err);
    res.status(500).json({ error: 'Error del servidor al obtener el progreso.' });
  }
};

/**
 * Save progress: mark or unmark a lesson completed
 */
export const saveProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { lessonKey, completed } = req.body;

  if (!req.user) {
    res.status(401).json({ error: 'Acceso denegado. No autenticado.' });
    return;
  }

  if (!lessonKey) {
    res.status(400).json({ error: 'Falta lessonKey.' });
    return;
  }

  try {
    if (completed === false) {
      // Delete progress entry if exist
      await prisma.userProgress.deleteMany({
        where: {
          userId: req.user.id,
          courseId: String(courseId),
          lessonKey: String(lessonKey)
        }
      });
    } else {
      // Upsert progress entry
      await prisma.userProgress.upsert({
        where: {
          userId_courseId_lessonKey: {
            userId: req.user.id,
            courseId: String(courseId),
            lessonKey: String(lessonKey)
          }
        },
        update: {
          completed: true
        },
        create: {
          userId: req.user.id,
          courseId: String(courseId),
          lessonKey: String(lessonKey),
          completed: true
        }
      });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error in saveProgress:', err);
    res.status(500).json({ error: 'Error del servidor al guardar progreso.' });
  }
};
