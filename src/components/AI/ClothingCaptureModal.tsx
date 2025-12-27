import React, { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle, Shirt, Zap } from 'lucide-react';
import { aiService, ClothingGenOptions, AIModelResult } from '../../services/aiService';

interface ClothingCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModelGenerated: (model: AIModelResult) => void;
}

type CaptureStep = 'category' | 'capture' | 'options' | 'processing' | 'result';

const categoryIcons = {
  tops: Shirt,
  bottoms: '👖',
  shoes: '👟',
  accessories: '👜'
};

const categoryNames = {
  tops: '上装',
  bottoms: '下装',
  shoes: '鞋子',
  accessories: '配饰'
};

export const ClothingCaptureModal: React.FC<ClothingCaptureModalProps> = ({
  isOpen,
  onClose,
  onModelGenerated
}) => {
  const [step, setStep] = useState<CaptureStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<ClothingGenOptions['category']>('tops');
  const [image, setImage] = useState<File | null>(null);
  const [options, setOptions] = useState<ClothingGenOptions>({
    category: 'tops',
    extractMaterial: true,
    generatePhysics: true
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AIModelResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCamera, setIsCamera] = useState(false);

  if (!isOpen) return null;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // 后置摄像头
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCamera(true);
      }
    } catch (err) {
      setError('无法访问摄像头，请检查权限设置');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-clothing.jpg', { type: 'image/jpeg' });
          setImage(file);
          stopCamera();
          setStep('options');
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setStep('options');
    }
  };

  const generateModel = async () => {
    if (!image) return;
    
    setStep('processing');
    setProcessing(true);
    setError(null);
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 800);

      const model = await aiService.generateClothingModel(image, {
        ...options,
        category: selectedCategory
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(model);
      setStep('result');
      
      setTimeout(() => {
        onModelGenerated(model);
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setStep('capture');
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setStep('category');
    setImage(null);
    setProgress(0);
    setResult(null);
    setError(null);
    stopCamera();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-cyan-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">AI服装3D建模</h2>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {step === 'category' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">选择服装类型</h3>
                <p className="text-gray-400">选择要生成3D模型的服装类型</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(Object.keys(categoryNames) as Array<keyof typeof categoryNames>).map((category) => {
                  const IconComponent = categoryIcons[category];
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setOptions(prev => ({ ...prev, category }));
                        setStep('capture');
                      }}
                      className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                        selectedCategory === category
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-4xl mb-3">
                        {typeof IconComponent === 'string' ? (
                          <span>{IconComponent}</span>
                        ) : (
                          <IconComponent className="w-12 h-12 mx-auto text-cyan-400" />
                        )}
                      </div>
                      <h4 className="text-white font-medium">{categoryNames[category]}</h4>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'capture' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">拍摄{categoryNames[selectedCategory]}</h3>
                <p className="text-gray-400">平铺拍摄或上传清晰的服装照片</p>
              </div>

              {/* 拍摄指导 */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-blue-400 font-medium mb-2">拍摄建议:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 将服装平铺在浅色背景上</li>
                  <li>• 确保光线充足，避免阴影</li>
                  <li>• 服装完全展开，无褶皱</li>
                  <li>• 垂直俯拍，保持服装居中</li>
                </ul>
              </div>

              {/* 摄像头预览 */}
              {isCamera && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                  />
                  <button
                    onClick={capturePhoto}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                </div>
              )}

              {/* 已选择的图片预览 */}
              {image && !isCamera && (
                <div className="text-center">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Selected clothing"
                    className="max-w-full max-h-64 mx-auto rounded-lg"
                  />
                  <button
                    onClick={() => setImage(null)}
                    className="mt-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    重新选择
                  </button>
                </div>
              )}

              {/* 操作按钮 */}
              {!isCamera && !image && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={startCamera}
                    className="flex items-center justify-center gap-2 p-4 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    拍照
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 p-4 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    上传
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

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
                <p className="text-gray-400">自定义3D模型生成参数</p>
              </div>

              {image && (
                <div className="text-center mb-4">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Selected clothing"
                    className="max-w-32 max-h-32 mx-auto rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">提取材质信息</span>
                    <p className="text-sm text-gray-400">分析服装材质和纹理</p>
                  </div>
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, extractMaterial: !prev.extractMaterial }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      options.extractMaterial ? 'bg-cyan-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      options.extractMaterial ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">生成物理属性</span>
                    <p className="text-sm text-gray-400">添加布料物理模拟参数</p>
                  </div>
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, generatePhysics: !prev.generatePhysics }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      options.generatePhysics ? 'bg-cyan-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      options.generatePhysics ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto">
                <Zap className="w-full h-full text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">AI正在生成服装3D模型</h3>
                <p className="text-gray-400">正在分析材质纹理和生成3D网格...</p>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500"
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
                <h3 className="text-xl font-semibold text-white mb-2">服装3D模型生成成功！</h3>
                <p className="text-gray-400">您的{categoryNames[selectedCategory]}3D模型已准备就绪</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">类型:</span>
                  <span className="text-white">{categoryNames[result.category as keyof typeof categoryNames]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">顶点数量:</span>
                  <span className="text-white">{result.vertexCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">面数:</span>
                  <span className="text-white">{result.faceCount.toLocaleString()}</span>
                </div>
                {result.materials && result.materials.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">材质:</span>
                    <span className="text-green-400">已提取</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-between p-6 border-t border-gray-800">
          {step === 'category' && (
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              取消
            </button>
          )}
          
          {step === 'capture' && (
            <>
              <button
                onClick={() => {
                  stopCamera();
                  setStep('category');
                }}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                上一步
              </button>
              {image && (
                <button
                  onClick={() => setStep('options')}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  下一步
                </button>
              )}
            </>
          )}
          
          {step === 'options' && (
            <>
              <button
                onClick={() => setStep('capture')}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                上一步
              </button>
              <button
                onClick={generateModel}
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
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};