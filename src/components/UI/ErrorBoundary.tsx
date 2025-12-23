import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import TouchButton from './TouchButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // 调用错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 这里可以添加错误报告服务
    // reportError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <div 
          className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-gray-50 rounded-lg border border-gray-200"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertTriangle 
              size={32} 
              className="text-red-600" 
              aria-hidden="true"
            />
          </div>
          
          <h2 className="text-lg font-semibold text-gray-900 mb-2 text-center">
            出现了一些问题
          </h2>
          
          <p className="text-gray-600 text-center mb-6 max-w-md">
            应用遇到了意外错误。请尝试刷新页面，如果问题持续存在，请联系技术支持。
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <TouchButton 
              onClick={this.handleRetry}
              variant="primary"
              className="flex items-center gap-2"
              aria-label="重试操作"
            >
              <RefreshCw size={16} aria-hidden="true" />
              重试
            </TouchButton>
            
            <TouchButton 
              onClick={() => window.location.reload()}
              variant="secondary"
              aria-label="刷新页面"
            >
              刷新页面
            </TouchButton>
          </div>

          {/* 开发环境下显示错误详情 */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 w-full max-w-2xl">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                查看错误详情 (仅开发环境)
              </summary>
              <div className="mt-2 p-4 bg-gray-100 rounded border text-xs font-mono overflow-auto">
                <div className="mb-2">
                  <strong>错误信息:</strong>
                  <pre className="mt-1 text-red-600">{this.state.error.message}</pre>
                </div>
                <div className="mb-2">
                  <strong>错误堆栈:</strong>
                  <pre className="mt-1 text-gray-700">{this.state.error.stack}</pre>
                </div>
                {this.state.errorInfo && (
                  <div>
                    <strong>组件堆栈:</strong>
                    <pre className="mt-1 text-gray-700">{this.state.errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;