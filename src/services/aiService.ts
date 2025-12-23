const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export interface BodyScanOptions {
  quality: 'low' | 'medium' | 'high';
  generateMeasurements: boolean;
  outputFormat: 'gltf' | 'obj' | 'fbx';
}

export interface ClothingGenOptions {
  category: 'tops' | 'bottoms' | 'shoes' | 'accessories';
  extractMaterial: boolean;
  generatePhysics: boolean;
}

export interface AIModelResult {
  id: string;
  vertexCount: number;
  faceCount: number;
  downloadUrl: string;
  measurements?: any;
  materials?: any[];
  category?: string;
}

export interface ServiceStatus {
  provider: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  errorRate: number;
  lastCheck: string;
}

class AIService {
  private token: string | null = null;

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
      throw new Error(error.error || '请求失败');
    }

    return response.json();
  }

  // 生成人体3D模型
  async generateBodyModel(images: File[], options: BodyScanOptions): Promise<AIModelResult> {
    const formData = new FormData();
    
    images.forEach((image, index) => {
      formData.append('images', image);
    });
    
    formData.append('quality', options.quality);
    formData.append('generateMeasurements', options.generateMeasurements.toString());
    formData.append('outputFormat', options.outputFormat);

    const result = await this.request<{ success: boolean; model: AIModelResult }>('/ai/generate-body-model', {
      method: 'POST',
      body: formData,
    });

    return result.model;
  }

  // 生成服装3D模型
  async generateClothingModel(image: File, options: ClothingGenOptions): Promise<AIModelResult> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('category', options.category);
    formData.append('extractMaterial', options.extractMaterial.toString());
    formData.append('generatePhysics', options.generatePhysics.toString());

    const result = await this.request<{ success: boolean; model: AIModelResult }>('/ai/generate-clothing-model', {
      method: 'POST',
      body: formData,
    });

    return result.model;
  }

  // 获取AI服务状态
  async getServiceStatus(): Promise<ServiceStatus[]> {
    const result = await this.request<{ services: ServiceStatus[] }>('/ai/service-status');
    return result.services;
  }

  // 下载3D模型
  async downloadModel(modelId: string): Promise<any> {
    return this.request(`/ai/models/${modelId}`);
  }

  // 批量处理状态查询
  async getBatchStatus(batchId: string): Promise<any> {
    return this.request(`/ai/batch-status/${batchId}`);
  }
}

export const aiService = new AIService();