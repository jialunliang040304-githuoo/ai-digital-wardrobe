import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModelCacheService } from '../services/modelCacheService';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 25: 缓存机制有效性
 * 验证需求: 需求9.5
 */
describe('缓存机制属性测试', () => {
  // Mock Cache API
  const mockCache = {
    put: vi.fn(),
    match: vi.fn(),
    delete: vi.fn(),
    keys: vi.fn()
  };

  const mockCaches = {
    open: vi.fn().mockResolvedValue(mockCache),
    delete: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock caches API
    Object.defineProperty(window, 'caches', {
      value: mockCaches,
      writable: true
    });

    // Mock fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('3D模型缓存', () => {
    it('应该成功缓存3D模型', async () => {
      const testData = new ArrayBuffer(1024);
      const testUrl = '/models/test.glb';

      mockCache.keys.mockResolvedValue([]);
      mockCache.put.mockResolvedValue(undefined);

      const result = await ModelCacheService.cacheModel(testUrl, testData);
      
      expect(result).toBe(true);
      expect(mockCache.put).toHaveBeenCalledWith(
        testUrl,
        expect.any(Response)
      );
    });

    it('应该获取缓存的3D模型', async () => {
      const testData = new ArrayBuffer(1024);
      const testUrl = '/models/test.glb';

      const mockResponse = new Response(testData, {
        headers: {
          'Cache-Timestamp': Date.now().toString(),
          'Cache-Expiry': (Date.now() + 86400000).toString() // 24小时后过期
        }
      });

      mockCache.match.mockResolvedValue(mockResponse);

      const result = await ModelCacheService.getCachedModel(testUrl);
      
      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result?.byteLength).toBe(1024);
    });

    it('应该处理过期的缓存条目', async () => {
      const testUrl = '/models/expired.glb';

      const expiredResponse = new Response(new ArrayBuffer(1024), {
        headers: {
          'Cache-Timestamp': (Date.now() - 86400000).toString(), // 24小时前
          'Cache-Expiry': (Date.now() - 1000).toString() // 1秒前过期
        }
      });

      mockCache.match.mockResolvedValue(expiredResponse);
      mockCache.delete.mockResolvedValue(true);

      const result = await ModelCacheService.getCachedModel(testUrl);
      
      expect(result).toBeNull();
      expect(mockCache.delete).toHaveBeenCalledWith(testUrl);
    });

    it('属性测试：缓存的模型应该与原始数据一致', () => {
      fc.assert(fc.property(
        fc.uint8Array({ minLength: 100, maxLength: 10000 }),
        fc.webUrl(),
        async (data: Uint8Array, url: string) => {
          const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
          
          mockCache.keys.mockResolvedValue([]);
          mockCache.put.mockResolvedValue(undefined);

          // 缓存数据
          const cacheResult = await ModelCacheService.cacheModel(url, arrayBuffer);
          expect(cacheResult).toBe(true);

          // 模拟获取缓存数据
          const mockResponse = new Response(arrayBuffer, {
            headers: {
              'Cache-Timestamp': Date.now().toString(),
              'Cache-Expiry': (Date.now() + 86400000).toString()
            }
          });

          mockCache.match.mockResolvedValue(mockResponse);

          const cachedData = await ModelCacheService.getCachedModel(url);
          
          expect(cachedData).not.toBeNull();
          expect(cachedData?.byteLength).toBe(arrayBuffer.byteLength);
        }
      ), { numRuns: 5 });
    });
  });

  describe('预加载功能', () => {
    it('应该预加载单个模型', async () => {
      const testUrl = '/models/preload.glb';
      const testData = new ArrayBuffer(2048);

      global.fetch = vi.fn().mockResolvedValue(new Response(testData, { status: 200 }));
      mockCache.match.mockResolvedValue(null); // 未缓存
      mockCache.keys.mockResolvedValue([]);
      mockCache.put.mockResolvedValue(undefined);

      const result = await ModelCacheService.preloadModel(testUrl);
      
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(testUrl);
      expect(mockCache.put).toHaveBeenCalled();
    });

    it('应该跳过已缓存的模型', async () => {
      const testUrl = '/models/cached.glb';
      const testData = new ArrayBuffer(1024);

      const mockResponse = new Response(testData, {
        headers: {
          'Cache-Timestamp': Date.now().toString(),
          'Cache-Expiry': (Date.now() + 86400000).toString()
        }
      });

      mockCache.match.mockResolvedValue(mockResponse);

      const result = await ModelCacheService.preloadModel(testUrl);
      
      expect(result).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('应该批量预加载模型', async () => {
      const testUrls = [
        '/models/model1.glb',
        '/models/model2.glb',
        '/models/model3.glb'
      ];

      global.fetch = vi.fn().mockResolvedValue(
        new Response(new ArrayBuffer(1024), { status: 200 })
      );
      mockCache.match.mockResolvedValue(null);
      mockCache.keys.mockResolvedValue([]);
      mockCache.put.mockResolvedValue(undefined);

      const result = await ModelCacheService.preloadModels(testUrls);
      
      expect(result.success).toHaveLength(3);
      expect(result.failed).toHaveLength(0);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('应该处理预加载失败', async () => {
      const testUrls = [
        '/models/success.glb',
        '/models/fail.glb'
      ];

      global.fetch = vi.fn()
        .mockResolvedValueOnce(new Response(new ArrayBuffer(1024), { status: 200 }))
        .mockRejectedValueOnce(new Error('Network error'));

      mockCache.match.mockResolvedValue(null);
      mockCache.keys.mockResolvedValue([]);
      mockCache.put.mockResolvedValue(undefined);

      const result = await ModelCacheService.preloadModels(testUrls);
      
      expect(result.success).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
      expect(result.success[0]).toBe('/models/success.glb');
      expect(result.failed[0]).toBe('/models/fail.glb');
    });

    it('属性测试：预加载应该正确处理各种URL', () => {
      fc.assert(fc.property(
        fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
        async (urls: string[]) => {
          global.fetch = vi.fn().mockResolvedValue(
            new Response(new ArrayBuffer(1024), { status: 200 })
          );
          mockCache.match.mockResolvedValue(null);
          mockCache.keys.mockResolvedValue([]);
          mockCache.put.mockResolvedValue(undefined);

          const result = await ModelCacheService.preloadModels(urls);
          
          expect(result.success.length + result.failed.length).toBe(urls.length);
          expect(global.fetch).toHaveBeenCalledTimes(urls.length);
        }
      ), { numRuns: 3 });
    });
  });

  describe('缓存大小管理', () => {
    it('应该计算缓存大小', async () => {
      const mockRequests = [
        new Request('/model1.glb'),
        new Request('/model2.glb')
      ];

      const mockResponses = [
        new Response(new ArrayBuffer(1024)),
        new Response(new ArrayBuffer(2048))
      ];

      mockCache.keys.mockResolvedValue(mockRequests);
      mockCache.match
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1]);

      const size = await ModelCacheService.getCacheSize();
      
      expect(size).toBe(3072); // 1024 + 2048
    });

    it('应该获取缓存统计信息', async () => {
      const now = Date.now();
      const mockRequests = [new Request('/model.glb')];
      const mockResponse = new Response(new ArrayBuffer(1024), {
        headers: {
          'Cache-Timestamp': now.toString(),
          'Cache-Expiry': (now + 86400000).toString()
        }
      });

      mockCache.keys.mockResolvedValue(mockRequests);
      mockCache.match.mockResolvedValue(mockResponse);

      const stats = await ModelCacheService.getCacheStats();
      
      expect(stats.totalSize).toBe(1024);
      expect(stats.itemCount).toBe(1);
      expect(stats.oldestEntry).toBeInstanceOf(Date);
      expect(stats.newestEntry).toBeInstanceOf(Date);
    });

    it('应该格式化缓存大小', () => {
      expect(ModelCacheService.formatSize(0)).toBe('0 B');
      expect(ModelCacheService.formatSize(1024)).toBe('1 KB');
      expect(ModelCacheService.formatSize(1048576)).toBe('1 MB');
      expect(ModelCacheService.formatSize(1073741824)).toBe('1 GB');
    });

    it('属性测试：大小格式化应该正确', () => {
      fc.assert(fc.property(
        fc.integer({ min: 0, max: 1000000000 }),
        (bytes: number) => {
          const formatted = ModelCacheService.formatSize(bytes);
          
          expect(formatted).toMatch(/^\d+(\.\d+)?\s[KMGT]?B$/);
          
          if (bytes === 0) {
            expect(formatted).toBe('0 B');
          }
        }
      ), { numRuns: 20 });
    });

    it('应该获取缓存使用率', async () => {
      mockCache.keys.mockResolvedValue([new Request('/model.glb')]);
      mockCache.match.mockResolvedValue(new Response(new ArrayBuffer(1024)));

      const usage = await ModelCacheService.getCacheUsage();
      
      expect(usage).toHaveProperty('used');
      expect(usage).toHaveProperty('total');
      expect(usage).toHaveProperty('percentage');
      expect(usage).toHaveProperty('formatted');
      expect(usage.formatted).toHaveProperty('used');
      expect(usage.formatted).toHaveProperty('total');
    });
  });

  describe('缓存清理', () => {
    it('应该清理过期条目', async () => {
      const now = Date.now();
      const mockRequests = [
        new Request('/expired.glb'),
        new Request('/valid.glb')
      ];

      const expiredResponse = new Response(new ArrayBuffer(1024), {
        headers: {
          'Cache-Expiry': (now - 1000).toString() // 已过期
        }
      });

      const validResponse = new Response(new ArrayBuffer(1024), {
        headers: {
          'Cache-Expiry': (now + 86400000).toString() // 未过期
        }
      });

      mockCache.keys.mockResolvedValue(mockRequests);
      mockCache.match
        .mockResolvedValueOnce(expiredResponse)
        .mockResolvedValueOnce(validResponse);
      mockCache.delete.mockResolvedValue(true);

      const deletedCount = await ModelCacheService.cleanupExpiredEntries();
      
      expect(deletedCount).toBe(1);
      expect(mockCache.delete).toHaveBeenCalledWith(mockRequests[0]);
    });

    it('应该清理旧条目（LRU策略）', async () => {
      const now = Date.now();
      const mockRequests = [
        new Request('/old1.glb'),
        new Request('/old2.glb'),
        new Request('/new1.glb'),
        new Request('/new2.glb')
      ];

      const responses = [
        new Response(new ArrayBuffer(1024), {
          headers: { 'Cache-Timestamp': (now - 86400000).toString() } // 1天前
        }),
        new Response(new ArrayBuffer(1024), {
          headers: { 'Cache-Timestamp': (now - 43200000).toString() } // 12小时前
        }),
        new Response(new ArrayBuffer(1024), {
          headers: { 'Cache-Timestamp': (now - 3600000).toString() } // 1小时前
        }),
        new Response(new ArrayBuffer(1024), {
          headers: { 'Cache-Timestamp': now.toString() } // 现在
        })
      ];

      mockCache.keys.mockResolvedValue(mockRequests);
      mockCache.match
        .mockResolvedValueOnce(responses[0])
        .mockResolvedValueOnce(responses[1])
        .mockResolvedValueOnce(responses[2])
        .mockResolvedValueOnce(responses[3]);
      mockCache.delete.mockResolvedValue(true);

      const deletedCount = await ModelCacheService.cleanupOldEntries();
      
      expect(deletedCount).toBe(1); // 25% of 4 = 1
      expect(mockCache.delete).toHaveBeenCalledWith(mockRequests[0]); // 最旧的
    });

    it('应该清空所有缓存', async () => {
      mockCaches.delete.mockResolvedValue(true);

      const result = await ModelCacheService.clearAllCache();
      
      expect(result).toBe(true);
      expect(mockCaches.delete).toHaveBeenCalledWith('digital-wardrobe-models-v1');
    });

    it('属性测试：清理操作应该是安全的', () => {
      fc.assert(fc.property(
        fc.integer({ min: 0, max: 100 }),
        async (itemCount: number) => {
          const mockRequests = Array.from({ length: itemCount }, (_, i) => 
            new Request(`/model${i}.glb`)
          );

          mockCache.keys.mockResolvedValue(mockRequests);
          mockCache.match.mockResolvedValue(new Response(new ArrayBuffer(1024), {
            headers: {
              'Cache-Timestamp': Date.now().toString(),
              'Cache-Expiry': (Date.now() + 86400000).toString()
            }
          }));
          mockCache.delete.mockResolvedValue(true);

          // 清理操作不应该抛出错误
          await expect(ModelCacheService.cleanupExpiredEntries()).resolves.not.toThrow();
          await expect(ModelCacheService.cleanupOldEntries()).resolves.not.toThrow();
        }
      ), { numRuns: 5 });
    });
  });

  describe('智能预加载', () => {
    it('应该根据缓存使用率调整预加载策略', async () => {
      const testUrls = Array.from({ length: 10 }, (_, i) => `/model${i}.glb`);

      // 模拟高缓存使用率
      mockCache.keys.mockResolvedValue(Array.from({ length: 50 }, (_, i) => 
        new Request(`/existing${i}.glb`)
      ));
      mockCache.match.mockResolvedValue(new Response(new ArrayBuffer(1048576))); // 1MB per item

      global.fetch = vi.fn().mockResolvedValue(
        new Response(new ArrayBuffer(1024), { status: 200 })
      );

      await ModelCacheService.smartPreload(testUrls, 'high');

      // 由于缓存使用率高，应该限制预加载数量
      expect(global.fetch).toHaveBeenCalledTimes(2); // high priority, >80% usage = 2
    });

    it('应该处理不同优先级', async () => {
      const testUrls = Array.from({ length: 10 }, (_, i) => `/model${i}.glb`);

      // 模拟低缓存使用率
      mockCache.keys.mockResolvedValue([]);
      mockCache.match.mockResolvedValue(null);

      global.fetch = vi.fn().mockResolvedValue(
        new Response(new ArrayBuffer(1024), { status: 200 })
      );

      await ModelCacheService.smartPreload(testUrls, 'low');

      // 低优先级，低使用率应该预加载3个
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('维护任务', () => {
    it('应该执行完整的维护任务', async () => {
      const now = Date.now();
      const mockRequests = [
        new Request('/expired.glb'),
        new Request('/old.glb'),
        new Request('/new.glb')
      ];

      const responses = [
        new Response(new ArrayBuffer(1024), {
          headers: { 'Cache-Expiry': (now - 1000).toString() } // 过期
        }),
        new Response(new ArrayBuffer(1024), {
          headers: { 
            'Cache-Timestamp': (now - 86400000).toString(),
            'Cache-Expiry': (now + 86400000).toString()
          }
        }),
        new Response(new ArrayBuffer(1024), {
          headers: { 
            'Cache-Timestamp': now.toString(),
            'Cache-Expiry': (now + 86400000).toString()
          }
        })
      ];

      mockCache.keys.mockResolvedValue(mockRequests);
      mockCache.match
        .mockResolvedValueOnce(responses[0])
        .mockResolvedValueOnce(responses[1])
        .mockResolvedValueOnce(responses[2])
        .mockResolvedValueOnce(responses[1]) // for size check
        .mockResolvedValueOnce(responses[2]); // for size check
      mockCache.delete.mockResolvedValue(true);

      const result = await ModelCacheService.performMaintenance();
      
      expect(result).toHaveProperty('expiredCleaned');
      expect(result).toHaveProperty('oldCleaned');
      expect(result).toHaveProperty('finalSize');
      expect(result.expiredCleaned).toBeGreaterThanOrEqual(0);
    });
  });

  describe('错误处理', () => {
    it('应该处理Cache API不可用', async () => {
      delete (window as any).caches;

      const result = await ModelCacheService.cacheModel('/test.glb', new ArrayBuffer(1024));
      expect(result).toBe(false);

      const cached = await ModelCacheService.getCachedModel('/test.glb');
      expect(cached).toBeNull();

      const size = await ModelCacheService.getCacheSize();
      expect(size).toBe(0);
    });

    it('应该处理网络错误', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await ModelCacheService.preloadModel('/test.glb');
      expect(result).toBe(false);
    });

    it('应该处理缓存操作失败', async () => {
      mockCache.put.mockRejectedValue(new Error('Cache error'));

      const result = await ModelCacheService.cacheModel('/test.glb', new ArrayBuffer(1024));
      expect(result).toBe(false);
    });

    it('属性测试：错误处理应该是健壮的', () => {
      fc.assert(fc.property(
        fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.constant(''),
          fc.string()
        ),
        async (invalidInput: any) => {
          // 测试各种无效输入不会导致崩溃
          await expect(
            ModelCacheService.getCachedModel(invalidInput)
          ).resolves.not.toThrow();
        }
      ), { numRuns: 5 });
    });
  });

  describe('缓存机制完整性', () => {
    it('应该提供完整的缓存功能', () => {
      // 验证所有核心功能都可用
      expect(typeof ModelCacheService.cacheModel).toBe('function');
      expect(typeof ModelCacheService.getCachedModel).toBe('function');
      expect(typeof ModelCacheService.preloadModel).toBe('function');
      expect(typeof ModelCacheService.getCacheSize).toBe('function');
      expect(typeof ModelCacheService.clearAllCache).toBe('function');
    });

    it('属性测试：缓存机制应该是一致的', () => {
      fc.assert(fc.property(
        fc.webUrl(),
        fc.uint8Array({ minLength: 100, maxLength: 1000 }),
        async (url: string, data: Uint8Array) => {
          const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
          
          mockCache.keys.mockResolvedValue([]);
          mockCache.put.mockResolvedValue(undefined);

          // 缓存应该成功
          const cacheResult = await ModelCacheService.cacheModel(url, arrayBuffer);
          expect(cacheResult).toBe(true);

          // 检查是否缓存应该返回true
          mockCache.match.mockResolvedValue(new Response(arrayBuffer, {
            headers: {
              'Cache-Timestamp': Date.now().toString(),
              'Cache-Expiry': (Date.now() + 86400000).toString()
            }
          }));

          const isCached = await ModelCacheService.isModelCached(url);
          expect(isCached).toBe(true);
        }
      ), { numRuns: 3 });
    });
  });
});