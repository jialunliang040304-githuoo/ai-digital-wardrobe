import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { validateRequest } from '../middleware/validation.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

router.post('/register', validateRequest(registerSchema), async (req, res) => {
  const { email, username, password } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] }
  });

  if (existingUser) {
    return res.status(400).json({ error: '用户已存在' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, username, password: hashedPassword },
    select: { id: true, email: true, username: true, avatar: true }
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

  res.json({ user, token });
});

router.post('/login', validateRequest(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: '邮箱或密码错误' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

  res.json({
    user: { id: user.id, email: user.email, username: user.username, avatar: user.avatar },
    token
  });
});

export { router as authRouter };