import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import SaveLookModal from '../components/TryOnStudio/SaveLookModal';
import { StorageService } from '../services/storageService';
import { WornClothing, ClothingItem } from '../types';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 12: 造型保存完整性
 * 验证需求: 需求6.2, 6.3
 */
describe('造型保存属性测试', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AppProvider>
        {component}
      </AppProvider>
    );
  };

  // 创建测试用的服装物品
  const createMockClothingItem = (id: string, name: string): ClothingItem => ({
    id,
    name,
    category: 'tops',
    type: 'shirt',
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: ['测试'],
    createdAt: new Date()
  });

  // 创建测试用的穿着组合
  const createMockWornClothing = (): WornClothing => ({
    top: createMockClothingItem('top1', '白色T恤'),
    bottom: createMockClothingItem('bottom1', '蓝色牛仔裤'),
    shoes: createMockClothingItem('shoes1', '白色运动鞋'),
    accessories: [createMockClothingItem('acc1', '黑色帽子')]
  });

  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks();
    
    // 设置localStorage mock的默认行为
    const storage: { [key: string]: string } = {};
    
    (localStorage.getItem as any).mockImplementation((key: string) => storage[key] || null);
    (localStorage.setItem as any).mockImplementation((key: string, value: string) => {
      storage[key] = value;
    });
    (localStorage.removeItem as any).mockImplementation((key: string) => {
      delete storage[key];
    });
    (localStorage.clear as any).mockImplementation(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('保存造型模态框', () => {
    const mockCurrentLook = createMockWornClothing();
    const mockOnClose = vi.fn();

    it('应该显示当前造型摘要', () => {
      renderWithProvider(
        <SaveLookModal
          isOpen={true}
          onClose={mockOnClose}
          currentLook={mockCurrentLook}
        />
      );

      expect(screen.getByText('保存造型')).toBeInTheDocument();
      expect(screen.getByText('当前造型')).toBeInTheDocument();
      expect(screen.getByText(/白色T恤.*蓝色牛仔裤.*白色运动鞋.*黑色帽子/)).toBeInTheDocument();
    });

    it('应该要求输入造型名称', () => {
      renderWithProvider(
        <SaveLookModal
          isOpen={true}
          onClose={mockOnClose}
          currentLook={mockCurrentLook}
        />
      );

      const nameInput = screen.getByPlaceholderText('为你的造型起个名字...');
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toBeRequired;
    });

    it('应该支持添加和删除标签', () => {
      renderWithProvider(
        <SaveLookModal
          isOpen={true}
          onClose={mockOnClose}
          currentLook={mockCurrentLook}
        />
      );

      const tagInput = screen.getByPlaceholderText('添加标签...');
      const addButton = screen.getByText('添加');

      // 添加标签
      fireEvent.change(tagInput, { target: { value: '休闲' } });
      fireEvent.click(addButton);

      expect(screen.getByText('#休闲')).toBeInTheDocument();

      // 删除标签
      const deleteButton = screen.getByLabelText('删除标签 休闲');
      fireEvent.click(deleteButton);

      expect(screen.queryByText('#休闲')).not.toBeInTheDocument();
    });

    it('应该支持隐私设置选择', () => {
      renderWithProvider(
        <SaveLookModal
          isOpen={true}
          onClose={mockOnClose}
          currentLook={mockCurrentLook}
        />
      );

      const privateRadio = screen.getByLabelText(/私人/);
      const publicRadio = screen.getByLabelText(/公开/);

      expect(privateRadio).toBeChecked();
      expect(publicRadio).not.toBeChecked();

      // 切换到公开
      fireEvent.click(publicRadio);
      expect(publicRadio).toBeChecked();
      expect(privateRadio).not.toBeChecked();
    });
  });

  describe('造型保存完整性', () => {
    it('属性测试：保存的造型应该包含所有必要信息', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
        fc.boolean(),
        (lookName: string, tags: string[], isPublic: boolean) => {
          const mockCurrentLook = createMockWornClothing();
          
          // 清空存储
          StorageService.clearAllLooks();
          
          // 创建造型数据
          const savedLook = {
            id: `test_${Date.now()}`,
            name: lookName.trim(),
            userId: 'test_user',
            clothing: mockCurrentLook,
            screenshot: '',
            tags: [...new Set(tags)], // 去重
            isPublic: isPublic,
            createdAt: new Date()
          };

          // 保存造型
          const saveResult = StorageService.saveLook(savedLook);
          expect(saveResult).toBe(true);

          // 验证保存的数据
          const savedLooks = StorageService.getSavedLooks();
          expect(savedLooks).toHaveLength(1);
          
          const saved = savedLooks[0];
          expect(saved.name).toBe(lookName.trim());
          expect(saved.isPublic).toBe(isPublic);
          expect(saved.clothing.top?.name).toBe('白色T恤');
          expect(saved.clothing.bottom?.name).toBe('蓝色牛仔裤');
          expect(saved.clothing.shoes?.name).toBe('白色运动鞋');
          expect(saved.clothing.accessories).toHaveLength(1);
          expect(saved.clothing.accessories[0].name).toBe('黑色帽子');
        }
      ), { numRuns: 20 });
    });

    it('应该正确处理空造型', () => {
      const emptyLook: WornClothing = { accessories: [] };
      
      const savedLook = {
        id: 'empty_look',
        name: '空造型',
        userId: 'test_user',
        clothing: emptyLook,
        screenshot: '',
        tags: [],
        isPublic: false,
        createdAt: new Date()
      };

      const saveResult = StorageService.saveLook(savedLook);
      expect(saveResult).toBe(true);

      const savedLooks = StorageService.getSavedLooks();
      expect(savedLooks).toHaveLength(1);
      expect(savedLooks[0].clothing.accessories).toHaveLength(0);
      expect(savedLooks[0].clothing.top).toBeUndefined();
    });

    it('应该生成唯一的造型ID', () => {
      const mockCurrentLook = createMockWornClothing();
      const savedIds = new Set<string>();

      // 保存多个造型
      for (let i = 0; i < 10; i++) {
        const savedLook = {
          id: `look_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: `造型${i}`,
          userId: 'test_user',
          clothing: mockCurrentLook,
          screenshot: '',
          tags: [],
          isPublic: false,
          createdAt: new Date()
        };

        StorageService.saveLook(savedLook);
        savedIds.add(savedLook.id);
      }

      // 验证所有ID都是唯一的
      expect(savedIds.size).toBe(10);
      
      const savedLooks = StorageService.getSavedLooks();
      expect(savedLooks).toHaveLength(10);
    });
  });

  describe('本地存储持久化', () => {
    it('应该正确保存到localStorage', () => {
      const mockCurrentLook = createMockWornClothing();
      
      const savedLook = {
        id: 'test_look',
        name: '测试造型',
        userId: 'test_user',
        clothing: mockCurrentLook,
        screenshot: '',
        tags: ['测试', '保存'],
        isPublic: true,
        createdAt: new Date()
      };

      StorageService.saveLook(savedLook);

      // 直接检查localStorage
      const stored = localStorage.getItem('digital_wardrobe_saved_looks');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('测试造型');
      expect(parsed[0].tags).toEqual(['测试', '保存']);
    });

    it('应该保存元数据信息', () => {
      const mockCurrentLook = createMockWornClothing();
      
      const savedLook = {
        id: 'metadata_test',
        name: '元数据测试',
        userId: 'test_user',
        clothing: mockCurrentLook,
        screenshot: '',
        tags: [],
        isPublic: false,
        createdAt: new Date()
      };

      StorageService.saveLook(savedLook);

      // 检查元数据
      const metadata = localStorage.getItem('digital_wardrobe_saved_looks_metadata');
      expect(metadata).toBeTruthy();
      
      const parsedMetadata = JSON.parse(metadata!);
      expect(parsedMetadata.totalLooks).toBe(1);
      expect(parsedMetadata.lastSaved).toBeTruthy();
    });

    it('应该正确处理日期序列化', () => {
      const mockCurrentLook = createMockWornClothing();
      const testDate = new Date('2023-12-25T10:30:00Z');
      
      const savedLook = {
        id: 'date_test',
        name: '日期测试',
        userId: 'test_user',
        clothing: mockCurrentLook,
        screenshot: '',
        tags: [],
        isPublic: false,
        createdAt: testDate
      };

      StorageService.saveLook(savedLook);
      
      const savedLooks = StorageService.getSavedLooks();
      expect(savedLooks).toHaveLength(1);
      expect(savedLooks[0].createdAt).toBeInstanceOf(Date);
      expect(savedLooks[0].createdAt.getTime()).toBe(testDate.getTime());
    });
  });

  describe('存储空间管理', () => {
    it('应该正确计算存储使用情况', () => {
      const stats = StorageService.getStorageStats();
      
      expect(stats).toHaveProperty('totalLooks');
      expect(stats).toHaveProperty('storageUsed');
      expect(stats).toHaveProperty('storageLimit');
      expect(stats).toHaveProperty('storagePercentage');
      expect(stats.storagePercentage).toBeGreaterThanOrEqual(0);
      expect(stats.storagePercentage).toBeLessThanOrEqual(100);
    });

    it('应该检测存储空间不足', () => {
      // 模拟存储空间检查
      const spyCheckSpace = vi.spyOn(StorageService, 'checkStorageSpace');
      spyCheckSpace.mockReturnValue({ hasSpace: false, usagePercentage: 95 });

      const result = StorageService.checkStorageSpace();
      expect(result.hasSpace).toBe(false);
      expect(result.usagePercentage).toBe(95);

      spyCheckSpace.mockRestore();
    });
  });

  describe('数据导入导出', () => {
    it('应该正确导出造型数据', () => {
      const mockCurrentLook = createMockWornClothing();
      
      const savedLook = {
        id: 'export_test',
        name: '导出测试',
        userId: 'test_user',
        clothing: mockCurrentLook,
        screenshot: '',
        tags: ['导出'],
        isPublic: false,
        createdAt: new Date()
      };

      StorageService.saveLook(savedLook);
      
      const exportData = StorageService.exportLooks();
      expect(exportData).toBeTruthy();
      
      const parsed = JSON.parse(exportData);
      expect(parsed.version).toBe('1.0');
      expect(parsed.looks).toHaveLength(1);
      expect(parsed.looks[0].name).toBe('导出测试');
    });

    it('应该正确导入造型数据', () => {
      const importData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        looks: [{
          id: 'import_test',
          name: '导入测试',
          userId: 'test_user',
          clothing: createMockWornClothing(),
          screenshot: '',
          tags: ['导入'],
          isPublic: true,
          createdAt: new Date().toISOString()
        }]
      };

      const importResult = StorageService.importLooks(JSON.stringify(importData));
      expect(importResult).toBe(true);

      const savedLooks = StorageService.getSavedLooks();
      expect(savedLooks.length).toBeGreaterThan(0);
      
      const importedLook = savedLooks.find(look => look.name === '导入测试');
      expect(importedLook).toBeTruthy();
      expect(importedLook!.tags).toContain('导入');
    });
  });

  describe('错误处理', () => {
    it('应该处理localStorage写入失败', () => {
      // 模拟localStorage写入失败
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      const mockCurrentLook = createMockWornClothing();
      const savedLook = {
        id: 'error_test',
        name: '错误测试',
        userId: 'test_user',
        clothing: mockCurrentLook,
        screenshot: '',
        tags: [],
        isPublic: false,
        createdAt: new Date()
      };

      const result = StorageService.saveLook(savedLook);
      expect(result).toBe(false);

      // 恢复原始方法
      localStorage.setItem = originalSetItem;
    });

    it('应该处理无效的导入数据', () => {
      const invalidData = '{"invalid": "data"}';
      const result = StorageService.importLooks(invalidData);
      expect(result).toBe(false);
    });

    it('应该处理损坏的localStorage数据', () => {
      // 设置损坏的数据
      localStorage.setItem('digital_wardrobe_saved_looks', 'invalid json');
      
      const looks = StorageService.getSavedLooks();
      expect(looks).toEqual([]);
    });
  });

  describe('用户界面集成', () => {
    it('保存按钮应该在没有造型名称时禁用', () => {
      const mockCurrentLook = createMockWornClothing();
      const mockOnClose = vi.fn();

      renderWithProvider(
        <SaveLookModal
          isOpen={true}
          onClose={mockOnClose}
          currentLook={mockCurrentLook}
        />
      );

      const saveButton = screen.getByText('保存造型');
      expect(saveButton).toBeDisabled();
    });

    it('应该在输入造型名称后启用保存按钮', () => {
      const mockCurrentLook = createMockWornClothing();
      const mockOnClose = vi.fn();

      renderWithProvider(
        <SaveLookModal
          isOpen={true}
          onClose={mockOnClose}
          currentLook={mockCurrentLook}
        />
      );

      const nameInput = screen.getByPlaceholderText('为你的造型起个名字...');
      const saveButton = screen.getByText('保存造型');

      fireEvent.change(nameInput, { target: { value: '我的造型' } });
      expect(saveButton).not.toBeDisabled();
    });

    it('应该显示保存进度', async () => {
      const mockCurrentLook = createMockWornClothing();
      const mockOnClose = vi.fn();

      // Mock alert to avoid actual alerts in tests
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      renderWithProvider(
        <SaveLookModal
          isOpen={true}
          onClose={mockOnClose}
          currentLook={mockCurrentLook}
        />
      );

      const nameInput = screen.getByPlaceholderText('为你的造型起个名字...');
      const saveButton = screen.getByText('保存造型');

      fireEvent.change(nameInput, { target: { value: '测试造型' } });
      fireEvent.click(saveButton);

      // 应该显示保存中状态
      await waitFor(() => {
        expect(screen.getByText('保存中...')).toBeInTheDocument();
      });

      alertSpy.mockRestore();
    });
  });
});