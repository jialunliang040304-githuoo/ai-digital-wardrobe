/**
 * 安全错误边界组件 - 捕获所有可能的错误并提供友好的回退UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class SafeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SafeErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 调用外部错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 发送错误报告到控制台（生产环境可以发送到错误监控服务）
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // 在生产环境中，这里可以发送到错误监控服务
    console.group('🚨 Error Report');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    // 重置错误状态并导航到首页
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.hash = '#home';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center">
            {/* 错误图标 */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            {/* 错误标题 */}
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              出现了一些问题
            </h2>

            {/* 错误描述 */}
            <p className="text-gray-600 mb-6">
              应用遇到了意外错误。请尝试刷新页面，如果问题持续存在，请联系技术支持。
            </p>

            {/* 错误详情（开发环境显示） */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 rounded-lg p-3 mb-4 text-left">
                <p className="text-xs font-mono text-gray-700 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                重试
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Home size={18} />
                返回首页
              </button>
            </div>

            {/* 帮助信息 */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                如果问题持续存在，请尝试：
              </p>
              <ul className="text-xs text-gray-500 mt-2 space-y-1">
                <li>• 刷新浏览器页面</li>
                <li>• 清除浏览器缓存</li>
                <li>• 检查网络连接</li>
                <li>• 使用最新版本的浏览器</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SafeErrorBoundary;