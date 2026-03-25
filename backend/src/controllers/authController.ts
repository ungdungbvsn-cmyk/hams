import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { logActivity } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'hams_super_secret_key_change_me_in_prod';

export const login = async (req: Request, res: Response): Promise<any> => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true, employee: true, departments: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Support for the unhashed seeded password
    let isMatch = false;
    if (user.password === 'password123' && password === 'password123') {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role.name,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    // Log Login
    await logActivity(user.id, 'LOGIN', 'AUTHENTICATION', { username: user.username });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        employee: user.employee,
        permissions: (user as any).permissions,
        departments: (user as any).departments,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getMe = async (req: any, res: Response): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true, employee: true, departments: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      employee: user.employee,
      permissions: (user as any).permissions,
      departments: (user as any).departments,
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const changePassword = async (req: any, res: Response): Promise<any> => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.userId;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Mật khẩu cũ và mật khẩu mới là bắt buộc.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại.' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch && !(user.password === 'password123' && oldPassword === 'password123')) {
      return res.status(401).json({ error: 'Mật khẩu cũ không chính xác.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await logActivity(userId, 'CHANGE_PASSWORD', 'AUTHENTICATION', { username: user.username });

    res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
