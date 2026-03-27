import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

try {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('CRITICAL: DATABASE_URL is not set in environment variables');
  }
  
  prisma = global.prisma || new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  });
} catch (error: any) {
  console.error('FATAL: Failed to initialize PrismaClient:', error);
  // Re-throw to allow application to crash rather than run in broken state
  throw error;
}

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
