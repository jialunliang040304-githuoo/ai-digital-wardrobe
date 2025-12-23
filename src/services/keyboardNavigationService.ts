// 键盘导航服务
export class KeyboardNavigationService {
  private static focusableElements: string[] = [
    'button',
    'input',
    'select',
    'textarea',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ];

  private static trapStack: HTMLElement[] = [];
  private static isEnabled = true;

  // 初始化键盘导航
  static init(): void {
    this.setupGlobalKeyboardHandlers();
    this.setupFocusManagement();
    console.log('Keyboard navigation service initialized');
  }

  // 设置全局键盘事件处理
  private static setupGlobalKeyboardHandlers(): void {
    document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
  }

  // 全局键盘事件处理
  private static handleGlobalKeydown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    switch (event.key) {
      case 'Tab':
        this.handleTabNavigation(event);
        break;
      case 'Escape':
        this.handleEscapeKey(event);
        break;
      case 'Enter':
      case ' ':
        this.handleActivationKeys(event);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowKeys(event);
        break;
    }
  }

  // 处理Tab导航
  private static handleTabNavigation(event: KeyboardEvent): void {
    const currentTrap = this.getCurrentFocusTrap();
    if (currentTrap) {
      this.handleTrapNavigation(event, currentTrap);
    }
  }

  // 处理焦点陷阱内的导航
  private static handleTrapNavigation(event: KeyboardEvent, trap: HTMLElement): void {
    const focusableElements = this.getFocusableElements(trap);
    if (focusableElements.length === 0) return;

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    let nextIndex: number;

    if (event.shiftKey) {
      // Shift+Tab - 向前导航
      nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    } else {
      // Tab - 向后导航
      nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
    }

    event.preventDefault();
    focusableElements[nextIndex].focus();
  }

  // 处理Escape键
  private static handleEscapeKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // 关闭模态框
    const modal = target.closest('[role="dialog"], .modal');
    if (modal) {
      const closeButton = modal.querySelector('[aria-label*="关闭"], [aria-label*="close"], .close-button') as HTMLElement;
      if (closeButton) {
        closeButton.click();
        event.preventDefault();
      }
    }

    // 清除搜索框
    if (target.tagName === 'INPUT' && target.getAttribute('type') === 'search') {
      (target as HTMLInputElement).value = '';
      event.preventDefault();
    }
  }

  // 处理激活键（Enter/Space）
  private static handleActivationKeys(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // 对于按钮和链接，Space键也应该激活
    if (event.key === ' ' && (target.tagName === 'BUTTON' || target.tagName === 'A')) {
      target.click();
      event.preventDefault();
    }

    // 对于自定义可点击元素
    if (target.hasAttribute('data-clickable') || target.getAttribute('role') === 'button') {
      target.click();
      event.preventDefault();
    }
  }

  // 处理方向键
  private static handleArrowKeys(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // 网格导航
    if (target.closest('[role="grid"], .grid-navigation')) {
      this.handleGridNavigation(event, target);
    }

    // 菜单导航
    if (target.closest('[role="menu"], [role="menubar"]')) {
      this.handleMenuNavigation(event, target);
    }

    // 标签页导航
    if (target.closest('[role="tablist"]')) {
      this.handleTablistNavigation(event, target);
    }
  }

  // 网格导航处理
  private static handleGridNavigation(event: KeyboardEvent, target: HTMLElement): void {
    const grid = target.closest('[role="grid"], .grid-navigation') as HTMLElement;
    const cells = Array.from(grid.querySelectorAll('[role="gridcell"], .grid-item')) as HTMLElement[];
    const currentIndex = cells.indexOf(target);
    
    if (currentIndex === -1) return;

    const gridWidth = this.getGridWidth(grid);
    let nextIndex: number;

    switch (event.key) {
      case 'ArrowUp':
        nextIndex = currentIndex - gridWidth;
        break;
      case 'ArrowDown':
        nextIndex = currentIndex + gridWidth;
        break;
      case 'ArrowLeft':
        nextIndex = currentIndex - 1;
        break;
      case 'ArrowRight':
        nextIndex = currentIndex + 1;
        break;
      default:
        return;
    }

    if (nextIndex >= 0 && nextIndex < cells.length) {
      cells[nextIndex].focus();
      event.preventDefault();
    }
  }

  // 菜单导航处理
  private static handleMenuNavigation(event: KeyboardEvent, target: HTMLElement): void {
    const menu = target.closest('[role="menu"], [role="menubar"]') as HTMLElement;
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    const currentIndex = items.indexOf(target);
    
    if (currentIndex === -1) return;

    let nextIndex: number;

    switch (event.key) {
      case 'ArrowUp':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowDown':
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      default:
        return;
    }

    items[nextIndex].focus();
    event.preventDefault();
  }

  // 标签页导航处理
  private static handleTablistNavigation(event: KeyboardEvent, target: HTMLElement): void {
    const tablist = target.closest('[role="tablist"]') as HTMLElement;
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]')) as HTMLElement[];
    const currentIndex = tabs.indexOf(target);
    
    if (currentIndex === -1) return;

    let nextIndex: number;

    switch (event.key) {
      case 'ArrowLeft':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      default:
        return;
    }

    tabs[nextIndex].focus();
    tabs[nextIndex].click(); // 激活标签页
    event.preventDefault();
  }

  // 焦点进入处理
  private static handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    
    // 添加焦点样式
    target.classList.add('keyboard-focused');
    
    // 确保焦点元素可见
    this.ensureElementVisible(target);
  }

  // 焦点离开处理
  private static handleFocusOut(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    
    // 移除焦点样式
    target.classList.remove('keyboard-focused');
  }

  // 设置焦点陷阱
  static setFocusTrap(element: HTMLElement): void {
    this.trapStack.push(element);
    
    // 聚焦到第一个可聚焦元素
    const firstFocusable = this.getFocusableElements(element)[0];
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  // 移除焦点陷阱
  static removeFocusTrap(): HTMLElement | null {
    return this.trapStack.pop() || null;
  }

  // 获取当前焦点陷阱
  private static getCurrentFocusTrap(): HTMLElement | null {
    return this.trapStack[this.trapStack.length - 1] || null;
  }

  // 获取可聚焦元素
  static getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    const selector = this.focusableElements.join(', ');
    const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
    
    return elements.filter(element => {
      return this.isElementFocusable(element);
    });
  }

  // 检查元素是否可聚焦
  private static isElementFocusable(element: HTMLElement): boolean {
    // 检查元素是否可见
    if (element.offsetParent === null && element.offsetWidth === 0 && element.offsetHeight === 0) {
      return false;
    }

    // 检查是否被禁用
    if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
      return false;
    }

    // 检查tabindex
    const tabindex = element.getAttribute('tabindex');
    if (tabindex === '-1') {
      return false;
    }

    return true;
  }

  // 确保元素可见
  private static ensureElementVisible(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // 检查是否在视口内
    if (rect.top < 0 || rect.bottom > viewportHeight || rect.left < 0 || rect.right > viewportWidth) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }

  // 获取网格宽度
  private static getGridWidth(grid: HTMLElement): number {
    const computedStyle = window.getComputedStyle(grid);
    const gridTemplateColumns = computedStyle.gridTemplateColumns;
    
    if (gridTemplateColumns && gridTemplateColumns !== 'none') {
      return gridTemplateColumns.split(' ').length;
    }

    // 回退：计算第一行的项目数
    const items = Array.from(grid.children) as HTMLElement[];
    if (items.length === 0) return 1;

    const firstItemTop = items[0].getBoundingClientRect().top;
    let width = 1;

    for (let i = 1; i < items.length; i++) {
      if (items[i].getBoundingClientRect().top > firstItemTop) {
        break;
      }
      width++;
    }

    return width;
  }

  // 聚焦到第一个元素
  static focusFirst(container: HTMLElement = document.body): boolean {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    return false;
  }

  // 聚焦到最后一个元素
  static focusLast(container: HTMLElement = document.body): boolean {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
      return true;
    }
    return false;
  }

  // 聚焦到下一个元素
  static focusNext(current?: HTMLElement): boolean {
    const currentElement = current || document.activeElement as HTMLElement;
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
      focusableElements[currentIndex + 1].focus();
      return true;
    }
    
    return false;
  }

  // 聚焦到上一个元素
  static focusPrevious(current?: HTMLElement): boolean {
    const currentElement = current || document.activeElement as HTMLElement;
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex > 0) {
      focusableElements[currentIndex - 1].focus();
      return true;
    }
    
    return false;
  }

  // 启用/禁用键盘导航
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // 检查是否启用
  static isNavigationEnabled(): boolean {
    return this.isEnabled;
  }

  // 添加跳过链接
  static addSkipLinks(): void {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">跳转到主要内容</a>
      <a href="#navigation" class="skip-link">跳转到导航</a>
    `;
    
    document.body.insertBefore(skipLinks, document.body.firstChild);
  }

  // 设置焦点管理
  private static setupFocusManagement(): void {
    // 为所有交互元素添加焦点样式
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-focused {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }
      
      .skip-links {
        position: absolute;
        top: -40px;
        left: 6px;
        z-index: 1000;
      }
      
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        transition: top 0.3s;
      }
      
      .skip-link:focus {
        top: 6px;
      }
      
      /* 隐藏默认焦点样式，使用自定义样式 */
      *:focus {
        outline: none;
      }
      
      /* 为触摸设备保留焦点样式 */
      @media (hover: none) {
        .keyboard-focused {
          outline: none !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  // 清理资源
  static cleanup(): void {
    document.removeEventListener('keydown', this.handleGlobalKeydown);
    document.removeEventListener('focusin', this.handleFocusIn);
    document.removeEventListener('focusout', this.handleFocusOut);
    this.trapStack = [];
  }
}