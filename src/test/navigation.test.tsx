import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import BottomNavigation from '../components/Layout/BottomNavigation';
import Layout from '../components/Layout/Layout';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 3: 导航状态一致性
 * 验证需求: 需求2.3, 2.4
 */
describe('导航状态属性测试', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AppProvider>
        {component}
      </AppProvider>
    );
  };

  describe('导航状态一致性', () => {
    it('应该显示包含5个主要功能区的固定底部导航栏', () => {
      renderWithProvider(<BottomNavigation />);
      
      // 验证5个导航项存在
      expect(screen.getByLabelText('切换到首页页面')).toBeInTheDocument();
      expect(screen.getByLabelText('切换到衣柜页面')).toBeInTheDocument();
      expect(screen.getByLabelText('切换到试穿页面')).toBeInTheDocument();
      expect(screen.getByLabelText('切换到扫描页面')).toBeInTheDocument();
      expect(screen.getByLabelText('切换到我的页面')).toBeInTheDocument();
    });

    it('应该包括正确的导航项内容和顺序', () => {
      renderWithProvider(<BottomNavigation />);
      
      const navItems = screen.getAllByRole('button');
      expect(navItems).toHaveLength(5);
      
      // 验证导航项文本
      expect(screen.getByText('首页')).toBeInTheDocument();
      expect(screen.getByText('衣柜')).toBeInTheDocument();
      expect(screen.getByText('试穿')).toBeInTheDocument();
      expect(screen.getByText('扫描')).toBeInTheDocument();
      expect(screen.getByText('我的')).toBeInTheDocument();
    });

    it('应该通过视觉反馈突出显示当前激活的功能区', () => {
      renderWithProvider(<BottomNavigation />);
      
      // 默认激活首页
      const homeButton = screen.getByLabelText('切换到首页页面');
      expect(homeButton).toHaveAttribute('aria-current', 'page');
      expect(homeButton).toHaveClass('text-primary-600', 'bg-primary-50');
    });

    // 基于属性的测试：导航点击一致性
    it('属性测试：对于任何导航项的点击操作，激活状态应该立即更新', () => {
      fc.assert(fc.property(
        fc.constantFrom('home', 'wardrobe', 'studio', 'scan', 'profile'),
        (tabId) => {
          const { unmount } = renderWithProvider(<Layout />);
          
          // 点击对应的导航项
          const buttonLabel = {
            'home': '切换到首页页面',
            'wardrobe': '切换到衣柜页面', 
            'studio': '切换到试穿页面',
            'scan': '切换到扫描页面',
            'profile': '切换到我的页面'
          }[tabId];
          
          const button = screen.getByLabelText(buttonLabel);
          fireEvent.click(button);
          
          // 验证激活状态
          expect(button).toHaveAttribute('aria-current', 'page');
          expect(button).toHaveClass('text-primary-600');
          
          unmount();
        }
      ), { numRuns: 20 });
    });

    it('属性测试：导航切换应该立即反映在页面内容中', () => {
      fc.assert(fc.property(
        fc.constantFrom('home', 'wardrobe', 'studio', 'scan', 'profile'),
        (tabId) => {
          const { unmount } = renderWithProvider(<Layout />);
          
          // 点击导航项
          const buttonLabel = {
            'home': '切换到首页页面',
            'wardrobe': '切换到衣柜页面',
            'studio': '切换到试穿页面', 
            'scan': '切换到扫描页面',
            'profile': '切换到我的页面'
          }[tabId];
          
          const expectedContent = {
            'home': '首页信息流',
            'wardrobe': '我的数字衣柜',
            'studio': '3D Avatar Area',
            'scan': '身体扫描',
            'profile': '用户名'
          }[tabId];
          
          const button = screen.getByLabelText(buttonLabel);
          fireEvent.click(button);
          
          // 验证页面内容已切换
          expect(screen.getByText(expectedContent)).toBeInTheDocument();
          
          unmount();
        }
      ), { numRuns: 20 });
    });
  });

  describe('导航栏结构验证', () => {
    it('应该有正确的语义化标记', () => {
      renderWithProvider(<BottomNavigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', '主导航');
    });

    it('应该有正确的CSS类用于固定定位', () => {
      renderWithProvider(<BottomNavigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('fixed', 'bottom-0');
    });

    it('试穿工作室应该在中心位置且有特殊样式', () => {
      renderWithProvider(<BottomNavigation />);
      
      const studioButton = screen.getByLabelText('切换到试穿页面');
      expect(studioButton).toHaveClass('rounded-full');
    });
  });
});