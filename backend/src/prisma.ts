import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const DATABASE_URL = 'postgresql://postgres.cvpzrimpdbputhapanjf:Sn123456%23@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1';
process.env.DATABASE_URL = DATABASE_URL;

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
