import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

const createLookSchema = z.object({
  name: z.string().min(1),
  items: z.array(z.object({
    clothingItemId: z.string(),
    slot: z.enum(['top', 'bottom', 'shoes', 'accessories'])
  })),
  screenshot: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false)
});

router.use(auth);

router.get('/', async (req, res) => {
  const looks = await prisma.savedLook.findMany({
    where: { userId: req.userId },
    include: {
      items: {
        include: { clothingItem: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(looks);
});

router.post('/', validateRequest(createLookSchema), async (req, res) => {
  const { items, ...lookData } = req.body;

  const look = await prisma.savedLook.create({
    data: {
      ...lookData,
      userId: req.userId,
      items: {
        create: items
      }
    },
    include: {
      items: {
        include: { clothingItem: true }
      }
    }
  });

  res.json(look);
});

router.put('/:id', validateRequest(createLookSchema), async (req, res) => {
  const { items, ...lookData } = req.body;

  await prisma.lookItem.deleteMany({
    where: { lookId: req.params.id }
  });

  const look = await prisma.savedLook.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: lookData
  });

  if (look.count === 0) {
    return res.status(404).json({ error: '造型未找到' });
  }

  await prisma.lookItem.createMany({
    data: items.map((item: any) => ({ ...item, lookId: req.params.id }))
  });

  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  const look = await prisma.savedLook.deleteMany({
    where: { id: req.params.id, userId: req.userId }
  });

  if (look.count === 0) {
    return res.status(404).json({ error: '造型未找到' });
  }

  res.json({ success: true });
});

export { router as looksRouter };