import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

async function test() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('Testing standard PrismaClient (no adapter)...');
    const userCount = await prisma.user.count();
    console.log('Success! User count:', userCount);
  } catch (error: any) {
    console.error('FAILED:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
