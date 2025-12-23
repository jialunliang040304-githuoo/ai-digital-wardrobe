import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { aiService, BodyScanOptions, AIModelResult } from '../../services/aiService';

interface BodyScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModelGenerated: (model: AIModelResult) => void;
}

type ScanStep = 'upload' | 'options' | 'processing' | 'result';

export const BodyScanModal: React.FC<BodyScanModalProps> = ({
  isOpen,
  onClose,
  onModelGenerated
}) => {
  const [step, setStep] = useState<ScanStep>('upload');
  const [images, setImages] = useState<File[]>([]);
  const [options, setOptions] = useState<BodyScanOptions>({
    quality: 'medium',
    generateMeasurements: true,
    outputFormat: 'gltf'
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AIModelResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 10)); // 最多10张图片
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 'upload' && images.length > 0) {
      setStep('options');
    } else if (step === 'options') {
      generateModel();
    }
  };

  const generateModel = async () => {
    setStep('processing');
    setProcessing(true);
    setError(null);
    
    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      const model = await aiService.generateBodyModel(images, options);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(model);
      setStep('result');
      
      setTimeout(() => {
        onModelGenerated(model);
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setStep('upload');
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setStep('upload');
    setImages([]);
    setProgress(0);
    setResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-cyan-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">AI人体3D建模</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">上传照片</h3>
                <p className="text-gray-400">上传1-10张不同角度的全身照片，获得更精确的3D模型</p>
              </div>

              {/* 上传区域 */}
              <div
                className="border-2 border-dashed border-cyan-500/30 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">点击上传照片</p>
                <p className="text-gray-400 text-sm">支持 JPG, PNG 格式，单张最大50MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* 已上传的图片 */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">{error}</span>
                </div>
              )}
            </div>
          )}

          {step === 'options' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">生成选项</h3>
                <p className="text-gray-400">选择模型质量和输出格式</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">模型质量</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((quality) => (
                      <button
                        key={quality}
                        onClick={() => setOptions(prev => ({ ...prev, quality }))}
                        className={`p-3 rounded-lg border transition-colors ${
                          options.quality === quality
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {quality === 'low' && '快速'}
                        {quality === 'medium' && '标准'}
                        {quality === 'high' && '高精度'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white">生成身体测量数据</span>
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, generateMeasurements: !prev.generateMeasurements }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      options.generateMeasurements ? 'bg-cyan-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      options.generateMeasurements ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">输出格式</label>
                  <select
                    value={options.outputFormat}
                    onChange={(e) => setOptions(prev => ({ ...prev, outputFormat: e.target.value as any }))}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="gltf">GLTF (推荐)</option>
                    <option value="obj">OBJ</option>
                    <option value="fbx">FBX</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto">
                <Loader2 className="w-full h-full text-cyan-400 animate-spin" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">AI正在生成3D模型</h3>
                <p className="text-gray-400">这可能需要几分钟时间，请耐心等待...</p>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-cyan-400 font-medium">{Math.round(progress)}%</p>
            </div>
          )}

          {step === 'result' && result && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto">
                <CheckCircle className="w-full h-full text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3D模型生成成功！</h3>
                <p className="text-gray-400">您的专属3D人体模型已准备就绪</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">顶点数量:</span>
                  <span className="text-white">{result.vertexCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">面数:</span>
                  <span className="text-white">{result.faceCount.toLocaleString()}</span>
                </div>
                {result.measurements && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">身体测量:</span>
                    <span className="text-green-400">已生成</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-between p-6 border-t border-gray-800">
          {step === 'upload' && (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleNext}
                disabled={images.length === 0}
                className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一步
              </button>
            </>
          )}
          
          {step === 'options' && (
            <>
              <button
                onClick={() => setStep('upload')}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                上一步
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                开始生成
              </button>
            </>
          )}
          
          {step === 'result' && (
            <>
              <button
                onClick={reset}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                重新生成
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                完成
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};