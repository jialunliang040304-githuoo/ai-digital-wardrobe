import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

const createClothingSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['tops', 'bottoms', 'shoes', 'accessories']),
  type: z.string(),
  meshData: z.string().optional(),
  texture: z.string().optional(),
  tags: z.array(z.string()).default([])
});

router.use(auth);

router.get('/', async (req, res) => {
  const { category, search } = req.query;
  
  const items = await prisma.clothingItem.findMany({
    where: {
      userId: req.userId,
      ...(category && { category: category as string }),
      ...(search && {
        OR: [
          { name: { contains: search as string } },
          { tags: { has: search as string } }
        ]
      })
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(items);
});

router.post('/', validateRequest(createClothingSchema), async (req, res) => {
  const item = await prisma.clothingItem.create({
    data: { ...req.body, userId: req.userId }
  });

  res.json(item);
});

router.put('/:id', validateRequest(createClothingSchema), async (req, res) => {
  const item = await prisma.clothingItem.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: req.body
  });

  if (item.count === 0) {
    return res.status(404).json({ error: '服装物品未找到' });
  }

  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  const item = await prisma.clothingItem.deleteMany({
    where: { id: req.params.id, userId: req.userId }
  });

  if (item.count === 0) {
    return res.status(404).json({ error: '服装物品未找到' });
  }

  res.json({ success: true });
});

export { router as clothingRouter };