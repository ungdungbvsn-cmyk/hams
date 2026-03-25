import prisma from '../src/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Start seeding...');

  try {
    // Create Asset Statuses
    const statuses = [
      { matt: 0, tentt: 'Hoạt động' },
      { matt: 1, tentt: 'Hỏng' },
      { matt: 2, tentt: 'Ngừng hoạt động/Chờ thanh lý' },
      { matt: 3, tentt: 'Mới nhập/Chờ lắp đặt' },
      { matt: 4, tentt: 'Đang bảo trì/Sửa chữa' },
      { matt: 5, tentt: 'Chờ kiểm định/Hiệu chuẩn' },
      { matt: 6, tentt: 'Đang cho mượn/Đang gửi' },
    ];
    for (const st of statuses) {
      await prisma.assetStatus.upsert({
        where: { matt: st.matt },
        update: { tentt: st.tentt },
        create: st,
      });
    }

    // Create Roles
    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN', description: 'Administrator with full access' },
    });

    await prisma.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: { name: 'USER', description: 'Regular staff member' },
    });

    // Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { username: 'admin' },
      update: { password: hashedPassword, roleId: adminRole.id },
      create: {
        username: 'admin',
        password: hashedPassword,
        roleId: adminRole.id,
      },
    });

    // Create Departments
    await prisma.department.upsert({
      where: { name: 'IT' },
      update: {},
      create: { name: 'IT', description: 'Information Technology' },
    });

    // Create Equipment Types
    await prisma.equipmentType.upsert({
      where: { code: 'MAY-X-QUANG' },
      update: {},
      create: { code: 'MAY-X-QUANG', name: 'Máy X-Quang' },
    });

    await prisma.equipmentType.upsert({
      where: { code: 'LAPTOP' },
      update: {},
      create: { code: 'LAPTOP', name: 'Máy tính xách tay' },
    });

    console.log('Seeding finished.');
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
