import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 进入动画
    const enterTimer = setTimeout(() => setIsVisible(true), 100);
    
    // 自动关闭
    const exitTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" aria-hidden="true" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-600" aria-hidden="true" />;
      case 'info':
        return <Info size={20} className="text-blue-600" aria-hidden="true" />;
    }
  };

  const getStyles = () => {
    const baseStyles = 'border-l-4 bg-white shadow-lg rounded-lg';
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500`;
      case 'error':
        return `${baseStyles} border-red-500`;
      case 'warning':
        return `${baseStyles} border-yellow-500`;
      case 'info':
        return `${baseStyles} border-blue-500`;
    }
  };

  const getAriaLabel = () => {
    const typeLabels = {
      success: '成功',
      error: '错误',
      warning: '警告',
      info: '信息'
    };
    return `${typeLabels[type]}通知: ${title}`;
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 transform
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-label={getAriaLabel()}
    >
      <div className={getStyles()}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {title}
              </h4>
              {message && (
                <p className="text-sm text-gray-600 mb-2">
                  {message}
                </p>
              )}
              
              {action && (
                <button
                  onClick={action.onClick}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                >
                  {action.label}
                </button>
              )}
            </div>
            
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="关闭通知"
            >
              <X size={16} className="text-gray-400" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast容器组件
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onRemove}
        />
      ))}
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>>([]);

  const addToast = (toast: Omit<typeof toasts[0], 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success: (title: string, message?: string, action?: { label: string; onClick: () => void }) =>
      addToast({ type: 'success', title, message, action }),
    error: (title: string, message?: string, action?: { label: string; onClick: () => void }) =>
      addToast({ type: 'error', title, message, action }),
    warning: (title: string, message?: string, action?: { label: string; onClick: () => void }) =>
      addToast({ type: 'warning', title, message, action }),
    info: (title: string, message?: string, action?: { label: string; onClick: () => void }) =>
      addToast({ type: 'info', title, message, action })
  };
};

export default Toast;