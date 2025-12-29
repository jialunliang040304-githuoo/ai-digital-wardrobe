import React, { useState, useRef } from 'react';
import { Camera, Scan as ScanIcon, Upload, Users, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ScanProps {
  isActive: boolean;
}

const Scan: React.FC<ScanProps> = ({ isActive }) => {
  const [scanMode, setScanMode] = useState<'single' | 'video' | 'gaussian'>('single');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages = files.map(file => URL.createObjectURL(file));
    setCapturedImages(prev => [...prev, ...newImages]);
  };

  // 处理扫描模式切换
  const handleScanModeChange = (mode: 'single' | 'video' | 'gaussian') => {
    setScanMode(mode);
    setCapturedImages([]);
    setCurrentStep(1);
  };

  // 开始3D生成处理
  const start3DGeneration = async () => {
    setIsProcessing(true);
    setScanProgress(0);
    
    // 模拟高斯泼溅生成过程
    for (let i = 0; i <= 100; i += 10) {
      setScanProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsProcessing(false);
    setCurrentStep(5); // 完成步骤
  };

  const renderScanStep = () => {
    switch (currentStep) {
      case 1: // 选择扫描模式
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleScanModeChange('single')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  scanMode === 'single' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Camera className="w-8 h-8 mx-auto mb-3 text-primary-600" />
                <h3 className="font-medium mb-2">单张照片扫描</h3>
                <p className="text-sm text-gray-600">使用一张正面照片生成3D模型</p>
              </button>
              
              <button
                onClick={() => handleScanModeChange('video')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  scanMode === 'video' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Zap className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-medium mb-2">多角度视频扫描</h3>
                <p className="text-sm text-gray-600">录制360°视频创建高精度模型</p>
              </button>
              
              <button
                onClick={() => handleScanModeChange('gaussian')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  scanMode === 'gaussian' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-medium mb-2">AI高斯泼溅</h3>
                <p className="text-sm text-gray-600">最先进的AI技术，照片生成3D</p>
              </button>
            </div>
          </div>
        );

      case 2: // 拍照/上传
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {scanMode === 'single' ? '上传正面照片' : 
                 scanMode === 'video' ? '上传视频文件' : '上传多角度照片'}
              </h3>
              
              {/* 图片预览区域 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {capturedImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={img} 
                      alt={`Scan ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => setCapturedImages(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {/* 添加图片按钮 */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">添加照片</span>
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept={scanMode === 'video' ? 'video/*' : 'image/*'}
                multiple={scanMode !== 'single'}
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            <button
              onClick={() => setCurrentStep(3)}
              disabled={capturedImages.length === 0}
              className="w-full bg-primary-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              下一步
            </button>
          </div>
        );

      case 3: // 参数配置
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">3D模型参数</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">模型质量</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option>高质量 (推荐)</option>
                  <option>标准质量</option>
                  <option>快速生成</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">输出格式</label>
                <div className="grid grid-cols-3 gap-2">
                  <button className="p-3 border-2 border-primary-500 bg-primary-50 rounded-lg text-center">
                    <span className="text-xs font-medium">GLB</span>
                  </button>
                  <button className="p-3 border border-gray-200 rounded-lg text-center hover:border-gray-300">
                    <span className="text-xs font-medium">OBJ</span>
                  </button>
                  <button className="p-3 border border-gray-200 rounded-lg text-center hover:border-gray-300">
                    <span className="text-xs font-medium">FBX</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900">AI高斯泼溅技术</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    使用最新的AI技术从2D照片生成高质量的3D模型，支持细节优化和材质映射。
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={start3DGeneration}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
            >
              开始AI 3D生成
            </button>
          </div>
        );

      case 4: // 处理中
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">AI正在生成3D模型</h3>
              <p className="text-gray-600 mb-4">
                使用高斯泼溅技术处理您的照片，请稍候...
              </p>
              
              {/* 进度条 */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{scanProgress}% 完成</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">处理步骤</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li className={scanProgress >= 25 ? 'text-blue-900 font-medium' : ''}>
                  ✓ {scanProgress >= 25 ? '照片预处理' : '照片预处理...'}
                </li>
                <li className={scanProgress >= 50 ? 'text-blue-900 font-medium' : ''}>
                  ✓ {scanProgress >= 50 ? '高斯泼溅重建' : '高斯泼溅重建...'}
                </li>
                <li className={scanProgress >= 75 ? 'text-blue-900 font-medium' : ''}>
                  ✓ {scanProgress >= 75 ? '纹理映射生成' : '纹理映射生成...'}
                </li>
                <li className={scanProgress >= 95 ? 'text-blue-900 font-medium' : ''}>
                  ✓ {scanProgress >= 95 ? '模型优化' : '模型优化...'}
                </li>
              </ul>
            </div>
          </div>
        );

      case 5: // 完成
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3D模型生成完成！</h3>
              <p className="text-gray-600 mb-6">
                您的3D数字分身已准备就绪，可以开始试穿了
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  开始试穿
                </button>
                <button className="border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  重新生成
                </button>
              </div>
            </div>
            
            {/* 模型预览 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">生成的模型</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="bg-gray-200 rounded-lg h-24 mb-2"></div>
                  <p className="text-sm text-gray-600">正面视图</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-200 rounded-lg h-24 mb-2"></div>
                  <p className="text-sm text-gray-600">侧面视图</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full p-4 xs:p-3 sm:p-6">
      <header className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">身体扫描</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          {scanMode === 'gaussian' ? 'AI高斯泼溅3D建模' : '创建你的3D数字分身'}
        </p>
        
        {/* 步骤指示器 */}
        <div className="flex items-center justify-between mt-4 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep >= step 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </div>
              {step < 5 && (
                <div 
                  className={`h-1 w-12 transition-colors ${
                    currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </header>
      
      {/* 主要内容区域 */}
      <div className="flex-1 flex flex-col justify-center">
        {isProcessing ? (
          renderScanStep()
        ) : (
          <div className={`${currentStep === 1 ? 'items-center' : 'items-start'} flex-1`}>
            {renderScanStep()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;