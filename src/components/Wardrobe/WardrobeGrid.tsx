import React from 'react';
import { ClothingItem } from '../../types';
import ClothingCard from './ClothingCard';

interface WardrobeGridProps {
  items: ClothingItem[];
  onItemSelect?: (item: ClothingItem) => void;
  onItemTryOn?: (item: ClothingItem) => void;
  onItemEdit?: (item: ClothingItem) => void;
  onItemDelete?: (item: ClothingItem) => void;
  selectedItems?: string[];
  loading?: boolean;
}

const WardrobeGrid: React.FC<WardrobeGridProps> = ({
  items,
  onItemSelect,
  onItemTryOn,
  onItemEdit,
  onItemDelete,
  selectedItems = [],
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <div 
            key={index}
            className="bg-gray-200 rounded-lg aspect-square animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
          <span className="text-2xl">👗</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无服装</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          还没有添加任何服装物品，快去上传你的第一件衣服吧！
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {items.map((item) => (
        <ClothingCard
          key={item.id}
          item={item}
          onSelect={onItemSelect}
          onTryOn={onItemTryOn}
          onEdit={onItemEdit}
          onDelete={onItemDelete}
          isSelected={selectedItems.includes(item.id)}
        />
      ))}
    </div>
  );
};

export default WardrobeGrid;