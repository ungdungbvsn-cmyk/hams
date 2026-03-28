import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var prisma: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

let poolConfig: any = {
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.cvpzrimpdbputhapanjf',
  password: 'HamsDatabase2024',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
};

if (databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    poolConfig = {
      host: url.hostname,
      port: parseInt(url.port),
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.substring(1),
      ssl: { rejectUnauthorized: false },
    };
    console.log('Using database configuration from DATABASE_URL');
  } catch (e) {
    console.error('Failed to parse DATABASE_URL, falling back to hardcoded config', e);
  }
}

const pool = new Pool(poolConfig);
// @ts-ignore
const adapter = new PrismaPg(pool as any);

const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
