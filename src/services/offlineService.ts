// 离线功能服务
export class OfflineService {
  private static swRegistration: ServiceWorkerRegistration | null = null;
  private static isOnline = navigator.onLine;
  private static onlineCallbacks: (() => void)[] = [];
  private static offlineCallbacks: (() => void)[] = [];

  // 初始化Service Worker
  static async init(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully');

      // 监听Service Worker更新
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 有新版本可用
              this.notifyUpdate();
            }
          });
        }
      });

      // 监听网络状态变化
      this.setupNetworkListeners();

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // 设置网络状态监听器
  private static setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onlineCallbacks.forEach(callback => callback());
      console.log('App is online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.offlineCallbacks.forEach(callback => callback());
      console.log('App is offline');
    });
  }

  // 检查是否在线
  static getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // 添加在线状态回调
  static onOnline(callback: () => void) {
    this.onlineCallbacks.push(callback);
  }

  // 添加离线状态回调
  static onOffline(callback: () => void) {
    this.offlineCallbacks.push(callback);
  }

  // 移除回调
  static removeOnlineCallback(callback: () => void) {
    const index = this.onlineCallbacks.indexOf(callback);
    if (index > -1) {
      this.onlineCallbacks.splice(index, 1);
    }
  }

  static removeOfflineCallback(callback: () => void) {
    const index = this.offlineCallbacks.indexOf(callback);
    if (index > -1) {
      this.offlineCallbacks.splice(index, 1);
    }
  }

  // 通知Service Worker更新
  private static notifyUpdate() {
    // 这里可以显示更新提示
    if (confirm('发现新版本，是否立即更新？')) {
      this.skipWaiting();
    }
  }

  // 跳过等待，立即激活新Service Worker
  static skipWaiting() {
    if (this.swRegistration && this.swRegistration.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  // 获取缓存大小
  static async getCacheSize(): Promise<number> {
    if (!this.swRegistration) {
      return 0;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.size || 0);
      };

      if (this.swRegistration.active) {
        this.swRegistration.active.postMessage(
          { type: 'GET_CACHE_SIZE' },
          [messageChannel.port2]
        );
      } else {
        resolve(0);
      }
    });
  }

  // 清理缓存
  static async clearCache(): Promise<boolean> {
    if (!this.swRegistration) {
      return false;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success || false);
      };

      if (this.swRegistration.active) {
        this.swRegistration.active.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      } else {
        resolve(false);
      }
    });
  }

  // 预缓存重要资源
  static async precacheResources(urls: string[]): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open('digital-wardrobe-precache-v1');
      await cache.addAll(urls);
      console.log('Resources precached successfully');
    } catch (error) {
      console.error('Failed to precache resources:', error);
    }
  }

  // 检查资源是否已缓存
  static async isResourceCached(url: string): Promise<boolean> {
    if (!('caches' in window)) {
      return false;
    }

    try {
      const response = await caches.match(url);
      return !!response;
    } catch (error) {
      console.error('Failed to check cache:', error);
      return false;
    }
  }

  // 获取缓存统计信息
  static async getCacheStats(): Promise<{
    totalSize: number;
    itemCount: number;
    cacheNames: string[];
  }> {
    if (!('caches' in window)) {
      return { totalSize: 0, itemCount: 0, cacheNames: [] };
    }

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      let itemCount = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        itemCount += requests.length;

        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return { totalSize, itemCount, cacheNames };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return { totalSize: 0, itemCount: 0, cacheNames: [] };
    }
  }

  // 格式化缓存大小
  static formatCacheSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 网络请求重试机制
  static async fetchWithRetry(
    url: string, 
    options: RequestInit = {}, 
    maxRetries = 3
  ): Promise<Response> {
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          return response;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        lastError = error as Error;
        
        if (i < maxRetries) {
          // 指数退避
          const delay = Math.pow(2, i) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  // 后台同步（如果支持）
  static async requestBackgroundSync(tag: string): Promise<boolean> {
    if (!this.swRegistration || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      return false;
    }

    try {
      await this.swRegistration.sync.register(tag);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }

  // 检查Service Worker支持
  static isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  // 检查缓存API支持
  static isCacheSupported(): boolean {
    return 'caches' in window;
  }

  // 检查后台同步支持
  static isBackgroundSyncSupported(): boolean {
    return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
  }
}