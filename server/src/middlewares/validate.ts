import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware de validación de entrada basado en Zod.
 * Valida req.body contra el schema y rechaza con 400 si falla.
 * Si la validación pasa, req.body queda reemplazado por los datos parseados/saneados.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).flatten();
      res.status(400).json({
        error: 'Datos de entrada inválidos.',
        details: errors.fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
};
