import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { auth } from '../middleware/auth.js';

const router = Router();

const upload = multer({
  memory: true,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

router.use(auth);

router.post('/image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择图片文件' });
  }

  const optimized = await sharp(req.file.buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  const base64 = `data:image/jpeg;base64,${optimized.toString('base64')}`;

  res.json({ url: base64 });
});

router.post('/avatar', upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择头像文件' });
  }

  const optimized = await sharp(req.file.buffer)
    .resize(200, 200, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toBuffer();

  const base64 = `data:image/jpeg;base64,${optimized.toString('base64')}`;

  res.json({ url: base64 });
});

export { router as uploadRouter };