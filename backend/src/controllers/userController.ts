import { Request, Response } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true, employee: true, departments: true },
      orderBy: { createdAt: 'desc' },
    });
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(usersWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { role: true, employee: true, departments: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, roleId, employeeId, permissions, departments } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        roleId: Number(roleId),
        employee: employeeId ? { connect: { id: Number(employeeId) } } : undefined,
        permissions: permissions || undefined,
        departments: departments?.length ? { connect: departments.map((id: number) => ({ id })) } : undefined,
      },
      include: { role: true, employee: true, departments: true },
    });
    
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password, roleId, employeeId, permissions, departments } = req.body;

    const data: any = { };
    if (password) data.password = await bcrypt.hash(password, 10);
    if (roleId) data.roleId = Number(roleId);
    if (employeeId) data.employee = { connect: { id: Number(employeeId) } };
    if (employeeId === null) data.employee = { disconnect: true };
    if (permissions !== undefined) data.permissions = permissions;
    if (departments !== undefined) {
      data.departments = { set: departments.map((id: number) => ({ id })) };
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
      include: { role: true, employee: true, departments: true },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
