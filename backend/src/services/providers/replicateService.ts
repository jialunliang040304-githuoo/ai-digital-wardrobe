import { AIServiceConfig, BodyModel3D, ClothingModel3D, BodyScanOptions, ClothingGenOptions } from '../aiServiceGateway.js';

export class ReplicateService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async generateBodyModel(images: File[], options: BodyScanOptions): Promise<BodyModel3D> {
    // 使用Replicate的3D重建模型
    const prediction = await this.createPrediction('body-reconstruction', {
      images: await this.convertImagesToBase64(images),
      quality: options.quality,
      generate_measurements: options.generateMeasurements
    });

    const result = await this.waitForPrediction(prediction.id);
    return this.parseBodyModel(result);
  }

  async generateClothingModel(image: File, options: ClothingGenOptions): Promise<ClothingModel3D> {
    const prediction = await this.createPrediction('clothing-3d-gen', {
      image: await this.convertImageToBase64(image),
      category: options.category,
      extract_material: options.extractMaterial,
      generate_physics: options.generatePhysics
    });

    const result = await this.waitForPrediction(prediction.id);
    return this.parseClothingModel(result, options);
  }

  async healthCheck(): Promise<void> {
    const response = await fetch(`${this.config.endpoint}/models`, {
      headers: {
        'Authorization': `Token ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Replicate服务不可用: ${response.status}`);
    }
  }

  private async createPrediction(model: string, input: any): Promise<any> {
    const response = await fetch(`${this.config.endpoint}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: this.config.model,
        input
      })
    });

    if (!response.ok) {
      throw new Error(`Replicate API错误: ${response.status}`);
    }

    return response.json();
  }

  private async waitForPrediction(predictionId: string): Promise<any> {
    let attempts = 0;
    const maxAttempts = 60; // 最多等待5分钟

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.config.endpoint}/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`获取预测结果失败: ${response.status}`);
      }

      const prediction = await response.json();

      if (prediction.status === 'succeeded') {
        return prediction.output;
      } else if (prediction.status === 'failed') {
        throw new Error(`预测失败: ${prediction.error}`);
      }

      // 等待5秒后重试
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('预测超时');
  }

  private async convertImagesToBase64(images: File[]): Promise<string[]> {
    return Promise.all(images.map(image => this.convertImageToBase64(image)));
  }

  private async convertImageToBase64(image: File): Promise<string> {
    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${image.type};base64,${base64}`;
  }

  private parseBodyModel(output: any): BodyModel3D {
    // 解析Replicate返回的3D模型数据
    return {
      id: `replicate_body_${Date.now()}`,
      vertices: new Float32Array(output.vertices || []),
      faces: new Uint32Array(output.faces || []),
      normals: new Float32Array(output.normals || []),
      uvCoordinates: new Float32Array(output.uvs || []),
      measurements: output.measurements,
      skeleton: output.skeleton
    };
  }

  private parseClothingModel(output: any, options: ClothingGenOptions): ClothingModel3D {
    return {
      id: `replicate_clothing_${Date.now()}`,
      vertices: new Float32Array(output.vertices || []),
      faces: new Uint32Array(output.faces || []),
      normals: new Float32Array(output.normals || []),
      uvCoordinates: new Float32Array(output.uvs || []),
      category: options.category,
      materials: output.materials || [],
      physicsProperties: output.physics
    };
  }
}