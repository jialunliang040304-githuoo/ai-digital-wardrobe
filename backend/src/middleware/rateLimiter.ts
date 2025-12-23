import { Request, Response, NextFunction } from 'express';

const requests = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15分钟
  const maxRequests = 100;

  const clientData = requests.get(ip);

  if (!clientData || now > clientData.resetTime) {
    requests.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (clientData.count >= maxRequests) {
    return res.status(429).json({
      error: '请求过于频繁，请稍后再试'
    });
  }

  clientData.count++;
  next();
};