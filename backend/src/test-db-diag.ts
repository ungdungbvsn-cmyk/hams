import prisma from './prisma';

async function test() {
  console.log('--- Database Diagnostic Start ---');
  try {
    console.log('Attempting to connect to database...');
    const userCount = await prisma.user.count();
    console.log('Connection successful! User count:', userCount);
    
    console.log('Attempting to find an admin user...');
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' },
      include: { role: true }
    });
    
    if (admin) {
      console.log('Admin user found:', admin.username, 'Role:', admin.role.name);
    } else {
      console.log('Admin user not found.');
    }
  } catch (error: any) {
    console.error('DATABASE ERROR:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    if (error.meta) console.error('Error Meta:', error.meta);
  } finally {
    await prisma.$disconnect();
    console.log('--- Database Diagnostic End ---');
  }
}

test();
