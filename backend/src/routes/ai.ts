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

// ============ 高斯泼溅 & Luma AI 端点 ============

// 存储任务状态
const taskStore = new Map<string, any>();

// 从视频生成人体高斯泼溅模型
router.post('/generate-body-gaussian',
  upload.single('video'),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: '请上传视频文件' });
      }

      const taskId = `gs_body_${Date.now()}`;
      
      // 创建任务
      const task = {
        id: taskId,
        type: 'body',
        method: 'gaussian_splatting',
        status: 'processing',
        progress: 0,
        createdAt: new Date().toISOString()
      };
      
      taskStore.set(taskId, task);

      // 模拟处理进度
      simulateGaussianProcessing(taskId, 'body');

      res.json({
        success: true,
        task: {
          id: taskId,
          status: 'processing',
          progress: 0,
          estimatedTime: 300 // 预计5分钟
        }
      });
    } catch (error) {
      console.error('高斯泼溅生成失败:', error);
      res.status(500).json({ 
        error: '模型生成失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
);

// 从视频生成服装高斯泼溅模型
router.post('/generate-clothing-gaussian',
  upload.single('video'),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: '请上传视频文件' });
      }

      const taskId = `gs_clothing_${Date.now()}`;
      const category = req.body.category || 'tops';
      
      const task = {
        id: taskId,
        type: 'clothing',
        category,
        method: 'gaussian_splatting',
        status: 'processing',
        progress: 0,
        createdAt: new Date().toISOString()
      };
      
      taskStore.set(taskId, task);

      // 模拟处理进度
      simulateGaussianProcessing(taskId, 'clothing');

      res.json({
        success: true,
        task: {
          id: taskId,
          status: 'processing',
          progress: 0,
          estimatedTime: 180 // 预计3分钟
        }
      });
    } catch (error) {
      console.error('高斯泼溅生成失败:', error);
      res.status(500).json({ 
        error: '模型生成失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
);

// 使用Luma AI生成3D模型
router.post('/generate-luma',
  upload.array('images', 50),
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: '请上传图片' });
      }

      const taskId = `luma_${Date.now()}`;
      const type = req.body.type || 'body';
      
      const task = {
        id: taskId,
        type,
        method: 'luma',
        status: 'processing',
        progress: 0,
        imageCount: files.length,
        createdAt: new Date().toISOString()
      };
      
      taskStore.set(taskId, task);

      // 模拟Luma处理
      simulateLumaProcessing(taskId, type);

      res.json({
        success: true,
        task: {
          id: taskId,
          status: 'processing',
          progress: 0,
          estimatedTime: 600 // 预计10分钟
        }
      });
    } catch (error) {
      console.error('Luma AI生成失败:', error);
      res.status(500).json({ 
        error: '模型生成失败',
        message: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
);

// 查询任务状态
router.get('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = taskStore.get(taskId);
    
    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('查询任务状态失败:', error);
    res.status(500).json({ error: '查询失败' });
  }
});

// 将高斯泼溅转换为Mesh
router.post('/convert-splat-to-mesh', async (req, res) => {
  try {
    const { splatUrl } = req.body;
    
    if (!splatUrl) {
      return res.status(400).json({ error: '请提供splat文件URL' });
    }

    // 模拟转换
    const meshUrl = splatUrl.replace('.splat', '.glb').replace('.ply', '.glb');
    
    res.json({
      success: true,
      meshUrl
    });
  } catch (error) {
    console.error('转换失败:', error);
    res.status(500).json({ error: '转换失败' });
  }
});

// 模拟高斯泼溅处理进度
function simulateGaussianProcessing(taskId: string, type: string) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      const task = taskStore.get(taskId);
      if (task) {
        task.status = 'completed';
        task.progress = 100;
        task.result = {
          id: taskId,
          type: 'gaussian_splatting',
          vertexCount: 0,
          faceCount: 0,
          pointCount: Math.floor(Math.random() * 500000) + 100000,
          downloadUrl: `/api/ai/models/${taskId}.glb`,
          splatUrl: `/api/ai/models/${taskId}.splat`,
          plyUrl: `/api/ai/models/${taskId}.ply`,
          previewUrl: `https://via.placeholder.com/400x400?text=3D+${type}`,
          status: 'completed'
        };
        taskStore.set(taskId, task);
      }
    } else {
      const task = taskStore.get(taskId);
      if (task) {
        task.progress = Math.round(progress);
        taskStore.set(taskId, task);
      }
    }
  }, 3000); // 每3秒更新一次
}

// 模拟Luma处理进度
function simulateLumaProcessing(taskId: string, type: string) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      const task = taskStore.get(taskId);
      if (task) {
        task.status = 'completed';
        task.progress = 100;
        task.result = {
          id: taskId,
          type: 'gaussian_splatting',
          vertexCount: Math.floor(Math.random() * 50000) + 10000,
          faceCount: Math.floor(Math.random() * 25000) + 5000,
          pointCount: Math.floor(Math.random() * 1000000) + 200000,
          downloadUrl: `/api/ai/models/${taskId}.glb`,
          splatUrl: `/api/ai/models/${taskId}.splat`,
          previewUrl: `https://via.placeholder.com/400x400?text=Luma+${type}`,
          status: 'completed'
        };
        taskStore.set(taskId, task);
      }
    } else {
      const task = taskStore.get(taskId);
      if (task) {
        task.progress = Math.round(progress);
        taskStore.set(taskId, task);
      }
    }
  }, 5000); // 每5秒更新一次
}

export { router as aiRouter };