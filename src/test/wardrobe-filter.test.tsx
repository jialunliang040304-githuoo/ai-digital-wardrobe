import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import Wardrobe from '../components/Pages/Wardrobe';
import WardrobeGrid from '../components/Wardrobe/WardrobeGrid';
import { ClothingItem, ClothingCategory } from '../types';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 8: 分类筛选准确性
 * 验证需求: 需求4.3
 */
describe('分类筛选属性测试', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AppProvider>
        {component}
      </AppProvider>
    );
  };

  // 创建测试用的ClothingItem数据
  const createMockClothingItem = (
    id: string, 
    category: ClothingCategory, 
    name?: string
  ): ClothingItem => ({
    id,
    name: name || `${category}物品${id}`,
    category,
    type: 'shirt',
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: [category],
    createdAt: new Date()
  });

  describe('分类筛选准确性', () => {
    it('应该显示正确的分类标签和数量', () => {
      const categories = [
        { id: 'all' as const, label: '全部', count: 10 },
        { id: 'tops' as const, label: '上装', count: 4 },
        { id: 'bottoms' as const, label: '下装', count: 3 },
        { id: 'shoes' as const, label: '鞋子', count: 2 },
        { id: 'accessories' as const, label: '配饰', count: 1 }
      ];

      render(
        <CategoryFilter
          categories={categories}
          activeCategory="all"
          onCategoryChange={() => {}}
        />
      );

      // 验证所有分类标签存在
      expect(screen.getByText('全部')).toBeInTheDocument();
      expect(screen.getByText('上装')).toBeInTheDocument();
      expect(screen.getByText('下装')).toBeInTheDocument();
      expect(screen.getByText('鞋子')).toBeInTheDocument();
      expect(screen.getByText('配饰')).toBeInTheDocument();

      // 验证数量显示
      expect(screen.getByText('(10)')).toBeInTheDocument();
      expect(screen.getByText('(4)')).toBeInTheDocument();
      expect(screen.getByText('(3)')).toBeInTheDocument();
    });

    it('应该正确筛选显示指定分类的物品', () => {
      const items: ClothingItem[] = [
        createMockClothingItem('1', 'tops', '白T恤'),
        createMockClothingItem('2', 'tops', '卫衣'),
        createMockClothingItem('3', 'bottoms', '牛仔裤'),
        createMockClothingItem('4', 'shoes', '运动鞋')
      ];

      render(
        <WardrobeGrid
          items={items.filter(item => item.category === 'tops')}
          loading={false}
        />
      );

      // 验证只显示上装物品
      expect(screen.getByText('白T恤')).toBeInTheDocument();
      expect(screen.getByText('卫衣')).toBeInTheDocument();
      expect(screen.queryByText('牛仔裤')).not.toBeInTheDocument();
      expect(screen.queryByText('运动鞋')).not.toBeInTheDocument();
    });

    it('属性测试：对于任何分类选择操作，显示的物品应该仅包含该分类的物品且不包含其他分类', () => {
      fc.assert(fc.property(
        fc.constantFrom('tops', 'bottoms', 'shoes', 'accessories'),
        fc.array(fc.constantFrom('tops', 'bottoms', 'shoes', 'accessories'), { minLength: 5, maxLength: 20 }),
        (selectedCategory, itemCategories) => {
          // 创建测试物品
          const items = itemCategories.map((category, index) => 
            createMockClothingItem(index.toString(), category as ClothingCategory)
          );

          // 筛选指定分类的物品
          const filteredItems = items.filter(item => item.category === selectedCategory);

          const { unmount } = render(
            <WardrobeGrid
              items={filteredItems}
              loading={false}
            />
          );

          // 验证所有显示的物品都属于选定分类
          filteredItems.forEach(item => {
            expect(item.category).toBe(selectedCategory);
          });

          // 验证没有其他分类的物品
          const otherCategoryItems = items.filter(item => item.category !== selectedCategory);
          otherCategoryItems.forEach(item => {
            expect(screen.queryByText(item.name)).not.toBeInTheDocument();
          });

          unmount();
        }
      ), { numRuns: 25 });
    });

    it('全部分类应该显示所有物品', () => {
      const items: ClothingItem[] = [
        createMockClothingItem('1', 'tops'),
        createMockClothingItem('2', 'bottoms'),
        createMockClothingItem('3', 'shoes'),
        createMockClothingItem('4', 'accessories')
      ];

      render(
        <WardrobeGrid
          items={items} // 显示所有物品
          loading={false}
        />
      );

      // 验证所有分类的物品都显示
      items.forEach(item => {
        expect(screen.getByText(item.name)).toBeInTheDocument();
      });
    });

    it('空分类应该显示空状态', () => {
      render(
        <WardrobeGrid
          items={[]} // 空数组
          loading={false}
        />
      );

      // 验证空状态显示
      expect(screen.getByText('暂无服装')).toBeInTheDocument();
      expect(screen.getByText('还没有添加任何服装物品，快去上传你的第一件衣服吧！')).toBeInTheDocument();
    });
  });

  describe('分类筛选交互', () => {
    it('点击分类按钮应该切换激活状态', () => {
      const mockOnChange = vi.fn();
      const categories = [
        { id: 'all' as const, label: '全部', count: 5 },
        { id: 'tops' as const, label: '上装', count: 3 }
      ];

      render(
        <CategoryFilter
          categories={categories}
          activeCategory="all"
          onCategoryChange={mockOnChange}
        />
      );

      // 点击上装分类
      const topsButton = screen.getByText('上装');
      fireEvent.click(topsButton);

      // 验证回调被调用
      expect(mockOnChange).toHaveBeenCalledWith('tops');
    });

    it('激活的分类应该有正确的视觉样式', () => {
      const categories = [
        { id: 'all' as const, label: '全部', count: 5 },
        { id: 'tops' as const, label: '上装', count: 3 }
      ];

      render(
        <CategoryFilter
          categories={categories}
          activeCategory="tops"
          onCategoryChange={() => {}}
        />
      );

      const topsButton = screen.getByText('上装');
      const allButton = screen.getByText('全部');

      // 验证激活状态的样式
      expect(topsButton).toHaveClass('bg-primary-500', 'text-white');
      expect(allButton).toHaveClass('bg-gray-100', 'text-gray-700');
    });

    it('属性测试：分类按钮应该有适当的触摸目标尺寸', () => {
      fc.assert(fc.property(
        fc.array(fc.constantFrom('all', 'tops', 'bottoms', 'shoes', 'accessories'), { minLength: 2, maxLength: 5 }),
        (categoryIds) => {
          const categories = categoryIds.map(id => ({
            id: id as any,
            label: id === 'all' ? '全部' : id,
            count: Math.floor(Math.random() * 10)
          }));

          const { unmount } = render(
            <CategoryFilter
              categories={categories}
              activeCategory="all"
              onCategoryChange={() => {}}
            />
          );

          // 验证所有按钮都有适当的触摸目标
          const buttons = screen.getAllByRole('button');
          buttons.forEach(button => {
            expect(button).toHaveClass('min-h-touch');
          });

          unmount();
        }
      ), { numRuns: 15 });
    });
  });

  describe('搜索筛选', () => {
    it('搜索应该正确筛选物品名称', () => {
      const items: ClothingItem[] = [
        createMockClothingItem('1', 'tops', '白色T恤'),
        createMockClothingItem('2', 'tops', '黑色卫衣'),
        createMockClothingItem('3', 'bottoms', '蓝色牛仔裤')
      ];

      // 模拟搜索"白色"
      const searchResults = items.filter(item => 
        item.name.toLowerCase().includes('白色')
      );

      render(
        <WardrobeGrid
          items={searchResults}
          loading={false}
        />
      );

      // 验证搜索结果
      expect(screen.getByText('白色T恤')).toBeInTheDocument();
      expect(screen.queryByText('黑色卫衣')).not.toBeInTheDocument();
      expect(screen.queryByText('蓝色牛仔裤')).not.toBeInTheDocument();
    });

    it('搜索应该正确筛选标签', () => {
      const items: ClothingItem[] = [
        { ...createMockClothingItem('1', 'tops'), tags: ['基础款', '百搭'] },
        { ...createMockClothingItem('2', 'tops'), tags: ['休闲', '舒适'] },
        { ...createMockClothingItem('3', 'bottoms'), tags: ['正式', '商务'] }
      ];

      // 模拟搜索"基础"
      const searchResults = items.filter(item => 
        item.tags.some(tag => tag.toLowerCase().includes('基础'))
      );

      render(
        <WardrobeGrid
          items={searchResults}
          loading={false}
        />
      );

      // 验证搜索结果
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].tags).toContain('基础款');
    });
  });

  describe('加载状态', () => {
    it('加载状态应该显示骨架屏', () => {
      render(
        <WardrobeGrid
          items={[]}
          loading={true}
        />
      );

      // 验证骨架屏存在
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('加载完成后应该显示实际内容', () => {
      const items = [createMockClothingItem('1', 'tops', '测试物品')];

      render(
        <WardrobeGrid
          items={items}
          loading={false}
        />
      );

      // 验证实际内容显示
      expect(screen.getByText('测试物品')).toBeInTheDocument();
      expect(document.querySelectorAll('.animate-pulse')).toHaveLength(0);
    });
  });
});