import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { auth, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { AIServiceGateway } from '../services/aiServiceGateway.js';
import { getAvailableServices } from '../config/aiConfig.js';

const router = Router();

// 配置文件上传
const upload = multer({
  storage: multer.memoryStorage(),
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
let aiGateway: AIServiceGateway | null = null;
try {
  const services = getAvailableServices();
  if (services.length > 0) {
    aiGateway = new AIServiceGateway(services);
  }
} catch (error) {
  console.warn('AI服务初始化失败，将使用模拟模式:', error);
}

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

router.use(optionalAuth);

// 测试端点 - 检查AI服务是否可用
router.get('/test', async (req, res) => {
  res.json({
    success: true,
    aiServiceAvailable: aiGateway !== null,
    message: aiGateway ? 'AI服务已就绪' : 'AI服务未配置，请设置API密钥',
    requiredEnvVars: [
      'REPLICATE_API_TOKEN',
      'STABILITY_API_KEY',
      'OPENAI_API_KEY'
    ],
    documentation: '/AI_IMPLEMENTATION_GUIDE.md'
  });
});

// 模拟生成函数 - 当没有配置真实API时使用
const generateMockModel = (type: 'body' | 'clothing', category?: string) => {
  const id = `mock_${type}_${Date.now()}`;
  return {
    id,
    success: true,
    model: {
      id,
      type,
      category: category || 'general',
      vertexCount: Math.floor(Math.random() * 10000) + 5000,
      faceCount: Math.floor(Math.random() * 5000) + 2500,
      materials: [{ name: 'default', color: '#cccccc' }],
      downloadUrl: `/api/ai/models/${id}`,
      previewUrl: `https://via.placeholder.com/400x400?text=${type}+Model`,
      createdAt: new Date().toISOString()
    },
    message: 'AI服务未配置，返回模拟数据。请配置REPLICATE_API_TOKEN以启用真实AI功能。'
  };
};

// 人体3D模型生成
router.post('/generate-body-model', 
  upload.array('images', 10),
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: '请上传至少一张图片' });
      }

      // 如果没有配置AI服务，返回模拟数据
      if (!aiGateway) {
        return res.json(generateMockModel('body'));
      }

      const options = {
        quality: (req.body.quality || 'medium') as 'low' | 'medium' | 'high',
        generateMeasurements: req.body.generateMeasurements !== 'false',
        outputFormat: (req.body.outputFormat || 'gltf') as 'gltf' | 'obj' | 'fbx'
      };
      
      // 转换为File对象
      const imageFiles = files.map(file => 
        new File([new Uint8Array(file.buffer)], file.originalname, { type: file.mimetype })
      );

      const bodyModel = await aiGateway.generateBodyModel(imageFiles, options);
      
      res.json({
        success: true,
        model: {
          id: bodyModel.id,
          vertexCount: bodyModel.vertices?.length ? bodyModel.vertices.length / 3 : 0,
          faceCount: bodyModel.faces?.length ? bodyModel.faces.length / 3 : 0,
          measurements: (bodyModel as any).measurements,
          downloadUrl: (bodyModel as any).downloadUrl || `/api/ai/models/${bodyModel.id}`
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
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: '请上传服装图片' });
      }

      // 如果没有配置AI服务，返回模拟数据
      if (!aiGateway) {
        return res.json(generateMockModel('clothing', req.body.category));
      }

      const options = {
        category: (req.body.category || 'tops') as 'tops' | 'bottoms' | 'shoes' | 'accessories',
        extractMaterial: req.body.extractMaterial !== 'false',
        generatePhysics: req.body.generatePhysics !== 'false'
      };
      
      const imageFile = new File([new Uint8Array(file.buffer)], file.originalname, { type: file.mimetype });
      const clothingModel = await aiGateway.generateClothingModel(imageFile, options);
      
      res.json({
        success: true,
        model: {
          id: clothingModel.id,
          category: clothingModel.category,
          vertexCount: clothingModel.vertices?.length ? clothingModel.vertices.length / 3 : 0,
          faceCount: clothingModel.faces?.length ? clothingModel.faces.length / 3 : 0,
          materials: clothingModel.materials,
          downloadUrl: (clothingModel as any).downloadUrl || `/api/ai/models/${clothingModel.id}`
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
    if (!aiGateway) {
      return res.json({
        services: [],
        configured: false,
        message: 'AI服务未配置。请在backend/.env中设置REPLICATE_API_TOKEN'
      });
    }
    
    const statuses = await aiGateway.getServiceStatus();
    res.json({ 
      services: statuses,
      configured: true
    });
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