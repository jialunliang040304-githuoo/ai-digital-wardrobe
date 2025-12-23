import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error.message === '只允许上传图片文件') {
    return res.status(400).json({ error: error.message });
  }

  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};