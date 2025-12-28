import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Camera, Calendar, Palette } from 'lucide-react';
import { useAppContext, actions } from '../../context/AppContext';
import { ClothingItem, ClothingCategory } from '../../types';
import CategoryFilter from '../Wardrobe/CategoryFilter';
import WardrobeGrid from '../Wardrobe/WardrobeGrid';
import ClothingUploader from '../AI/ClothingUploader';
import ColorMatcher from '../Wardrobe/ColorMatcher';
import OutfitCalendar from '../Social/OutfitCalendar';

interface WardrobeProps {
  isActive: boolean;
}

// 模拟数据
const mockClothingItems: ClothingItem[] = [
  {
    id: '1',
    name: '白色基础T恤',
    category: 'tops',
    type: 'shirt',
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: ['基础款', '百搭'],
    createdAt: new Date()
  },
  {
    id: '2',
    name: '牛仔裤',
    category: 'bottoms',
    type: 'pants',
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: ['牛仔', '休闲'],
    createdAt: new Date()
  },
  {
    id: '3',
    name: '运动鞋',
    category: 'shoes',
    type: 'sneakers',
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: ['运动', '舒适'],
    createdAt: new Date()
  },
  {
    id: '4',
    name: '连帽卫衣',
    category: 'tops',
    type: 'jacket',
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: ['休闲', '保暖'],
    createdAt: new Date()
  },
  {
    id: '5',
    name: '短裙',
    category: 'bottoms',
    type: 'dress',
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: ['甜美', '夏季'],
    createdAt: new Date()
  },
  {
    id: '6',
    name: '棒球帽',
    category: 'accessories',
    type: 'hat',
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: ['街头', '防晒'],
    createdAt: new Date()
  }
];

