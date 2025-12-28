/**
 * 3D Gaussian Splatting 服务
 * 
 * 使用Replicate上的开源高斯泼溅模型:
 * - 3D Gaussian Splatting for Real-Time Radiance Field Rendering
 * - 支持视频/图片输入
 * - 输出.ply或.splat格式
 */

import { AIServiceConfig } from '../aiServiceGateway.js';

export interface GaussianSplattingResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  splatUrl?: string;      // .splat文件URL
  plyUrl?: string;        // .ply文件URL  
  meshUrl?: string;       // 转换后的mesh URL
  previewUrl?: string;    // 预览图URL
  pointCount?: number;    // 高斯点数量
  createdAt: string;
}

export interface SplatRenderOptions {
  backgroundColor: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  fov: number;
}

// Replicate上的高斯泼溅模型
const GAUSSIAN_MODELS = {
  // 图片转3D高斯泼溅
  IMAGE_TO_SPLAT: 'camenduru/gaussian-splatting:latest',
  // 视频转3D高斯泼溅  
  VIDEO_TO_SPLAT: 'cjwbw/gaussian-splatting:latest',
  // 高斯泼溅转Mesh
  SPLAT_TO_MESH: 'camenduru/sugar:latest'
};

export class GaussianSplattingService {
  private config: AIServiceConfig;
  private baseUrl = 'https://api.replicate.com/v1';

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  /**
   * 从多张图片生成3D高斯泼溅模型
   * 需要从不同角度拍摄的图片(建议20-50张)
   */
  async createFromImages(imageUrls: string[]): Promise<GaussianSplattingResult> {
    const prediction = await this.runModel(GAUSSIAN_MODELS.IMAGE_TO_SPLAT, {
      images: imageUrls,
      num_iterations: 7000,
      sh_degree: 3,
      densify_grad_threshold: 0.0002,
      densify_until_iter: 15000
    });

    return this.parseResult(prediction);
  }

  /**
   * 从视频生成3D高斯泼溅模型
   * 用户围绕物体拍摄的视频
   */
  async createFromVideo(videoUrl: string): Promise<GaussianSplattingResult> {
    const prediction = await this.runModel(GAUSSIAN_MODELS.VIDEO_TO_SPLAT, {
      video: videoUrl,
      num_iterations: 7000,
      extract_frames: true,
      frame_interval: 5
    });

    return this.parseResult(prediction);
  }

  /**
   * 将高斯泼溅模型转换为传统Mesh
   * 便于在不支持高斯渲染的环境中使用
   */
  async convertToMesh(splatUrl: string): Promise<string> {
    const prediction = await this.runModel(GAUSSIAN_MODELS.SPLAT_TO_MESH, {
      splat_file: splatUrl,
      output_format: 'glb',
      simplify: true,
      target_faces: 50000
    });

    return prediction;
  }

  /**
   * 运行Replicate模型
   */
  private async runModel(model: string, input: any): Promise<any> {
    const version = model.split(':')[1] || 'latest';
    const modelName = model.split(':')[0];

    // 创建预测
    const createResponse = await fetch(`${this.baseUrl}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version,
        input
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Replicate API错误: ${createResponse.status} - ${error}`);
    }

    const prediction = await createResponse.json();
    return this.waitForPrediction(prediction.id);
  }

  /**
   * 等待预测完成
   */
  private async waitForPrediction(predictionId: string): Promise<any> {
    let attempts = 0;
    const maxAttempts = 180; // 最多等待30分钟(高斯泼溅需要较长时间)

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${this.config.apiKey}`
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

      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
    }

    throw new Error('高斯泼溅生成超时');
  }

  /**
   * 解析结果
   */
  private parseResult(output: any): GaussianSplattingResult {
    return {
      id: `gs_${Date.now()}`,
      status: 'completed',
      progress: 100,
      splatUrl: output.splat || output[0],
      plyUrl: output.ply,
      meshUrl: output.mesh,
      previewUrl: output.preview,
      pointCount: output.point_count,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Token ${this.config.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`服务不可用: ${response.status}`);
    }
  }
}
