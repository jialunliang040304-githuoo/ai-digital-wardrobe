/**
 * 服装图片上传组件
 * 支持拍照或从相册选择服装图片
 */

import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Check, Shirt, Image as ImageIcon } from 'lucide-react';
import { ClothingCategory } from '../../types';

interface ClothingUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (imageData: string, category: ClothingCategory, name: string) => void;
}

const ClothingUploader: React.FC<ClothingUploaderProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [category, setCategory] = useState<ClothingCategory>('tops');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const categories: { value: ClothingCategory; label: string; icon: string }[] = [
    { value: 'tops', label: '上装', icon: '👕' },
    { value: 'bottoms', label: '下装', icon: '👖' },
    { value: 'shoes', label: '鞋子', icon: '👟' },
    { value: 'accessories', label: '配饰', icon: '👜' }
  ];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedImage || !name.trim()) {
      alert('请选择图片并输入名称');
      return;
    }

    setIsProcessing(true);
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onUpload(selectedImage, category, name.trim());
    
    // 重置状态
    setSelectedImage(null);
    setName('');
    setIsProcessing(false);
    onClose();
  }, [selectedImage, category, name, onUpload, onClose]);

  const handleReset = () => {
    setSelectedImage(null);
    setName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">添加服装</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* 图片选择区域 */}
          {!selectedImage ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">选择服装图片</p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* 拍照 */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors"
                >
                  <Camera size={32} className="text-blue-500 mb-2" />
                  <span className="text-sm font-medium text-blue-700">拍照</span>
                </button>
                
                {/* 相册 */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-2xl border-2 border-dashed border-purple-200 hover:border-purple-400 transition-colors"
                >
                  <ImageIcon size={32} className="text-purple-500 mb-2" />
                  <span className="text-sm font-medium text-purple-700">相册</span>
                </button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* 预览图片 */}
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="预览"
                  className="w-full h-64 object-contain bg-gray-100 rounded-2xl"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>

              {/* 分类选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  服装类型
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-xl text-center transition-all ${
                        category === cat.value
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-xl mb-1">{cat.icon}</div>
                      <div className="text-xs font-medium">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 名称输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  服装名称
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：白色T恤"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 提交按钮 */}
              <button
                onClick={handleUpload}
                disabled={isProcessing || !name.trim()}
                className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all ${
                  isProcessing || !name.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    添加到衣柜
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClothingUploader;
