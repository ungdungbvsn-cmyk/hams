import { Request, Response } from 'express';
import prisma from '../prisma';

export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            username: true,
            employee: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 200 // Limit for performance
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
