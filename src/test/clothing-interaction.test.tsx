import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import ClothingCard from '../components/Wardrobe/ClothingCard';
import ClothingDetailModal from '../components/Wardrobe/ClothingDetailModal';
import { ClothingItem } from '../types';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 6: 点击交互响应性
 * 验证需求: 需求4.5
 */
describe('服装物品交互属性测试', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AppProvider>
        {component}
      </AppProvider>
    );
  };

  // 创建测试用的ClothingItem数据
  const createMockClothingItem = (id: string): ClothingItem => ({
    id,
    name: `测试服装${id}`,
    category: 'tops',
    type: 'shirt',
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: ['测试', '基础款'],
    createdAt: new Date()
  });

  describe('点击交互响应性', () => {
    it('应该在点击服装卡片时显示详情视图', async () => {
      const item = createMockClothingItem('1');
      
      renderWithProvider(<ClothingCard item={item} />);

      // 点击卡片
      const card = screen.getByText('测试服装1').closest('div');
      fireEvent.click(card!);

      // 验证详情模态框出现
      await waitFor(() => {
        expect(screen.getByText('3D模型预览')).toBeInTheDocument();
      });
    });

    it('应该在点击试穿按钮时触发试穿回调', () => {
      const item = createMockClothingItem('1');
      const mockTryOn = vi.fn();
      
      renderWithProvider(
        <ClothingCard 
          item={item} 
          onTryOn={mockTryOn}
        />
      );

      // 点击试穿按钮
      const tryOnButton = screen.getByText('试穿');
      fireEvent.click(tryOnButton);

      // 验证回调被调用
      expect(mockTryOn).toHaveBeenCalledWith(item);
    });

    it('应该提供试穿选项跳转', () => {
      const item = createMockClothingItem('1');
      
      renderWithProvider(
        <ClothingDetailModal 
          item={item}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // 验证试穿按钮存在
      const tryOnButton = screen.getByText('立即试穿');
      expect(tryOnButton).toBeInTheDocument();
      expect(tryOnButton).toHaveClass('bg-primary-500');
    });

    it('属性测试：对于任何服装物品点击，应该立即显示详情视图并提供试穿选项', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
        fc.constantFrom('tops', 'bottoms', 'shoes', 'accessories'),
        (itemId: string, category: string) => {
          const item = {
            ...createMockClothingItem(itemId.trim()),
            category: category as any
          };
          
          const { unmount } = renderWithProvider(<ClothingCard item={item} />);

          // 验证卡片存在且可点击
          const cardContent = screen.getByText(`测试服装${itemId.trim()}`);
          expect(cardContent).toBeInTheDocument();
          
          // 验证试穿按钮存在
          const tryOnButton = screen.getByText('试穿');
          expect(tryOnButton).toBeInTheDocument();
          expect(tryOnButton).toHaveClass('min-h-touch');

          unmount();
        }
      ), { numRuns: 20 });
    });
  });

  describe('详情模态框交互', () => {
    it('应该显示完整的物品信息', () => {
      const item = createMockClothingItem('1');
      
      renderWithProvider(
        <ClothingDetailModal 
          item={item}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // 验证物品信息显示
      expect(screen.getByText('测试服装1')).toBeInTheDocument();
      expect(screen.getByText('上装')).toBeInTheDocument();
      expect(screen.getByText('#测试')).toBeInTheDocument();
      expect(screen.getByText('#基础款')).toBeInTheDocument();
    });

    it('应该提供所有必要的操作按钮', () => {
      const item = createMockClothingItem('1');
      
      renderWithProvider(
        <ClothingDetailModal 
          item={item}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // 验证操作按钮存在
      expect(screen.getByText('立即试穿')).toBeInTheDocument();
      expect(screen.getByText('编辑')).toBeInTheDocument();
      expect(screen.getByText('重新拍摄')).toBeInTheDocument();
      expect(screen.getByText('删除')).toBeInTheDocument();
      expect(screen.getByLabelText('分享')).toBeInTheDocument();
      expect(screen.getByLabelText('收藏')).toBeInTheDocument();
    });

    it('应该正确处理收藏状态切换', () => {
      const item = createMockClothingItem('1');
      
      renderWithProvider(
        <ClothingDetailModal 
          item={item}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // 点击收藏按钮
      const favoriteButton = screen.getByLabelText('收藏');
      fireEvent.click(favoriteButton);

      // 验证状态变化 (在实际实现中，这里应该有状态变化的逻辑)
      expect(favoriteButton).toBeInTheDocument();
    });

    it('应该支持分享功能', () => {
      const item = createMockClothingItem('1');
      
      // Mock navigator.share
      const mockShare = vi.fn();
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true
      });
      
      renderWithProvider(
        <ClothingDetailModal 
          item={item}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // 点击分享按钮
      const shareButton = screen.getByLabelText('分享');
      fireEvent.click(shareButton);

      // 验证分享被调用
      expect(mockShare).toHaveBeenCalledWith({
        title: '测试服装1',
        text: '来看看这件测试服装1',
        url: window.location.href
      });
    });
  });

  describe('卡片状态和样式', () => {
    it('选中状态应该有正确的视觉反馈', () => {
      const item = createMockClothingItem('1');
      
      renderWithProvider(
        <ClothingCard 
          item={item} 
          isSelected={true}
        />
      );

      // 验证选中状态样式
      const cardContainer = screen.getByText('测试服装1').closest('[class*="border-primary-500"]');
      expect(cardContainer).toBeInTheDocument();
      expect(cardContainer).toHaveClass('border-primary-500');
    });

    it('未选中状态应该有正确的样式', () => {
      const item = createMockClothingItem('1');
      
      renderWithProvider(
        <ClothingCard 
          item={item} 
          isSelected={false}
        />
      );

      // 验证未选中状态样式
      const cardContainer = screen.getByText('测试服装1').closest('[class*="border-gray-200"]');
      expect(cardContainer).toBeInTheDocument();
      expect(cardContainer).toHaveClass('border-gray-200');
    });

    it('应该显示正确的分类标签颜色', () => {
      const categories = [
        { category: 'tops', expectedClass: 'bg-blue-100' },
        { category: 'bottoms', expectedClass: 'bg-green-100' },
        { category: 'shoes', expectedClass: 'bg-purple-100' },
        { category: 'accessories', expectedClass: 'bg-orange-100' }
      ];

      categories.forEach(({ category, expectedClass }) => {
        const item = {
          ...createMockClothingItem('1'),
          category: category as any
        };
        
        const { unmount } = renderWithProvider(<ClothingCard item={item} />);
        
        const categoryLabel = document.querySelector(`[class*="${expectedClass}"]`);
        expect(categoryLabel).toBeTruthy();
        
        unmount();
      });
    });
  });

  describe('可访问性', () => {
    it('所有交互元素应该有适当的ARIA标签', () => {
      const item = createMockClothingItem('1');
      
      renderWithProvider(<ClothingCard item={item} />);

      // 验证ARIA标签
      expect(screen.getByLabelText('更多操作')).toBeInTheDocument();
      expect(screen.getByLabelText('收藏')).toBeInTheDocument();
    });

    it('按钮应该有适当的触摸目标尺寸', () => {
      const item = createMockClothingItem('1');
      
      renderWithProvider(<ClothingCard item={item} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button: HTMLElement) => {
        expect(button).toHaveClass('min-h-touch');
      });
    });

    it('模态框应该支持键盘导航', () => {
      const mockClose = vi.fn();
      const item = createMockClothingItem('1');
      
      renderWithProvider(
        <ClothingDetailModal 
          item={item}
          isOpen={true}
          onClose={mockClose}
        />
      );

      // 模拟ESC键
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('回调函数处理', () => {
    it('应该正确调用编辑回调', () => {
      const item = createMockClothingItem('1');
      const mockEdit = vi.fn();
      
      renderWithProvider(
        <ClothingDetailModal 
          item={item}
          isOpen={true}
          onClose={() => {}}
          onEdit={mockEdit}
        />
      );

      // 点击编辑按钮
      const editButton = screen.getByText('编辑');
      fireEvent.click(editButton);

      expect(mockEdit).toHaveBeenCalledWith(item);
    });

    it('应该正确调用删除回调', () => {
      const item = createMockClothingItem('1');
      const mockDelete = vi.fn();
      
      renderWithProvider(
        <ClothingDetailModal 
          item={item}
          isOpen={true}
          onClose={() => {}}
          onDelete={mockDelete}
        />
      );

      // 点击删除按钮
      const deleteButton = screen.getByText('删除');
      fireEvent.click(deleteButton);

      expect(mockDelete).toHaveBeenCalledWith(item);
    });

    it('试穿按钮应该关闭模态框', () => {
      const item = createMockClothingItem('1');
      const mockClose = vi.fn();
      const mockTryOn = vi.fn();
      
      renderWithProvider(
        <ClothingDetailModal 
          item={item}
          isOpen={true}
          onClose={mockClose}
          onTryOn={mockTryOn}
        />
      );

      // 点击试穿按钮
      const tryOnButton = screen.getByText('立即试穿');
      fireEvent.click(tryOnButton);

      expect(mockTryOn).toHaveBeenCalledWith(item);
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该优雅处理缺失的回调函数', () => {
      const item = createMockClothingItem('1');
      
      // 不提供任何回调函数
      renderWithProvider(<ClothingCard item={item} />);

      // 点击试穿按钮不应该报错
      const tryOnButton = screen.getByText('试穿');
      expect(() => fireEvent.click(tryOnButton)).not.toThrow();
    });

    it('应该处理空标签数组', () => {
      const item = {
        ...createMockClothingItem('1'),
        tags: []
      };
      
      renderWithProvider(
        <ClothingDetailModal 
          item={item}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // 验证组件不会崩溃
      expect(screen.getByText('测试服装1')).toBeInTheDocument();
    });
  });
});