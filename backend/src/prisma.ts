import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
} as any);

if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`DEBUG: Prisma connecting to host ${url.hostname} as user ${url.username}`);
  } catch (e) {
    console.log('DEBUG: Prisma using DATABASE_URL (unable to parse)');
  }
} else {
  console.error('CRITICAL: DATABASE_URL is NOT set!');
}

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
