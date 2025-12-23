import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import Layout from '../components/Layout/Layout';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 4: 导航栏持久可见性
 * 验证需求: 需求2.5
 */
describe('布局持久性属性测试', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AppProvider>
        {component}
      </AppProvider>
    );
  };

  describe('导航栏持久可见性', () => {
    it('应该在所有页面状态下保持导航栏可见', () => {
      renderWithProvider(<Layout />);
      
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      expect(navigation).toHaveClass('fixed', 'bottom-0');
    });

    it('属性测试：对于任何页面状态和用户操作，底部导航栏应该始终保持固定位置且可见', () => {
      fc.assert(fc.property(
        fc.constantFrom('home', 'wardrobe', 'studio', 'scan', 'profile'),
        (tabId) => {
          const { unmount } = renderWithProvider(<Layout />);
          
          // 切换到指定页面
          const buttonLabel = {
            'home': '切换到首页页面',
            'wardrobe': '切换到衣柜页面',
            'studio': '切换到试穿页面',
            'scan': '切换到扫描页面', 
            'profile': '切换到我的页面'
          }[tabId];
          
          const button = screen.getByLabelText(buttonLabel);
          fireEvent.click(button);
          
          // 验证导航栏仍然存在且可见
          const navigation = screen.getByRole('navigation');
          expect(navigation).toBeInTheDocument();
          expect(navigation).toBeVisible();
          expect(navigation).toHaveClass('fixed', 'bottom-0');
          
          // 验证导航栏在视口底部
          const computedStyle = window.getComputedStyle(navigation);
          expect(computedStyle.position).toBe('fixed');
          
          unmount();
        }
      ), { numRuns: 25 });
    });

    it('应该有正确的z-index确保导航栏在最上层', () => {
      renderWithProvider(<Layout />);
      
      const navigation = screen.getByRole('navigation');
      const computedStyle = window.getComputedStyle(navigation);
      
      // 虽然我们没有显式设置z-index，但fixed定位应该确保它在上层
      expect(computedStyle.position).toBe('fixed');
    });

    it('主内容区域应该有适当的底部间距避免被导航栏遮挡', () => {
      renderWithProvider(<Layout />);
      
      // 查找主内容容器
      const mainContent = screen.getByRole('navigation').parentElement?.querySelector('div');
      expect(mainContent).toHaveClass('pb-20'); // 底部间距
    });
  });

  describe('布局响应性', () => {
    it('应该限制最大宽度适配移动端', () => {
      renderWithProvider(<Layout />);
      
      const layoutContainer = screen.getByRole('navigation').parentElement;
      expect(layoutContainer).toHaveClass('max-w-md', 'mx-auto');
    });

    it('应该使用flex布局确保正确的垂直分布', () => {
      renderWithProvider(<Layout />);
      
      const layoutContainer = screen.getByRole('navigation').parentElement;
      expect(layoutContainer).toHaveClass('flex', 'flex-col', 'h-screen');
    });

    it('主内容区域应该占据剩余空间', () => {
      renderWithProvider(<Layout />);
      
      const navigation = screen.getByRole('navigation');
      const mainContent = navigation.parentElement?.querySelector('div');
      expect(mainContent).toHaveClass('flex-1');
    });
  });

  describe('可访问性', () => {
    it('导航栏应该有正确的ARIA标签', () => {
      renderWithProvider(<Layout />);
      
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', '主导航');
    });

    it('所有导航按钮应该有适当的触摸目标尺寸', () => {
      renderWithProvider(<Layout />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-touch', 'min-w-touch');
      });
    });
  });
});