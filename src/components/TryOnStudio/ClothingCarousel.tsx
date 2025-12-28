import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ClothingItem, ClothingCategory } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface ClothingCarouselProps {
  category: ClothingCategory;
  onSelectItem: (item: ClothingItem) => void;
  selectedItem?: ClothingItem;
}

const ClothingCarousel: React.FC<ClothingCarouselProps> = ({
  category,
  onSelectItem,
  selectedItem
}) => {
  const { state } = useAppContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 根据分类筛选衣物
  const filteredItems = state.wardrobe.filter(item => item.category === category);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const getCategoryLabel = (cat: ClothingCategory) => {
    const labels = {
      tops: '上装',
      bottoms: '下装',
      shoes: '鞋子',
      accessories: '配饰'
    };
    return labels[cat];
  };

  const getCategoryColor = (cat: ClothingCategory) => {
    const colors = {
      tops: 'bg-blue-100 text-blue-800',
      bottoms: 'bg-green-100 text-green-800',
      shoes: 'bg-purple-100 text-purple-800',
      accessories: 'bg-orange-100 text-orange-800'
    };
    return colors[cat];
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      {/* 分类标题 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(category)}`}>
            {getCategoryLabel(category)}
          </span>
          <span className="text-sm text-gray-600">
            {filteredItems.length} 件
          </span>
        </div>
        
        {/* 滚动控制按钮 */}
        <div className="flex space-x-1">
          <button
            onClick={scrollLeft}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors min-h-touch min-w-touch"
            aria-label="向左滚动"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={scrollRight}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors min-h-touch min-w-touch"
            aria-label="向右滚动"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 衣物轮播 */}
      <div 
        ref={scrollRef}
        className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filteredItems.length === 0 ? (
          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-xs text-gray-500 text-center">暂无{getCategoryLabel(category)}</span>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`
                flex-shrink-0 w-20 h-20 rounded-lg cursor-pointer transition-all duration-200 touch-item
                ${selectedItem?.id === item.id 
                  ? 'ring-2 ring-primary-500 ring-offset-2 shadow-md' 
                  : 'hover:shadow-md'
                }
              `}
            >
              {/* 3D模型缩略图 */}
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                {item.texture && item.texture.startsWith('data:image') ? (
                  <img 
                    src={item.texture} 
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-xs text-gray-500">3D</span>
                )}
                
                {/* 选中指示器 */}
                {selectedItem?.id === item.id && (
                  <div className="absolute inset-0 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {/* 添加新物品按钮 */}
        <div
          className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors touch-item"
        >
          <div className="text-center">
            <div className="w-6 h-6 mx-auto mb-1 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">添加</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothingCarousel;