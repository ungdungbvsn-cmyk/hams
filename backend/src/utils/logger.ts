import prisma from '../prisma';

export const logActivity = (userId: number | null, action: string, resource: string, details?: any) => {
  // Fire and forget to avoid blocking the main request thread
  prisma.activityLog.create({
    data: {
      userId,
      action,
      resource,
      details: details || {}
    }
  }).catch((error) => {
    console.error('Failed to log activity in background:', error);
  });
};
