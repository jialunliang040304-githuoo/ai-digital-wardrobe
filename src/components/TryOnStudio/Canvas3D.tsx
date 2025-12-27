import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface Canvas3DProps {
  className?: string;
  currentClothing?: any;
}

// 简化的3D人物组件 - 使用CSS 3D变换
const Simple3DAvatar: React.FC<{ rotation: number; scale: number }> = ({ rotation, scale }) => {
  return (
    <div 
      className="relative w-full h-full flex items-center justify-center"
      style={{ 
        perspective: '1000px',
        perspectiveOrigin: 'center center'
      }}
    >
      <div
        className="relative"
        style={{
          transform: `rotateY(${rotation}deg) scale(${scale})`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* 头部 */}
        <div 
          className="absolute rounded-full bg-gradient-to-b from-amber-200 to-amber-300 shadow-lg"
          style={{
            width: '60px',
            height: '70px',
            left: '50%',
            top: '0',
            transform: 'translateX(-50%)',
            borderRadius: '50% 50% 45% 45%'
          }}
        >
          {/* 眼睛 */}
          <div className="absolute top-6 left-3 w-2 h-2 bg-gray-800 rounded-full"></div>
          <div className="absolute top-6 right-3 w-2 h-2 bg-gray-800 rounded-full"></div>
          {/* 嘴巴 */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-red-400 rounded-full"></div>
        </div>
        
        {/* 脖子 */}
        <div 
          className="absolute bg-amber-200"
          style={{
            width: '20px',
            height: '15px',
            left: '50%',
            top: '65px',
            transform: 'translateX(-50%)'
          }}
        />
        
        {/* 身体/上衣 */}
        <div 
          className="absolute bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-lg shadow-md"
          style={{
            width: '80px',
            height: '100px',
            left: '50%',
            top: '75px',
            transform: 'translateX(-50%)',
            borderRadius: '10px 10px 5px 5px'
          }}
        >
          {/* 衣领 */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-white rounded-b-full"></div>
        </div>
        
        {/* 左臂 */}
        <div 
          className="absolute bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-sm"
          style={{
            width: '22px',
            height: '80px',
            left: 'calc(50% - 52px)',
            top: '80px',
            transform: 'rotate(10deg)'
          }}
        />
        {/* 左手 */}
        <div 
          className="absolute bg-amber-200 rounded-full"
          style={{
            width: '18px',
            height: '22px',
            left: 'calc(50% - 50px)',
            top: '155px'
          }}
        />
        
        {/* 右臂 */}
        <div 
          className="absolute bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-sm"
          style={{
            width: '22px',
            height: '80px',
            left: 'calc(50% + 30px)',
            top: '80px',
            transform: 'rotate(-10deg)'
          }}
        />
        {/* 右手 */}
        <div 
          className="absolute bg-amber-200 rounded-full"
          style={{
            width: '18px',
            height: '22px',
            left: 'calc(50% + 32px)',
            top: '155px'
          }}
        />
        
        {/* 裤子 */}
        <div 
          className="absolute bg-gradient-to-b from-gray-700 to-gray-800 shadow-md"
          style={{
            width: '80px',
            height: '30px',
            left: '50%',
            top: '170px',
            transform: 'translateX(-50%)',
            borderRadius: '0 0 5px 5px'
          }}
        />
        
        {/* 左腿 */}
        <div 
          className="absolute bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-lg shadow-sm"
          style={{
            width: '32px',
            height: '90px',
            left: 'calc(50% - 35px)',
            top: '195px'
          }}
        />
        
        {/* 右腿 */}
        <div 
          className="absolute bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-lg shadow-sm"
          style={{
            width: '32px',
            height: '90px',
            left: 'calc(50% + 3px)',
            top: '195px'
          }}
        />
        
        {/* 左鞋 */}
        <div 
          className="absolute bg-gradient-to-r from-white to-gray-100 rounded-lg shadow-md"
          style={{
            width: '38px',
            height: '18px',
            left: 'calc(50% - 38px)',
            top: '282px',
            borderRadius: '5px 15px 5px 5px'
          }}
        />
        
        {/* 右鞋 */}
        <div 
          className="absolute bg-gradient-to-r from-gray-100 to-white rounded-lg shadow-md"
          style={{
            width: '38px',
            height: '18px',
            left: 'calc(50% + 0px)',
            top: '282px',
            borderRadius: '15px 5px 5px 5px'
          }}
        />
      </div>
    </div>
  );
};

const Canvas3D: React.FC<Canvas3DProps> = ({ className = '', currentClothing }) => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动旋转
  useEffect(() => {
    if (!isDragging) {
      const interval = setInterval(() => {
        setRotation(prev => (prev + 0.5) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - lastX;
      setRotation(prev => prev + deltaX * 0.5);
      setLastX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setLastX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const deltaX = e.touches[0].clientX - lastX;
      setRotation(prev => prev + deltaX * 0.5);
      setLastX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setRotation(0);
    setScale(1);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <div className={`relative bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 rounded-2xl overflow-hidden ${className}`}>
      {/* 3D场景容器 */}
      <div 
        ref={containerRef}
        className="w-full h-full relative cursor-grab active:cursor-grabbing" 
        style={{ minHeight: '400px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-pink-200/20 rounded-full blur-2xl"></div>
        </div>

        {/* 地面阴影 */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-400/20 rounded-full blur-md"
          style={{
            width: '120px',
            height: '20px',
            transform: `translateX(-50%) scaleX(${scale})`
          }}
        />

        {/* 3D人物 */}
        <Simple3DAvatar rotation={rotation} scale={scale} />

        {/* 交互提示 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">
          拖动旋转 • 双指缩放
        </div>
      </div>

      {/* 3D控制按钮 */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={handleReset}
          className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all duration-200 min-h-[44px] min-w-[44px] hover:shadow-xl backdrop-blur-sm"
          aria-label="重置视图"
        >
          <RotateCcw size={16} className="text-gray-700" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all duration-200 min-h-[44px] min-w-[44px] hover:shadow-xl backdrop-blur-sm"
          aria-label="放大"
        >
          <ZoomIn size={16} className="text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all duration-200 min-h-[44px] min-w-[44px] hover:shadow-xl backdrop-blur-sm"
          aria-label="缩小"
        >
          <ZoomOut size={16} className="text-gray-700" />
        </button>
      </div>

      {/* 状态指示器 */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-600 bg-white/90 px-3 py-2 rounded-lg shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          3D试穿工作室
        </div>
      </div>

      {/* 当前穿着指示器 */}
      {currentClothing && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-xs text-gray-600 mb-1">当前穿着</div>
          <div className="flex gap-1">
            {currentClothing.top && <div className="w-3 h-3 bg-blue-500 rounded" title="上装"></div>}
            {currentClothing.bottom && <div className="w-3 h-3 bg-gray-700 rounded" title="下装"></div>}
            {currentClothing.shoes && <div className="w-3 h-3 bg-white border border-gray-300 rounded" title="鞋子"></div>}
            {currentClothing.accessories?.length > 0 && <div className="w-3 h-3 bg-purple-500 rounded" title="配饰"></div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas3D;