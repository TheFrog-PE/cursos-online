import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

// ─── 1. Crear un pago (Sube el voucher a Cloudinary) ───
export const createPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Ya no extraemos comprobanteUrl del body, solo el amount
    const { amount, courseTitle } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'No autenticado.' });
      return;
    }

    if (!amount) {
      res.status(400).json({ error: 'El monto es obligatorio.' });
      return;
    }

    // El middleware de Cloudinary guardará el archivo procesado en req.file
    // La URL segura (https://...) que genera Cloudinary estará en req.file.path
    const comprobanteUrl = req.file ? req.file.path : null;

    if (!comprobanteUrl) {
      res.status(400).json({ error: 'El archivo del comprobante es obligatorio.' });
      return;
    }

    const newPayment = await prisma.payment.create({
      data: {
        userId: req.user.id,
        courseTitle: courseTitle || "Especialista en Compliance",
        amount: parseFloat(amount),
        comprobanteUrl: comprobanteUrl, // Guardamos el link limpio de Cloudinary
        imageName: req.file?.originalname || 'voucher_subido', // Guardamos el nombre original del archivo
        status: "PENDIENTE"
      }
    });

    res.status(201).json({
      message: 'Comprobante de pago subido exitosamente. En revisión.',
      payment: newPayment
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor al registrar pago.' });
  }
};

// ─── 2. Obtener todos los pagos (Para el panel de Admin) ───
export const getPayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.status(200).json({ payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los pagos.' });
  }
};

// ─── Obtener los pagos del usuario autenticado (Para el panel de Estudiante) ───
export const getUserPayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado.' });
    return;
  }

  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' }
    });
    res.status(200).json({ payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los pagos del usuario.' });
  }
};

// ─── 3. Actualizar el estado de un pago (Aprobar/Rechazar) ───
export const updatePaymentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    const updatedPayment = await prisma.payment.update({
      where: { id: String(id) }, // NOTA: Si en tu base de datos el ID es un número, cámbialo a Number(id)
      data: { status }
    });

    res.status(200).json({ message: 'Estado actualizado', payment: updatedPayment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el estado del pago.' });
  }
};