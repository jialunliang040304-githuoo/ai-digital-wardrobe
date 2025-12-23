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
  tags: z.array(z.string()).default([]).transform(tags => tags.join(','))
});

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let whereClause: any = {
      userId: req.userId
    };

    if (category) {
      whereClause.category = category as string;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { tags: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const items = await prisma.clothingItem.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    // 转换tags字符串为数组
    const itemsWithArrayTags = items.map(item => ({
      ...item,
      tags: item.tags ? item.tags.split(',').filter(tag => tag.trim()) : []
    }));

    res.json(itemsWithArrayTags);
  } catch (error) {
    console.error('获取服装列表失败:', error);
    res.status(500).json({ error: '获取服装列表失败' });
  }
});

router.post('/', validateRequest(createClothingSchema), async (req, res) => {
  try {
    const item = await prisma.clothingItem.create({
      data: { ...req.body, userId: req.userId }
    });

    // 转换tags字符串为数组返回
    const itemWithArrayTags = {
      ...item,
      tags: item.tags ? item.tags.split(',').filter(tag => tag.trim()) : []
    };

    res.json(itemWithArrayTags);
  } catch (error) {
    console.error('创建服装失败:', error);
    res.status(500).json({ error: '创建服装失败' });
  }
});

router.put('/:id', validateRequest(createClothingSchema), async (req, res) => {
  try {
    const item = await prisma.clothingItem.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: req.body
    });

    if (item.count === 0) {
      return res.status(404).json({ error: '服装物品未找到' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('更新服装失败:', error);
    res.status(500).json({ error: '更新服装失败' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await prisma.clothingItem.deleteMany({
      where: { id: req.params.id, userId: req.userId }
    });

    if (item.count === 0) {
      return res.status(404).json({ error: '服装物品未找到' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('删除服装失败:', error);
    res.status(500).json({ error: '删除服装失败' });
  }
});

export { router as clothingRouter };