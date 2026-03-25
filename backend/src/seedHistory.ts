import prisma from './prisma';

async function seedHistory() {
  const employees = await prisma.employee.findMany();
  console.log(`Found ${employees.length} employees to seed history.`);

  for (const emp of employees) {
    const existing = await prisma.departmentHistory.findFirst({
      where: { employeeId: emp.id }
    });

    if (!existing) {
      await prisma.departmentHistory.create({
        data: {
          employeeId: emp.id,
          departmentId: emp.departmentId,
          startDate: emp.startDate || new Date('2000-01-01'), // Default if unknown
        }
      });
      console.log(`Seeded history for employee ${emp.fullName}`);
    }
  }
  process.exit(0);
}

seedHistory();
