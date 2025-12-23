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
  tags: z.array(z.string()).default([]).transform(tags => tags.join(',')),
  isPublic: z.boolean().default(false)
});

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const looks = await prisma.savedLook.findMany({
      where: { userId: req.userId },
      include: {
        items: {
          include: { clothingItem: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 转换tags字符串为数组
    const looksWithArrayTags = looks.map(look => ({
      ...look,
      tags: look.tags ? look.tags.split(',').filter(tag => tag.trim()) : [],
      items: look.items.map(item => ({
        ...item,
        clothingItem: {
          ...item.clothingItem,
          tags: item.clothingItem.tags ? item.clothingItem.tags.split(',').filter(tag => tag.trim()) : []
        }
      }))
    }));

    res.json(looksWithArrayTags);
  } catch (error) {
    console.error('获取造型列表失败:', error);
    res.status(500).json({ error: '获取造型列表失败' });
  }
});

router.post('/', validateRequest(createLookSchema), async (req, res) => {
  try {
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

    // 转换tags字符串为数组返回
    const lookWithArrayTags = {
      ...look,
      tags: look.tags ? look.tags.split(',').filter(tag => tag.trim()) : [],
      items: look.items.map(item => ({
        ...item,
        clothingItem: {
          ...item.clothingItem,
          tags: item.clothingItem.tags ? item.clothingItem.tags.split(',').filter(tag => tag.trim()) : []
        }
      }))
    };

    res.json(lookWithArrayTags);
  } catch (error) {
    console.error('创建造型失败:', error);
    res.status(500).json({ error: '创建造型失败' });
  }
});

router.put('/:id', validateRequest(createLookSchema), async (req, res) => {
  try {
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
  } catch (error) {
    console.error('更新造型失败:', error);
    res.status(500).json({ error: '更新造型失败' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const look = await prisma.savedLook.deleteMany({
      where: { id: req.params.id, userId: req.userId }
    });

    if (look.count === 0) {
      return res.status(404).json({ error: '造型未找到' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('删除造型失败:', error);
    res.status(500).json({ error: '删除造型失败' });
  }
});

export { router as looksRouter };