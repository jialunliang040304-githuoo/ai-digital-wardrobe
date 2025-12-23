import React from 'react';
import { ClothingCategory } from '../../types';

interface CategoryFilterProps {
  categories: { id: ClothingCategory | 'all'; label: string; count?: number }[];
  activeCategory: ClothingCategory | 'all';
  onCategoryChange: (category: ClothingCategory | 'all') => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-touch
            ${activeCategory === category.id
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <span>{category.label}</span>
          {category.count !== undefined && (
            <span className={`ml-1 text-xs ${
              activeCategory === category.id ? 'text-primary-100' : 'text-gray-500'
            }`}>
              ({category.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;