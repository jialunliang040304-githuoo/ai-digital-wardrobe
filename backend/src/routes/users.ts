import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

const updateBodyMeasurementSchema = z.object({
  height: z.number().positive(),
  chest: z.number().positive(),
  waist: z.number().positive(),
  hips: z.number().positive(),
  shoulderWidth: z.number().positive(),
  pose: z.enum(['A-pose', 'T-pose']).default('A-pose'),
  meshData: z.string().optional()
});

router.use(auth);

router.get('/me', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      bodyMeasurements: true,
      _count: {
        select: {
          savedLooks: true,
          followers: true,
          follows: true
        }
      }
    }
  });

  res.json(user);
});

router.put('/body-measurements', validateRequest(updateBodyMeasurementSchema), async (req, res) => {
  const measurements = await prisma.bodyMeasurement.upsert({
    where: { userId: req.userId },
    update: req.body,
    create: { ...req.body, userId: req.userId }
  });

  res.json(measurements);
});

router.get('/stats', async (req, res) => {
  const stats = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      _count: {
        select: {
          savedLooks: true,
          clothingItems: true,
          feedPosts: true,
          followers: true,
          follows: true
        }
      }
    }
  });

  res.json(stats?._count || {});
});

export { router as usersRouter };