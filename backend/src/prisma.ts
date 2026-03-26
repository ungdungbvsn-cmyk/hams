import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();
// Original adapter logic (causing DriverAdapterError on Render)
// const connectionString = process.env.DATABASE_URL;
// const pool = new Pool({ connectionString });
// const adapter = new PrismaPg(pool as any);
// const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
