import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Save, Share, Undo2, User, Shirt, Zap, Video, Sparkles } from 'lucide-react';
import { ClothingItem, ClothingCategory, WornClothing } from '../../types';
import { useAppContext, actions } from '../../context/AppContext';
import Canvas3D from '../TryOnStudio/Canvas3D';
import ClothingCarousel from '../TryOnStudio/ClothingCarousel';
import SaveLookModal from '../TryOnStudio/SaveLookModal';
import { BodyScanModal } from '../AI/BodyScanModal';
import { ClothingCaptureModal } from '../AI/ClothingCaptureModal';
import VideoCapture3D from '../AI/VideoCapture3D';
import { aiService, AIModelResult, GaussianSplattingTask } from '../../services/aiService';

// 懒加载高斯泼溅组件
const GaussianSplatViewer = lazy(() => import('../TryOnStudio/GaussianSplatViewer'));

interface TryOnStudioProps {
  isActive: boolean;
}

// 高斯泼溅加载占位
const GaussianLoading = () => (
  <div className="aspect-[3/4] bg-gradient-to-b from-purple-50 to-indigo-100 rounded-2xl flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">加载高斯泼溅组件...</p>
    </div>
  </div>
);

// 错误边界组件
class GaussianErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('高斯泼溅组件错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const TryOnStudio: React.FC<TryOnStudioProps> = ({ isActive }) => {
  const { state, dispatch } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory>('tops');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showBodyScanModal, setShowBodyScanModal] = useState(false);
  const [showClothingCaptureModal, setShowClothingCaptureModal] = useState(false);
  const [showVideoCapture, setShowVideoCapture] = useState(false);
  const [videoCaptureType, setVideoCaptureType] = useState<'body' | 'clothing'>('body');
  const [aiGeneratedModels, setAiGeneratedModels] = useState<AIModelResult[]>([]);
  const [currentGaussianModel, setCurrentGaussianModel] = useState<string | null>(null);
  const [processingTask, setProcessingTask] = useState<GaussianSplattingTask | null>(null);
  const [viewMode, setViewMode] = useState<'simple' | 'gaussian'>('simple');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      aiService.setToken(token);
    }
  }, []);

  useEffect(() => {
    if (!processingTask || processingTask.status === 'completed' || processingTask.status === 'failed') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const task = await aiService.getTaskStatus(processingTask.id);
        setProcessingTask(task);
        
        if (task.status === 'completed' && task.result) {
          setCurrentGaussianModel(task.result.splatUrl || task.result.downloadUrl);
          setViewMode('gaussian');
          clearInterval(pollInterval);
        } else if (task.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('轮询任务状态失败:', error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [processingTask]);

  const categories: ClothingCategory[] = ['tops', 'bottoms', 'shoes', 'accessories'];

  const handleSelectClothing = (item: ClothingItem) => {
    let slot: keyof WornClothing;
    
    if (item.category === 'tops') {
      slot = 'top';
    } else if (item.category === 'bottoms') {
      slot = 'bottom';
    } else if (item.category === 'shoes') {
      slot = 'shoes';
    } else {
      slot = 'accessories';
    }
    
    dispatch(actions.wearClothing(item, slot));
  };

  const handleBodyModelGenerated = (model: AIModelResult) => {
    console.log('生成的人体模型:', model);
    setShowBodyScanModal(false);
  };

  const handleClothingModelGenerated = (model: AIModelResult) => {
    console.log('生成的服装模型:', model);
    
    const clothingItem: ClothingItem = {
      id: model.id,
      name: `AI生成${model.category === 'tops' ? '上装' : model.category === 'bottoms' ? '下装' : model.category === 'shoes' ? '鞋子' : '配饰'}`,
      category: (model.category || 'tops') as ClothingCategory,
      type: 'ai-generated',
      texture: model.downloadUrl,
      meshData: JSON.stringify({
        vertices: model.vertexCount,
        faces: model.faceCount,
        materials: model.materials
      }),
      tags: ['AI生成', '3D模型'],
      createdAt: new Date(),
      mountPoints: []
    };
    
    dispatch(actions.addClothingItem(clothingItem));
    setAiGeneratedModels(prev => [...prev, model]);
    setShowClothingCaptureModal(false);
  };

  const handleVideoCapture = async (videoBlob: Blob) => {
    try {
      let task: GaussianSplattingTask;
      
      if (videoCaptureType === 'body') {
        task = await aiService.generateBodyFromVideo(videoBlob, { quality: 'medium' });
      } else {
        task = await aiService.generateClothingFromVideo(videoBlob, selectedCategory);
      }
      
      setProcessingTask(task);
      setShowVideoCapture(false);
    } catch (error) {
      console.error('视频处理失败:', error);
      alert('视频处理失败，请重试');
    }
  };

  const startVideoCapture = (type: 'body' | 'clothing') => {
    setVideoCaptureType(type);
    setShowVideoCapture(true);
  };

  const handleSaveLook = () => {
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

  const getCurrentItem = (category: ClothingCategory): ClothingItem | undefined => {
    if (category === 'accessories') {
      return state.currentLook.accessories[0];
    }
    
    if (category === 'tops') {
      return state.currentLook.top;
    } else if (category === 'bottoms') {
      return state.currentLook.bottom;
    } else if (category === 'shoes') {
      return state.currentLook.shoes;
    }
    
    return undefined;
  };

  // 高斯泼溅错误回退UI
  const GaussianFallback = () => (
    <div className="aspect-[3/4] bg-gradient-to-b from-red-50 to-red-100 rounded-2xl flex items-center justify-center">
      <div className="text-center p-6">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-700 mb-2">高斯泼溅组件加载失败</h3>
        <p className="text-red-600 text-sm mb-4">请切换到简易3D模式</p>
        <button
          onClick={() => setViewMode('simple')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          切换到简易3D
        </button>
      </div>
    </div>
  );

  if (!isActive) return null;

  return (
    <div className="h-full bg-gray-50 flex flex-col relative">
      {/* 处理中状态 */}
      {processingTask && processingTask.status === 'processing' && (
        <div className="absolute top-4 right-4 z-40">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">
                高斯泼溅生成中 {processingTask.progress}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AI生成状态指示器 */}
      {aiGeneratedModels.length > 0 && !processingTask && (
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
            <p className="text-sm text-gray-600">3D虚拟试穿</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => startVideoCapture('body')}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors min-h-[44px] min-w-[44px]"
              aria-label="视频扫描人体"
              title="视频扫描人体"
            >
              <Video size={18} />
            </button>
            <button
              onClick={() => setShowBodyScanModal(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors min-h-[44px] min-w-[44px]"
              aria-label="AI人体扫描"
            >
              <User size={18} />
            </button>
            <button
              onClick={() => setShowClothingCaptureModal(true)}
              className="p-2 text-pink-600 hover:bg-pink-50 rounded-full transition-colors min-h-[44px] min-w-[44px]"
              aria-label="AI服装生成"
            >
              <Shirt size={18} />
            </button>
            <button
              onClick={handleClearLook}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px]"
              aria-label="清空造型"
            >
              <Undo2 size={18} />
            </button>
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px]"
              aria-label="分享造型"
            >
              <Share size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 视图模式切换 */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setViewMode('simple')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'simple' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            简易3D
          </button>
          <button
            onClick={() => setViewMode('gaussian')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'gaussian' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            高斯泼溅
          </button>
        </div>

        {/* 3D Canvas 区域 */}
        {viewMode === 'simple' ? (
          <Canvas3D className="aspect-[3/4]" currentClothing={state.currentLook} />
        ) : (
          <GaussianErrorBoundary fallback={<GaussianFallback />}>
            <Suspense fallback={<GaussianLoading />}>
              <GaussianSplatViewer 
                splatUrl={currentGaussianModel || undefined}
                className="aspect-[3/4]"
              />
            </Suspense>
          </GaussianErrorBoundary>
        )}

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
                  flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]
                  ${selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>

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
          className="w-full bg-blue-500 text-white py-4 rounded-lg font-medium text-lg hover:bg-blue-600 transition-colors min-h-[44px] flex items-center justify-center space-x-2"
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

      <VideoCapture3D
        isOpen={showVideoCapture}
        onClose={() => setShowVideoCapture(false)}
        onVideoCapture={handleVideoCapture}
        captureType={videoCaptureType}
      />
    </div>
  );
};

export default TryOnStudio;
