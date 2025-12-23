import { SavedLook } from '../types';

// 本地存储键名
const STORAGE_KEYS = {
  SAVED_LOOKS: 'digital_wardrobe_saved_looks',
  USER_PREFERENCES: 'digital_wardrobe_user_preferences',
  CLOTHING_ITEMS: 'digital_wardrobe_clothing_items'
};

// 存储服务类
export class StorageService {
  // 保存造型到本地存储
  static saveLook(look: SavedLook): boolean {
    try {
      const existingLooks = this.getSavedLooks();
      const updatedLooks = [...existingLooks, look];
      
      localStorage.setItem(STORAGE_KEYS.SAVED_LOOKS, JSON.stringify(updatedLooks));
      
      // 记录保存时间戳
      const metadata = {
        lastSaved: new Date().toISOString(),
        totalLooks: updatedLooks.length
      };
      localStorage.setItem(`${STORAGE_KEYS.SAVED_LOOKS}_metadata`, JSON.stringify(metadata));
      
      return true;
    } catch (error) {
      console.error('保存造型失败:', error);
      return false;
    }
  }

  // 获取所有保存的造型
  static getSavedLooks(): SavedLook[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_LOOKS);
      if (!stored) return [];
      
      const looks = JSON.parse(stored);
      
      // 转换日期字符串为Date对象
      return looks.map((look: any) => ({
        ...look,
        createdAt: new Date(look.createdAt)
      }));
    } catch (error) {
      console.error('获取保存的造型失败:', error);
      return [];
    }
  }

  // 删除指定造型
  static deleteLook(lookId: string): boolean {
    try {
      const existingLooks = this.getSavedLooks();
      const updatedLooks = existingLooks.filter(look => look.id !== lookId);
      
      localStorage.setItem(STORAGE_KEYS.SAVED_LOOKS, JSON.stringify(updatedLooks));
      
      // 更新元数据
      const metadata = {
        lastModified: new Date().toISOString(),
        totalLooks: updatedLooks.length
      };
      localStorage.setItem(`${STORAGE_KEYS.SAVED_LOOKS}_metadata`, JSON.stringify(metadata));
      
      return true;
    } catch (error) {
      console.error('删除造型失败:', error);
      return false;
    }
  }

  // 更新造型信息
  static updateLook(lookId: string, updates: Partial<SavedLook>): boolean {
    try {
      const existingLooks = this.getSavedLooks();
      const lookIndex = existingLooks.findIndex(look => look.id === lookId);
      
      if (lookIndex === -1) {
        console.error('未找到指定的造型');
        return false;
      }
      
      existingLooks[lookIndex] = {
        ...existingLooks[lookIndex],
        ...updates
      };
      
      localStorage.setItem(STORAGE_KEYS.SAVED_LOOKS, JSON.stringify(existingLooks));
      
      return true;
    } catch (error) {
      console.error('更新造型失败:', error);
      return false;
    }
  }

  // 获取存储统计信息
  static getStorageStats() {
    try {
      const looks = this.getSavedLooks();
      const metadata = localStorage.getItem(`${STORAGE_KEYS.SAVED_LOOKS}_metadata`);
      const parsedMetadata = metadata ? JSON.parse(metadata) : {};
      
      // 计算存储使用情况
      const storageUsed = new Blob([localStorage.getItem(STORAGE_KEYS.SAVED_LOOKS) || '']).size;
      const maxStorage = 5 * 1024 * 1024; // 5MB 限制
      
      return {
        totalLooks: looks.length,
        storageUsed: storageUsed,
        storageLimit: maxStorage,
        storagePercentage: (storageUsed / maxStorage) * 100,
        lastSaved: parsedMetadata.lastSaved,
        publicLooks: looks.filter(look => look.isPublic).length,
        privateLooks: looks.filter(look => !look.isPublic).length
      };
    } catch (error) {
      console.error('获取存储统计失败:', error);
      return {
        totalLooks: 0,
        storageUsed: 0,
        storageLimit: 5 * 1024 * 1024,
        storagePercentage: 0,
        lastSaved: null,
        publicLooks: 0,
        privateLooks: 0
      };
    }
  }

  // 导出造型数据
  static exportLooks(): string {
    try {
      const looks = this.getSavedLooks();
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        looks: looks
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('导出造型数据失败:', error);
      throw new Error('导出失败');
    }
  }

  // 导入造型数据
  static importLooks(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.looks || !Array.isArray(importData.looks)) {
        throw new Error('无效的数据格式');
      }
      
      const existingLooks = this.getSavedLooks();
      const newLooks = importData.looks.map((look: any) => ({
        ...look,
        id: `imported_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`, // 生成新ID避免冲突
        createdAt: new Date(look.createdAt)
      }));
      
      const allLooks = [...existingLooks, ...newLooks];
      localStorage.setItem(STORAGE_KEYS.SAVED_LOOKS, JSON.stringify(allLooks));
      
      return true;
    } catch (error) {
      console.error('导入造型数据失败:', error);
      return false;
    }
  }

  // 清空所有造型数据
  static clearAllLooks(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEYS.SAVED_LOOKS);
      localStorage.removeItem(`${STORAGE_KEYS.SAVED_LOOKS}_metadata`);
      return true;
    } catch (error) {
      console.error('清空造型数据失败:', error);
      return false;
    }
  }

  // 检查存储空间是否充足
  static checkStorageSpace(): { hasSpace: boolean; usagePercentage: number } {
    try {
      const stats = this.getStorageStats();
      return {
        hasSpace: stats.storagePercentage < 90, // 90%以下认为有足够空间
        usagePercentage: stats.storagePercentage
      };
    } catch (error) {
      console.error('检查存储空间失败:', error);
      return { hasSpace: true, usagePercentage: 0 };
    }
  }

  // 保存用户偏好设置
  static saveUserPreferences(preferences: any): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('保存用户偏好失败:', error);
      return false;
    }
  }

  // 获取用户偏好设置
  static getUserPreferences(): any {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('获取用户偏好失败:', error);
      return {};
    }
  }
}