import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function reset() {
  const hash = await bcrypt.hash('admin123', 10);
  
  const exist = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (exist) {
    await prisma.user.update({
      where: { username: 'admin' },
      data: { password: hash }
    });
    console.log('Successfully reset password to admin123 for existing admin');
  } else {
    const role = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
    if (role) {
      await prisma.user.create({
        data: { username: 'admin', password: hash, roleId: role.id }
      });
      console.log('Successfully created new admin with password admin123');
    }
  }
}
reset().catch(console.error).finally(() => prisma.$disconnect());
