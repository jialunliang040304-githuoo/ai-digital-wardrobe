import React, { useState } from 'react';
import { X, Heart, Share, Trash2, Edit, Camera } from 'lucide-react';
import { ClothingItem } from '../../types';
import { useAppContext, actions } from '../../context/AppContext';
import Modal from '../UI/Modal';

interface ClothingDetailModalProps {
  item: ClothingItem;
  isOpen: boolean;
  onClose: () => void;
  onTryOn?: (item: ClothingItem) => void;
  onEdit?: (item: ClothingItem) => void;
  onDelete?: (item: ClothingItem) => void;
}

const ClothingDetailModal: React.FC<ClothingDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onTryOn,
  onEdit,
  onDelete
}) => {
  const { dispatch } = useAppContext();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleTryOn = () => {
    onTryOn?.(item);
    onClose();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `来看看这件${item.name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${item.name} - ${window.location.href}`);
      alert('链接已复制到剪贴板');
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      tops: '上装',
      bottoms: '下装', 
      shoes: '鞋子',
      accessories: '配饰'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      shirt: '衬衫',
      pants: '裤子',
      dress: '连衣裙',
      jacket: '外套',
      sneakers: '运动鞋',
      hat: '帽子'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="relative">
        {/* 3D模型展示区域 */}
        <div className="aspect-[4/5] bg-gray-100 flex items-center justify-center relative">
          <span className="text-gray-500 text-lg">3D模型预览</span>
          
          {/* 360度查看提示 */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
            拖拽旋转查看
          </div>
        </div>

        {/* 物品信息 */}
        <div className="p-6">
          {/* 基本信息 */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{getCategoryLabel(item.category)}</span>
                  <span>•</span>
                  <span>{getTypeLabel(item.type)}</span>
                </div>
              </div>
              
              <button
                onClick={handleFavorite}
                className={`p-2 rounded-full transition-colors min-h-touch min-w-touch ${
                  isFavorite 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
                aria-label={isFavorite ? '取消收藏' : '收藏'}
              >
                <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
              </button>
            </div>

            {/* 标签 */}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {item.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 创建时间 */}
            <p className="text-sm text-gray-500">
              添加于 {item.createdAt.toLocaleDateString()}
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            {/* 主要操作 */}
            <div className="flex space-x-3">
              <button
                onClick={handleTryOn}
                className="flex-1 bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors min-h-touch"
              >
                立即试穿
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-touch min-w-touch"
                aria-label="分享"
              >
                <Share size={18} />
              </button>
            </div>

            {/* 次要操作 */}
            <div className="flex space-x-3">
              <button
                onClick={() => onEdit?.(item)}
                className="flex-1 flex items-center justify-center space-x-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-touch"
              >
                <Edit size={16} />
                <span>编辑</span>
              </button>
              <button
                className="flex-1 flex items-center justify-center space-x-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-touch"
              >
                <Camera size={16} />
                <span>重新拍摄</span>
              </button>
              <button
                onClick={() => onDelete?.(item)}
                className="flex-1 flex items-center justify-center space-x-2 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors min-h-touch"
              >
                <Trash2 size={16} />
                <span>删除</span>
              </button>
            </div>
          </div>

          {/* 技术信息 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">技术信息</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>模型质量:</span>
                <span>高清</span>
              </div>
              <div className="flex justify-between">
                <span>文件大小:</span>
                <span>2.3 MB</span>
              </div>
              <div className="flex justify-between">
                <span>挂载点:</span>
                <span>{item.mountPoints.length} 个</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ClothingDetailModal;