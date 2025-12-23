import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import MasonryGrid from '../Feed/MasonryGrid';
import { FeedPost } from '../../types';

interface HomePageProps {
  isActive: boolean;
}

// 模拟数据
const mockPosts: FeedPost[] = [
  {
    id: '1',
    userId: 'user1',
    username: '时尚达人小李',
    userAvatar: '',
    look: {
      id: 'look1',
      name: '春日清新搭配',
      userId: 'user1',
      clothing: { accessories: [] },
      screenshot: '',
      tags: ['春装', '清新'],
      isPublic: true,
      createdAt: new Date()
    },
    likes: 128,
    isLiked: false,
    createdAt: new Date()
  },
  {
    id: '2',
    userId: 'user2',
    username: '穿搭博主Anna',
    userAvatar: '',
    look: {
      id: 'look2',
      name: '职场优雅风',
      userId: 'user2',
      clothing: { accessories: [] },
      screenshot: '',
      tags: ['职场', '优雅'],
      isPublic: true,
      createdAt: new Date()
    },
    likes: 89,
    isLiked: true,
    createdAt: new Date()
  },
  {
    id: '3',
    userId: 'user3',
    username: '街头风格师',
    userAvatar: '',
    look: {
      id: 'look3',
      name: '街头潮流混搭',
      userId: 'user3',
      clothing: { accessories: [] },
      screenshot: '',
      tags: ['街头', '潮流'],
      isPublic: true,
      createdAt: new Date()
    },
    likes: 256,
    isLiked: false,
    createdAt: new Date()
  },
  {
    id: '4',
    userId: 'user4',
    username: '复古爱好者',
    userAvatar: '',
    look: {
      id: 'look4',
      name: '复古文艺范',
      userId: 'user4',
      clothing: { accessories: [] },
      screenshot: '',
      tags: ['复古', '文艺'],
      isPublic: true,
      createdAt: new Date()
    },
    likes: 67,
    isLiked: false,
    createdAt: new Date()
  },
  {
    id: '5',
    userId: 'user5',
    username: '极简主义者',
    userAvatar: '',
    look: {
      id: 'look5',
      name: '极简黑白配',
      userId: 'user5',
      clothing: { accessories: [] },
      screenshot: '',
      tags: ['极简', '黑白'],
      isPublic: true,
      createdAt: new Date()
    },
    likes: 145,
    isLiked: true,
    createdAt: new Date()
  },
  {
    id: '6',
    userId: 'user6',
    username: '甜美女孩',
    userAvatar: '',
    look: {
      id: 'look6',
      name: '甜美可爱风',
      userId: 'user6',
      clothing: { accessories: [] },
      screenshot: '',
      tags: ['甜美', '可爱'],
      isPublic: true,
      createdAt: new Date()
    },
    likes: 203,
    isLiked: false,
    createdAt: new Date()
  }
];

const HomeFeed: React.FC<HomePageProps> = ({ isActive }) => {
  const { state } = useAppContext();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // 初始加载数据
    if (isActive && posts.length === 0) {
      setLoading(true);
      setTimeout(() => {
        setPosts(mockPosts);
        setLoading(false);
        setPage(1);
      }, 500);
    }
  }, [isActive, posts.length]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    // 模拟加载更多数据
    setTimeout(() => {
      const morePosts = mockPosts.map((post, index) => ({
        ...post,
        id: `${post.id}_page${page}_${index}`,
        likes: Math.floor(Math.random() * 300),
        username: `${post.username}_${page}`
      }));
      
      setPosts(prev => [...prev, ...morePosts]);
      setPage(prev => prev + 1);
      setLoading(false);
      
      // 模拟最多加载3页
      if (page >= 3) {
        setHasMore(false);
      }
    }, 1000);
  };

  return (
    <div className="h-full overflow-y-auto scroll-smooth">
      <div className="p-4 xs:p-3 sm:p-6">
        <header className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">首页信息流</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">发现精彩的3D穿搭作品</p>
        </header>
        
        <MasonryGrid 
          posts={posts} 
          onLoadMore={handleLoadMore}
          loading={loading}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
};

export default HomeFeed;