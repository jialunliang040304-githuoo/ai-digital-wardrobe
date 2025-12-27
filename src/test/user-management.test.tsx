import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import Profile from '../components/Pages/Profile';
import { StorageService } from '../services/storageService';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 17: 用户管理功能完整性
 * 验证需求: 需求7.5
 */
describe('用户管理属性测试', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AppProvider>
        {component}
      </AppProvider>
    );
  };

  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks();
    
    // 设置localStorage mock的默认行为
    const storage: { [key: string]: string } = {};
    
    (localStorage.getItem as any) = vi.fn((key: string) => storage[key] || null);
    (localStorage.setItem as any) = vi.fn((key: string, value: string) => {
      storage[key] = value;
    });
    (localStorage.removeItem as any) = vi.fn((key: string) => {
      delete storage[key];
    });
    (localStorage.clear as any) = vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    });
  });

  describe('用户资料展示', () => {
    it('应该显示用户基本信息', () => {
      renderWithProvider(<Profile isActive={true} />);

      // 验证用户名显示
      expect(screen.getByText('时尚达人')).toBeInTheDocument();
      
      // 验证加入时间
      expect(screen.getByText(/加入于.*年/)).toBeInTheDocument();
    });

    it('应该显示用户统计数据', () => {
      renderWithProvider(<Profile isActive={true} />);

      // 验证统计标签
      expect(screen.getByText('造型')).toBeInTheDocument();
      expect(screen.getByText('关注者')).toBeInTheDocument();
      expect(screen.getByText('关注中')).toBeInTheDocument();
    });

    it('应该显示详细统计信息', () => {
      renderWithProvider(<Profile isActive={true} />);

      // 验证详细统计
      expect(screen.getByText('公开造型')).toBeInTheDocument();
      expect(screen.getByText('私人造型')).toBeInTheDocument();
      expect(screen.getByText('本月创建')).toBeInTheDocument();
      expect(screen.getByText('分享次数')).toBeInTheDocument();
    });

    it('属性测试：统计数据应该与存储服务一致', () => {
      fc.assert(fc.property(
        fc.constant(true), // 简单的属性测试
        () => {
          // Mock StorageService.getStorageStats
          const mockStats = {
            totalLooks: 5,
            storageUsed: 256,
            storageLimit: 1024,
            storagePercentage: 25.5,
            lastSaved: new Date(),
            publicLooks: 3,
            privateLooks: 2
          };
          
          vi.spyOn(StorageService, 'getStorageStats').mockReturnValue(mockStats);

          renderWithProvider(<Profile isActive={true} />);

          // 验证统计数据显示正确
          expect(screen.getByText('5')).toBeInTheDocument(); // totalLooks
          expect(screen.getByText('3')).toBeInTheDocument(); // publicLooks
          expect(screen.getByText('2')).toBeInTheDocument(); // privateLooks
        }
      ), { numRuns: 3 });
    });
  });

  describe('造型管理功能', () => {
    it('应该显示我的造型管理区域', () => {
      renderWithProvider(<Profile isActive={true} />);

      expect(screen.getByText('我的造型')).toBeInTheDocument();
    });

    it('应该显示造型分类按钮', () => {
      renderWithProvider(<Profile isActive={true} />);

      expect(screen.getByText('全部造型')).toBeInTheDocument();
      expect(screen.getByText('公开造型')).toBeInTheDocument();
      expect(screen.getByText('私人造型')).toBeInTheDocument();
      expect(screen.getByText('收藏夹')).toBeInTheDocument();
    });

    it('应该显示每个分类的数量', () => {
      renderWithProvider(<Profile isActive={true} />);

      // 验证数量显示格式
      expect(screen.getByText(/\d+ 个/)).toBeInTheDocument();
    });

    it('应该支持造型分类按钮点击', () => {
      renderWithProvider(<Profile isActive={true} />);

      const allLooksButton = screen.getByText('全部造型').closest('button');
      const publicLooksButton = screen.getByText('公开造型').closest('button');
      const privateLooksButton = screen.getByText('私人造型').closest('button');
      const favoritesButton = screen.getByText('收藏夹').closest('button');

      // 验证按钮可点击
      expect(allLooksButton).not.toBeDisabled();
      expect(publicLooksButton).not.toBeDisabled();
      expect(privateLooksButton).not.toBeDisabled();
      expect(favoritesButton).not.toBeDisabled();

      // 测试点击事件
      fireEvent.click(allLooksButton!);
      fireEvent.click(publicLooksButton!);
      fireEvent.click(privateLooksButton!);
      fireEvent.click(favoritesButton!);

      // 验证点击不会导致错误
    });

    it('属性测试：造型数量应该正确计算', () => {
      fc.assert(fc.property(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 0, max: 50 }),
        (publicCount: number, privateCount: number) => {
          const totalCount = publicCount + privateCount;
          
          const mockStats = {
            totalLooks: totalCount,
            storageUsed: 256,
            storageLimit: 1024,
            storagePercentage: 10,
            lastSaved: new Date(),
            publicLooks: publicCount,
            privateLooks: privateCount
          };
          
          vi.spyOn(StorageService, 'getStorageStats').mockReturnValue(mockStats);

          renderWithProvider(<Profile isActive={true} />);

          // 验证总数显示
          if (totalCount > 0) {
            expect(screen.getByText(`${totalCount} 个`)).toBeInTheDocument();
          }
          
          // 验证公开造型数量
          if (publicCount > 0) {
            expect(screen.getByText(`${publicCount} 个`)).toBeInTheDocument();
          }
          
          // 验证私人造型数量
          if (privateCount > 0) {
            expect(screen.getByText(`${privateCount} 个`)).toBeInTheDocument();
          }
        }
      ), { numRuns: 10 });
    });
  });

  describe('个人资料设置', () => {
    it('应该显示设置按钮', () => {
      renderWithProvider(<Profile isActive={true} />);

      expect(screen.getByText('个人资料设置')).toBeInTheDocument();
    });

    it('应该支持展开和收起设置菜单', () => {
      renderWithProvider(<Profile isActive={true} />);

      const settingsButton = screen.getByText('个人资料设置').closest('button');
      
      // 初始状态下设置菜单应该是隐藏的
      expect(screen.queryByText('编辑个人信息')).not.toBeInTheDocument();

      // 点击展开设置菜单
      fireEvent.click(settingsButton!);
      expect(screen.getByText('编辑个人信息')).toBeInTheDocument();

      // 再次点击收起设置菜单
      fireEvent.click(settingsButton!);
      expect(screen.queryByText('编辑个人信息')).not.toBeInTheDocument();
    });

    it('应该显示所有设置选项', () => {
      renderWithProvider(<Profile isActive={true} />);

      const settingsButton = screen.getByText('个人资料设置').closest('button');
      fireEvent.click(settingsButton!);

      // 验证所有设置选项
      expect(screen.getByText('编辑个人信息')).toBeInTheDocument();
      expect(screen.getByText('隐私设置')).toBeInTheDocument();
      expect(screen.getByText('通知设置')).toBeInTheDocument();
      expect(screen.getByText('数据导出')).toBeInTheDocument();
      expect(screen.getByText('退出登录')).toBeInTheDocument();
    });

    it('应该支持设置选项点击', () => {
      renderWithProvider(<Profile isActive={true} />);

      const settingsButton = screen.getByText('个人资料设置').closest('button');
      fireEvent.click(settingsButton!);

      // 测试各个设置选项的点击
      const editProfileButton = screen.getByText('编辑个人信息');
      const privacyButton = screen.getByText('隐私设置');
      const notificationButton = screen.getByText('通知设置');
      const exportButton = screen.getByText('数据导出');
      const logoutButton = screen.getByText('退出登录');

      fireEvent.click(editProfileButton);
      fireEvent.click(privacyButton);
      fireEvent.click(notificationButton);
      fireEvent.click(exportButton);
      fireEvent.click(logoutButton);

      // 验证点击不会导致错误
    });

    it('应该区分危险操作的样式', () => {
      renderWithProvider(<Profile isActive={true} />);

      const settingsButton = screen.getByText('个人资料设置').closest('button');
      fireEvent.click(settingsButton!);

      const logoutButton = screen.getByText('退出登录');
      
      // 验证退出登录按钮有红色样式
      expect(logoutButton).toHaveClass('text-red-600');
    });
  });

  describe('存储管理', () => {
    it('应该显示存储管理选项', () => {
      renderWithProvider(<Profile isActive={true} />);

      expect(screen.getByText('存储管理')).toBeInTheDocument();
    });

    it('应该显示存储使用率', () => {
      const mockStats = {
        totalLooks: 10,
        storageUsed: 432,
        storageLimit: 1024,
        storagePercentage: 42.3,
        lastSaved: new Date(),
        publicLooks: 5,
        privateLooks: 5
      };
      
      vi.spyOn(StorageService, 'getStorageStats').mockReturnValue(mockStats);

      renderWithProvider(<Profile isActive={true} />);

      expect(screen.getByText('42.3% 已使用')).toBeInTheDocument();
    });

    it('属性测试：存储使用率应该正确显示', () => {
      fc.assert(fc.property(
        fc.float({ min: 0, max: 100 }),
        (percentage: number) => {
          const mockStats = {
            totalLooks: 10,
            storageUsed: Math.round(percentage * 10.24),
            storageLimit: 1024,
            storagePercentage: percentage,
            lastSaved: new Date(),
            publicLooks: 5,
            privateLooks: 5
          };
          
          vi.spyOn(StorageService, 'getStorageStats').mockReturnValue(mockStats);

          renderWithProvider(<Profile isActive={true} />);

          const expectedText = `${percentage.toFixed(1)}% 已使用`;
          expect(screen.getByText(expectedText)).toBeInTheDocument();
        }
      ), { numRuns: 10 });
    });
  });

  describe('用户界面交互', () => {
    it('应该支持键盘导航', () => {
      renderWithProvider(<Profile isActive={true} />);

      const settingsButton = screen.getByText('个人资料设置').closest('button');
      
      // 测试焦点
      fireEvent.focus(settingsButton!);
      expect(settingsButton).toHaveFocus();

      // 测试键盘激活
      fireEvent.keyDown(settingsButton!, { key: 'Enter' });
      expect(screen.getByText('编辑个人信息')).toBeInTheDocument();
    });

    it('应该有适当的触摸目标大小', () => {
      renderWithProvider(<Profile isActive={true} />);

      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        // 验证所有按钮都有最小触摸目标类
        expect(button).toHaveClass('min-h-touch');
      });
    });

    it('应该支持悬停效果', () => {
      renderWithProvider(<Profile isActive={true} />);

      const settingsButton = screen.getByText('个人资料设置').closest('button');
      
      // 验证悬停样式类存在
      expect(settingsButton).toHaveClass('hover:bg-gray-100');
    });

    it('应该正确处理快速点击', () => {
      renderWithProvider(<Profile isActive={true} />);

      const settingsButton = screen.getByText('个人资料设置').closest('button');
      
      // 快速多次点击
      for (let i = 0; i < 5; i++) {
        fireEvent.click(settingsButton!);
      }

      // 验证最终状态（应该是展开的，因为奇数次点击）
      expect(screen.getByText('编辑个人信息')).toBeInTheDocument();
    });
  });

  describe('数据一致性', () => {
    it('应该与存储服务数据保持同步', () => {
      const mockStats = {
        totalLooks: 15,
        storageUsed: 668,
        storageLimit: 1024,
        storagePercentage: 65.2,
        lastSaved: new Date(),
        publicLooks: 8,
        privateLooks: 7
      };
      
      vi.spyOn(StorageService, 'getStorageStats').mockReturnValue(mockStats);

      renderWithProvider(<Profile isActive={true} />);

      // 验证各项数据显示正确
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('65.2% 已使用')).toBeInTheDocument();
    });

    it('应该处理空数据状态', () => {
      const mockStats = {
        totalLooks: 0,
        storageUsed: 0,
        storageLimit: 1024,
        storagePercentage: 0,
        lastSaved: new Date(),
        publicLooks: 0,
        privateLooks: 0
      };
      
      vi.spyOn(StorageService, 'getStorageStats').mockReturnValue(mockStats);

      renderWithProvider(<Profile isActive={true} />);

      // 验证零值正确显示
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0.0% 已使用')).toBeInTheDocument();
    });

    it('属性测试：用户管理功能应该完整可用', () => {
      fc.assert(fc.property(
        fc.record({
          totalLooks: fc.integer({ min: 0, max: 100 }),
          publicLooks: fc.integer({ min: 0, max: 50 }),
          privateLooks: fc.integer({ min: 0, max: 50 }),
          storagePercentage: fc.float({ min: 0, max: 100 })
        }),
        (stats) => {
          vi.spyOn(StorageService, 'getStorageStats').mockReturnValue(stats);

          renderWithProvider(<Profile isActive={true} />);

          // 验证核心功能都存在
          expect(screen.getByText('我的造型')).toBeInTheDocument();
          expect(screen.getByText('个人资料设置')).toBeInTheDocument();
          expect(screen.getByText('存储管理')).toBeInTheDocument();
          expect(screen.getByText('帮助与反馈')).toBeInTheDocument();

          // 验证数据显示
          expect(screen.getByText(`${stats.storagePercentage.toFixed(1)}% 已使用`)).toBeInTheDocument();
        }
      ), { numRuns: 10 });
    });
  });

  describe('错误处理', () => {
    it('应该处理存储服务错误', () => {
      // Mock StorageService to throw error
      vi.spyOn(StorageService, 'getStorageStats').mockImplementation(() => {
        throw new Error('Storage error');
      });

      // 组件应该能够渲染而不崩溃
      expect(() => {
        renderWithProvider(<Profile isActive={true} />);
      }).not.toThrow();
    });

    it('应该处理无效数据', () => {
      const mockStats = {
        totalLooks: -1, // 无效值
        publicLooks: NaN, // 无效值
        privateLooks: undefined, // 无效值
        storagePercentage: Infinity // 无效值
      };
      
      vi.spyOn(StorageService, 'getStorageStats').mockReturnValue(mockStats as any);

      // 组件应该能够渲染而不崩溃
      expect(() => {
        renderWithProvider(<Profile isActive={true} />);
      }).not.toThrow();
    });

    it('应该提供默认值', () => {
      // Mock StorageService to return undefined
      vi.spyOn(StorageService, 'getStorageStats').mockReturnValue(undefined as any);

      renderWithProvider(<Profile isActive={true} />);

      // 验证组件仍然渲染
      expect(screen.getByText('我的造型')).toBeInTheDocument();
    });
  });
});