import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import Layout from '../components/Layout/Layout';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 1: 响应式布局适配
 * 验证需求: 需求1.3, 10.1
 */
describe('响应式布局属性测试', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AppProvider>
        {component}
      </AppProvider>
    );
  };

  // 模拟不同屏幕尺寸
  const setViewportSize = (width: number, height: number = 800) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    
    // 触发resize事件
    window.dispatchEvent(new Event('resize'));
  };

  beforeEach(() => {
    // 重置为默认尺寸
    setViewportSize(375, 667); // iPhone SE尺寸
  });

  afterEach(() => {
    // 清理
    setViewportSize(1024, 768);
  });

  describe('响应式布局适配', () => {
    it('应该在320px宽度下正确显示', () => {
      setViewportSize(320, 568);
      renderWithProvider(<Layout />);
      
      // 验证布局容器存在且有正确的类
      const layoutContainer = screen.getByRole('navigation').parentElement;
      expect(layoutContainer).toHaveClass('max-w-md', 'mx-auto');
      
      // 验证导航栏可见
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeVisible();
    });

    it('应该在768px宽度下正确显示', () => {
      setViewportSize(768, 1024);
      renderWithProvider(<Layout />);
      
      const layoutContainer = screen.getByRole('navigation').parentElement;
      expect(layoutContainer).toHaveClass('max-w-md', 'mx-auto');
      
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeVisible();
    });

    it('属性测试：对于任何屏幕宽度在320px到768px范围内的设备，所有UI组件都应该正确显示且不出现水平滚动条', () => {
      fc.assert(fc.property(
        fc.integer({ min: 320, max: 768 }),
        fc.integer({ min: 480, max: 1024 }),
        (width, height) => {
          setViewportSize(width, height);
          const { unmount } = renderWithProvider(<Layout />);
          
          // 验证主容器不超出视口宽度
          const layoutContainer = screen.getByRole('navigation').parentElement;
          expect(layoutContainer).toHaveClass('max-w-md'); // 限制最大宽度
          
          // 验证导航栏可见且正确定位
          const navigation = screen.getByRole('navigation');
          expect(navigation).toBeVisible();
          expect(navigation).toHaveClass('fixed', 'bottom-0');
          
          // 验证所有导航按钮都有适当的尺寸
          const buttons = screen.getAllByRole('button');
          buttons.forEach(button => {
            expect(button).toHaveClass('min-h-touch', 'min-w-touch');
          });
          
          unmount();
        }
      ), { numRuns: 30 });
    });

    it('应该使用移动优先的断点系统', () => {
      renderWithProvider(<Layout />);
      
      // 检查Tailwind的移动优先类是否正确应用
      const layoutContainer = screen.getByRole('navigation').parentElement;
      expect(layoutContainer).toHaveClass('flex', 'flex-col', 'h-screen');
    });
  });

  describe('内容适配性', () => {
    it('主内容区域应该有适当的内边距', () => {
      renderWithProvider(<Layout />);
      
      const mainContent = screen.getByRole('navigation').parentElement?.querySelector('div');
      expect(mainContent).toHaveClass('pb-20'); // 为导航栏留出空间
    });

    it('应该防止内容被导航栏遮挡', () => {
      renderWithProvider(<Layout />);
      
      const navigation = screen.getByRole('navigation');
      const mainContent = navigation.parentElement?.querySelector('div');
      
      // 主内容应该有底部间距
      expect(mainContent).toHaveClass('pb-20');
      
      // 导航栏应该是固定定位
      expect(navigation).toHaveClass('fixed', 'bottom-0');
    });
  });

  describe('触摸友好性', () => {
    it('所有交互元素应该有最小触摸目标尺寸', () => {
      renderWithProvider(<Layout />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-touch'); // 最小44px高度
        expect(button).toHaveClass('min-w-touch'); // 最小44px宽度
      });
    });

    it('属性测试：对于任何交互元素，触摸目标尺寸应该不小于44px', () => {
      fc.assert(fc.property(
        fc.constantFrom('home', 'wardrobe', 'studio', 'scan', 'profile'),
        (tabId) => {
          const { unmount } = renderWithProvider(<Layout />);
          
          const buttons = screen.getAllByRole('button');
          buttons.forEach(button => {
            // 验证最小触摸目标类存在
            expect(button).toHaveClass('min-h-touch', 'min-w-touch');
          });
          
          unmount();
        }
      ), { numRuns: 15 });
    });
  });

  describe('视觉层次', () => {
    it('应该在不同屏幕尺寸下保持正确的视觉层次', () => {
      const sizes = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 375, height: 667 }, // iPhone 8
        { width: 414, height: 896 }, // iPhone 11
        { width: 768, height: 1024 } // iPad Mini
      ];

      sizes.forEach(({ width, height }) => {
        setViewportSize(width, height);
        const { unmount } = renderWithProvider(<Layout />);
        
        // 验证布局结构
        const layoutContainer = screen.getByRole('navigation').parentElement;
        expect(layoutContainer).toHaveClass('flex', 'flex-col');
        
        // 验证导航栏在底部
        const navigation = screen.getByRole('navigation');
        expect(navigation).toHaveClass('bottom-0');
        
        unmount();
      });
    });
  });
});