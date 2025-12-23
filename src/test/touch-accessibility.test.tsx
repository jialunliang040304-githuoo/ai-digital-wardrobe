import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import Layout from '../components/Layout/Layout';
import TouchButton from '../components/UI/TouchButton';
import TouchCard from '../components/UI/TouchCard';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 26: 触摸目标可访问性
 * 验证需求: 需求10.2
 */
describe('触摸目标可访问性属性测试', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AppProvider>
        {component}
      </AppProvider>
    );
  };

  describe('触摸目标可访问性', () => {
    it('所有导航按钮应该有最小44px的触摸目标', () => {
      renderWithProvider(<Layout />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-touch', 'min-w-touch');
      });
    });

    it('TouchButton组件应该有正确的触摸目标尺寸', () => {
      render(<TouchButton>测试按钮</TouchButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-touch', 'min-w-touch');
      expect(button).toHaveStyle({ touchAction: 'manipulation' });
    });

    it('TouchCard组件在交互模式下应该有适当的触摸目标', () => {
      render(
        <TouchCard interactive onClick={() => {}}>
          <div>测试卡片</div>
        </TouchCard>
      );
      
      const card = screen.getByRole('button');
      expect(card).toHaveClass('min-h-touch');
    });

    it('属性测试：对于任何交互元素，触摸目标尺寸应该不小于44px以确保良好的移动端体验', () => {
      fc.assert(fc.property(
        fc.constantFrom('primary', 'secondary', 'ghost'),
        fc.constantFrom('sm', 'md', 'lg'),
        (variant, size) => {
          const { unmount } = render(
            <TouchButton variant={variant as any} size={size as any}>
              测试按钮
            </TouchButton>
          );
          
          const button = screen.getByRole('button');
          
          // 验证最小触摸目标类存在
          expect(button).toHaveClass('min-h-touch', 'min-w-touch');
          
          // 验证触摸操作优化
          expect(button).toHaveClass('touch-manipulation');
          
          unmount();
        }
      ), { numRuns: 20 });
    });

    it('属性测试：对于任何页面中的交互元素，都应该符合触摸目标要求', () => {
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
          
          // 验证导航按钮
          const navButton = screen.getByLabelText(buttonLabel);
          expect(navButton).toHaveClass('min-h-touch', 'min-w-touch');
          
          // 验证页面内的所有按钮
          const allButtons = screen.getAllByRole('button');
          allButtons.forEach(button => {
            expect(button).toHaveClass('min-h-touch');
          });
          
          unmount();
        }
      ), { numRuns: 15 });
    });
  });

  describe('触摸交互优化', () => {
    it('应该防止双击缩放', () => {
      renderWithProvider(<Layout />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // 检查是否有touch-action: manipulation样式
        const computedStyle = window.getComputedStyle(button);
        expect(computedStyle.touchAction).toBe('manipulation');
      });
    });

    it('交互元素应该有适当的视觉反馈', () => {
      render(<TouchButton>测试按钮</TouchButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all', 'duration-200');
    });

    it('应该有正确的cursor样式', () => {
      render(
        <TouchCard interactive onClick={() => {}}>
          测试卡片
        </TouchCard>
      );
      
      const card = screen.getByRole('button');
      expect(card).toHaveClass('cursor-pointer');
    });
  });

  describe('可访问性标准', () => {
    it('按钮应该有正确的语义标记', () => {
      render(<TouchButton aria-label="测试按钮">按钮</TouchButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', '测试按钮');
    });

    it('交互卡片应该有正确的角色', () => {
      render(
        <TouchCard interactive onClick={() => {}}>
          <div>卡片内容</div>
        </TouchCard>
      );
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('type', 'button');
    });

    it('应该支持键盘导航', () => {
      render(<TouchButton>测试按钮</TouchButton>);
      
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON'); // 原生button支持键盘导航
    });
  });

  describe('尺寸变体测试', () => {
    it('小尺寸按钮仍应满足最小触摸目标', () => {
      render(<TouchButton size="sm">小按钮</TouchButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-touch', 'min-w-touch');
    });

    it('大尺寸按钮应该有更大的内边距', () => {
      render(<TouchButton size="lg">大按钮</TouchButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-4');
    });

    it('不同变体应该保持一致的触摸目标', () => {
      const variants = ['primary', 'secondary', 'ghost'] as const;
      
      variants.forEach(variant => {
        const { unmount } = render(<TouchButton variant={variant}>按钮</TouchButton>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('min-h-touch', 'min-w-touch');
        
        unmount();
      });
    });
  });
});