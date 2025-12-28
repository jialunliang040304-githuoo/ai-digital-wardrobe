/**
 * 简化版3D Canvas组件 - 当主要3D组件失败时的回退方案
 */

import React from 'react';
import { RotateCcw, User } from 'lucide-react';

interface SimpleCanvas3DProps {
  className?: string;
  currentClothing?: {
    top?: { texture?: string; name?: string };
    bottom?: { texture?: string; name?: string };
    shoes?: { texture?: string; name?: string };
    accessories?: Array<{ texture?: string; name?: string }>;
  };
}

const SimpleCanvas3D: React.FC<SimpleCanvas3DProps> = ({ className = '', currentClothing }) => {
  return (
    <div className={`relative bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 rounded-2xl overflow-hidden ${className}`}>
      <div className="w-full h-full flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
        {/* 虚拟人体模型 */}
        <div className="relative">
          {/* 人体轮廓 */}
          <div className="w-32 h-48 bg-gradient-to-b from-blue-200 to-blue-300 rounded-full relative mx-auto mb-4 flex items-center justify-center">
            <User size={48} className="text-blue-600" />
          </div>
          
          {/* 显示当前穿着的服装 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* 上装 */}
            {currentClothing?.top && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-16 bg-white/90 rounded-lg border-2 border-blue-300 flex items-center justify-center">
                {currentClothing.top.texture && currentClothing.top.texture.startsWith('data:image') ? (
                  <img 
                    src={currentClothing.top.texture} 
                    alt={currentClothing.top.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-2xl">👕</span>
                )}
              </div>
            )}
            
            {/* 下装 */}
            {currentClothing?.bottom && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-20 h-16 bg-white/90 rounded-lg border-2 border-blue-300 flex items-center justify-center">
                {currentClothing.bottom.texture && currentClothing.bottom.texture.startsWith('data:image') ? (
                  <img 
                    src={currentClothing.bottom.texture} 
                    alt={currentClothing.bottom.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-2xl">👖</span>
                )}
              </div>
            )}
            
            {/* 鞋子 */}
            {currentClothing?.shoes && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-white/90 rounded-lg border-2 border-blue-300 flex items-center justify-center">
                {currentClothing.shoes.texture && currentClothing.shoes.texture.startsWith('data:image') ? (
                  <img 
                    src={currentClothing.shoes.texture} 
                    alt={currentClothing.shoes.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-lg">👟</span>
                )}
              </div>
            )}
            
            {/* 配饰 */}
            {currentClothing?.accessories?.[0] && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white/90 rounded-full border-2 border-blue-300 flex items-center justify-center">
                {currentClothing.accessories[0].texture && currentClothing.accessories[0].texture.startsWith('data:image') ? (
                  <img 
                    src={currentClothing.accessories[0].texture} 
                    alt={currentClothing.accessories[0].name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-lg">👜</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* 提示信息 */}
        <div className="text-center mt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">简化试穿模式</h3>
          <p className="text-sm text-gray-600 mb-4">3D渲染暂时不可用，使用简化模式显示</p>
          
          {/* 当前穿着列表 */}
          {(currentClothing?.top || currentClothing?.bottom || currentClothing?.shoes || (currentClothing?.accessories?.length ?? 0) > 0) && (
            <div className="bg-white/80 rounded-lg p-3 mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">当前穿着</h4>
              <div className="space-y-1 text-xs text-gray-600">
                {currentClothing?.top && <div>👕 {currentClothing.top.name}</div>}
                {currentClothing?.bottom && <div>👖 {currentClothing.bottom.name}</div>}
                {currentClothing?.shoes && <div>👟 {currentClothing.shoes.name}</div>}
                {currentClothing?.accessories?.map((item, index) => (
                  <div key={index}>👜 {item.name}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => window.location.reload()}
          className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all min-h-[44px] min-w-[44px]"
          aria-label="刷新页面"
          title="刷新页面重试3D渲染"
        >
          <RotateCcw size={16} className="text-gray-700" />
        </button>
      </div>

      {/* 状态指示器 */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-600 bg-white/90 px-3 py-2 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
          简化试穿模式
        </div>
      </div>

      {/* 操作提示 */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        点击刷新恢复3D
      </div>
    </div>
  );
};

export default SimpleCanvas3D;