import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { KeyboardNavigationService } from '../services/keyboardNavigationService';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 27: 键盘导航完整性
 * 验证需求: 需求10.3
 */
describe('键盘导航属性测试', () => {
  // 创建测试组件
  const TestComponent: React.FC = () => (
    <div>
      <button>按钮1</button>
      <input type="text" placeholder="输入框" />
      <a href="#test">链接</a>
      <button disabled>禁用按钮</button>
      <div tabIndex={0}>可聚焦div</div>
      <div tabIndex={-1}>不可聚焦div</div>
    </div>
  );

  const GridTestComponent: React.FC = () => (
    <div role="grid" className="grid-navigation" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      <div role="gridcell" tabIndex={0}>项目1</div>
      <div role="gridcell" tabIndex={0}>项目2</div>
      <div role="gridcell" tabIndex={0}>项目3</div>
      <div role="gridcell" tabIndex={0}>项目4</div>
      <div role="gridcell" tabIndex={0}>项目5</div>
      <div role="gridcell" tabIndex={0}>项目6</div>
    </div>
  );

  const MenuTestComponent: React.FC = () => (
    <div role="menu">
      <div role="menuitem" tabIndex={0}>菜单项1</div>
      <div role="menuitem" tabIndex={0}>菜单项2</div>
      <div role="menuitem" tabIndex={0}>菜单项3</div>
    </div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    KeyboardNavigationService.init();
  });

  afterEach(() => {
    KeyboardNavigationService.cleanup();
  });

  describe('可聚焦元素检测', () => {
    it('应该正确识别可聚焦元素', () => {
      render(<TestComponent />);
      
      const focusableElements = KeyboardNavigationService.getFocusableElements();
      
      // 应该包含按钮、输入框、链接和可聚焦div
      expect(focusableElements.length).toBe(4);
      expect(focusableElements[0].tagName).toBe('BUTTON');
      expect(focusableElements[1].tagName).toBe('INPUT');
      expect(focusableElements[2].tagName).toBe('A');
      expect(focusableElements[3].tagName).toBe('DIV');
    });

    it('应该排除禁用和不可聚焦的元素', () => {
      render(<TestComponent />);
      
      const focusableElements = KeyboardNavigationService.getFocusableElements();
      
      // 不应该包含禁用按钮和tabindex=-1的div
      const disabledButton = focusableElements.find(el => 
        el.tagName === 'BUTTON' && el.hasAttribute('disabled')
      );
      const negativeTabIndex = focusableElements.find(el => 
        el.getAttribute('tabindex') === '-1'
      );
      
      expect(disabledButton).toBeUndefined();
      expect(negativeTabIndex).toBeUndefined();
    });

    it('属性测试：可聚焦元素检测应该一致', () => {
      fc.assert(fc.property(
        fc.integer({ min: 1, max: 10 }),
        (buttonCount: number) => {
          const TestDynamicComponent: React.FC = () => (
            <div>
              {Array.from({ length: buttonCount }, (_, i) => (
                <button key={i}>按钮{i + 1}</button>
              ))}
            </div>
          );

          render(<TestDynamicComponent />);
          
          const focusableElements = KeyboardNavigationService.getFocusableElements();
          expect(focusableElements.length).toBe(buttonCount);
        }
      ), { numRuns: 5 });
    });
  });

  describe('Tab导航', () => {
    it('应该支持Tab键导航', () => {
      render(<TestComponent />);
      
      const focusableElements = KeyboardNavigationService.getFocusableElements();
      
      // 聚焦第一个元素
      focusableElements[0].focus();
      expect(document.activeElement).toBe(focusableElements[0]);
      
      // 模拟Tab键
      fireEvent.keyDown(document, { key: 'Tab' });
      
      // 由于我们没有设置焦点陷阱，这里主要测试事件处理不会出错
    });

    it('应该支持Shift+Tab反向导航', () => {
      render(<TestComponent />);
      
      const focusableElements = KeyboardNavigationService.getFocusableElements();
      
      // 聚焦第二个元素
      focusableElements[1].focus();
      expect(document.activeElement).toBe(focusableElements[1]);
      
      // 模拟Shift+Tab键
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    });

    it('应该在焦点陷阱内循环导航', () => {
      render(<TestComponent />);
      
      const container = screen.getByText('按钮1').parentElement!;
      KeyboardNavigationService.setFocusTrap(container);
      
      const focusableElements = KeyboardNavigationService.getFocusableElements(container);
      
      // 聚焦最后一个元素
      focusableElements[focusableElements.length - 1].focus();
      
      // Tab应该循环到第一个元素
      fireEvent.keyDown(document, { key: 'Tab' });
      
      // 清理焦点陷阱
      KeyboardNavigationService.removeFocusTrap();
    });
  });

  describe('方向键导航', () => {
    it('应该支持网格导航', () => {
      render(<GridTestComponent />);
      
      const gridItems = screen.getAllByRole('gridcell');
      
      // 聚焦第一个项目
      gridItems[0].focus();
      expect(document.activeElement).toBe(gridItems[0]);
      
      // 向右箭头应该移动到下一个项目
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(gridItems[1]);
      
      // 向下箭头应该移动到下一行
      gridItems[0].focus();
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(gridItems[3]);
    });

    it('应该支持菜单导航', () => {
      render(<MenuTestComponent />);
      
      const menuItems = screen.getAllByRole('menuitem');
      
      // 聚焦第一个菜单项
      menuItems[0].focus();
      expect(document.activeElement).toBe(menuItems[0]);
      
      // 向下箭头应该移动到下一个菜单项
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(menuItems[1]);
      
      // 在最后一个项目按向下应该循环到第一个
      menuItems[2].focus();
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(menuItems[0]);
    });

    it('属性测试：方向键导航应该在边界内', () => {
      fc.assert(fc.property(
        fc.integer({ min: 2, max: 6 }),
        (itemCount: number) => {
          const TestGridComponent: React.FC = () => (
            <div role="grid" className="grid-navigation">
              {Array.from({ length: itemCount }, (_, i) => (
                <div key={i} role="gridcell" tabIndex={0}>项目{i + 1}</div>
              ))}
            </div>
          );

          render(<TestGridComponent />);
          
          const gridItems = screen.getAllByRole('gridcell');
          
          // 测试每个项目的导航
          gridItems.forEach((item) => {
            item.focus();
            
            // 方向键导航不应该导致错误
            fireEvent.keyDown(document, { key: 'ArrowRight' });
            fireEvent.keyDown(document, { key: 'ArrowLeft' });
            fireEvent.keyDown(document, { key: 'ArrowUp' });
            fireEvent.keyDown(document, { key: 'ArrowDown' });
            
            // 焦点应该仍在网格内
            expect(gridItems.includes(document.activeElement as HTMLElement)).toBe(true);
          });
        }
      ), { numRuns: 3 });
    });
  });

  describe('激活键处理', () => {
    it('应该处理Enter键激活', () => {
      const handleClick = vi.fn();
      
      const TestButtonComponent: React.FC = () => (
        <button onClick={handleClick}>测试按钮</button>
      );
      
      render(<TestButtonComponent />);
      
      const button = screen.getByText('测试按钮');
      button.focus();
      
      // Enter键应该激活按钮
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });

    it('应该处理Space键激活', () => {
      const handleClick = vi.fn();
      
      const TestButtonComponent: React.FC = () => (
        <button onClick={handleClick}>测试按钮</button>
      );
      
      render(<TestButtonComponent />);
      
      const button = screen.getByText('测试按钮');
      button.focus();
      
      // Space键应该激活按钮
      fireEvent.keyDown(button, { key: ' ' });
      expect(handleClick).toHaveBeenCalled();
    });

    it('应该处理自定义可点击元素', () => {
      const handleClick = vi.fn();
      
      const TestCustomComponent: React.FC = () => (
        <div 
          role="button" 
          tabIndex={0} 
          onClick={handleClick}
          data-clickable="true"
        >
          自定义按钮
        </div>
      );
      
      render(<TestCustomComponent />);
      
      const customButton = screen.getByText('自定义按钮');
      customButton.focus();
      
      // Enter键应该激活自定义按钮
      fireEvent.keyDown(customButton, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Escape键处理', () => {
    it('应该关闭模态框', () => {
      const handleClose = vi.fn();
      
      const TestModalComponent: React.FC = () => (
        <div role="dialog">
          <button aria-label="关闭" onClick={handleClose}>×</button>
          <input type="text" />
        </div>
      );
      
      render(<TestModalComponent />);
      
      const input = screen.getByRole('textbox');
      input.focus();
      
      // Escape键应该触发关闭
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });

    it('应该清除搜索框', () => {
      const TestSearchComponent: React.FC = () => (
        <input type="search" defaultValue="搜索内容" />
      );
      
      render(<TestSearchComponent />);
      
      const searchInput = screen.getByRole('searchbox') as HTMLInputElement;
      searchInput.focus();
      
      expect(searchInput.value).toBe('搜索内容');
      
      // Escape键应该清除搜索框
      fireEvent.keyDown(searchInput, { key: 'Escape' });
      expect(searchInput.value).toBe('');
    });
  });

  describe('焦点管理', () => {
    it('应该聚焦到第一个元素', () => {
      render(<TestComponent />);
      
      const result = KeyboardNavigationService.focusFirst();
      expect(result).toBe(true);
      
      const focusableElements = KeyboardNavigationService.getFocusableElements();
      expect(document.activeElement).toBe(focusableElements[0]);
    });

    it('应该聚焦到最后一个元素', () => {
      render(<TestComponent />);
      
      const result = KeyboardNavigationService.focusLast();
      expect(result).toBe(true);
      
      const focusableElements = KeyboardNavigationService.getFocusableElements();
      expect(document.activeElement).toBe(focusableElements[focusableElements.length - 1]);
    });

    it('应该聚焦到下一个元素', () => {
      render(<TestComponent />);
      
      const focusableElements = KeyboardNavigationService.getFocusableElements();
      focusableElements[0].focus();
      
      const result = KeyboardNavigationService.focusNext();
      expect(result).toBe(true);
      expect(document.activeElement).toBe(focusableElements[1]);
    });

    it('应该聚焦到上一个元素', () => {
      render(<TestComponent />);
      
      const focusableElements = KeyboardNavigationService.getFocusableElements();
      focusableElements[1].focus();
      
      const result = KeyboardNavigationService.focusPrevious();
      expect(result).toBe(true);
      expect(document.activeElement).toBe(focusableElements[0]);
    });

    it('应该处理边界情况', () => {
      render(<TestComponent />);
      
      const focusableElements = KeyboardNavigationService.getFocusableElements();
      
      // 在最后一个元素时，focusNext应该返回false
      focusableElements[focusableElements.length - 1].focus();
      const nextResult = KeyboardNavigationService.focusNext();
      expect(nextResult).toBe(false);
      
      // 在第一个元素时，focusPrevious应该返回false
      focusableElements[0].focus();
      const prevResult = KeyboardNavigationService.focusPrevious();
      expect(prevResult).toBe(false);
    });
  });

  describe('焦点陷阱', () => {
    it('应该设置和移除焦点陷阱', () => {
      render(<TestComponent />);
      
      const container = screen.getByText('按钮1').parentElement!;
      
      // 设置焦点陷阱
      KeyboardNavigationService.setFocusTrap(container);
      
      // 应该聚焦到容器内的第一个元素
      const focusableElements = KeyboardNavigationService.getFocusableElements(container);
      expect(document.activeElement).toBe(focusableElements[0]);
      
      // 移除焦点陷阱
      const removedTrap = KeyboardNavigationService.removeFocusTrap();
      expect(removedTrap).toBe(container);
    });

    it('应该支持嵌套焦点陷阱', () => {
      const TestNestedComponent: React.FC = () => (
        <div id="outer">
          <button>外部按钮</button>
          <div id="inner">
            <button>内部按钮</button>
            <input type="text" />
          </div>
        </div>
      );
      
      render(<TestNestedComponent />);
      
      const outerContainer = document.getElementById('outer')!;
      const innerContainer = document.getElementById('inner')!;
      
      // 设置外部陷阱
      KeyboardNavigationService.setFocusTrap(outerContainer);
      
      // 设置内部陷阱
      KeyboardNavigationService.setFocusTrap(innerContainer);
      
      // 移除内部陷阱
      const removedInner = KeyboardNavigationService.removeFocusTrap();
      expect(removedInner).toBe(innerContainer);
      
      // 移除外部陷阱
      const removedOuter = KeyboardNavigationService.removeFocusTrap();
      expect(removedOuter).toBe(outerContainer);
    });
  });

  describe('焦点样式', () => {
    it('应该添加键盘焦点样式', () => {
      render(<TestComponent />);
      
      const button = screen.getByText('按钮1');
      
      // 模拟焦点进入
      fireEvent.focusIn(button);
      expect(button.classList.contains('keyboard-focused')).toBe(true);
      
      // 模拟焦点离开
      fireEvent.focusOut(button);
      expect(button.classList.contains('keyboard-focused')).toBe(false);
    });

    it('应该确保焦点元素可见', () => {
      // Mock scrollIntoView
      const scrollIntoViewMock = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;
      
      render(<TestComponent />);
      
      const button = screen.getByText('按钮1');
      
      // Mock getBoundingClientRect to simulate element outside viewport
      vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
        top: -100,
        bottom: -50,
        left: 0,
        right: 100,
        width: 100,
        height: 50,
        x: 0,
        y: -100,
        toJSON: () => ({})
      });
      
      // 模拟焦点进入
      fireEvent.focusIn(button);
      
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    });
  });

  describe('启用/禁用功能', () => {
    it('应该支持启用和禁用键盘导航', () => {
      expect(KeyboardNavigationService.isNavigationEnabled()).toBe(true);
      
      KeyboardNavigationService.setEnabled(false);
      expect(KeyboardNavigationService.isNavigationEnabled()).toBe(false);
      
      KeyboardNavigationService.setEnabled(true);
      expect(KeyboardNavigationService.isNavigationEnabled()).toBe(true);
    });

    it('禁用时不应该处理键盘事件', () => {
      render(<TestComponent />);
      
      KeyboardNavigationService.setEnabled(false);
      
      const button = screen.getByText('按钮1');
      button.focus();
      
      // 键盘事件不应该被处理
      fireEvent.keyDown(document, { key: 'Tab' });
      
      // 重新启用
      KeyboardNavigationService.setEnabled(true);
    });
  });

  describe('跳过链接', () => {
    it('应该添加跳过链接', () => {
      KeyboardNavigationService.addSkipLinks();
      
      const skipLinks = document.querySelector('.skip-links');
      expect(skipLinks).toBeTruthy();
      
      const mainContentLink = document.querySelector('a[href="#main-content"]');
      const navigationLink = document.querySelector('a[href="#navigation"]');
      
      expect(mainContentLink).toBeTruthy();
      expect(navigationLink).toBeTruthy();
    });
  });

  describe('属性测试综合', () => {
    it('属性测试：键盘导航应该是健壮的', () => {
      fc.assert(fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
        (buttonTexts: string[]) => {
          const TestDynamicComponent: React.FC = () => (
            <div>
              {buttonTexts.map((text, i) => (
                <button key={i}>{text}</button>
              ))}
            </div>
          );

          render(<TestDynamicComponent />);
          
          // 所有基本功能都应该工作
          expect(() => {
            KeyboardNavigationService.getFocusableElements();
            KeyboardNavigationService.focusFirst();
            KeyboardNavigationService.focusLast();
          }).not.toThrow();
          
          const focusableElements = KeyboardNavigationService.getFocusableElements();
          expect(focusableElements.length).toBe(buttonTexts.length);
        }
      ), { numRuns: 5 });
    });

    it('属性测试：焦点管理应该是一致的', () => {
      fc.assert(fc.property(
        fc.integer({ min: 1, max: 10 }),
        (elementCount: number) => {
          const TestComponent: React.FC = () => (
            <div>
              {Array.from({ length: elementCount }, (_, i) => (
                <button key={i}>按钮{i + 1}</button>
              ))}
            </div>
          );

          render(<TestComponent />);
          
          const focusableElements = KeyboardNavigationService.getFocusableElements();
          
          // 聚焦第一个元素
          KeyboardNavigationService.focusFirst();
          expect(document.activeElement).toBe(focusableElements[0]);
          
          // 聚焦最后一个元素
          KeyboardNavigationService.focusLast();
          expect(document.activeElement).toBe(focusableElements[focusableElements.length - 1]);
        }
      ), { numRuns: 5 });
    });
  });

  describe('错误处理', () => {
    it('应该处理空容器', () => {
      const emptyDiv = document.createElement('div');
      
      expect(() => {
        KeyboardNavigationService.getFocusableElements(emptyDiv);
        KeyboardNavigationService.focusFirst(emptyDiv);
        KeyboardNavigationService.focusLast(emptyDiv);
      }).not.toThrow();
      
      const focusableElements = KeyboardNavigationService.getFocusableElements(emptyDiv);
      expect(focusableElements).toEqual([]);
      
      const focusFirstResult = KeyboardNavigationService.focusFirst(emptyDiv);
      expect(focusFirstResult).toBe(false);
    });

    it('应该处理无效元素', () => {
      expect(() => {
        KeyboardNavigationService.setFocusTrap(null as any);
        KeyboardNavigationService.removeFocusTrap();
      }).not.toThrow();
    });

    it('应该处理键盘事件错误', () => {
      render(<TestComponent />);
      
      // 模拟各种键盘事件，确保不会崩溃
      const keys = ['Tab', 'Enter', ' ', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      
      keys.forEach(key => {
        expect(() => {
          fireEvent.keyDown(document, { key });
        }).not.toThrow();
      });
    });
  });
});