import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface NetworkStatusProps {
  onNetworkChange?: (isOnline: boolean) => void;
  showIndicator?: boolean;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  onNetworkChange, 
  showIndicator = true 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      onNetworkChange?.(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      onNetworkChange?.(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初始状态通知
    onNetworkChange?.(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onNetworkChange]);

  // 自动隐藏离线消息
  useEffect(() => {
    if (showOfflineMessage) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showOfflineMessage]);

  if (!showIndicator) {
    return null;
  }

  return (
    <>
      {/* 网络状态指示器 */}
      <div 
        className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 ${
          isOnline 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}
        role="status"
        aria-live="polite"
        aria-label={isOnline ? '网络已连接' : '网络已断开'}
      >
        {isOnline ? (
          <Wifi size={16} aria-hidden="true" />
        ) : (
          <WifiOff size={16} aria-hidden="true" />
        )}
        <span className="text-sm font-medium">
          {isOnline ? '在线' : '离线'}
        </span>
      </div>

      {/* 离线提示横幅 */}
      {showOfflineMessage && (
        <div 
          className="fixed top-0 left-0 right-0 z-40 bg-yellow-50 border-b border-yellow-200 px-4 py-3"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
            <AlertCircle size={20} className="text-yellow-600" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                网络连接已断开
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                您可以继续使用已缓存的内容，网络恢复后将自动同步
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NetworkStatus;