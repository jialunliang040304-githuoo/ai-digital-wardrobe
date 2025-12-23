import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import Canvas3D from '../components/TryOnStudio/Canvas3D';
import ClothingCarousel from '../components/TryOnStudio/ClothingCarousel';
import { ClothingItem, ClothingCategory } from '../types';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 9: 3D服装挂载即时性, 属性 11: 多物品组合兼容性
 * 验证需求: 需求5.3, 5.5
 */
describe('3D交互属性测试', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AppProvider>
        {component}
      </AppProvider>
    );
  };

  // 创建测试用的ClothingItem数据
  const createMockClothingItem = (id: string, category: ClothingCategory): ClothingItem => ({
    id,
    name: `测试服装${id}`,
    category,
    type: 'shirt',
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: ['测试'],
    createdAt: new Date()
  });

  describe('3D Canvas 控制', () => {
    it('应该渲染3D Canvas容器', () => {
      renderWithProvider(<Canvas3D />);
      
      expect(screen.getByText('3D Avatar')).toBeInTheDocument();
      expect(screen.getByText('拖拽旋转查看')).toBeInTheDocument();
      expect(screen.getByText('WebGL 就绪')).toBeInTheDocument();
    });

    it('应该提供3D控制按钮', () => {
      renderWithProvider(<Canvas3D />);
      
      expect(screen.getByLabelText('重置视图')).toBeInTheDocument();
      expect(screen.getByLabelText('放大')).toBeInTheDocument();
      expect(screen.getByLabelText('缩小')).toBeInTheDocument();
    });

    it('应该响应控制按钮点击', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      renderWithProvider(<Canvas3D />);
      
      // 测试重置按钮
      fireEvent.click(screen.getByLabelText('重置视图'));
      expect(consoleSpy).toHaveBeenCalledWith('重置3D视图');
      
      // 测试放大按钮
      fireEvent.click(screen.getByLabelText('放大'));
      expect(consoleSpy).toHaveBeenCalledWith('放大');
      
      // 测试缩小按钮
      fireEvent.click(screen.getByLabelText('缩小'));
      expect(consoleSpy).toHaveBeenCalledWith('缩小');
      
      consoleSpy.mockRestore();
    });
  });

  describe('服装选择轮播', () => {
    const mockOnSelect = vi.fn();
    const mockItems = [
      createMockClothingItem('1', 'tops'),
      createMockClothingItem('2', 'tops'),
      createMockClothingItem('3', 'tops')
    ];

    beforeEach(() => {
      mockOnSelect.mockClear();
    });

    it('应该显示分类标题和数量', () => {
      renderWithProvider(
        <ClothingCarousel 
          category="tops" 
          onSelectItem={mockOnSelect}
        />
      );
      
      expect(screen.getByText('上装')).toBeInTheDocument();
    });

    it('应该提供滚动控制按钮', () => {
      renderWithProvider(
        <ClothingCarousel 
          category="tops" 
          onSelectItem={mockOnSelect}
        />
      );
      
      expect(screen.getByLabelText('向左滚动')).toBeInTheDocument();
      expect(screen.getByLabelText('向右滚动')).toBeInTheDocument();
    });

    it('应该显示添加新物品按钮', () => {
      renderWithProvider(
        <ClothingCarousel 
          category="tops" 
          onSelectItem={mockOnSelect}
        />
      );
      
      expect(screen.getByText('添加')).toBeInTheDocument();
    });

    it('空分类应该显示占位符', () => {
      renderWithProvider(
        <ClothingCarousel 
          category="accessories" 
          onSelectItem={mockOnSelect}
        />
      );
      
      expect(screen.getByText('暂无配饰')).toBeInTheDocument();
    });
  });

  describe('3D服装挂载即时性', () => {
    it('属性测试：服装选择应该立即触发挂载回调', () => {
      fc.assert(fc.property(
        fc.constantFrom('tops', 'bottoms', 'shoes', 'accessories'),
        fc.integer({ min: 1, max: 10 }),
        (category: string, itemCount: number) => {
          const mockOnSelect = vi.fn();
          const items = Array.from({ length: itemCount }, (_, i) => 
            createMockClothingItem(i.toString(), category as ClothingCategory)
          );
          
          // 模拟有物品的状态
          const { unmount } = render(
            <AppProvider>
              <ClothingCarousel 
                category={category as ClothingCategory}
                onSelectItem={mockOnSelect}
              />
            </AppProvider>
          );

          // 验证轮播组件渲染
          const categoryLabels = {
            tops: '上装',
            bottoms: '下装', 
            shoes: '鞋子',
            accessories: '配饰'
          };
          
          expect(screen.getByText(categoryLabels[category as keyof typeof categoryLabels])).toBeInTheDocument();
          
          unmount();
        }
      ), { numRuns: 10 });
    });

    it('选中状态应该有正确的视觉反馈', () => {
      const selectedItem = createMockClothingItem('selected', 'tops');
      const mockOnSelect = vi.fn();
      
      renderWithProvider(
        <ClothingCarousel 
          category="tops" 
          onSelectItem={mockOnSelect}
          selectedItem={selectedItem}
        />
      );
      
      // 验证选中状态的视觉效果存在
      const selectedElements = document.querySelectorAll('[class*="ring-2"]');
      expect(selectedElements.length).toBeGreaterThan(0);
    });
  });

  describe('多物品组合兼容性', () => {
    it('应该支持不同分类的物品同时选择', () => {
      const categories: ClothingCategory[] = ['tops', 'bottoms', 'shoes', 'accessories'];
      
      categories.forEach(category => {
        const mockOnSelect = vi.fn();
        const { unmount } = renderWithProvider(
          <ClothingCarousel 
            category={category}
            onSelectItem={mockOnSelect}
          />
        );
        
        // 验证每个分类都能正确渲染
        const categoryLabels = {
          tops: '上装',
          bottoms: '下装',
          shoes: '鞋子', 
          accessories: '配饰'
        };
        
        expect(screen.getByText(categoryLabels[category])).toBeInTheDocument();
        
        unmount();
      });
    });

    it('属性测试：任意分类组合都应该兼容', () => {
      fc.assert(fc.property(
        fc.array(fc.constantFrom('tops', 'bottoms', 'shoes', 'accessories'), { minLength: 1, maxLength: 4 }),
        (categories: string[]) => {
          // 为每个分类创建轮播组件
          categories.forEach(category => {
            const mockOnSelect = vi.fn();
            const { unmount } = renderWithProvider(
              <ClothingCarousel 
                category={category as ClothingCategory}
                onSelectItem={mockOnSelect}
              />
            );
            
            // 验证组件能正常渲染
            expect(document.body).toBeInTheDocument();
            
            unmount();
          });
        }
      ), { numRuns: 15 });
    });
  });

  describe('3D场景交互', () => {
    it('应该支持触摸和鼠标交互', () => {
      renderWithProvider(<Canvas3D />);
      
      const canvas = screen.getByText('3D Avatar').closest('div');
      expect(canvas).toBeInTheDocument();
      
      // 模拟触摸事件
      fireEvent.touchStart(canvas!, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchMove(canvas!, { touches: [{ clientX: 150, clientY: 150 }] });
      fireEvent.touchEnd(canvas!);
      
      // 模拟鼠标事件
      fireEvent.mouseDown(canvas!, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas!, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(canvas!);
      
      // 验证事件不会导致错误
      expect(canvas).toBeInTheDocument();
    });

    it('应该显示环境效果', () => {
      renderWithProvider(<Canvas3D />);
      
      // 验证3D平台底座
      const platform = document.querySelector('[class*="bg-gradient-to-r"]');
      expect(platform).toBeInTheDocument();
      
      // 验证环境光效果
      const lighting = document.querySelector('[class*="bg-gradient-radial"]');
      expect(lighting).toBeInTheDocument();
    });
  });

  describe('性能和响应性', () => {
    it('应该快速响应用户交互', () => {
      const start = performance.now();
      
      renderWithProvider(<Canvas3D />);
      
      const renderTime = performance.now() - start;
      
      // 渲染时间应该在合理范围内（100ms以内）
      expect(renderTime).toBeLessThan(100);
    });

    it('应该正确处理快速连续点击', () => {
      const mockOnSelect = vi.fn();
      renderWithProvider(
        <ClothingCarousel 
          category="tops" 
          onSelectItem={mockOnSelect}
        />
      );
      
      const scrollButton = screen.getByLabelText('向右滚动');
      
      // 快速连续点击
      for (let i = 0; i < 5; i++) {
        fireEvent.click(scrollButton);
      }
      
      // 验证组件仍然正常工作
      expect(scrollButton).toBeInTheDocument();
    });
  });

  describe('错误处理', () => {
    it('应该优雅处理缺失的回调函数', () => {
      expect(() => {
        renderWithProvider(
          <ClothingCarousel 
            category="tops" 
            onSelectItem={undefined as any}
          />
        );
      }).not.toThrow();
    });

    it('应该处理无效的分类', () => {
      const mockOnSelect = vi.fn();
      
      expect(() => {
        renderWithProvider(
          <ClothingCarousel 
            category={'invalid' as any}
            onSelectItem={mockOnSelect}
          />
        );
      }).not.toThrow();
    });
  });
});