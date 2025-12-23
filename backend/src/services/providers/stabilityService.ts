import { AIServiceConfig, BodyModel3D, ClothingModel3D, BodyScanOptions, ClothingGenOptions } from '../aiServiceGateway.js';

export class StabilityService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async generateBodyModel(images: File[], options: BodyScanOptions): Promise<BodyModel3D> {
    // Stability AI主要用于图像生成，这里作为备用服务
    // 可以用于增强纹理或生成缺失的视角
    const enhancedImages = await this.enhanceImages(images);
    return this.createBasicBodyModel(enhancedImages, options);
  }

  async generateClothingModel(image: File, options: ClothingGenOptions): Promise<ClothingModel3D> {
    // 使用Stability AI增强服装图像质量
    const enhancedImage = await this.enhanceClothingImage(image);
    return this.createBasicClothingModel(enhancedImage, options);
  }

  async healthCheck(): Promise<void> {
    const response = await fetch(`${this.config.endpoint}/v1/user/account`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Stability AI服务不可用: ${response.status}`);
    }
  }

  private async enhanceImages(images: File[]): Promise<File[]> {
    const enhancedImages = [];

    for (const image of images) {
      try {
        const enhanced = await this.upscaleImage(image);
        enhancedImages.push(enhanced);
      } catch (error) {
        console.warn('图像增强失败，使用原图:', error);
        enhancedImages.push(image);
      }
    }

    return enhancedImages;
  }

  private async enhanceClothingImage(image: File): Promise<File> {
    try {
      return await this.upscaleImage(image);
    } catch (error) {
      console.warn('服装图像增强失败，使用原图:', error);
      return image;
    }
  }

  private async upscaleImage(image: File): Promise<File> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('width', '1024');
    formData.append('height', '1024');

    const response = await fetch(`${this.config.endpoint}/v1/generation/esrgan-v1-x2plus/image-to-image/upscale`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'image/*'
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`图像增强失败: ${response.status}`);
    }

    const blob = await response.blob();
    return new File([blob], image.name, { type: image.type });
  }

  private createBasicBodyModel(images: File[], options: BodyScanOptions): BodyModel3D {
    // 创建基础的人体模型（简化版本）
    const vertices = this.generateBasicBodyVertices();
    const faces = this.generateBasicBodyFaces();
    const normals = this.calculateBasicNormals(vertices, faces);
    const uvCoordinates = this.generateBasicUVs(vertices.length / 3);

    return {
      id: `stability_body_${Date.now()}`,
      vertices,
      faces,
      normals,
      uvCoordinates,
      measurements: this.estimateBodyMeasurements(),
      skeleton: this.generateBasicSkeleton()
    };
  }

  private createBasicClothingModel(image: File, options: ClothingGenOptions): ClothingModel3D {
    const vertices = this.generateBasicClothingVertices(options.category);
    const faces = this.generateBasicClothingFaces();
    const normals = this.calculateBasicNormals(vertices, faces);
    const uvCoordinates = this.generateBasicUVs(vertices.length / 3);

    return {
      id: `stability_clothing_${Date.now()}`,
      vertices,
      faces,
      normals,
      uvCoordinates,
      category: options.category,
      materials: this.generateBasicMaterials(),
      physicsProperties: options.generatePhysics ? this.generateBasicPhysics() : undefined
    };
  }

  private generateBasicBodyVertices(): Float32Array {
    // 生成基础人体形状顶点
    const vertices = [];
    
    // 简化的人体轮廓
    for (let i = 0; i < 800; i++) {
      const angle = (i / 800) * Math.PI * 2;
      const height = (i / 800) * 1.8 - 0.9; // 身高1.8米
      const radius = 0.3 + Math.sin(height * 3) * 0.1; // 身体轮廓
      
      vertices.push(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
    }
    
    return new Float32Array(vertices);
  }

  private generateBasicClothingVertices(category: string): Float32Array {
    const vertices = [];
    let vertexCount = 400;
    
    switch (category) {
      case 'tops':
        // 上衣顶点
        for (let i = 0; i < vertexCount; i++) {
          vertices.push(
            (Math.random() - 0.5) * 1.2, // x
            Math.random() * 0.8 + 0.2,   // y (上半身)
            (Math.random() - 0.5) * 0.4  // z
          );
        }
        break;
      case 'bottoms':
        // 下装顶点
        for (let i = 0; i < vertexCount; i++) {
          vertices.push(
            (Math.random() - 0.5) * 1.0, // x
            Math.random() * 0.8 - 0.4,   // y (下半身)
            (Math.random() - 0.5) * 0.4  // z
          );
        }
        break;
      default:
        // 默认形状
        for (let i = 0; i < vertexCount; i++) {
          vertices.push(
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.3
          );
        }
    }
    
    return new Float32Array(vertices);
  }

  private generateBasicBodyFaces(): Uint32Array {
    const faces = [];
    for (let i = 0; i < 797; i++) {
      faces.push(i, i + 1, (i + 2) % 800);
    }
    return new Uint32Array(faces);
  }

  private generateBasicClothingFaces(): Uint32Array {
    const faces = [];
    for (let i = 0; i < 397; i++) {
      faces.push(i, i + 1, i + 2);
    }
    return new Uint32Array(faces);
  }

  private calculateBasicNormals(vertices: Float32Array, faces: Uint32Array): Float32Array {
    const normals = new Float32Array(vertices.length);
    
    // 简化的法线计算 - 向外指向
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
      
      const length = Math.sqrt(x * x + y * y + z * z);
      normals[i] = x / length;
      normals[i + 1] = y / length;
      normals[i + 2] = z / length;
    }
    
    return normals;
  }

  private generateBasicUVs(vertexCount: number): Float32Array {
    const uvs = [];
    for (let i = 0; i < vertexCount; i++) {
      uvs.push(
        (i % 20) / 20,  // u
        Math.floor(i / 20) / Math.ceil(vertexCount / 20)  // v
      );
    }
    return new Float32Array(uvs);
  }

  private estimateBodyMeasurements(): any {
    return {
      height: 170 + Math.random() * 20,
      chest: 85 + Math.random() * 15,
      waist: 70 + Math.random() * 15,
      hips: 90 + Math.random() * 15,
      shoulderWidth: 40 + Math.random() * 8
    };
  }

  private generateBasicSkeleton(): any {
    return {
      bones: [
        { id: 'spine', name: 'Spine', position: [0, 0, 0], rotation: [0, 0, 0, 1] },
        { id: 'chest', name: 'Chest', parent: 'spine', position: [0, 0.3, 0], rotation: [0, 0, 0, 1] },
        { id: 'head', name: 'Head', parent: 'chest', position: [0, 0.5, 0], rotation: [0, 0, 0, 1] }
      ],
      joints: [
        { id: 'spine_joint', position: [0, 0, 0], type: 'ball' },
        { id: 'chest_joint', position: [0, 0.3, 0], type: 'ball' },
        { id: 'neck_joint', position: [0, 0.5, 0], type: 'ball' }
      ]
    };
  }

  private generateBasicMaterials(): any[] {
    return [
      {
        name: 'fabric',
        diffuse: '#ffffff',
        roughness: 0.8,
        metallic: 0.0
      }
    ];
  }

  private generateBasicPhysics(): any {
    return {
      mass: 0.5,
      elasticity: 0.3,
      friction: 0.7,
      damping: 0.1
    };
  }
}