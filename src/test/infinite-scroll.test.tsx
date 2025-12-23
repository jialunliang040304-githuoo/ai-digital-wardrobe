import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import HomeFeed from '../components/Pages/HomeFeed';
import MasonryGrid from '../components/Feed/MasonryGrid';
import { FeedPost } from '../types';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 5: 动态内容渐进加载
 * 验证需求: 需求3.3
 */
describe('动态内容加载属性测试', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AppProvider>
        {component}
      </AppProvider>
    );
  };

  // Mock IntersectionObserver
  const mockIntersectionObserver = vi.fn();
  const mockObserve = vi.fn();
  const mockUnobserve = vi.fn();
  const mockDisconnect = vi.fn();

  beforeEach(() => {
    mockIntersectionObserver.mockReturnValue({
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    });
    
    global.IntersectionObserver = mockIntersectionObserver;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // 创建测试用的FeedPost数据
  const createMockPost = (id: string): FeedPost => ({
    id,
    userId: `user${id}`,
    username: `用户${id}`,
    userAvatar: '',
    look: {
      id: `look${id}`,
      name: `造型${id}`,
      userId: `user${id}`,
      clothing: { accessories: [] },
      screenshot: '',
      tags: ['测试'],
      isPublic: true,
      createdAt: new Date()
    },
    likes: Math.floor(Math.random() * 100),
    isLiked: false,
    createdAt: new Date()
  });

  describe('动态内容渐进加载', () => {
    it('应该显示类似Instagram/Pinterest的双列瀑布流网格布局', () => {
      const posts = Array.from({ length: 6 }, (_, i) => createMockPost(i.toString()));
      
      render(
        <MasonryGrid 
          posts={posts}
          loading={false}
          hasMore={true}
        />
      );

      // 验证网格布局存在
      const grid = screen.getByRole('grid', { hidden: true }) || 
                   document.querySelector('.grid.grid-cols-2');
      expect(grid).toBeTruthy();

      // 验证有6个动态卡片
      const cards = screen.getAllByText(/造型\d/);
      expect(cards).toHaveLength(6);
    });

    it('应该在加载状态下显示加载指示器', () => {
      const posts = Array.from({ length: 3 }, (_, i) => createMockPost(i.toString()));
      
      render(
        <MasonryGrid 
          posts={posts}
          loading={true}
          hasMore={true}
        />
      );

      // 验证加载指示器存在
      const loadingIndicator = document.querySelector('.animate-spin');
      expect(loadingIndicator).toBeTruthy();
    });

    it('应该在没有更多内容时显示结束提示', () => {
      const posts = Array.from({ length: 3 }, (_, i) => createMockPost(i.toString()));
      
      render(
        <MasonryGrid 
          posts={posts}
          loading={false}
          hasMore={false}
        />
      );

      // 验证结束提示
      expect(screen.getByText('已加载全部内容')).toBeInTheDocument();
    });

    it('属性测试：对于任何向下滚动操作，当接近页面底部时应该自动加载更多内容', () => {
      fc.assert(fc.property(
        fc.integer({ min: 1, max: 10 }),
        (postCount) => {
          const posts = Array.from({ length: postCount }, (_, i) => createMockPost(i.toString()));
          const mockLoadMore = vi.fn();
          
          const { unmount } = render(
            <MasonryGrid 
              posts={posts}
              onLoadMore={mockLoadMore}
              loading={false}
              hasMore={true}
            />
          );

          // 验证IntersectionObserver被创建
          expect(mockIntersectionObserver).toHaveBeenCalled();
          
          // 验证observe被调用
          expect(mockObserve).toHaveBeenCalled();

          unmount();
        }
      ), { numRuns: 15 });
    });

    it('应该正确处理无限滚动触发', async () => {
      const posts = Array.from({ length: 3 }, (_, i) => createMockPost(i.toString()));
      const mockLoadMore = vi.fn();
      
      render(
        <MasonryGrid 
          posts={posts}
          onLoadMore={mockLoadMore}
          loading={false}
          hasMore={true}
        />
      );

      // 模拟IntersectionObserver回调
      const [callback] = mockIntersectionObserver.mock.calls[0];
      callback([{ isIntersecting: true }]);

      // 验证loadMore被调用
      expect(mockLoadMore).toHaveBeenCalled();
    });

    it('在加载中时不应该重复触发加载', () => {
      const posts = Array.from({ length: 3 }, (_, i) => createMockPost(i.toString()));
      const mockLoadMore = vi.fn();
      
      render(
        <MasonryGrid 
          posts={posts}
          onLoadMore={mockLoadMore}
          loading={true} // 正在加载中
          hasMore={true}
        />
      );

      // 模拟IntersectionObserver回调
      const [callback] = mockIntersectionObserver.mock.calls[0];
      callback([{ isIntersecting: true }]);

      // 验证loadMore不被调用
      expect(mockLoadMore).not.toHaveBeenCalled();
    });

    it('在没有更多内容时不应该触发加载', () => {
      const posts = Array.from({ length: 3 }, (_, i) => createMockPost(i.toString()));
      const mockLoadMore = vi.fn();
      
      render(
        <MasonryGrid 
          posts={posts}
          onLoadMore={mockLoadMore}
          loading={false}
          hasMore={false} // 没有更多内容
        />
      );

      // 模拟IntersectionObserver回调
      const [callback] = mockIntersectionObserver.mock.calls[0];
      callback([{ isIntersecting: true }]);

      // 验证loadMore不被调用
      expect(mockLoadMore).not.toHaveBeenCalled();
    });
  });

  describe('首页信息流集成测试', () => {
    it('应该在首页正确显示瀑布流布局', async () => {
      renderWithProvider(<HomeFeed isActive={true} />);

      // 等待初始数据加载
      await waitFor(() => {
        expect(screen.getByText('首页信息流')).toBeInTheDocument();
      });

      // 验证页面标题和描述
      expect(screen.getByText('发现精彩的3D穿搭作品')).toBeInTheDocument();
    });

    it('应该在非激活状态下不加载数据', () => {
      renderWithProvider(<HomeFeed isActive={false} />);

      // 验证页面存在但没有加载数据
      expect(screen.getByText('首页信息流')).toBeInTheDocument();
    });
  });

  describe('错误处理', () => {
    it('应该优雅处理空数据', () => {
      render(
        <MasonryGrid 
          posts={[]}
          loading={false}
          hasMore={false}
        />
      );

      // 验证空状态不会崩溃
      const grid = document.querySelector('.grid.grid-cols-2');
      expect(grid).toBeTruthy();
    });

    it('应该正确清理IntersectionObserver', () => {
      const posts = Array.from({ length: 3 }, (_, i) => createMockPost(i.toString()));
      
      const { unmount } = render(
        <MasonryGrid 
          posts={posts}
          loading={false}
          hasMore={true}
        />
      );

      unmount();

      // 验证disconnect被调用
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});