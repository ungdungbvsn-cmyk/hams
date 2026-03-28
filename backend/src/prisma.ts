import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  try {
    const url = new URL(dbUrl);
    console.log(`DEBUG: Prisma connecting to ${url.hostname} as user ${url.username}`);
  } catch (e) {
    console.log('DEBUG: Prisma using DATABASE_URL (unable to parse individual fields)');
  }
} else {
  console.error('CRITICAL: DATABASE_URL is NOT set in environment!');
}

const prisma = global.prisma || new PrismaClient({
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
