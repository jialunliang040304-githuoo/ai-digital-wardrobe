import { AIServiceConfig } from '../services/aiServiceGateway.js';

export const aiServiceConfigs: AIServiceConfig[] = [
  {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    endpoint: 'https://api.openai.com/v1',
    model: 'gpt-4-vision-preview',
    priority: 1, // 最高优先级
    rateLimit: {
      requests: 50,
      window: 60000 // 1分钟
    },
    fallbackProvider: 'replicate'
  },
  {
    provider: 'replicate',
    apiKey: process.env.REPLICATE_API_TOKEN || '',
    endpoint: 'https://api.replicate.com/v1',
    model: 'stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478',
    priority: 2,
    rateLimit: {
      requests: 30,
      window: 60000
    },
    fallbackProvider: 'stability'
  },
  {
    provider: 'stability',
    apiKey: process.env.STABILITY_API_KEY || '',
    endpoint: 'https://api.stability.ai',
    model: 'stable-diffusion-xl-1024-v1-0',
    priority: 3,
    rateLimit: {
      requests: 20,
      window: 60000
    }
  }
];

export const validateAIConfig = (): boolean => {
  const requiredKeys = ['OPENAI_API_KEY', 'REPLICATE_API_TOKEN', 'STABILITY_API_KEY'];
  const missingKeys = requiredKeys.filter(key => !process.env[key]);
  
  if (missingKeys.length > 0) {
    console.warn('缺少AI服务API密钥:', missingKeys);
    return false;
  }
  
  return true;
};

export const getAvailableServices = (): AIServiceConfig[] => {
  return aiServiceConfigs.filter(config => {
    switch (config.provider) {
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      case 'replicate':
        return !!process.env.REPLICATE_API_TOKEN;
      case 'stability':
        return !!process.env.STABILITY_API_KEY;
      default:
        return false;
    }
  });
};