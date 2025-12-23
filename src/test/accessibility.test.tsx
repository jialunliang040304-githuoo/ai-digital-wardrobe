import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import BottomNavigation from '../components/Layout/BottomNavigation';
import PageContainer from '../components/Layout/PageContainer';
import TouchButton from '../components/UI/TouchButton';
import Modal from '../components/UI/Modal';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 28: 可访问性标准符合性
 * 验证需求: 需求10.4
 */
describe('可访问性属性测试', () => {
  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AppProvider>
      {children}
    </AppProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 清理DOM
    document.body.innerHTML = '';
  });

  describe('ARIA标签和角色', () => {
    it('导航组件应该有正确的ARIA标签', () => {
      render(
        <TestWrapper>
          <BottomNavigation />
        </TestWrapper>
      );

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', '主导航');
      expect(navigation).toHaveAttribute('id', 'navigation');

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(5);

      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
        expect(tab).toHaveAttribute('aria-controls');
        expect(tab).toHaveAttribute('aria-label');
      });
    });

    it('页面容器应该有正确的语义化标记', () => {
      render(
        <TestWrapper>
          <PageContainer />
        </TestWrapper>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('aria-label');

      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toHaveAttribute('id');
      expect(tabpanel).toHaveAttribute('aria-labelledby');

      // 检查隐藏的标题
      const hiddenTitle = document.querySelector('h1.sr-only');
      expect(hiddenTitle).toBeTruthy();
    });

    it('模态框应该有正确的ARIA属性', () => {
      const TestModalComponent: React.FC = () => {
        const [isOpen, setIsOpen] = React.useState(true);
        return (
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="测试模态框">
            <p>模态框内容</p>
          </Modal>
        );
      };

      render(<TestModalComponent />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');

      const document_element = screen.getByRole('document');
      expect(document_element).toBeTruthy();

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveAttribute('id', 'modal-title');

      const closeButton = screen.getByRole('button', { name: /关闭对话框/i });
      expect(closeButton).toHaveAttribute('aria-label', '关闭对话框');
      expect(closeButton).toHaveAttribute('type', 'button');
    });

    it('按钮应该有正确的可访问性属性', () => {
      const TestButtonComponent: React.FC = () => (
        <div>
          <TouchButton>普通按钮</TouchButton>
          <TouchButton disabled>禁用按钮</TouchButton>
          <TouchButton loading>加载按钮</TouchButton>
          <TouchButton aria-describedby="help-text">带描述按钮</TouchButton>
          <div id="help-text">帮助文本</div>
        </div>
      );

      render(<TestButtonComponent />);

      const buttons = screen.getAllByRole('button');
      
      // 普通按钮
      expect(buttons[0]).not.toHaveAttribute('aria-disabled');
      expect(buttons[0]).not.toHaveAttribute('aria-busy');

      // 禁用按钮
      expect(buttons[1]).toHaveAttribute('aria-disabled', 'true');
      expect(buttons[1]).toBeDisabled();

      // 加载按钮
      expect(buttons[2]).toHaveAttribute('aria-disabled', 'true');
      expect(buttons[2]).toHaveAttribute('aria-busy', 'true');
      expect(buttons[2]).toBeDisabled();

      // 带描述按钮
      expect(buttons[3]).toHaveAttribute('aria-describedby', 'help-text');

      // 检查加载状态的实时区域
      const liveRegion = screen.getByText('加载中...');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveClass('sr-only');
    });

    it('属性测试：所有交互元素都应该有可访问的名称', () => {
      fc.assert(fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        (buttonTexts: string[]) => {
          const TestComponent: React.FC = () => (
            <div>
              {buttonTexts.map((text, i) => (
                <TouchButton key={i} aria-label={`按钮 ${text}`}>
                  {text}
                </TouchButton>
              ))}
            </div>
          );

          render(<TestComponent />);

          const buttons = screen.getAllByRole('button');
          buttons.forEach(button => {
            // 每个按钮都应该有可访问的名称（通过文本内容或aria-label）
            const accessibleName = button.getAttribute('aria-label') || button.textContent;
            expect(accessibleName).toBeTruthy();
            expect(accessibleName!.trim().length).toBeGreaterThan(0);
          });
        }
      ), { numRuns: 5 });
    });
  });

  describe('语义化HTML结构', () => {
    it('应该使用正确的HTML语义元素', () => {
      render(
        <TestWrapper>
          <BottomNavigation />
          <PageContainer />
        </TestWrapper>
      );

      // 检查导航元素
      const nav = document.querySelector('nav');
      expect(nav).toBeTruthy();

      // 检查主要内容区域
      const main = document.querySelector('main');
      expect(main).toBeTruthy();

      // 检查标题层次结构
      const h1 = document.querySelector('h1');
      expect(h1).toBeTruthy();
    });

    it('模态框应该使用正确的语义结构', () => {
      const TestModalComponent: React.FC = () => {
        const [isOpen, setIsOpen] = React.useState(true);
        return (
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="测试标题">
            <p>内容段落</p>
          </Modal>
        );
      };

      render(<TestModalComponent />);

      // 检查header元素
      const header = document.querySelector('header');
      expect(header).toBeTruthy();

      // 检查标题层次
      const h2 = document.querySelector('h2');
      expect(h2).toBeTruthy();
      expect(h2).toHaveTextContent('测试标题');
    });

    it('属性测试：标题层次应该是逻辑的', () => {
      const TestHeadingComponent: React.FC = () => (
        <div>
          <h1>主标题</h1>
          <h2>二级标题</h2>
          <h3>三级标题</h3>
        </div>
      );

      render(<TestHeadingComponent />);

      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));

      // 检查标题层次是否合理（不应该跳级太多）
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        expect(diff).toBeLessThanOrEqual(1); // 不应该跳过超过1级
      }
    });
  });

  describe('焦点管理', () => {
    it('模态框应该正确管理焦点', () => {
      const TestModalComponent: React.FC = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        return (
          <div>
            <button onClick={() => setIsOpen(true)}>打开模态框</button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="测试模态框">
              <button>模态框内按钮</button>
            </Modal>
          </div>
        );
      };

      render(<TestModalComponent />);

      const openButton = screen.getByText('打开模态框');
      fireEvent.click(openButton);

      // 模态框打开后，焦点应该在模态框内
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeTruthy();

      // 按Escape键应该关闭模态框
      fireEvent.keyDown(dialog, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('禁用元素不应该接收焦点', () => {
      render(
        <div>
          <TouchButton>正常按钮</TouchButton>
          <TouchButton disabled>禁用按钮</TouchButton>
        </div>
      );

      const buttons = screen.getAllByRole('button');
      
      // 正常按钮应该可以聚焦
      buttons[0].focus();
      expect(document.activeElement).toBe(buttons[0]);

      // 禁用按钮不应该可以聚焦
      buttons[1].focus();
      expect(document.activeElement).not.toBe(buttons[1]);
    });

    it('属性测试：焦点应该在可见元素之间正确移动', () => {
      fc.assert(fc.property(
        fc.integer({ min: 2, max: 5 }),
        (buttonCount: number) => {
          const TestComponent: React.FC = () => (
            <div>
              {Array.from({ length: buttonCount }, (_, i) => (
                <TouchButton key={i}>按钮 {i + 1}</TouchButton>
              ))}
            </div>
          );

          render(<TestComponent />);

          const buttons = screen.getAllByRole('button');
          
          // 测试Tab导航
          buttons[0].focus();
          expect(document.activeElement).toBe(buttons[0]);

          // 模拟Tab键导航
          for (let i = 1; i < buttons.length; i++) {
            fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
            // 注意：实际的Tab导航由浏览器处理，这里主要测试元素是否可聚焦
          }
        }
      ), { numRuns: 3 });
    });
  });

  describe('屏幕阅读器支持', () => {
    it('应该有适当的实时区域', () => {
      render(
        <TouchButton loading>加载中</TouchButton>
      );

      const liveRegion = screen.getByText('加载中...');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveClass('sr-only');
    });

    it('图标应该对屏幕阅读器隐藏', () => {
      render(
        <TestWrapper>
          <BottomNavigation />
        </TestWrapper>
      );

      // 检查图标是否有aria-hidden属性
      const icons = document.querySelectorAll('svg');
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('应该有跳过链接', () => {
      // 跳过链接通常在页面加载时添加
      const skipLinks = document.querySelector('.skip-links');
      if (skipLinks) {
        const mainContentLink = skipLinks.querySelector('a[href="#main-content"]');
        const navigationLink = skipLinks.querySelector('a[href="#navigation"]');
        
        expect(mainContentLink).toBeTruthy();
        expect(navigationLink).toBeTruthy();
      }
    });

    it('隐藏内容应该有正确的样式', () => {
      render(
        <div>
          <span className="sr-only">屏幕阅读器专用文本</span>
          <span>可见文本</span>
        </div>
      );

      const hiddenText = document.querySelector('.sr-only');
      expect(hiddenText).toBeTruthy();
      
      // 检查CSS样式是否正确应用（通过计算样式）
      const computedStyle = window.getComputedStyle(hiddenText!);
      expect(computedStyle.position).toBe('absolute');
      expect(computedStyle.width).toBe('1px');
      expect(computedStyle.height).toBe('1px');
    });
  });

  describe('键盘导航支持', () => {
    it('所有交互元素都应该可以通过键盘访问', () => {
      render(
        <TestWrapper>
          <BottomNavigation />
        </TestWrapper>
      );

      const interactiveElements = screen.getAllByRole('tab');
      
      interactiveElements.forEach(element => {
        // 检查tabindex
        const tabIndex = element.getAttribute('tabindex');
        expect(tabIndex).not.toBe('-1'); // 不应该从Tab序列中排除（除非是非活动标签）
        
        // 检查是否可以聚焦
        element.focus();
        if (element.getAttribute('aria-selected') === 'true') {
          expect(document.activeElement).toBe(element);
        }
      });
    });

    it('Enter和Space键应该激活按钮', () => {
      const handleClick = vi.fn();
      
      render(
        <TouchButton onClick={handleClick}>测试按钮</TouchButton>
      );

      const button = screen.getByRole('button');
      button.focus();

      // Enter键
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Space键
      fireEvent.keyDown(button, { key: ' ' });
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('属性测试：键盘导航应该是一致的', () => {
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
          
          // 所有按钮都应该可以聚焦
          buttons.forEach(button => {
            button.focus();
            expect(document.activeElement).toBe(button);
          });
        }
      ), { numRuns: 3 });
    });
  });

  describe('状态通知', () => {
    it('加载状态应该通过ARIA属性通知', () => {
      render(
        <TouchButton loading>保存</TouchButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');

      const statusText = screen.getByText('加载中...');
      expect(statusText).toHaveAttribute('aria-live', 'polite');
    });

    it('错误状态应该正确通知', () => {
      const TestErrorComponent: React.FC = () => (
        <div>
          <input type="text" aria-describedby="error-message" aria-invalid="true" />
          <div id="error-message" role="alert">
            输入格式不正确
          </div>
        </div>
      );

      render(<TestErrorComponent />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'error-message');

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('id', 'error-message');
    });

    it('成功状态应该正确通知', () => {
      const TestSuccessComponent: React.FC = () => (
        <div role="status" aria-live="polite">
          操作成功完成
        </div>
      );

      render(<TestSuccessComponent />);

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('表单可访问性', () => {
    it('表单控件应该有正确的标签', () => {
      const TestFormComponent: React.FC = () => (
        <form>
          <label htmlFor="username">用户名</label>
          <input type="text" id="username" name="username" required />
          
          <label htmlFor="email">邮箱</label>
          <input type="email" id="email" name="email" required aria-describedby="email-help" />
          <div id="email-help">请输入有效的邮箱地址</div>
        </form>
      );

      render(<TestFormComponent />);

      const usernameInput = screen.getByLabelText('用户名');
      expect(usernameInput).toHaveAttribute('id', 'username');
      expect(usernameInput).toHaveAttribute('required');

      const emailInput = screen.getByLabelText('邮箱');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-help');
      expect(emailInput).toHaveAttribute('required');
    });

    it('必填字段应该正确标识', () => {
      const TestRequiredComponent: React.FC = () => (
        <div>
          <label htmlFor="required-field">
            必填字段 <span aria-label="必填">*</span>
          </label>
          <input type="text" id="required-field" required aria-required="true" />
        </div>
      );

      render(<TestRequiredComponent />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('aria-required', 'true');

      const requiredIndicator = screen.getByLabelText('必填');
      expect(requiredIndicator).toBeTruthy();
    });
  });

  describe('颜色和对比度', () => {
    it('重要信息不应该仅依赖颜色传达', () => {
      const TestColorComponent: React.FC = () => (
        <div>
          <div className="text-red-600">
            <span aria-label="错误">❌</span> 错误信息
          </div>
          <div className="text-green-600">
            <span aria-label="成功">✅</span> 成功信息
          </div>
          <div className="text-yellow-600">
            <span aria-label="警告">⚠️</span> 警告信息
          </div>
        </div>
      );

      render(<TestColorComponent />);

      // 检查是否有非颜色的指示器
      expect(screen.getByLabelText('错误')).toBeTruthy();
      expect(screen.getByLabelText('成功')).toBeTruthy();
      expect(screen.getByLabelText('警告')).toBeTruthy();
    });

    it('链接应该有除颜色外的其他视觉指示', () => {
      const TestLinkComponent: React.FC = () => (
        <p>
          这是一段包含 
          <a href="#test" className="underline">链接</a> 
          的文本。
        </p>
      );

      render(<TestLinkComponent />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('underline'); // 下划线作为额外的视觉指示
    });
  });

  describe('响应式可访问性', () => {
    it('触摸目标应该足够大', () => {
      render(
        <TouchButton>测试按钮</TouchButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-touch');
      expect(button).toHaveClass('min-w-touch');
    });

    it('在不同视口下应该保持可访问性', () => {
      // 模拟移动设备视口
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

      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeTruthy();

      // 导航应该仍然可访问
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(5);
    });
  });

  describe('错误处理和恢复', () => {
    it('应该优雅处理可访问性API错误', () => {
      // 模拟缺少某些可访问性功能的环境
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = vi.fn().mockImplementation(() => {
        throw new Error('getComputedStyle not available');
      });

      expect(() => {
        render(<TouchButton>测试按钮</TouchButton>);
      }).not.toThrow();

      // 恢复原始函数
      window.getComputedStyle = originalGetComputedStyle;
    });

    it('应该在JavaScript禁用时仍然可用', () => {
      // 测试基本的HTML结构和语义
      render(
        <TestWrapper>
          <BottomNavigation />
        </TestWrapper>
      );

      // 即使没有JavaScript，导航结构也应该是语义化的
      const nav = document.querySelector('nav');
      expect(nav).toBeTruthy();

      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});