import prisma from '../prisma';

export const logActivity = async (userId: number | null, action: string, resource: string, details?: any) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        resource,
        details: details || {}
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
