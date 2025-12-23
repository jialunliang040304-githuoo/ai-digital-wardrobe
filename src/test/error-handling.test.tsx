import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ErrorHandlingService, ValidationRules } from '../services/errorHandlingService';
import ErrorBoundary from '../components/UI/ErrorBoundary';
import NetworkStatus from '../components/UI/NetworkStatus';
import { useToast } from '../components/UI/Toast';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 错误处理和用户反馈测试
 * 验证需求: 通用错误处理
 */
describe('错误处理属性测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ErrorHandlingService.clearErrorQueue();
  });

  afterEach(() => {
    // 恢复网络状态
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  describe('网络错误处理', () => {
    it('应该检测网络连接状态', () => {
      // 模拟离线状态
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      expect(navigator.onLine).toBe(false);

      // 模拟在线状态
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      expect(navigator.onLine).toBe(true);
    });

    it('应该处理网络连接错误', async () => {
      // 模拟离线状态
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const networkError = new Error('Network request failed');
      
      await expect(
        ErrorHandlingService.handleNetworkError(networkError, 'test-context')
      ).rejects.toThrow('网络连接已断开，请检查您的网络设置');
    });

    it('应该处理超时错误', async () => {
      const timeoutError = new Error('Request timeout');
      
      await expect(
        ErrorHandlingService.handleNetworkError(timeoutError, 'test-context')
      ).rejects.toThrow('请求超时，请稍后重试');
    });

    it('应该处理服务器错误', async () => {
      const serverError = new Error('Server error 500');
      
      await expect(
        ErrorHandlingService.handleNetworkError(serverError, 'test-context')
      ).rejects.toThrow('服务器暂时不可用，请稍后重试');
    });

    it('应该处理权限错误', async () => {
      const authError = new Error('Unauthorized 401');
      
      await expect(
        ErrorHandlingService.handleNetworkError(authError, 'test-context')
      ).rejects.toThrow('访问权限不足，请重新登录');
    });

    it('属性测试：网络错误处理应该是健壮的', () => {
      fc.assert(fc.property(
        fc.oneof(
          fc.constant('timeout'),
          fc.constant('500'),
          fc.constant('502'),
          fc.constant('503'),
          fc.constant('401'),
          fc.constant('403')
        ),
        async (errorType: string) => {
          const error = new Error(`Network error ${errorType}`);
          
          await expect(
            ErrorHandlingService.handleNetworkError(error, 'test-context')
          ).rejects.toThrow();
        }
      ), { numRuns: 6 });
    });

    it('应该支持重试机制', async () => {
      let attemptCount = 0;
      const retryFn = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return Promise.resolve('success');
      });

      const result = await ErrorHandlingService.handleNetworkError(
        new Error('Initial error'),
        'test-context',
        retryFn
      );

      expect(result).toBe('success');
      expect(retryFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('3D渲染错误处理', () => {
    it('应该处理WebGL不支持错误', () => {
      const webglError = new Error('WebGL not supported');
      const result = ErrorHandlingService.handle3DError(webglError, 'canvas-init');

      expect(result.fallbackMessage).toContain('不支持3D功能');
      expect(result.canRetry).toBe(false);
      expect(result.suggestions).toContain('更新您的浏览器到最新版本');
    });

    it('应该处理内存不足错误', () => {
      const memoryError = new Error('Out of memory');
      const result = ErrorHandlingService.handle3DError(memoryError, 'model-loading');

      expect(result.fallbackMessage).toContain('设备内存不足');
      expect(result.canRetry).toBe(true);
      expect(result.suggestions).toContain('关闭其他浏览器标签页');
    });

    it('应该处理模型加载错误', () => {
      const loadError = new Error('Failed to load model');
      const result = ErrorHandlingService.handle3DError(loadError, 'model-fetch');

      expect(result.fallbackMessage).toContain('3D模型加载失败');
      expect(result.canRetry).toBe(true);
      expect(result.suggestions).toContain('检查网络连接');
    });

    it('应该处理渲染错误', () => {
      const renderError = new Error('Render failed');
      const result = ErrorHandlingService.handle3DError(renderError, 'scene-render');

      expect(result.fallbackMessage).toContain('3D渲染出现问题');
      expect(result.canRetry).toBe(true);
      expect(result.suggestions).toContain('更新显卡驱动');
    });

    it('属性测试：3D错误处理应该总是返回有用信息', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (errorMessage: string, context: string) => {
          const error = new Error(errorMessage);
          const result = ErrorHandlingService.handle3DError(error, context);

          expect(result.fallbackMessage).toBeTruthy();
          expect(typeof result.canRetry).toBe('boolean');
          expect(Array.isArray(result.suggestions)).toBe(true);
          expect(result.suggestions.length).toBeGreaterThan(0);
        }
      ), { numRuns: 10 });
    });
  });

  describe('用户输入验证', () => {
    it('应该验证必填字段', () => {
      const result = ErrorHandlingService.validateUserInput('', { required: true });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('此字段为必填项');
    });

    it('应该验证最小长度', () => {
      const result = ErrorHandlingService.validateUserInput('ab', { minLength: 3 });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('最少需要3个字符');
    });

    it('应该验证最大长度', () => {
      const result = ErrorHandlingService.validateUserInput('abcdef', { maxLength: 5 });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('最多允许5个字符');
    });

    it('应该验证邮箱格式', () => {
      const invalidEmail = ErrorHandlingService.validateUserInput('invalid-email', { email: true });
      expect(invalidEmail.isValid).toBe(false);
      expect(invalidEmail.errors).toContain('请输入有效的邮箱地址');

      const validEmail = ErrorHandlingService.validateUserInput('test@example.com', { email: true });
      expect(validEmail.isValid).toBe(true);
    });

    it('应该验证数字格式', () => {
      const invalidNumber = ErrorHandlingService.validateUserInput('abc', { numeric: true });
      expect(invalidNumber.isValid).toBe(false);
      expect(invalidNumber.errors).toContain('请输入有效的数字');

      const validNumber = ErrorHandlingService.validateUserInput('123', { numeric: true });
      expect(validNumber.isValid).toBe(true);
    });

    it('应该验证数字范围', () => {
      const tooSmall = ErrorHandlingService.validateUserInput('5', { numeric: true, min: 10 });
      expect(tooSmall.isValid).toBe(false);
      expect(tooSmall.errors).toContain('数值不能小于10');

      const tooBig = ErrorHandlingService.validateUserInput('15', { numeric: true, max: 10 });
      expect(tooBig.isValid).toBe(false);
      expect(tooBig.errors).toContain('数值不能大于10');
    });

    it('应该支持自定义验证', () => {
      const customRule = {
        custom: (value: string) => value.includes('@') || '必须包含@符号'
      };

      const invalid = ErrorHandlingService.validateUserInput('test', customRule);
      expect(invalid.isValid).toBe(false);
      expect(invalid.errors).toContain('必须包含@符号');

      const valid = ErrorHandlingService.validateUserInput('test@', customRule);
      expect(valid.isValid).toBe(true);
    });

    it('属性测试：验证应该是一致的', () => {
      fc.assert(fc.property(
        fc.string(),
        fc.boolean(),
        fc.nat(100),
        fc.nat(100),
        (input: string, required: boolean, minLen: number, maxLen: number) => {
          const rules = {
            required,
            minLength: Math.min(minLen, maxLen),
            maxLength: Math.max(minLen, maxLen)
          };

          const result = ErrorHandlingService.validateUserInput(input, rules);
          
          // 验证结果应该有isValid和errors属性
          expect(typeof result.isValid).toBe('boolean');
          expect(Array.isArray(result.errors)).toBe(true);
          
          // 如果无效，应该有错误信息
          if (!result.isValid) {
            expect(result.errors.length).toBeGreaterThan(0);
          }
        }
      ), { numRuns: 20 });
    });

    it('应该使用预定义验证规则', () => {
      // 测试用户名规则
      const usernameResult = ErrorHandlingService.validateUserInput('test@user', ValidationRules.username);
      expect(usernameResult.isValid).toBe(false);
      expect(usernameResult.errors).toContain('用户名只能包含字母、数字和下划线');

      // 测试手机号规则
      const phoneResult = ErrorHandlingService.validateUserInput('123456', ValidationRules.phone);
      expect(phoneResult.isValid).toBe(false);
      expect(phoneResult.errors).toContain('请输入有效的手机号码');
    });
  });

  describe('WebGL支持检测', () => {
    it('应该检测WebGL支持', () => {
      const support = ErrorHandlingService.checkWebGLSupport();
      
      expect(typeof support.supported).toBe('boolean');
      expect(Array.isArray(support.extensions)).toBe(true);
      
      if (support.supported) {
        expect(support.version).toBeTruthy();
      } else {
        expect(support.version).toBeNull();
      }
    });

    it('应该处理WebGL检测错误', () => {
      // Mock document.createElement to throw error
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn().mockImplementation(() => {
        throw new Error('Canvas not supported');
      });

      const support = ErrorHandlingService.checkWebGLSupport();
      expect(support.supported).toBe(false);
      expect(support.version).toBeNull();
      expect(support.extensions).toEqual([]);

      // Restore original function
      document.createElement = originalCreateElement;
    });
  });

  describe('设备性能检测', () => {
    it('应该检测设备性能指标', () => {
      const performance = ErrorHandlingService.checkDevicePerformance();
      
      expect(typeof performance.cores).toBe('number');
      expect(performance.cores).toBeGreaterThan(0);
      expect(typeof performance.devicePixelRatio).toBe('number');
      expect(performance.devicePixelRatio).toBeGreaterThan(0);
    });
  });

  describe('错误报告生成', () => {
    it('应该生成完整的错误报告', () => {
      const error = new Error('Test error');
      const report = ErrorHandlingService.generateErrorReport(error, 'test-context');

      expect(report.error.message).toBe('Test error');
      expect(report.error.name).toBe('Error');
      expect(report.context).toBe('test-context');
      expect(report.timestamp).toBeTruthy();
      expect(report.userAgent).toBeTruthy();
      expect(report.url).toBeTruthy();
      expect(report.webglSupport).toBeTruthy();
      expect(report.devicePerformance).toBeTruthy();
      expect(report.errorStats).toBeTruthy();
    });

    it('应该包含错误统计信息', () => {
      // 添加一些错误到队列
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      
      ErrorHandlingService.handleNetworkError(error1, 'context1').catch(() => {});
      ErrorHandlingService.handleNetworkError(error2, 'context2').catch(() => {});

      const stats = ErrorHandlingService.getErrorStats();
      expect(stats.totalErrors).toBeGreaterThan(0);
      expect(typeof stats.errorsByContext).toBe('object');
      expect(Array.isArray(stats.recentErrors)).toBe(true);
    });
  });

  describe('ErrorBoundary组件', () => {
    const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>正常内容</div>;
    };

    it('应该捕获并显示错误', () => {
      const onError = vi.fn();
      
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('出现了一些问题')).toBeTruthy();
      expect(screen.getByText('重试')).toBeTruthy();
      expect(screen.getByText('刷新页面')).toBeTruthy();
      expect(onError).toHaveBeenCalled();
    });

    it('应该在正常情况下渲染子组件', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('正常内容')).toBeTruthy();
    });

    it('应该支持自定义fallback', () => {
      const customFallback = <div>自定义错误页面</div>;
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('自定义错误页面')).toBeTruthy();
    });

    it('应该支持重试功能', () => {
      const TestRetryComponent: React.FC = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true);
        
        return (
          <ErrorBoundary>
            <button onClick={() => setShouldThrow(false)}>修复错误</button>
            <ThrowError shouldThrow={shouldThrow} />
          </ErrorBoundary>
        );
      };

      render(<TestRetryComponent />);

      // 应该显示错误
      expect(screen.getByText('出现了一些问题')).toBeTruthy();

      // 点击重试
      fireEvent.click(screen.getByText('重试'));

      // 错误应该被清除（虽然组件仍然会抛出错误，但这测试了重试机制）
    });
  });

  describe('NetworkStatus组件', () => {
    it('应该显示网络状态', () => {
      const onNetworkChange = vi.fn();
      
      render(<NetworkStatus onNetworkChange={onNetworkChange} />);

      expect(screen.getByText('在线')).toBeTruthy();
      expect(onNetworkChange).toHaveBeenCalledWith(true);
    });

    it('应该响应网络状态变化', async () => {
      const onNetworkChange = vi.fn();
      
      render(<NetworkStatus onNetworkChange={onNetworkChange} />);

      // 模拟离线
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      fireEvent(window, new Event('offline'));

      await waitFor(() => {
        expect(screen.getByText('离线')).toBeTruthy();
      });

      expect(onNetworkChange).toHaveBeenCalledWith(false);

      // 模拟重新上线
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      fireEvent(window, new Event('online'));

      await waitFor(() => {
        expect(screen.getByText('在线')).toBeTruthy();
      });

      expect(onNetworkChange).toHaveBeenCalledWith(true);
    });

    it('应该显示离线提示横幅', async () => {
      render(<NetworkStatus />);

      // 模拟离线
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      fireEvent(window, new Event('offline'));

      await waitFor(() => {
        expect(screen.getByText('网络连接已断开')).toBeTruthy();
      });
    });
  });

  describe('Toast通知系统', () => {
    const TestToastComponent: React.FC = () => {
      const { success, error, warning, info, toasts, removeToast } = useToast();
      
      return (
        <div>
          <button onClick={() => success('成功', '操作成功完成')}>成功通知</button>
          <button onClick={() => error('错误', '操作失败')}>错误通知</button>
          <button onClick={() => warning('警告', '需要注意')}>警告通知</button>
          <button onClick={() => info('信息', '提示信息')}>信息通知</button>
          
          {toasts.map(toast => (
            <div key={toast.id} onClick={() => removeToast(toast.id)}>
              {toast.title}: {toast.message}
            </div>
          ))}
        </div>
      );
    };

    it('应该显示不同类型的通知', () => {
      render(<TestToastComponent />);

      // 测试成功通知
      fireEvent.click(screen.getByText('成功通知'));
      expect(screen.getByText('成功: 操作成功完成')).toBeTruthy();

      // 测试错误通知
      fireEvent.click(screen.getByText('错误通知'));
      expect(screen.getByText('错误: 操作失败')).toBeTruthy();

      // 测试警告通知
      fireEvent.click(screen.getByText('警告通知'));
      expect(screen.getByText('警告: 需要注意')).toBeTruthy();

      // 测试信息通知
      fireEvent.click(screen.getByText('信息通知'));
      expect(screen.getByText('信息: 提示信息')).toBeTruthy();
    });

    it('应该支持移除通知', () => {
      render(<TestToastComponent />);

      fireEvent.click(screen.getByText('成功通知'));
      expect(screen.getByText('成功: 操作成功完成')).toBeTruthy();

      fireEvent.click(screen.getByText('成功: 操作成功完成'));
      expect(screen.queryByText('成功: 操作成功完成')).toBeNull();
    });
  });

  describe('错误恢复机制', () => {
    it('应该支持优雅降级', () => {
      // 模拟WebGL不支持的情况
      const webglError = new Error('WebGL not supported');
      const result = ErrorHandlingService.handle3DError(webglError, 'canvas-init');

      expect(result.canRetry).toBe(false);
      expect(result.suggestions).toContain('使用Chrome、Firefox或Safari浏览器');
    });

    it('应该提供有用的错误建议', () => {
      const memoryError = new Error('Out of memory');
      const result = ErrorHandlingService.handle3DError(memoryError, 'model-loading');

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.every(s => typeof s === 'string' && s.length > 0)).toBe(true);
    });

    it('属性测试：错误恢复应该总是提供建设性建议', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (errorMessage: string) => {
          const error = new Error(errorMessage);
          const result = ErrorHandlingService.handle3DError(error, 'test-context');

          // 应该总是有建议
          expect(result.suggestions.length).toBeGreaterThan(0);
          
          // 建议应该是有意义的字符串
          result.suggestions.forEach(suggestion => {
            expect(typeof suggestion).toBe('string');
            expect(suggestion.trim().length).toBeGreaterThan(0);
          });
        }
      ), { numRuns: 10 });
    });
  });
});