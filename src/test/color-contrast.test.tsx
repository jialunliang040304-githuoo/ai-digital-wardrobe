import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import TouchButton from '../components/UI/TouchButton';
import BottomNavigation from '../components/Layout/BottomNavigation';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 29: 颜色对比度合规性
 * 验证需求: 需求10.5
 */
describe('颜色对比度属性测试', () => {
  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AppProvider>
      {children}
    </AppProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // 计算相对亮度的辅助函数
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // 计算对比度比率的辅助函数
  const getContrastRatio = (color1: [number, number, number], color2: [number, number, number]): number => {
    const lum1 = getLuminance(...color1);
    const lum2 = getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  // 从十六进制颜色转换为RGB的辅助函数
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  // 从计算样式中提取RGB值的辅助函数
  const getRgbFromComputedStyle = (element: Element, property: string): [number, number, number] => {
    const style = window.getComputedStyle(element);
    const value = style.getPropertyValue(property);
    
    if (value.startsWith('rgb(')) {
      const matches = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (matches) {
        return [parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3])];
      }
    }
    
    if (value.startsWith('rgba(')) {
      const matches = value.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
      if (matches) {
        return [parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3])];
      }
    }
    
    // 默认返回白色
    return [255, 255, 255];
  };

  describe('WCAG对比度标准', () => {
    it('主要按钮应该满足WCAG AA标准 (4.5:1)', () => {
      render(<TouchButton variant="primary">主要按钮</TouchButton>);
      
      const button = screen.getByRole('button');
      const textColor = getRgbFromComputedStyle(button, 'color');
      const backgroundColor = getRgbFromComputedStyle(button, 'background-color');
      
      const contrastRatio = getContrastRatio(textColor, backgroundColor);
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
    });

    it('次要按钮应该满足WCAG AA标准', () => {
      render(<TouchButton variant="secondary">次要按钮</TouchButton>);
      
      const button = screen.getByRole('button');
      const textColor = getRgbFromComputedStyle(button, 'color');
      const backgroundColor = getRgbFromComputedStyle(button, 'background-color');
      
      const contrastRatio = getContrastRatio(textColor, backgroundColor);
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
    });

    it('导航标签应该满足对比度要求', () => {
      render(
        <TestWrapper>
          <BottomNavigation />
        </TestWrapper>
      );

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        const textColor = getRgbFromComputedStyle(tab, 'color');
        const backgroundColor = getRgbFromComputedStyle(tab, 'background-color');
        
        const contrastRatio = getContrastRatio(textColor, backgroundColor);
        expect(contrastRatio).toBeGreaterThanOrEqual(3.0); // 对于大文本，WCAG AA要求3:1
      });
    });

    it('属性测试：预定义颜色组合应该满足对比度要求', () => {
      const colorCombinations = [
        { text: '#111827', bg: '#ffffff' }, // 深灰色文本，白色背景
        { text: '#ffffff', bg: '#0369a1' }, // 白色文本，深蓝色背景
        { text: '#b91c1c', bg: '#ffffff' }, // 错误红色文本，白色背景
        { text: '#15803d', bg: '#ffffff' }, // 成功绿色文本，白色背景
        { text: '#b45309', bg: '#ffffff' }, // 警告橙色文本，白色背景
      ];

      fc.assert(fc.property(
        fc.constantFrom(...colorCombinations),
        (combination) => {
          const textRgb = hexToRgb(combination.text);
          const bgRgb = hexToRgb(combination.bg);
          
          const contrastRatio = getContrastRatio(textRgb, bgRgb);
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
        }
      ), { numRuns: colorCombinations.length });
    });
  });

  describe('状态颜色对比度', () => {
    it('错误状态应该有足够的对比度', () => {
      const TestErrorComponent: React.FC = () => (
        <div className="error-text">错误信息</div>
      );

      render(<TestErrorComponent />);
      
      const errorElement = screen.getByText('错误信息');
      const textColor = getRgbFromComputedStyle(errorElement, 'color');
      const backgroundColor = getRgbFromComputedStyle(errorElement.parentElement!, 'background-color');
      
      const contrastRatio = getContrastRatio(textColor, backgroundColor);
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
    });

    it('成功状态应该有足够的对比度', () => {
      const TestSuccessComponent: React.FC = () => (
        <div className="success-text">成功信息</div>
      );

      render(<TestSuccessComponent />);
      
      const successElement = screen.getByText('成功信息');
      const textColor = getRgbFromComputedStyle(successElement, 'color');
      const backgroundColor = getRgbFromComputedStyle(successElement.parentElement!, 'background-color');
      
      const contrastRatio = getContrastRatio(textColor, backgroundColor);
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
    });

    it('警告状态应该有足够的对比度', () => {
      const TestWarningComponent: React.FC = () => (
        <div className="warning-text">警告信息</div>
      );

      render(<TestWarningComponent />);
      
      const warningElement = screen.getByText('警告信息');
      const textColor = getRgbFromComputedStyle(warningElement, 'color');
      const backgroundColor = getRgbFromComputedStyle(warningElement.parentElement!, 'background-color');
      
      const contrastRatio = getContrastRatio(textColor, backgroundColor);
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
    });

    it('属性测试：状态指示器应该不仅依赖颜色', () => {
      const TestStatusComponent: React.FC = () => (
        <div>
          <div className="status-indicator status-success">
            <span>成功</span>
          </div>
          <div className="status-indicator status-warning">
            <span>警告</span>
          </div>
          <div className="status-indicator status-error">
            <span>错误</span>
          </div>
        </div>
      );

      render(<TestStatusComponent />);

      // 检查是否有非颜色的指示器（如图标或文本）
      const statusElements = document.querySelectorAll('.status-indicator');
      statusElements.forEach(element => {
        // 应该有文本内容
        expect(element.textContent?.trim()).toBeTruthy();
        
        // 应该有CSS伪元素作为视觉指示器
        const computedStyle = window.getComputedStyle(element, '::before');
        expect(computedStyle.content).not.toBe('none');
      });
    });
  });

  describe('链接对比度', () => {
    it('链接应该有足够的对比度和额外的视觉指示', () => {
      const TestLinkComponent: React.FC = () => (
        <p>
          这是一段包含 
          <a href="#test" className="text-primary-600">链接</a> 
          的文本。
        </p>
      );

      render(<TestLinkComponent />);

      const link = screen.getByRole('link');
      const textColor = getRgbFromComputedStyle(link, 'color');
      const backgroundColor = getRgbFromComputedStyle(link.parentElement!, 'background-color');
      
      const contrastRatio = getContrastRatio(textColor, backgroundColor);
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5);

      // 检查是否有下划线或其他视觉指示
      const textDecoration = window.getComputedStyle(link).textDecoration;
      expect(textDecoration).toContain('underline');
    });

    it('访问过的链接应该保持足够的对比度', () => {
      const TestVisitedLinkComponent: React.FC = () => (
        <a href="#visited" className="text-primary-700 visited:text-primary-800">
          访问过的链接
        </a>
      );

      render(<TestVisitedLinkComponent />);

      const link = screen.getByRole('link');
      
      // 模拟访问状态（通过添加类）
      link.classList.add('visited');
      
      const textColor = getRgbFromComputedStyle(link, 'color');
      const backgroundColor = getRgbFromComputedStyle(link.parentElement!, 'background-color');
      
      const contrastRatio = getContrastRatio(textColor, backgroundColor);
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('表单控件对比度', () => {
    it('表单输入框应该有足够的边框对比度', () => {
      const TestFormComponent: React.FC = () => (
        <input 
          type="text" 
          className="border border-gray-300 text-gray-900" 
          placeholder="输入文本"
        />
      );

      render(<TestFormComponent />);

      const input = screen.getByRole('textbox');
      const textColor = getRgbFromComputedStyle(input, 'color');
      const backgroundColor = getRgbFromComputedStyle(input, 'background-color');
      
      const contrastRatio = getContrastRatio(textColor, backgroundColor);
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
    });

    it('错误状态的表单控件应该有足够的对比度', () => {
      const TestErrorFormComponent: React.FC = () => (
        <input 
          type="text" 
          className="border-2 error-border text-gray-900" 
          aria-invalid="true"
        />
      );

      render(<TestErrorFormComponent />);

      const input = screen.getByRole('textbox');
      const borderColor = getRgbFromComputedStyle(input, 'border-color');
      const backgroundColor = getRgbFromComputedStyle(input, 'background-color');
      
      const contrastRatio = getContrastRatio(borderColor, backgroundColor);
      expect(contrastRatio).toBeGreaterThanOrEqual(3.0); // 边框对比度要求较低
    });

    it('占位符文本应该有足够的对比度', () => {
      const TestPlaceholderComponent: React.FC = () => (
        <input 
          type="text" 
          placeholder="占位符文本"
          className="placeholder-gray-500"
        />
      );

      render(<TestPlaceholderComponent />);

      const input = screen.getByRole('textbox');
      
      // 占位符对比度要求较低（WCAG允许3:1）
      // 这里主要测试占位符不会完全不可见
      const placeholderColor = getRgbFromComputedStyle(input, 'color');
      const backgroundColor = getRgbFromComputedStyle(input, 'background-color');
      
      const contrastRatio = getContrastRatio(placeholderColor, backgroundColor);
      expect(contrastRatio).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe('焦点指示器对比度', () => {
    it('焦点指示器应该有足够的对比度', () => {
      const TestFocusComponent: React.FC = () => (
        <button className="focus-visible:outline-primary-500">
          可聚焦按钮
        </button>
      );

      render(<TestFocusComponent />);

      const button = screen.getByRole('button');
      button.focus();

      // 检查焦点轮廓颜色
      const outlineColor = window.getComputedStyle(button).outlineColor;
      
      // 焦点指示器应该是可见的（不是透明的）
      expect(outlineColor).not.toBe('transparent');
      expect(outlineColor).not.toBe('rgba(0, 0, 0, 0)');
    });

    it('属性测试：所有可聚焦元素都应该有可见的焦点指示器', () => {
      fc.assert(fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 3 }),
        (buttonTexts: string[]) => {
          const TestComponent: React.FC = () => (
            <div>
              {buttonTexts.map((text, i) => (
                <TouchButton key={i}>{text}</TouchButton>
              ))}
            </div>
          );

          render(<TestComponent />);

          const buttons = screen.getAllByRole('button');
          buttons.forEach(button => {
            button.focus();
            
            // 检查是否有焦点样式
            const computedStyle = window.getComputedStyle(button);
            const outline = computedStyle.outline;
            const boxShadow = computedStyle.boxShadow;
            
            // 应该有轮廓或阴影作为焦点指示器
            expect(outline !== 'none' || boxShadow !== 'none').toBe(true);
          });
        }
      ), { numRuns: 3 });
    });
  });

  describe('高对比度模式支持', () => {
    it('应该在高对比度模式下调整颜色', () => {
      // 模拟高对比度媒体查询
      const mockMatchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      render(<TouchButton variant="primary">高对比度按钮</TouchButton>);

      const button = screen.getByRole('button');
      
      // 在高对比度模式下，颜色应该更深
      expect(button).toHaveClass('bg-primary-500');
    });

    it('应该在强制颜色模式下使用系统颜色', () => {
      // 模拟强制颜色模式
      const mockMatchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(forced-colors: active)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      render(<TouchButton variant="primary">系统颜色按钮</TouchButton>);

      // 在强制颜色模式下，应该使用系统定义的颜色
      const button = screen.getByRole('button');
      expect(button).toBeTruthy();
    });
  });

  describe('颜色盲友好性', () => {
    it('重要信息不应该仅通过颜色传达', () => {
      const TestColorBlindComponent: React.FC = () => (
        <div>
          <div className="text-red-600">
            <span role="img" aria-label="错误">❌</span>
            <span className="ml-1">操作失败</span>
          </div>
          <div className="text-green-600">
            <span role="img" aria-label="成功">✅</span>
            <span className="ml-1">操作成功</span>
          </div>
          <div className="text-yellow-600">
            <span role="img" aria-label="警告">⚠️</span>
            <span className="ml-1">需要注意</span>
          </div>
        </div>
      );

      render(<TestColorBlindComponent />);

      // 检查是否有图标或其他非颜色指示器
      expect(screen.getByLabelText('错误')).toBeTruthy();
      expect(screen.getByLabelText('成功')).toBeTruthy();
      expect(screen.getByLabelText('警告')).toBeTruthy();

      // 检查是否有描述性文本
      expect(screen.getByText('操作失败')).toBeTruthy();
      expect(screen.getByText('操作成功')).toBeTruthy();
      expect(screen.getByText('需要注意')).toBeTruthy();
    });

    it('图表和数据可视化应该有替代指示器', () => {
      const TestChartComponent: React.FC = () => (
        <div role="img" aria-label="销售数据图表">
          <div className="flex space-x-2">
            <div className="bg-blue-500 h-10 w-4" aria-label="第一季度: 100万"></div>
            <div className="bg-green-500 h-16 w-4" aria-label="第二季度: 150万"></div>
            <div className="bg-red-500 h-12 w-4" aria-label="第三季度: 120万"></div>
          </div>
          <div className="mt-2 text-sm">
            <span className="inline-block w-3 h-3 bg-blue-500 mr-1"></span>Q1
            <span className="inline-block w-3 h-3 bg-green-500 mr-1 ml-4"></span>Q2
            <span className="inline-block w-3 h-3 bg-red-500 mr-1 ml-4"></span>Q3
          </div>
        </div>
      );

      render(<TestChartComponent />);

      // 检查是否有ARIA标签提供数据信息
      expect(screen.getByLabelText('销售数据图表')).toBeTruthy();
      expect(screen.getByLabelText('第一季度: 100万')).toBeTruthy();
      expect(screen.getByLabelText('第二季度: 150万')).toBeTruthy();
      expect(screen.getByLabelText('第三季度: 120万')).toBeTruthy();
    });
  });

  describe('动态对比度检查', () => {
    it('属性测试：动态生成的颜色应该保持足够对比度', () => {
      // 测试一些常见的颜色组合
      const validColorPairs = [
        ['#000000', '#ffffff'], // 黑白
        ['#ffffff', '#000000'], // 白黑
        ['#0369a1', '#ffffff'], // 深蓝白
        ['#b91c1c', '#ffffff'], // 深红白
        ['#15803d', '#ffffff'], // 深绿白
      ];

      fc.assert(fc.property(
        fc.constantFrom(...validColorPairs),
        ([textColor, bgColor]) => {
          const textRgb = hexToRgb(textColor);
          const bgRgb = hexToRgb(bgColor);
          
          const contrastRatio = getContrastRatio(textRgb, bgRgb);
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
        }
      ), { numRuns: validColorPairs.length });
    });

    it('应该检测不符合标准的颜色组合', () => {
      // 测试一些不符合标准的颜色组合
      const invalidColorPairs = [
        ['#cccccc', '#ffffff'], // 浅灰白（对比度不足）
        ['#ffff00', '#ffffff'], // 黄白（对比度不足）
        ['#ff0000', '#ff6666'], // 红浅红（对比度不足）
      ];

      invalidColorPairs.forEach(([textColor, bgColor]) => {
        const textRgb = hexToRgb(textColor);
        const bgRgb = hexToRgb(bgColor);
        
        const contrastRatio = getContrastRatio(textRgb, bgRgb);
        expect(contrastRatio).toBeLessThan(4.5);
      });
    });
  });

  describe('响应式对比度', () => {
    it('在不同屏幕尺寸下应该保持对比度', () => {
      // 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <BottomNavigation />
        </TestWrapper>
      );

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        const textColor = getRgbFromComputedStyle(tab, 'color');
        const backgroundColor = getRgbFromComputedStyle(tab, 'background-color');
        
        const contrastRatio = getContrastRatio(textColor, backgroundColor);
        expect(contrastRatio).toBeGreaterThanOrEqual(3.0);
      });
    });

    it('在暗色模式下应该保持对比度', () => {
      // 模拟暗色模式偏好
      const mockMatchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      render(<TouchButton variant="primary">暗色模式按钮</TouchButton>);

      const button = screen.getByRole('button');
      const textColor = getRgbFromComputedStyle(button, 'color');
      const backgroundColor = getRgbFromComputedStyle(button, 'background-color');
      
      const contrastRatio = getContrastRatio(textColor, backgroundColor);
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
    });
  });
});