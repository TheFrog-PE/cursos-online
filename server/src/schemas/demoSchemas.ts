import { z } from 'zod';

export const createDemoUserSchema = z.object({
  name: z
    .string({ message: 'El nombre es requerido.' })
    .min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z
    .string({ message: 'El email es requerido.' })
    .email('Formato de email inválido.'),
  role: z
    .enum(['STUDENT', 'EDITOR', 'ADMIN'], { message: 'El rol es requerido.' }),
});

export const createCourseSchema = z.object({
  title: z
    .string({ message: 'El título es requerido.' })
    .min(3, 'El título debe tener al menos 3 caracteres.'),
  description: z
    .string({ message: 'La descripción es requerida.' })
    .min(5, 'La descripción debe tener al menos 5 caracteres.'),
  price: z
    .preprocess((val) => Number(val), z.number({ message: 'El precio es requerido.' }).min(0, 'El precio no puede ser negativo.')),
  lessons: z
    .preprocess((val) => Number(val), z.number({ message: 'Las lecciones son requeridas.' }).int().min(1, 'Debe haber al menos 1 lección.')),
});

export type CreateDemoUserInput = z.infer<typeof createDemoUserSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
