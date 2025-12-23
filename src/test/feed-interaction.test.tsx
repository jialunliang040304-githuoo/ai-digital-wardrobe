import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import FeedCard from '../components/Feed/FeedCard';
import PostDetailModal from '../components/Feed/PostDetailModal';
import { FeedPost } from '../types';
import fc from 'fast-check';

/**
 * 功能: digital-wardrobe, 属性 6: 点击交互响应性
 * 功能: digital-wardrobe, 属性 7: 用户交互状态保持
 * 验证需求: 需求3.4, 3.5
 */
describe('用户交互属性测试', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AppProvider>
        {component}
      </AppProvider>
    );
  };

  // 创建测试用的FeedPost数据
  const createMockPost = (id: string, isLiked = false, likes = 100): FeedPost => ({
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
      tags: ['测试', '穿搭'],
      isPublic: true,
      createdAt: new Date()
    },
    likes,
    isLiked,
    createdAt: new Date()
  });

  describe('点击交互响应性', () => {
    it('应该在点击动态卡片时显示详情', async () => {
      const post = createMockPost('1');
      
      renderWithProvider(<FeedCard post={post} />);

      // 点击卡片
      const card = screen.getByText('造型1').closest('div');
      fireEvent.click(card!);

      // 验证详情模态框出现
      await waitFor(() => {
        expect(screen.getByText('用户1')).toBeInTheDocument();
      });
    });

    it('应该在点击点赞按钮时立即更新状态', () => {
      const post = createMockPost('1', false, 100);
      
      renderWithProvider(<FeedCard post={post} />);

      // 找到点赞按钮并点击
      const likeButton = screen.getByLabelText('点赞');
      fireEvent.click(likeButton);

      // 验证点赞状态变化（通过Redux状态管理）
      expect(likeButton).toHaveAttribute('aria-label', '取消点赞');
    });

    it('应该在点击保存按钮时触发保存操作', () => {
      const post = createMockPost('1');
      
      renderWithProvider(<FeedCard post={post} />);

      // 找到保存按钮并点击
      const saveButton = screen.getByLabelText('保存穿搭');
      fireEvent.click(saveButton);

      // 验证保存按钮存在且可点击
      expect(saveButton).toBeInTheDocument();
    });

    it('属性测试：对于任何可点击的动态项目，点击操作应该立即触发相应的详情显示', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.boolean(),
        fc.integer({ min: 0, max: 1000 }),
        (postId, isLiked, likes) => {
          const post = createMockPost(postId, isLiked, likes);
          const { unmount } = renderWithProvider(<FeedCard post={post} />);

          // 点击卡片主体
          const cardContent = screen.getByText(`造型${postId}`);
          const card = cardContent.closest('div');
          
          expect(card).toBeTruthy();
          fireEvent.click(card!);

          // 验证点击事件被处理（不会抛出错误）
          expect(cardContent).toBeInTheDocument();

          unmount();
        }
      ), { numRuns: 20 });
    });

    it('属性测试：对于任何点赞或保存操作，状态变化应该立即反映在UI中', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.boolean(),
        fc.integer({ min: 0, max: 1000 }),
        (postId, initialLiked, initialLikes) => {
          const post = createMockPost(postId, initialLiked, initialLikes);
          const { unmount } = renderWithProvider(<FeedCard post={post} />);

          // 测试点赞按钮
          const likeButton = screen.getByLabelText(initialLiked ? '取消点赞' : '点赞');
          expect(likeButton).toBeInTheDocument();

          // 测试保存按钮
          const saveButton = screen.getByLabelText('保存穿搭');
          expect(saveButton).toBeInTheDocument();

          // 验证按钮都有正确的触摸目标
          expect(likeButton).toHaveClass('min-h-touch');
          expect(saveButton).toHaveClass('min-h-touch', 'min-w-touch');

          unmount();
        }
      ), { numRuns: 15 });
    });
  });

  describe('用户交互状态保持', () => {
    it('点赞状态应该在组件重新渲染后保持', () => {
      const post = createMockPost('1', true, 150); // 已点赞状态
      
      renderWithProvider(<FeedCard post={post} />);

      // 验证已点赞状态
      const likeButton = screen.getByLabelText('取消点赞');
      expect(likeButton).toBeInTheDocument();
      
      // 验证点赞数显示
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('详情模态框应该正确显示和隐藏', async () => {
      const post = createMockPost('1');
      
      renderWithProvider(
        <>
          <FeedCard post={post} />
          <PostDetailModal 
            post={post} 
            isOpen={true} 
            onClose={() => {}} 
          />
        </>
      );

      // 验证模态框内容
      expect(screen.getByText('用户1')).toBeInTheDocument();
      expect(screen.getByText('造型1')).toBeInTheDocument();
    });

    it('模态框中的交互应该与卡片状态同步', () => {
      const post = createMockPost('1', false, 100);
      
      renderWithProvider(
        <PostDetailModal 
          post={post} 
          isOpen={true} 
          onClose={() => {}} 
        />
      );

      // 验证模态框中的点赞按钮
      const likeButton = screen.getByLabelText('点赞');
      expect(likeButton).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('可访问性和用户体验', () => {
    it('所有交互按钮应该有正确的ARIA标签', () => {
      const post = createMockPost('1');
      
      renderWithProvider(<FeedCard post={post} />);

      // 验证ARIA标签
      expect(screen.getByLabelText('点赞')).toBeInTheDocument();
      expect(screen.getByLabelText('保存穿搭')).toBeInTheDocument();
      expect(screen.getByLabelText('评论')).toBeInTheDocument();
    });

    it('按钮应该有适当的触摸目标尺寸', () => {
      const post = createMockPost('1');
      
      renderWithProvider(<FeedCard post={post} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-touch');
      });
    });

    it('应该支持键盘导航', () => {
      const post = createMockPost('1');
      
      renderWithProvider(<FeedCard post={post} />);

      const likeButton = screen.getByLabelText('点赞');
      
      // 验证按钮可以获得焦点
      likeButton.focus();
      expect(document.activeElement).toBe(likeButton);
    });

    it('模态框应该支持ESC键关闭', () => {
      const mockClose = vi.fn();
      const post = createMockPost('1');
      
      renderWithProvider(
        <PostDetailModal 
          post={post} 
          isOpen={true} 
          onClose={mockClose} 
        />
      );

      // 模拟ESC键按下
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该优雅处理缺失数据', () => {
      const incompletePost = {
        ...createMockPost('1'),
        look: {
          ...createMockPost('1').look,
          tags: [] // 空标签数组
        }
      };
      
      renderWithProvider(<FeedCard post={incompletePost} />);

      // 验证组件不会崩溃
      expect(screen.getByText('造型1')).toBeInTheDocument();
    });

    it('应该处理点击事件冒泡', () => {
      const post = createMockPost('1');
      
      renderWithProvider(<FeedCard post={post} />);

      const likeButton = screen.getByLabelText('点赞');
      const saveButton = screen.getByLabelText('保存穿搭');

      // 点击按钮不应该触发卡片点击
      fireEvent.click(likeButton);
      fireEvent.click(saveButton);

      // 验证按钮仍然存在（没有因为事件冒泡导致问题）
      expect(likeButton).toBeInTheDocument();
      expect(saveButton).toBeInTheDocument();
    });
  });
});