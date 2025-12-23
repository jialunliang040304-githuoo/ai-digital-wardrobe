import React, { useState, useEffect } from 'react';
import { Save, Share, Undo2, User, Shirt, Zap } from 'lucide-react';
import { ClothingItem, ClothingCategory } from '../../types';
import { useAppContext, actions } from '../../context/AppContext';
import Canvas3D from '../TryOnStudio/Canvas3D';
import ClothingCarousel from '../TryOnStudio/ClothingCarousel';
import SaveLookModal from '../TryOnStudio/SaveLookModal';
import { BodyScanModal } from '../AI/BodyScanModal';
import { ClothingCaptureModal } from '../AI/ClothingCaptureModal';
import { aiService, AIModelResult } from '../../services/aiService';

interface TryOnStudioProps {
  isActive: boolean;
}

const TryOnStudio: React.FC<TryOnStudioProps> = ({ isActive }) => {
  const { state, dispatch } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory>('tops');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showBodyScanModal, setShowBodyScanModal] = useState(false);
  const [showClothingCaptureModal, setShowClothingCaptureModal] = useState(false);
  const [aiGeneratedModels, setAiGeneratedModels] = useState<AIModelResult[]>([]);

  // 设置AI服务token
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      aiService.setToken(token);
    }
  }, []);

  const categories: ClothingCategory[] = ['tops', 'bottoms', 'shoes', 'accessories'];

  const handleSelectClothing = (item: ClothingItem) => {
    // 根据物品类型决定穿戴位置
    const slot = item.category === 'accessories' ? 'accessories' : item.category;
    dispatch(actions.wearClothing(item, slot as keyof typeof state.currentLook));
  };

  const handleBodyModelGenerated = (model: AIModelResult) => {
    console.log('生成的人体模型:', model);
    // 这里可以更新用户的3D模型
    setShowBodyScanModal(false);
  };

  const handleClothingModelGenerated = (model: AIModelResult) => {
    console.log('生成的服装模型:', model);
    
    // 将AI生成的模型转换为服装项目
    const clothingItem: ClothingItem = {
      id: model.id,
      name: `AI生成${model.category === 'tops' ? '上装' : model.category === 'bottoms' ? '下装' : model.category === 'shoes' ? '鞋子' : '配饰'}`,
      category: (model.category || 'tops') as ClothingCategory,
      type: 'ai-generated',
      color: '#ffffff',
      texture: model.downloadUrl,
      meshData: JSON.stringify({
        vertices: model.vertexCount,
        faces: model.faceCount,
        materials: model.materials
      }),
      tags: ['AI生成', '3D模型']
    };
    
    // 添加到衣柜
    dispatch(actions.addClothingItem(clothingItem));
    setAiGeneratedModels(prev => [...prev, model]);
    setShowClothingCaptureModal(false);
  };

  const handleSaveLook = () => {
    // 检查是否有选择的服装
    const hasClothing = state.currentLook.top || 
                       state.currentLook.bottom || 
                       state.currentLook.shoes || 
                       state.currentLook.accessories.length > 0;
    
    if (!hasClothing) {
      alert('请先选择一些服装再保存造型');
      return;
    }
    
    setShowSaveModal(true);
  };

  const handleClearLook = () => {
    // 清空当前造型
    dispatch(actions.clearLook());
  };

  const getCategoryLabel = (category: ClothingCategory) => {
    const labels = {
      tops: '上装',
      bottoms: '下装',
      shoes: '鞋子',
      accessories: '配饰'
    };
    return labels[category];
  };

  const getCurrentItem = (category: ClothingCategory) => {
    if (category === 'accessories') {
      return state.currentLook.accessories[0]; // 简化处理，只显示第一个配饰
    }
    return state.currentLook[category as keyof typeof state.currentLook] as ClothingItem;
  };

  if (!isActive) return null;

  return (
    <div className="h-full bg-gray-50 flex flex-col relative">
      {/* AI功能快捷栏 */}
      <div className="absolute top-4 left-4 z-40 flex flex-col gap-2">
        <button
          onClick={() => setShowBodyScanModal(true)}
          className="group relative p-3 bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl hover:border-blue-400 transition-all duration-300 hover:scale-105 shadow-lg"
          title="AI人体扫描"
        >
          <User className="w-6 h-6 text-blue-600" />
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI人体扫描
          </div>
        </button>
        
        <button
          onClick={() => setShowClothingCaptureModal(true)}
          className="group relative p-3 bg-white/90 backdrop-blur-sm border border-purple-200 rounded-xl hover:border-purple-400 transition-all duration-300 hover:scale-105 shadow-lg"
          title="AI服装生成"
        >
          <Shirt className="w-6 h-6 text-purple-600" />
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI服装生成
          </div>
        </button>
      </div>

      {/* AI生成状态指示器 */}
      {aiGeneratedModels.length > 0 && (
        <div className="absolute top-4 right-4 z-40">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2 text-green-700">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">已生成 {aiGeneratedModels.length} 个AI模型</span>
            </div>
          </div>
        </div>
      )}

      {/* 页面标题 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI试穿工作室</h1>
            <p className="text-sm text-gray-600">AI驱动的智能试穿体验</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleClearLook}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors min-h-touch min-w-touch"
              aria-label="清空造型"
            >
              <Undo2 size={18} />
            </button>
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors min-h-touch min-w-touch"
              aria-label="分享造型"
            >
              <Share size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 3D Canvas 区域 */}
        <Canvas3D className="aspect-[3/4]" />

        {/* 当前穿着显示 */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">当前穿着</h3>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((category) => {
              const currentItem = getCurrentItem(category);
              return (
                <div key={category} className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-1 flex items-center justify-center">
                    {currentItem ? (
                      <span className="text-xs text-gray-600">已穿</span>
                    ) : (
                      <span className="text-xs text-gray-400">空</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600">{getCategoryLabel(category)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 分类选择 */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex space-x-2 mb-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-touch
                  ${selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>

          {/* 衣物轮播 */}
          <ClothingCarousel
            category={selectedCategory}
            onSelectItem={handleSelectClothing}
            selectedItem={getCurrentItem(selectedCategory)}
          />
        </div>
      </div>

      {/* 保存造型按钮 */}
      <div className="flex-shrink-0 p-4 bg-white border-t">
        <button
          onClick={handleSaveLook}
          className="w-full bg-primary-500 text-white py-4 rounded-lg font-medium text-lg hover:bg-primary-600 transition-colors min-h-touch flex items-center justify-center space-x-2"
        >
          <Save size={20} />
          <span>保存造型</span>
        </button>
      </div>

      {/* 模态框 */}
      <SaveLookModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        currentLook={state.currentLook}
      />
      
      <BodyScanModal
        isOpen={showBodyScanModal}
        onClose={() => setShowBodyScanModal(false)}
        onModelGenerated={handleBodyModelGenerated}
      />
      
      <ClothingCaptureModal
        isOpen={showClothingCaptureModal}
        onClose={() => setShowClothingCaptureModal(false)}
        onModelGenerated={handleClothingModelGenerated}
      />
    </div>
  );
};

export default TryOnStudio;