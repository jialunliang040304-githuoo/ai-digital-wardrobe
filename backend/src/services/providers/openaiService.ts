import { AIServiceConfig, BodyModel3D, ClothingModel3D, BodyScanOptions, ClothingGenOptions } from '../aiServiceGateway.js';

export class OpenAIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async generateBodyModel(images: File[], options: BodyScanOptions): Promise<BodyModel3D> {
    // 使用OpenAI Vision API分析人体图像
    const imageAnalysis = await this.analyzeBodyImages(images);
    
    // 生成3D模型数据
    const model = await this.createBodyMesh(imageAnalysis, options);
    
    return model;
  }

  async generateClothingModel(image: File, options: ClothingGenOptions): Promise<ClothingModel3D> {
    // 使用OpenAI Vision API分析服装图像
    const clothingAnalysis = await this.analyzeClothingImage(image, options);
    
    // 生成3D服装模型
    const model = await this.createClothingMesh(clothingAnalysis, options);
    
    return model;
  }

  async healthCheck(): Promise<void> {
    const response = await fetch(`${this.config.endpoint}/models`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`OpenAI服务不可用: ${response.status}`);
    }
  }

  private async analyzeBodyImages(images: File[]): Promise<any> {
    const imageBase64Array = await Promise.all(
      images.map(async (image) => {
        const buffer = await image.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:${image.type};base64,${base64}`;
      })
    );

    const response = await fetch(`${this.config.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '分析这些人体图像，提取身体测量数据、姿态关键点和3D重建所需的特征点。返回JSON格式的结构化数据。'
              },
              ...imageBase64Array.map(image => ({
                type: 'image_url',
                image_url: { url: image }
              }))
            ]
          }
        ],
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API错误: ${response.status}`);
    }

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
  }

  private async analyzeClothingImage(image: File, options: ClothingGenOptions): Promise<any> {
    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const imageUrl = `data:${image.type};base64,${base64}`;

    const response = await fetch(`${this.config.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `分析这件${options.category}服装图像，提取：1.服装轮廓和尺寸 2.材质和纹理信息 3.3D建模所需的特征点 4.物理属性参数。返回JSON格式数据。`
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API错误: ${response.status}`);
    }

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
  }

  private async createBodyMesh(analysis: any, options: BodyScanOptions): Promise<BodyModel3D> {
    // 基于分析结果生成3D网格
    // 这里使用简化的算法，实际应该使用更复杂的3D重建算法
    
    const vertices = this.generateBodyVertices(analysis);
    const faces = this.generateBodyFaces(vertices.length / 3);
    const normals = this.calculateNormals(vertices, faces);
    const uvCoordinates = this.generateUVCoordinates(vertices.length / 3);

    return {
      id: `body_${Date.now()}`,
      vertices,
      faces,
      normals,
      uvCoordinates,
      measurements: analysis.measurements,
      skeleton: analysis.skeleton
    };
  }

  private async createClothingMesh(analysis: any, options: ClothingGenOptions): Promise<ClothingModel3D> {
    const vertices = this.generateClothingVertices(analysis);
    const faces = this.generateClothingFaces(vertices.length / 3);
    const normals = this.calculateNormals(vertices, faces);
    const uvCoordinates = this.generateUVCoordinates(vertices.length / 3);

    return {
      id: `clothing_${Date.now()}`,
      vertices,
      faces,
      normals,
      uvCoordinates,
      category: options.category,
      materials: analysis.materials || [],
      physicsProperties: options.generatePhysics ? analysis.physics : undefined
    };
  }

  private generateBodyVertices(analysis: any): Float32Array {
    // 简化的人体顶点生成
    // 实际应该基于分析结果生成精确的人体网格
    const vertices = [];
    const keypoints = analysis.keypoints || [];
    
    // 生成基础人体形状
    for (let i = 0; i < 1000; i++) {
      vertices.push(
        Math.random() * 2 - 1, // x
        Math.random() * 2 - 1, // y  
        Math.random() * 0.5     // z
      );
    }
    
    return new Float32Array(vertices);
  }

  private generateClothingVertices(analysis: any): Float32Array {
    // 简化的服装顶点生成
    const vertices = [];
    
    for (let i = 0; i < 500; i++) {
      vertices.push(
        Math.random() * 1.5 - 0.75, // x
        Math.random() * 1.5 - 0.75, // y
        Math.random() * 0.3          // z
      );
    }
    
    return new Float32Array(vertices);
  }

  private generateBodyFaces(vertexCount: number): Uint32Array {
    const faces = [];
    for (let i = 0; i < vertexCount - 2; i += 3) {
      faces.push(i, i + 1, i + 2);
    }
    return new Uint32Array(faces);
  }

  private generateClothingFaces(vertexCount: number): Uint32Array {
    const faces = [];
    for (let i = 0; i < vertexCount - 2; i += 3) {
      faces.push(i, i + 1, i + 2);
    }
    return new Uint32Array(faces);
  }

  private calculateNormals(vertices: Float32Array, faces: Uint32Array): Float32Array {
    const normals = new Float32Array(vertices.length);
    
    for (let i = 0; i < faces.length; i += 3) {
      const i1 = faces[i] * 3;
      const i2 = faces[i + 1] * 3;
      const i3 = faces[i + 2] * 3;
      
      // 简化的法线计算
      normals[i1] = 0; normals[i1 + 1] = 0; normals[i1 + 2] = 1;
      normals[i2] = 0; normals[i2 + 1] = 0; normals[i2 + 2] = 1;
      normals[i3] = 0; normals[i3 + 1] = 0; normals[i3 + 2] = 1;
    }
    
    return normals;
  }

  private generateUVCoordinates(vertexCount: number): Float32Array {
    const uvs = [];
    for (let i = 0; i < vertexCount; i++) {
      uvs.push(Math.random(), Math.random());
    }
    return new Float32Array(uvs);
  }
}