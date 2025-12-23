// 3D模型缓存服务
export class ModelCacheService {
  private static readonly CACHE_NAME = 'digital-wardrobe-models-v1';
  private static readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7天

  // 缓存3D模型
  static async cacheModel(url: string, data: ArrayBuffer | Blob): Promise<boolean> {
    if (!('caches' in window)) {
      console.warn('Cache API not supported');
      return false;
    }

    try {
      const cache = await caches.open(this.CACHE_NAME);
      
      // 检查缓存大小
      const currentSize = await this.getCacheSize();
      const newDataSize = data instanceof ArrayBuffer ? data.byteLength : data.size;
      
      if (currentSize + newDataSize > this.MAX_CACHE_SIZE) {
        // 清理旧缓存
        await this.cleanupOldEntries();
      }

      // 创建响应对象
      const response = new Response(data, {
        headers: {
          'Content-Type': this.getContentType(url),
          'Cache-Timestamp': Date.now().toString(),
          'Cache-Expiry': (Date.now() + this.CACHE_EXPIRY).toString()
        }
      });

      await cache.put(url, response);
      console.log(`Model cached: ${url}`);
      return true;
    } catch (error) {
      console.error('Failed to cache model:', error);
      return false;
    }
  }

  // 获取缓存的3D模型
  static async getCachedModel(url: string): Promise<ArrayBuffer | null> {
    if (!('caches' in window)) {
      return null;
    }

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const response = await cache.match(url);

      if (!response) {
        return null;
      }

      // 检查是否过期
      const expiryTime = response.headers.get('Cache-Expiry');
      if (expiryTime && Date.now() > parseInt(expiryTime)) {
        await cache.delete(url);
        return null;
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Failed to get cached model:', error);
      return null;
    }
  }

  // 预加载3D模型
  static async preloadModel(url: string): Promise<boolean> {
    try {
      // 检查是否已缓存
      const cached = await this.getCachedModel(url);
      if (cached) {
        return true;
      }

      // 下载模型
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.arrayBuffer();
      return await this.cacheModel(url, data);
    } catch (error) {
      console.error('Failed to preload model:', error);
      return false;
    }
  }

  // 批量预加载模型
  static async preloadModels(urls: string[]): Promise<{
    success: string[];
    failed: string[];
  }> {
    const success: string[] = [];
    const failed: string[] = [];

    // 限制并发数量
    const concurrency = 3;
    const chunks = this.chunkArray(urls, concurrency);

    for (const chunk of chunks) {
      const promises = chunk.map(async (url) => {
        const result = await this.preloadModel(url);
        if (result) {
          success.push(url);
        } else {
          failed.push(url);
        }
      });

      await Promise.all(promises);
    }

    return { success, failed };
  }

  // 获取缓存大小
  static async getCacheSize(): Promise<number> {
    if (!('caches' in window)) {
      return 0;
    }

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const requests = await cache.keys();
      let totalSize = 0;

      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  // 获取缓存统计
  static async getCacheStats(): Promise<{
    totalSize: number;
    itemCount: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  }> {
    if (!('caches' in window)) {
      return {
        totalSize: 0,
        itemCount: 0,
        oldestEntry: null,
        newestEntry: null
      };
    }

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const requests = await cache.keys();
      let totalSize = 0;
      let oldestTime = Infinity;
      let newestTime = 0;

      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;

          const timestamp = response.headers.get('Cache-Timestamp');
          if (timestamp) {
            const time = parseInt(timestamp);
            oldestTime = Math.min(oldestTime, time);
            newestTime = Math.max(newestTime, time);
          }
        }
      }

