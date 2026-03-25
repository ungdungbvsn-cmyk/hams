import { Request, Response } from 'express';
import prisma from '../prisma';

export const getTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        asset: true,
        requester: { include: { department: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTicket = async (req: any, res: Response): Promise<any> => {
  try {
    const { title, description, assetId, priority } = req.body;

    const employee = await prisma.employee.findFirst({
      where: { userId: Number(req.user.userId) }
    });

    if (!employee) {
      return res.status(400).json({ error: 'User is not linked to an employee profile.' });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        assetId: assetId ? Number(assetId) : null,
        requesterId: employee.id,
        status: 'OPEN'
      }
    });

    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTicketStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await prisma.supportTicket.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.json(ticket);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to update ticket' });
  }
};
