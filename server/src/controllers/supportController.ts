import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const createTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, description } = req.body;

  if (!req.user) {
    res.status(401).json({ error: 'No autorizado.' });
    return;
  }

  if (!title || !description) {
    res.status(400).json({ error: 'Título y descripción son obligatorios.' });
    return;
  }

  try {
    const image = req.file ? req.file.path : null;
    const ticketId = 'TKT-' + Math.floor(10000 + Math.random() * 90000);
    const newTicket = await prisma.supportTicket.create({
      data: {
        id: ticketId,
        userId: req.user.id,
        title,
        description,
        status: 'ABIERTO',
        image: image || null,
        adminAgreedToClose: false,
        devAgreedToClose: false
      }
    });

    res.status(201).json({
      message: 'Ticket de soporte creado exitosamente.',
      ticket: newTicket,
      url: `${req.protocol}://${req.get('host')}/#ticket-${ticketId}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor al crear ticket.' });
  }
};

export const getTickets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'No autorizado.' });
    return;
  }

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.id },
      include: {
        messages: {
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.status(200).json({ tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

export const getAllTickets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        messages: {
          orderBy: { date: 'asc' }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.status(200).json({ tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

export const getTicketById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: String(id) },
      include: {
        messages: {
          orderBy: { date: 'asc' }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!ticket) {
      res.status(404).json({ error: 'Ticket no encontrado.' });
      return;
    }

    res.status(200).json({ ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

export const addTicketMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { sender, text, devName } = req.body;
  const image = req.file ? req.file.path : null;

  if (sender !== 'Admin' && sender !== 'Dev') {
    res.status(400).json({ error: 'Remitente de mensaje inválido.' });
    return;
  }

  if (!text && !image) {
    res.status(400).json({ error: 'El contenido del mensaje no puede estar vacío.' });
    return;
  }

  try {
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newMessage = await prisma.ticketMessage.create({
      data: {
        id: messageId,
        ticketId: String(id),
        sender,
        text: text || '',
        image: image || null,
        devName: devName || null
      }
    });

    res.status(201).json({
      message: 'Mensaje de ticket agregado.',
      chatMessage: newMessage
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor al agregar respuesta.' });
  }
};

export const resolveTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  // Determine the signer: if there's an authenticated admin/editor session, it's 'Admin'
  // Otherwise, treat it as a 'Dev' action (external tech link viewer)
  const sender = (req.user && (req.user.role === 'ADMIN' || req.user.role === 'EDITOR')) ? 'Admin' : 'Dev';

  try {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: String(id) } });
    if (!ticket) {
      res.status(404).json({ error: 'Ticket no encontrado.' });
      return;
    }

    const updateData: any = {};
    if (sender === 'Admin') updateData.adminAgreedToClose = true;
    if (sender === 'Dev') updateData.devAgreedToClose = true;

    // If both agreed, set the whole status to RESUELTO
    const bothAgreed = (sender === 'Admin' && ticket.devAgreedToClose) || (sender === 'Dev' && ticket.adminAgreedToClose);
    if (bothAgreed) {
      updateData.status = 'RESUELTO';
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: String(id) },
      data: updateData
    });

    res.status(200).json({
      message: bothAgreed ? 'El ticket ha sido cerrado definitivamente.' : 'El ticket ha sido marcado como solucionado.',
      ticket: updatedTicket
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor al actualizar ticket.' });
  }
};
