import { OpenAIService } from './providers/openaiService.js';
import { ReplicateService } from './providers/replicateService.js';
import { StabilityService } from './providers/stabilityService.js';

export interface AIServiceConfig {
  provider: 'openai' | 'replicate' | 'stability';
  apiKey: string;
  endpoint: string;
  model: string;
  priority: number;
  rateLimit: {
    requests: number;
    window: number; // 毫秒
  };
  fallbackProvider?: string;
}

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

export interface BodyModel3D {
  id: string;
  vertices: Float32Array;
  faces: Uint32Array;
  normals: Float32Array;
  uvCoordinates: Float32Array;
  measurements?: BodyMeasurements;
  skeleton?: SkeletonData;
}

export interface ClothingModel3D {
  id: string;
  vertices: Float32Array;
  faces: Uint32Array;
  normals: Float32Array;
  uvCoordinates: Float32Array;
  category: string;
  materials: MaterialProperties[];
  physicsProperties?: PhysicsProperties;
}

export interface BodyMeasurements {
  height: number;
  chest: number;
  waist: number;
  hips: number;
  shoulderWidth: number;
}

export interface SkeletonData {
  bones: Bone[];
  joints: Joint[];
}

export interface Bone {
  id: string;
  name: string;
  parent?: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
}

export interface Joint {
  id: string;
  position: [number, number, number];
  type: string;
}

export interface MaterialProperties {
  name: string;
  diffuse: string;
  normal?: string;
  roughness: number;
  metallic: number;
}

export interface PhysicsProperties {
  mass: number;
  elasticity: number;
  friction: number;
  damping: number;
}

export interface ServiceStatus {
  provider: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
}

export class AIServiceGateway {
  private services: Map<string, any> = new Map();
  private configs: AIServiceConfig[] = [];
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(configs: AIServiceConfig[]) {
    this.configs = configs.sort((a, b) => a.priority - b.priority);
    this.initializeServices();
  }

  private initializeServices() {
    for (const config of this.configs) {
      switch (config.provider) {
        case 'openai':
          this.services.set(config.provider, new OpenAIService(config));
          break;
        case 'replicate':
          this.services.set(config.provider, new ReplicateService(config));
          break;
        case 'stability':
          this.services.set(config.provider, new StabilityService(config));
          break;
      }
    }
  }

  async generateBodyModel(images: File[], options: BodyScanOptions): Promise<BodyModel3D> {
    for (const config of this.configs) {
      if (!this.checkRateLimit(config.provider)) {
        continue;
      }

      try {
        const service = this.services.get(config.provider);
        if (!service) continue;

        const result = await service.generateBodyModel(images, options);
        this.updateRateLimit(config.provider);
        return result;
      } catch (error) {
        console.warn(`${config.provider} failed:`, error);
        if (config.fallbackProvider) {
          try {
            const fallbackService = this.services.get(config.fallbackProvider);
            if (fallbackService && this.checkRateLimit(config.fallbackProvider)) {
              const result = await fallbackService.generateBodyModel(images, options);
              this.updateRateLimit(config.fallbackProvider);
              return result;
            }
          } catch (fallbackError) {
            console.warn(`Fallback ${config.fallbackProvider} failed:`, fallbackError);
          }
        }
      }
    }

    throw new Error('所有AI服务都不可用');
  }

  async generateClothingModel(image: File, options: ClothingGenOptions): Promise<ClothingModel3D> {
    for (const config of this.configs) {
      if (!this.checkRateLimit(config.provider)) {
        continue;
      }

      try {
        const service = this.services.get(config.provider);
        if (!service) continue;

        const result = await service.generateClothingModel(image, options);
        this.updateRateLimit(config.provider);
        return result;
      } catch (error) {
        console.warn(`${config.provider} failed:`, error);
        if (config.fallbackProvider) {
          try {
            const fallbackService = this.services.get(config.fallbackProvider);
            if (fallbackService && this.checkRateLimit(config.fallbackProvider)) {
              const result = await fallbackService.generateClothingModel(image, options);
              this.updateRateLimit(config.fallbackProvider);
              return result;
            }
          } catch (fallbackError) {
            console.warn(`Fallback ${config.fallbackProvider} failed:`, fallbackError);
          }
        }
      }
    }

    throw new Error('所有AI服务都不可用');
  }

  async getServiceStatus(): Promise<ServiceStatus[]> {
    const statuses: ServiceStatus[] = [];

    for (const [provider, service] of this.services) {
      try {
        const start = Date.now();
        await service.healthCheck();
        const responseTime = Date.now() - start;

        statuses.push({
          provider,
          status: 'online',
          responseTime,
          errorRate: 0, // 实际应该从监控系统获取
          lastCheck: new Date()
        });
      } catch (error) {
        statuses.push({
          provider,
          status: 'offline',
          responseTime: -1,
          errorRate: 1,
          lastCheck: new Date()
        });
      }
    }

    return statuses;
  }

  private checkRateLimit(provider: string): boolean {
    const config = this.configs.find(c => c.provider === provider);
    if (!config) return false;

    const now = Date.now();
    const limit = this.rateLimits.get(provider);

    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(provider, {
        count: 0,
        resetTime: now + config.rateLimit.window
      });
      return true;
    }

    return limit.count < config.rateLimit.requests;
  }

  private updateRateLimit(provider: string) {
    const limit = this.rateLimits.get(provider);
    if (limit) {
      limit.count++;
    }
  }
}