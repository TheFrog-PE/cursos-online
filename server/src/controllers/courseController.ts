import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const getCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany();
    res.status(200).json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor al obtener cursos.' });
  }
};

export const getCourseLessons = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    res.status(401).json({ error: 'Acceso denegado. No autenticado.' });
    return;
  }

  try {
    const course = await prisma.course.findUnique({ where: { id: String(id) } });
    if (!course) {
      res.status(404).json({ error: 'Curso no encontrado.' });
      return;
    }

    // Check if user is Admin or Editor (they have full access)
    if (req.user.role === 'ADMIN' || req.user.role === 'EDITOR') {
      res.status(200).json({
        lessons: [
          { id: '1', title: '1.1 Fundamentos de Tarjetología', duration: '12m 40s', url: 'https://vimeo.com/12345678' },
          { id: '2', title: '1.2 Reglas Ocultas de los Bancos', duration: '18m 15s', url: 'https://vimeo.com/87654321' }
        ]
      });
      return;
    }

    // Check if Student has an APROBADO payment in PostgreSQL database
    const approvedPayment = await prisma.payment.findFirst({
      where: {
        userId: req.user.id,
        status: 'APROBADO'
      }
    });

    if (!approvedPayment) {
      res.status(403).json({ error: 'Acceso denegado. Se requiere adquirir el curso para visualizar las lecciones.' });
      return;
    }

    res.status(200).json({
      lessons: [
        { id: '1', title: '1.1 Fundamentos de Tarjetología', duration: '12m 40s', url: 'https://vimeo.com/12345678' },
        { id: '2', title: '1.2 Reglas Ocultas de los Bancos', duration: '18m 15s', url: 'https://vimeo.com/87654321' }
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

export const createCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const isDemo = process.env.DEMO_MODE !== 'false';
  if (!isDemo) {
    res.status(403).json({ error: 'No disponible en producción.' });
    return;
  }

  const { title, description, price, lessons } = req.body;

  if (!title || !description || price === undefined || lessons === undefined) {
    res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    return;
  }

  try {
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        lessons: parseInt(lessons, 10)
      }
    });

    res.status(201).json({
      message: 'Curso creado exitosamente.',
      course: newCourse
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el curso.' });
  }
};
