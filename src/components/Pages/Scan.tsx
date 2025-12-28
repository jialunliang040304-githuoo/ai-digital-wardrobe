import React from 'react';
import { Camera, Scan as ScanIcon } from 'lucide-react';

interface ScanProps {
  isActive: boolean;
}

const Scan: React.FC<ScanProps> = ({ isActive }) => {
  return (
    <div className="h-full p-4 xs:p-3 sm:p-6">
      <header className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">身体扫描</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">创建你的3D数字分身</p>
      </header>
      
      {/* 扫描区域 */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
          <ScanIcon size={36} className="sm:w-12 sm:h-12 text-primary-600" />
        </div>
        
        <h2 className="text-lg sm:text-xl font-semibold mb-2">开始身体扫描</h2>
        <p className="text-gray-600 text-center mb-6 sm:mb-8 max-w-sm text-sm sm:text-base px-4">
          通过身体扫描创建专属的3D虚拟形象，让试穿效果更加真实
        </p>
        
        <button className="w-full bg-primary-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-600 transition-colors min-h-touch flex items-center justify-center space-x-2">
          <Camera size={18} className="sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">开始扫描</span>
        </button>
      </div>
      
      {/* 扫描说明 */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
        <h3 className="font-medium mb-2 text-sm sm:text-base">扫描提示</h3>
        <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
          <li>• 确保光线充足</li>
          <li>• 穿着贴身衣物</li>
          <li>• 按照指引完成动作</li>
        </ul>
      </div>
    </div>
  );
};

export default Scan;