const Wardrobe: React.FC<WardrobeProps> = ({ isActive }) => {
  const { state, dispatch } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [showColorMatcher, setShowColorMatcher] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // 初始化衣柜数据
  useEffect(() => {
    if (isActive && state.wardrobe.length === 0) {
      setLoading(true);
      setTimeout(() => {
        mockClothingItems.forEach(item => {
          dispatch(actions.addClothingItem(item));
        });
        setLoading(false);
      }, 500);
    }
  }, [isActive, state.wardrobe.length, dispatch]);

  // 计算分类统计
  const categoryStats = useMemo(() => {
    const stats = state.wardrobe.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<ClothingCategory, number>);

    return [
      { id: 'all' as const, label: '全部', count: state.wardrobe.length },
      { id: 'tops' as const, label: '上装', count: stats.tops || 0 },
      { id: 'bottoms' as const, label: '下装', count: stats.bottoms || 0 },
      { id: 'shoes' as const, label: '鞋子', count: stats.shoes || 0 },
      { id: 'accessories' as const, label: '配饰', count: stats.accessories || 0 }
    ];
  }, [state.wardrobe]);

  // 筛选后的物品
  const filteredItems = useMemo(() => {
    let items = state.wardrobe;

    // 分类筛选
    if (state.ui.selectedCategory !== 'all') {
      items = items.filter(item => item.category === state.ui.selectedCategory);
    }

    // 搜索筛选
    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return items;
  }, [state.wardrobe, state.ui.selectedCategory, searchQuery]);

  const handleCategoryChange = (category: ClothingCategory | 'all') => {
    dispatch(actions.setCategory(category));
  };

  const handleItemSelect = (item: ClothingItem) => {
    setSelectedItems(prev => 
      prev.includes(item.id) 
        ? prev.filter(id => id !== item.id)
        : [...prev, item.id]
    );
  };

  const handleItemTryOn = (item: ClothingItem) => {
    // 切换到试穿工作室并穿上该物品
    dispatch(actions.setActiveTab('studio'));
    
    // 根据物品类型决定穿在哪个部位
    const slot = item.category === 'accessories' ? 'accessories' : 
                 item.category === 'tops' ? 'top' :
                 item.category === 'bottoms' ? 'bottom' :
                 item.category === 'shoes' ? 'shoes' : 'top';
    
    dispatch(actions.wearClothing(item, slot));
  };

  const handleItemEdit = (item: ClothingItem) => {
    // 这里可以打开编辑模态框或导航到编辑页面
    console.log('编辑物品:', item.name);
  };

  const handleItemDelete = (item: ClothingItem) => {
    // 这里可以显示确认删除对话框
    if (confirm(`确定要删除 "${item.name}" 吗？`)) {
      // 从衣柜中移除物品的逻辑
      console.log('删除物品:', item.name);
    }
  };

  // 处理服装上传
  const handleClothingUpload = (imageData: string, category: ClothingCategory, name: string) => {
    const newItem: ClothingItem = {
      id: `uploaded-${Date.now()}`,
      name,
      category,
      type: 'custom',
      meshData: '',
      texture: imageData,
      mountPoints: [],
      tags: ['自定义', '上传'],
      createdAt: new Date()
    };
    dispatch(actions.addClothingItem(newItem));
  };

  // 处理颜色匹配
  const handleColorMatch = (items: ClothingItem[]) => {
    // 切换到试穿工作室并应用搭配
    dispatch(actions.setActiveTab('studio'));
    items.forEach(item => {
      const slot = item.category === 'accessories' ? 'accessories' : 
                   item.category === 'tops' ? 'top' :
                   item.category === 'bottoms' ? 'bottom' :
                   item.category === 'shoes' ? 'shoes' : 'top';
      dispatch(actions.wearClothing(item, slot));
    });
    setShowColorMatcher(false);
  };

  // 处理创建穿搭记录
  const handleCreateOutfit = (date: Date) => {
    // 切换到试穿工作室
    dispatch(actions.setActiveTab('studio'));
    setShowCalendar(false);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 xs:p-3 sm:p-6">
        {/* 头部 */}
        <header className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">我的数字衣柜</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">管理你的3D服装收藏</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowUploader(true)}
                className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors min-h-touch min-w-touch flex items-center gap-1"
              >
                <Camera size={18} />
                <Plus size={16} />
              </button>
              <button 
                onClick={() => setShowColorMatcher(true)}
                className="p-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors min-h-touch min-w-touch"
                title="颜色搭配助手"
              >
                <Palette size={18} />
              </button>
              <button 
                onClick={() => setShowCalendar(true)}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors min-h-touch min-w-touch"
                title="穿搭日历"
              >
                <Calendar size={18} />
              </button>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索服装..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </header>
        
        {/* 分类筛选 */}
        <div className="mb-4 sm:mb-6">
          <CategoryFilter
            categories={categoryStats}
            activeCategory={state.ui.selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
        
        {/* 衣柜网格 */}
        <WardrobeGrid
          items={filteredItems}
          onItemSelect={handleItemSelect}
          onItemTryOn={handleItemTryOn}
          onItemEdit={handleItemEdit}
          onItemDelete={handleItemDelete}
          selectedItems={selectedItems}
          loading={loading}
        />

        {/* 选中项操作栏 */}
        {selectedItems.length > 0 && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg border px-4 py-2 flex items-center space-x-3">
            <span className="text-sm text-gray-600">已选择 {selectedItems.length} 件</span>
            <button className="text-sm bg-primary-500 text-white px-3 py-1 rounded-full">
              批量试穿
            </button>
            <button 
              className="text-sm text-gray-500"
              onClick={() => setSelectedItems([])}
            >
              取消
            </button>
          </div>
        )}

        {/* 服装上传组件 */}
        <ClothingUploader
          isOpen={showUploader}
          onClose={() => setShowUploader(false)}
          onUpload={handleClothingUpload}
        />

        <ColorMatcher
          isOpen={showColorMatcher}
          onClose={() => setShowColorMatcher(false)}
          availableItems={state.wardrobe}
          onSelectMatch={handleColorMatch}
        />

        <OutfitCalendar
          isOpen={showCalendar}
          onClose={() => setShowCalendar(false)}
          onCreateOutfit={handleCreateOutfit}
        />
      </div>
    </div>
  );
};

export default Wardrobe;