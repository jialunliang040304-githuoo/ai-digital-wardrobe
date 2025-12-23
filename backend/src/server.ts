import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { clothingRouter } from './routes/clothing.js';
import { looksRouter } from './routes/looks.js';
import { feedRouter } from './routes/feed.js';
import { uploadRouter } from './routes/upload.js';
import { aiRouter } from './routes/ai.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

const app = express();
const prisma = new PrismaClient();

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/clothing', clothingRouter);
app.use('/api/looks', looksRouter);
app.use('/api/feed', feedRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/ai', aiRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { prisma };