/**
 * AI服务 - 支持高斯泼溅和Luma AI
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export interface BodyScanOptions {
  quality: 'low' | 'medium' | 'high';
  generateMeasurements: boolean;
  outputFormat: 'gltf' | 'obj' | 'fbx' | 'splat' | 'ply';
  method: 'image' | 'video' | 'gaussian_splatting' | 'luma';
}

export interface ClothingGenOptions {
  category: 'tops' | 'bottoms' | 'shoes' | 'accessories';
  extractMaterial: boolean;
  generatePhysics: boolean;
  method: 'image' | 'video' | 'gaussian_splatting' | 'luma';
}

export interface AIModelResult {
  id: string;
  type: 'mesh' | 'gaussian_splatting' | 'nerf';
  vertexCount: number;
  faceCount: number;
  pointCount?: number;  // 高斯泼溅点数
  downloadUrl: string;
  splatUrl?: string;    // .splat文件URL
  plyUrl?: string;      // .ply文件URL
  previewUrl?: string;
  measurements?: any;
  materials?: any[];
  category?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
}

export interface ServiceStatus {
  provider: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  errorRate: number;
  lastCheck: string;
  capabilities?: string[];
}

export interface GaussianSplattingTask {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime?: number;
  result?: AIModelResult;
}

class AIService {
  private token: string | null = null;
  private pollingTasks: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '网络错误' }));
      throw new Error(error.error || error.message || '请求失败');
    }

    return response.json();
  }

  /**
   * 从图片生成人体3D模型
   */
  async generateBodyModel(images: File[], options: BodyScanOptions): Promise<AIModelResult> {
    const formData = new FormData();
    
    images.forEach((image) => {
      formData.append('images', image);
    });
    
    formData.append('quality', options.quality);
    formData.append('generateMeasurements', options.generateMeasurements.toString());
    formData.append('outputFormat', options.outputFormat);
    formData.append('method', options.method || 'image');

    const result = await this.request<{ success: boolean; model: AIModelResult; message?: string }>('/ai/generate-body-model', {
      method: 'POST',
      body: formData,
    });

    return result.model;
  }

  /**
   * 从视频生成人体3D高斯泼溅模型
   */
  async generateBodyFromVideo(video: Blob, options: Partial<BodyScanOptions> = {}): Promise<GaussianSplattingTask> {
    const formData = new FormData();
    formData.append('video', video, 'capture.webm');
    formData.append('method', 'gaussian_splatting');
    formData.append('quality', options.quality || 'medium');

    const result = await this.request<{ success: boolean; task: GaussianSplattingTask }>('/ai/generate-body-gaussian', {
      method: 'POST',
      body: formData,
    });

    return result.task;
  }

  /**
   * 从图片生成服装3D模型
   */
  async generateClothingModel(image: File, options: ClothingGenOptions): Promise<AIModelResult> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('category', options.category);
    formData.append('extractMaterial', options.extractMaterial.toString());
    formData.append('generatePhysics', options.generatePhysics.toString());
    formData.append('method', options.method || 'image');

    const result = await this.request<{ success: boolean; model: AIModelResult; message?: string }>('/ai/generate-clothing-model', {
      method: 'POST',
      body: formData,
    });

    return result.model;
  }

  /**
   * 从视频生成服装3D高斯泼溅模型
   */
  async generateClothingFromVideo(video: Blob, category: string): Promise<GaussianSplattingTask> {
    const formData = new FormData();
    formData.append('video', video, 'capture.webm');
    formData.append('category', category);
    formData.append('method', 'gaussian_splatting');

    const result = await this.request<{ success: boolean; task: GaussianSplattingTask }>('/ai/generate-clothing-gaussian', {
      method: 'POST',
      body: formData,
    });

    return result.task;
  }

  /**
   * 使用Luma AI生成3D模型
   */
  async generateWithLuma(images: File[], type: 'body' | 'clothing'): Promise<GaussianSplattingTask> {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    formData.append('type', type);
    formData.append('provider', 'luma');

    const result = await this.request<{ success: boolean; task: GaussianSplattingTask }>('/ai/generate-luma', {
      method: 'POST',
      body: formData,
    });

    return result.task;
  }

  /**
   * 查询任务状态
   */
  async getTaskStatus(taskId: string): Promise<GaussianSplattingTask> {
    return this.request<GaussianSplattingTask>(`/ai/tasks/${taskId}`);
  }

  /**
   * 轮询任务直到完成
   */
  async waitForTask(
    taskId: string, 
    onProgress?: (progress: number) => void,
    maxWaitMs = 600000
  ): Promise<AIModelResult> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      const task = await this.getTaskStatus(taskId);
      
      if (onProgress) {
        onProgress(task.progress);
      }
      
      if (task.status === 'completed' && task.result) {
        return task.result;
      } else if (task.status === 'failed') {
        throw new Error('3D模型生成失败');
      }
      
      // 等待5秒后重试
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw new Error('3D模型生成超时');
  }

  /**
   * 获取AI服务状态
   */
  async getServiceStatus(): Promise<ServiceStatus[]> {
    const result = await this.request<{ services: ServiceStatus[]; configured: boolean }>('/ai/service-status');
    return result.services;
  }

  /**
   * 测试AI服务连接
   */
  async testConnection(): Promise<{ available: boolean; message: string }> {
    try {
      const result = await this.request<{ success: boolean; aiServiceAvailable: boolean; message: string }>('/ai/test');
      return {
        available: result.aiServiceAvailable,
        message: result.message
      };
    } catch (error) {
      return {
        available: false,
        message: error instanceof Error ? error.message : '连接失败'
      };
    }
  }

  /**
   * 下载3D模型
   */
  async downloadModel(modelId: string): Promise<any> {
    return this.request(`/ai/models/${modelId}`);
  }

  /**
   * 将高斯泼溅模型转换为Mesh
   */
  async convertSplatToMesh(splatUrl: string): Promise<string> {
    const result = await this.request<{ meshUrl: string }>('/ai/convert-splat-to-mesh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ splatUrl })
    });
    return result.meshUrl;
  }

  /**
   * 清理轮询任务
   */
  cleanup() {
    this.pollingTasks.forEach(timer => clearTimeout(timer));
    this.pollingTasks.clear();
  }
}

export const aiService = new AIService();