      return {
        totalSize,
        itemCount: requests.length,
        oldestEntry: oldestTime === Infinity ? null : new Date(oldestTime),
        newestEntry: newestTime === 0 ? null : new Date(newestTime)
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        totalSize: 0,
        itemCount: 0,
        oldestEntry: null,
        newestEntry: null
      };
    }
  }

  // 清理过期缓存
  static async cleanupExpiredEntries(): Promise<number> {
    if (!('caches' in window)) {
      return 0;
    }

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const requests = await cache.keys();
      let deletedCount = 0;

      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const expiryTime = response.headers.get('Cache-Expiry');
          if (expiryTime && Date.now() > parseInt(expiryTime)) {
            await cache.delete(request);
            deletedCount++;
          }
        }
      }

      console.log(`Cleaned up ${deletedCount} expired model cache entries`);
      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup expired entries:', error);
      return 0;
    }
  }

  // 清理旧缓存条目（LRU策略）
  static async cleanupOldEntries(): Promise<number> {
    if (!('caches' in window)) {
      return 0;
    }

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const requests = await cache.keys();
      const entries: { request: Request; timestamp: number }[] = [];

      // 收集所有条目及其时间戳
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const timestamp = response.headers.get('Cache-Timestamp');
          if (timestamp) {
            entries.push({
              request,
              timestamp: parseInt(timestamp)
            });
          }
        }
      }

      // 按时间戳排序（最旧的在前）
      entries.sort((a, b) => a.timestamp - b.timestamp);

      // 删除最旧的25%条目
      const deleteCount = Math.floor(entries.length * 0.25);
      let deletedCount = 0;

      for (let i = 0; i < deleteCount; i++) {
        await cache.delete(entries[i].request);
        deletedCount++;
      }

      console.log(`Cleaned up ${deletedCount} old model cache entries`);
      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup old entries:', error);
      return 0;
    }
  }

  // 清空所有缓存
  static async clearAllCache(): Promise<boolean> {
    if (!('caches' in window)) {
      return false;
    }

    try {
      const deleted = await caches.delete(this.CACHE_NAME);
      console.log('Model cache cleared');
      return deleted;
    } catch (error) {
      console.error('Failed to clear model cache:', error);
      return false;
    }
  }

  // 检查模型是否已缓存
  static async isModelCached(url: string): Promise<boolean> {
    const cached = await this.getCachedModel(url);
    return cached !== null;
  }

  // 获取内容类型
  private static getContentType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'gltf':
        return 'model/gltf+json';
      case 'glb':
        return 'model/gltf-binary';
      case 'obj':
        return 'text/plain';
      case 'fbx':
        return 'application/octet-stream';
      case 'dae':
        return 'model/vnd.collada+xml';
      default:
        return 'application/octet-stream';
    }
  }

  // 数组分块工具
  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // 格式化缓存大小
  static formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 获取缓存使用率
  static async getCacheUsage(): Promise<{
    used: number;
    total: number;
    percentage: number;
    formatted: {
      used: string;
      total: string;
    };
  }> {
    const used = await this.getCacheSize();
    const total = this.MAX_CACHE_SIZE;
    const percentage = (used / total) * 100;

    return {
      used,
      total,
      percentage,
      formatted: {
        used: this.formatSize(used),
        total: this.formatSize(total)
      }
    };
  }

  // 智能预加载（基于使用频率）
  static async smartPreload(modelUrls: string[], priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    const usage = await this.getCacheUsage();
    
    // 根据缓存使用率和优先级决定预加载策略
    let maxPreload: number;
    
    if (usage.percentage > 80) {
      maxPreload = priority === 'high' ? 2 : 1;
    } else if (usage.percentage > 60) {
      maxPreload = priority === 'high' ? 5 : priority === 'medium' ? 3 : 1;
    } else {
      maxPreload = priority === 'high' ? 10 : priority === 'medium' ? 5 : 3;
    }

    const urlsToPreload = modelUrls.slice(0, maxPreload);
    
    if (urlsToPreload.length > 0) {
      console.log(`Smart preloading ${urlsToPreload.length} models with ${priority} priority`);
      await this.preloadModels(urlsToPreload);
    }
  }

  // 定期维护任务
  static async performMaintenance(): Promise<{
    expiredCleaned: number;
    oldCleaned: number;
    finalSize: number;
  }> {
    console.log('Starting model cache maintenance...');
    
    const expiredCleaned = await this.cleanupExpiredEntries();
    
    // 检查缓存大小，如果仍然过大则清理旧条目
    const currentSize = await this.getCacheSize();
    let oldCleaned = 0;
    
    if (currentSize > this.MAX_CACHE_SIZE * 0.8) {
      oldCleaned = await this.cleanupOldEntries();
    }
    
    const finalSize = await this.getCacheSize();
    
    console.log(`Model cache maintenance completed: expired=${expiredCleaned}, old=${oldCleaned}, final size=${this.formatSize(finalSize)}`);
    
    return {
      expiredCleaned,
      oldCleaned,
      finalSize
    };
  }
}