import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

const createPostSchema = z.object({
  lookId: z.string(),
  caption: z.string().optional()
});

router.use(auth);

router.get('/', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const posts = await prisma.feedPost.findMany({
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      look: {
        include: {
          items: { include: { clothingItem: true } }
        }
      },
      likes: { where: { userId: req.userId } },
      _count: { select: { likes: true } }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: Number(limit)
  });

  const formattedPosts = posts.map(post => ({
    ...post,
    isLiked: post.likes.length > 0,
    likesCount: post._count.likes,
    likes: undefined,
    _count: undefined
  }));

  res.json(formattedPosts);
});

router.post('/', validateRequest(createPostSchema), async (req, res) => {
  const look = await prisma.savedLook.findFirst({
    where: { id: req.body.lookId, userId: req.userId }
  });

  if (!look) {
    return res.status(404).json({ error: '造型未找到' });
  }

  const post = await prisma.feedPost.create({
    data: {
      ...req.body,
      userId: req.userId
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      look: {
        include: {
          items: { include: { clothingItem: true } }
        }
      }
    }
  });

  res.json(post);
});

router.post('/:id/like', async (req, res) => {
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: req.userId,
        postId: req.params.id
      }
    }
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id }
    });
    res.json({ liked: false });
  } else {
    await prisma.like.create({
      data: {
        userId: req.userId,
        postId: req.params.id
      }
    });
    res.json({ liked: true });
  }
});

export { router as feedRouter };