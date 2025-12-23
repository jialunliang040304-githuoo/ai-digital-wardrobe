import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { ClothingType } from '../../types';
import Modal from '../UI/Modal';

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  types: ClothingType[];
  tags: string[];
  sortBy: 'name' | 'date' | 'category';
  sortOrder: 'asc' | 'desc';
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  onFilterChange,
  currentFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(currentFilters);

  const clothingTypes = [
    { id: 'shirt', label: '衬衫' },
    { id: 'pants', label: '裤子' },
    { id: 'dress', label: '连衣裙' },
    { id: 'jacket', label: '外套' },
    { id: 'sneakers', label: '运动鞋' },
    { id: 'hat', label: '帽子' }
  ];

  const sortOptions = [
    { id: 'name', label: '按名称' },
    { id: 'date', label: '按时间' },
    { id: 'category', label: '按分类' }
  ];

  const handleApplyFilters = () => {
    onFilterChange(tempFilters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: FilterOptions = {
      types: [],
      tags: [],
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setTempFilters(resetFilters);
    onFilterChange(resetFilters);
    setIsOpen(false);
  };

  const toggleType = (type: ClothingType) => {
    setTempFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const hasActiveFilters = currentFilters.types.length > 0 || 
                          currentFilters.tags.length > 0 ||
                          currentFilters.sortBy !== 'date' ||
                          currentFilters.sortOrder !== 'desc';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`
          p-2 rounded-lg border transition-colors min-h-touch min-w-touch relative
          ${hasActiveFilters 
            ? 'bg-primary-50 border-primary-200 text-primary-600' 
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }
        `}
        aria-label="高级筛选"
      >
        <Filter size={18} />
        {hasActiveFilters && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"></div>
        )}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="高级筛选"
        size="md"
      >
        <div className="p-4 space-y-6">
          {/* 服装类型 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">服装类型</h3>
            <div className="grid grid-cols-2 gap-2">
              {clothingTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => toggleType(type.id as ClothingType)}
                  className={`
                    p-2 text-sm rounded-lg border transition-colors min-h-touch
                    ${tempFilters.types.includes(type.id as ClothingType)
                      ? 'bg-primary-50 border-primary-200 text-primary-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* 排序 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">排序方式</h3>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <label key={option.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sortBy"
                    value={option.id}
                    checked={tempFilters.sortBy === option.id}
                    onChange={(e) => setTempFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value as any
                    }))}
                    className="text-primary-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-3 flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sortOrder"
                  value="asc"
                  checked={tempFilters.sortOrder === 'asc'}
                  onChange={(e) => setTempFilters(prev => ({
                    ...prev,
                    sortOrder: e.target.value as any
                  }))}
                  className="text-primary-500"
                />
                <span className="text-sm">升序</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sortOrder"
                  value="desc"
                  checked={tempFilters.sortOrder === 'desc'}
                  onChange={(e) => setTempFilters(prev => ({
                    ...prev,
                    sortOrder: e.target.value as any
                  }))}
                  className="text-primary-500"
                />
                <span className="text-sm">降序</span>
              </label>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={handleResetFilters}
              className="flex-1 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              重置
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              应用筛选
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdvancedFilter;