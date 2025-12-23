// 错误处理服务
export class ErrorHandlingService {
  private static errorQueue: Array<{
    error: Error;
    context: string;
    timestamp: Date;
    retryCount: number;
  }> = [];

  private static maxRetries = 3;
  private static retryDelay = 1000; // 1秒

  // 网络错误处理
  static async handleNetworkError(
    error: Error,
    context: string,
    retryFn?: () => Promise<any>
  ): Promise<any> {
    console.error(`Network error in ${context}:`, error);

    // 检查是否是网络连接问题
    if (!navigator.onLine) {
      throw new Error('网络连接已断开，请检查您的网络设置');
    }

    // 检查是否是超时错误
    if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      throw new Error('请求超时，请稍后重试');
    }

    // 检查是否是服务器错误
    if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
      throw new Error('服务器暂时不可用，请稍后重试');
    }

    // 检查是否是权限错误
    if (error.message.includes('401') || error.message.includes('403')) {
      throw new Error('访问权限不足，请重新登录');
    }

    // 如果提供了重试函数，尝试重试
    if (retryFn) {
      return this.retryWithBackoff(error, context, retryFn);
    }

    throw error;
  }

  // 3D渲染错误处理
  static handle3DError(error: Error, context: string): {
    fallbackMessage: string;
    canRetry: boolean;
    suggestions: string[];
  } {
    console.error(`3D rendering error in ${context}:`, error);

    // WebGL不支持
    if (error.message.includes('WebGL') || error.message.includes('webgl')) {
      return {
        fallbackMessage: '您的浏览器不支持3D功能，请使用支持WebGL的现代浏览器',
        canRetry: false,
        suggestions: [
          '更新您的浏览器到最新版本',
          '启用硬件加速',
          '使用Chrome、Firefox或Safari浏览器'
        ]
      };
    }

    // 内存不足
    if (error.message.includes('memory') || error.message.includes('MEMORY')) {
      return {
        fallbackMessage: '设备内存不足，无法加载3D模型',
        canRetry: true,
        suggestions: [
          '关闭其他浏览器标签页',
          '重启浏览器',
          '使用性能更好的设备'
        ]
      };
    }

    // 模型加载失败
    if (error.message.includes('load') || error.message.includes('fetch')) {
      return {
        fallbackMessage: '3D模型加载失败，请检查网络连接',
        canRetry: true,
        suggestions: [
          '检查网络连接',
          '刷新页面重试',
          '稍后再试'
        ]
      };
    }

    // 渲染错误
    if (error.message.includes('render') || error.message.includes('draw')) {
      return {
        fallbackMessage: '3D渲染出现问题，已切换到2D模式',
        canRetry: true,
        suggestions: [
          '更新显卡驱动',
          '降低渲染质量',
          '重启浏览器'
        ]
      };
    }

    // 通用3D错误
    return {
      fallbackMessage: '3D功能暂时不可用，请稍后重试',
      canRetry: true,
      suggestions: [
        '刷新页面',
        '检查浏览器设置',
        '联系技术支持'
      ]
    };
  }

  // 用户输入验证
  static validateUserInput(input: any, rules: ValidationRules): ValidationResult {
    const errors: string[] = [];

    // 必填验证
    if (rules.required && (!input || input.toString().trim() === '')) {
      errors.push('此字段为必填项');
    }

    if (input && input.toString().trim() !== '') {
      // 长度验证
      if (rules.minLength && input.toString().length < rules.minLength) {
        errors.push(`最少需要${rules.minLength}个字符`);
      }

      if (rules.maxLength && input.toString().length > rules.maxLength) {
        errors.push(`最多允许${rules.maxLength}个字符`);
      }

      // 格式验证
      if (rules.pattern && !rules.pattern.test(input.toString())) {
        errors.push(rules.patternMessage || '格式不正确');
      }

      // 邮箱验证
      if (rules.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(input.toString())) {
          errors.push('请输入有效的邮箱地址');
        }
      }

      // 数字验证
      if (rules.numeric) {
        const numValue = Number(input);
        if (isNaN(numValue)) {
          errors.push('请输入有效的数字');
        } else {
          if (rules.min !== undefined && numValue < rules.min) {
            errors.push(`数值不能小于${rules.min}`);
          }
          if (rules.max !== undefined && numValue > rules.max) {
            errors.push(`数值不能大于${rules.max}`);
          }
        }
      }

      // 自定义验证
      if (rules.custom) {
        const customResult = rules.custom(input);
        if (customResult !== true) {
          errors.push(typeof customResult === 'string' ? customResult : '验证失败');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 带退避的重试机制
  private static async retryWithBackoff(
    error: Error,
    context: string,
    retryFn: () => Promise<any>,
    attempt: number = 1
  ): Promise<any> {
    if (attempt > this.maxRetries) {
      throw new Error(`${context}操作失败，已重试${this.maxRetries}次`);
    }

    try {
      // 添加到错误队列
      this.errorQueue.push({
        error,
        context,
        timestamp: new Date(),
        retryCount: attempt
      });

      // 等待退避时间
      await this.delay(this.retryDelay * Math.pow(2, attempt - 1));

      // 重试操作
      return await retryFn();
    } catch (retryError) {
      console.warn(`Retry ${attempt} failed for ${context}:`, retryError);
      return this.retryWithBackoff(retryError as Error, context, retryFn, attempt + 1);
    }
  }

  // 延迟函数
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 获取错误统计
  static getErrorStats(): {
    totalErrors: number;
    errorsByContext: Record<string, number>;
    recentErrors: Array<{ context: string; timestamp: Date; retryCount: number }>;
  } {
    const errorsByContext: Record<string, number> = {};
    
    this.errorQueue.forEach(item => {
      errorsByContext[item.context] = (errorsByContext[item.context] || 0) + 1;
    });

    const recentErrors = this.errorQueue
      .slice(-10)
      .map(item => ({
        context: item.context,
        timestamp: item.timestamp,
        retryCount: item.retryCount
      }));

    return {
      totalErrors: this.errorQueue.length,
      errorsByContext,
      recentErrors
    };
  }

  // 清理错误队列
  static clearErrorQueue(): void {
    this.errorQueue = [];
  }

  // 检查WebGL支持
  static checkWebGLSupport(): {
    supported: boolean;
    version: string | null;
    extensions: string[];
  } {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl || !('getParameter' in gl)) {
        return {
          supported: false,
          version: null,
          extensions: []
        };
      }

      const webglContext = gl as WebGLRenderingContext;
      const version = webglContext.getParameter(webglContext.VERSION);
      const extensions = webglContext.getSupportedExtensions() || [];

      return {
        supported: true,
        version,
        extensions
      };
    } catch (error) {
      return {
        supported: false,
        version: null,
        extensions: []
      };
    }
  }

  // 检查设备性能
  static checkDevicePerformance(): {
    memory: number | null;
    cores: number;
    connection: string | null;
    devicePixelRatio: number;
  } {
    const nav = navigator as any;
    
    return {
      memory: nav.deviceMemory || null,
      cores: nav.hardwareConcurrency || 1,
      connection: nav.connection?.effectiveType || null,
      devicePixelRatio: window.devicePixelRatio || 1
    };
  }

  // 生成错误报告
  static generateErrorReport(error: Error, context: string): {
    error: {
      message: string;
      stack: string | undefined;
      name: string;
    };
    context: string;
    timestamp: string;
    userAgent: string;
    url: string;
    webglSupport: ReturnType<typeof ErrorHandlingService.checkWebGLSupport>;
    devicePerformance: ReturnType<typeof ErrorHandlingService.checkDevicePerformance>;
    errorStats: ReturnType<typeof ErrorHandlingService.getErrorStats>;
  } {
    return {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      webglSupport: this.checkWebGLSupport(),
      devicePerformance: this.checkDevicePerformance(),
      errorStats: this.getErrorStats()
    };
  }
}

// 验证规则接口
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  email?: boolean;
  numeric?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean | string;
}

// 验证结果接口
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// 预定义验证规则
export const ValidationRules = {
  required: { required: true },
  email: { required: true, email: true },
  password: { 
    required: true, 
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    patternMessage: '密码必须包含大小写字母和数字'
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    patternMessage: '用户名只能包含字母、数字和下划线'
  },
  phone: {
    required: true,
    pattern: /^1[3-9]\d{9}$/,
    patternMessage: '请输入有效的手机号码'
  }
};