import React, { useRef, useEffect } from 'react';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface Canvas3DProps {
  className?: string;
}

const Canvas3D: React.FC<Canvas3DProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 这里将来会初始化 React Three Fiber 场景
    // 目前使用占位符实现
  }, []);

  const handleReset = () => {
    // 重置相机位置和模型姿态
    console.log('重置3D视图');
  };

  const handleZoomIn = () => {
    // 放大视图
    console.log('放大');
  };

  const handleZoomOut = () => {
    // 缩小视图
    console.log('缩小');
  };

  return (
    <div className={`relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* 3D场景容器 */}
      <div 
        ref={canvasRef}
        className="w-full h-full flex items-center justify-center relative"
      >
        {/* 占位符内容 */}
        <div className="text-center">
          <div className="w-32 h-48 bg-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-gray-600 text-sm">3D Avatar</span>
          </div>
          <p className="text-gray-500 text-sm">拖拽旋转查看</p>
        </div>

        {/* 3D平台底座 */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          <div className="w-40 h-4 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 rounded-full opacity-60"></div>
        </div>

        {/* 环境光效果 */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-gray-200/20 pointer-events-none"></div>
      </div>

      {/* 3D控制按钮 */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={handleReset}
          className="p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors min-h-touch min-w-touch"
          aria-label="重置视图"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors min-h-touch min-w-touch"
          aria-label="放大"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors min-h-touch min-w-touch"
          aria-label="缩小"
        >
          <ZoomOut size={16} />
        </button>
      </div>

      {/* 加载指示器 */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        WebGL 就绪
      </div>
    </div>
  );
};

export default Canvas3D;