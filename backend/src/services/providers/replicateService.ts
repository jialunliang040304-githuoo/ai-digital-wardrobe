import { AIServiceConfig, BodyModel3D, ClothingModel3D, BodyScanOptions, ClothingGenOptions } from '../aiServiceGateway.js';

// Replicate API模型版本
const MODELS = {
  // 图片转3D模型 - TripoSR
  IMAGE_TO_3D: 'camenduru/triposr:3f5a3e0e-5a3e-4a3e-8a3e-5a3e4a3e8a3e',
  // 虚拟试穿 - IDM-VTON
  VIRTUAL_TRYON: 'cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4',
  // 人体姿态估计
  POSE_ESTIMATION: 'rossjillian/controlnet:795433b19458d0f4fa172a7ccf93178d2adb1cb8ab2ad6c8fdc33fdbcd49f477',
  // 背景移除
  REMOVE_BG: 'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003'
};

export class ReplicateService {
  private config: AIServiceConfig;
  private baseUrl = 'https://api.replicate.com/v1';

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  // 生成人体3D模型
  async generateBodyModel(images: File[], options: BodyScanOptions): Promise<BodyModel3D> {
    // 首先移除背景
    const cleanedImage = await this.removeBackground(images[0]);
    
    // 然后生成3D模型
    const prediction = await this.runModel(MODELS.IMAGE_TO_3D, {
      image: cleanedImage,
      foreground_ratio: 0.85,
      mc_resolution: options.quality === 'high' ? 256 : options.quality === 'medium' ? 192 : 128
    });

    return this.parseBodyModel(prediction);
  }

  // 生成服装3D模型
  async generateClothingModel(image: File, options: ClothingGenOptions): Promise<ClothingModel3D> {
    // 移除背景
    const cleanedImage = await this.removeBackground(image);
    
    // 生成3D模型
    const prediction = await this.runModel(MODELS.IMAGE_TO_3D, {
      image: cleanedImage,
      foreground_ratio: 0.9,
      mc_resolution: 192
    });

    return this.parseClothingModel(prediction, options);
  }

  // 虚拟试穿 - 2D效果
  async virtualTryOn(personImage: string, clothingImage: string): Promise<string> {
    const prediction = await this.runModel(MODELS.VIRTUAL_TRYON, {
      human_img: personImage,
      garm_img: clothingImage,
      garment_des: 'clothing item',
      is_checked: true,
      is_checked_crop: false,
      denoise_steps: 30,
      seed: 42
    });

    return prediction;
  }

  // 移除背景
  async removeBackground(image: File): Promise<string> {
    const base64 = await this.convertImageToBase64(image);
    
    const prediction = await this.runModel(MODELS.REMOVE_BG, {
      image: base64
    });

    return prediction;
  }

  // 健康检查
  async healthCheck(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Token ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Replicate服务不可用: ${response.status}`);
    }
  }

  // 运行模型
  private async runModel(modelVersion: string, input: any): Promise<any> {
    // 创建预测
    const createResponse = await fetch(`${this.baseUrl}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: modelVersion.split(':')[1],
        input
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Replicate API错误: ${createResponse.status} - ${error}`);
    }

    const prediction = await createResponse.json();
    
    // 等待结果
    return this.waitForPrediction(prediction.id);
  }

  // 等待预测完成
  private async waitForPrediction(predictionId: string): Promise<any> {
    let attempts = 0;
    const maxAttempts = 120; // 最多等待10分钟

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
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
      } else if (prediction.status === 'canceled') {
        throw new Error('预测已取消');
      }

      // 等待5秒后重试
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('预测超时');
  }

  // 转换图片为Base64
  private async convertImageToBase64(image: File): Promise<string> {
    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${image.type};base64,${base64}`;
  }

  // 解析人体模型
  private parseBodyModel(output: any): BodyModel3D {
    // TripoSR返回的是GLB文件URL
    const modelUrl = typeof output === 'string' ? output : output[0];
    
    return {
      id: `replicate_body_${Date.now()}`,
      vertices: new Float32Array([]),
      faces: new Uint32Array([]),
      normals: new Float32Array([]),
      uvCoordinates: new Float32Array([]),
      // 存储模型URL，前端可以直接加载
      downloadUrl: modelUrl
    } as any;
  }

  // 解析服装模型
  private parseClothingModel(output: any, options: ClothingGenOptions): ClothingModel3D {
    const modelUrl = typeof output === 'string' ? output : output[0];
    
    return {
      id: `replicate_clothing_${Date.now()}`,
      vertices: new Float32Array([]),
      faces: new Uint32Array([]),
      normals: new Float32Array([]),
      uvCoordinates: new Float32Array([]),
      category: options.category,
      materials: [],
      downloadUrl: modelUrl
    } as any;
  }
}
