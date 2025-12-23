import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { AIServiceGateway } from '../services/aiServiceGateway.js';
import { getAvailableServices } from '../config/aiConfig.js';

const router = Router();

// 配置文件上传
const upload = multer({
  memory: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('只支持图片和视频文件'));
    }
  }
});

// 初始化AI服务网关
const aiGateway = new AIServiceGateway(getAvailableServices());

// 验证模式
const bodyScanSchema = z.object({
  quality: z.enum(['low', 'medium', 'high']).default('medium'),
  generateMeasurements: z.boolean().default(true),
  outputFormat: z.enum(['gltf', 'obj', 'fbx']).default('gltf')
});

const clothingGenSchema = z.object({
  category: z.enum(['tops', 'bottoms', 'shoes', 'accessories']),
  extractMaterial: z.boolean().default(true),
  generatePhysics: z.boolean().default(true)
});

router.use(auth);

// 人体3D模型生成
router.post('/generate-body-model', 
  upload.array('images', 10),
  validateRequest(bodyScanSchema),
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: '请上传至少一张图片' });
      }

      const options = req.body;
      
      // 转换为File对象
      const imageFiles = files.map(file => 
        new File([file.buffer], file.originalname, { type: file.mimetype })
      );

      const bodyModel = await aiGateway.generateBodyModel(imageFiles, options);
      
      res.json({
        success: true,
        model: {
          id: bodyModel.id,
          vertexCount: bodyModel.vertices.length / 3,
          faceCount: bodyModel.faces.length / 3,
          measurements: bodyModel.measurements,
          downloadUrl: `/api/ai/models/${bodyModel.id}`
        }
      });
    } catch (error) {
      console.error('人体模型生成失败:', error);
      res.status(500).json({ 
        error: '模型生成失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
);

// 服装3D模型生成
router.post('/generate-clothing-model',
  upload.single('image'),
  validateRequest(clothingGenSchema),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: '请上传服装图片' });
      }

      const options = req.body;
      
      const imageFile = new File([file.buffer], file.originalname, { type: file.mimetype });
      const clothingModel = await aiGateway.generateClothingModel(imageFile, options);
      
      res.json({
        success: true,
        model: {
          id: clothingModel.id,
          category: clothingModel.category,
          vertexCount: clothingModel.vertices.length / 3,
          faceCount: clothingModel.faces.length / 3,
          materials: clothingModel.materials,
          downloadUrl: `/api/ai/models/${clothingModel.id}`
        }
      });
    } catch (error) {
      console.error('服装模型生成失败:', error);
      res.status(500).json({ 
        error: '模型生成失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
);

// 获取AI服务状态
router.get('/service-status', async (req, res) => {
  try {
    const statuses = await aiGateway.getServiceStatus();
    res.json({ services: statuses });
  } catch (error) {
    console.error('获取服务状态失败:', error);
    res.status(500).json({ error: '获取服务状态失败' });
  }
});

// 模型下载端点（简化版本）
router.get('/models/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 这里应该从数据库或文件系统获取模型数据
    // 暂时返回示例数据
    res.json({
      id,
      format: 'gltf',
      data: {
        vertices: [],
        faces: [],
        normals: [],
        uvCoordinates: []
      },
      metadata: {
        createdAt: new Date(),
        userId: req.userId
      }
    });
  } catch (error) {
    console.error('模型下载失败:', error);
    res.status(500).json({ error: '模型下载失败' });
  }
});

// 批量处理状态查询
router.get('/batch-status/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // 这里应该查询批量处理状态
    // 暂时返回示例数据
    res.json({
      batchId,
      status: 'processing',
      progress: 0.6,
      completed: 3,
      total: 5,
      results: []
    });
  } catch (error) {
    console.error('查询批量状态失败:', error);
    res.status(500).json({ error: '查询状态失败' });
  }
});

export { router as aiRouter };