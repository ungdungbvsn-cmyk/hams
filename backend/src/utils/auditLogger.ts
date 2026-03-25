import prisma from '../prisma';

export const logActivity = async (userId: number | undefined, action: string, resource: string, details: any = null) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        resource,
        details: details ? JSON.parse(JSON.stringify(details)) : null,
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
