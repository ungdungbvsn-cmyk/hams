import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const dbUrl = process.env.DATABASE_URL;

const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
  log: ['error', 'warn'],
});

if (dbUrl) {
  try {
    const url = new URL(dbUrl);
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
