import React, { useState } from 'react';
import { Heart, MoreVertical } from 'lucide-react';
import { ClothingItem } from '../../types';
import ClothingDetailModal from './ClothingDetailModal';

interface ClothingCardProps {
  item: ClothingItem;
  onSelect?: (item: ClothingItem) => void;
  onTryOn?: (item: ClothingItem) => void;
  onEdit?: (item: ClothingItem) => void;
  onDelete?: (item: ClothingItem) => void;
  isSelected?: boolean;
}

const ClothingCard: React.FC<ClothingCardProps> = ({ 
  item, 
  onSelect, 
  onTryOn, 
  onEdit,
  onDelete,
  isSelected = false 
}) => {
  const [showDetail, setShowDetail] = useState(false);

  const handleCardClick = () => {
    setShowDetail(true);
  };

  const handleTryOnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTryOn?.(item);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      tops: 'bg-blue-100 text-blue-800',
      bottoms: 'bg-green-100 text-green-800',
      shoes: 'bg-purple-100 text-purple-800',
      accessories: 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div 
      className={`
        bg-white rounded-lg shadow-sm border-2 transition-all duration-200 cursor-pointer touch-item
        ${isSelected 
          ? 'border-primary-500 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}
      onClick={handleCardClick}
    >
      {/* 3D模型预览区域 */}
      <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center relative overflow-hidden">
        <span className="text-gray-500 text-sm">3D模型</span>
        
        {/* 分类标签 */}
        <div className="absolute top-2 left-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
            {item.category === 'tops' ? '上装' : 
             item.category === 'bottoms' ? '下装' : 
             item.category === 'shoes' ? '鞋子' : '配饰'}
          </span>
        </div>

        {/* 更多操作按钮 */}
        <button
          className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors min-h-touch min-w-touch"
          onClick={(e) => e.stopPropagation()}
          aria-label="更多操作"
        >
          <MoreVertical size={14} />
        </button>
      </div>

      {/* 物品信息 */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
          {item.name}
        </h3>
        
        {/* 标签 */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleTryOnClick}
            className="text-xs bg-primary-500 text-white px-3 py-1.5 rounded-md hover:bg-primary-600 transition-colors min-h-touch"
          >
            试穿
          </button>
          
          <button
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors min-h-touch min-w-touch"
            aria-label="收藏"
          >
            <Heart size={14} />
          </button>
        </div>
      </div>

      {/* 详情模态框 */}
      <ClothingDetailModal
        item={item}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onTryOn={onTryOn}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default ClothingCard;