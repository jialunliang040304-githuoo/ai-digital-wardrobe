import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FeedPost } from '../../types';
import SectionLabel from '../UI/SectionLabel';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { Heart, MessageCircle, Share2, Sparkles, TrendingUp } from 'lucide-react';

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

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 radial-glow opacity-30" />
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-accent rounded-full blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-accent-secondary rounded-full blur-2xl opacity-15 animate-float-delayed" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <SectionLabel animated className="mb-6">
            AI数字衣柜
          </SectionLabel>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 text-foreground">
            发现你的
            <span className="gradient-text gradient-underline"> 专属风格</span>
          </h1>
          
          <p className="font-ui text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            通过AI技术打造个性化3D试穿体验，探索无限穿搭可能性
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" showArrow>
              开始试穿
            </Button>
            <Button variant="secondary" size="lg">
              浏览作品
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section - Inverted */}
      <section className="section-inverted dot-pattern py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-display mb-2 text-white">10K+</div>
              <div className="text-sm font-ui text-white/80">活跃用户</div>
            </div>
            <div>
              <div className="text-3xl font-display mb-2 text-white">50K+</div>
              <div className="text-sm font-ui text-white/80">穿搭作品</div>
            </div>
            <div>
              <div className="text-3xl font-display mb-2 text-white">100K+</div>
              <div className="text-sm font-ui text-white/80">服装单品</div>
            </div>
            <div>
              <div className="text-3xl font-display mb-2 text-white">1M+</div>
              <div className="text-sm font-ui text-white/80">试穿次数</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel className="mb-4">
              精选作品
            </SectionLabel>
            <h2 className="font-display text-3xl lg:text-4xl mb-4 text-foreground">
              今日<span className="gradient-text">热门</span>穿搭
            </h2>
            <p className="font-ui text-muted-foreground text-lg max-w-2xl mx-auto">
              发现社区中最受欢迎的3D穿搭作品，获取灵感启发
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.slice(0, 6).map((post, index) => (
              <Card 
                key={post.id} 
                variant={index === 0 ? 'featured' : 'default'}
                className="group"
              >
                <div className="space-y-4">
                  {/* Post Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {post.username.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{post.username}</div>
                      <div className="text-xs text-muted-foreground">2小时前</div>
                    </div>
                    {index === 0 && (
                      <div className="ml-auto">
                        <div className="flex items-center gap-1 bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium">
                          <TrendingUp size={12} />
                          热门
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent-secondary/20" />
                    <Sparkles size={48} className="text-accent/60" />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      3D试穿
                    </div>
                  </div>

                  {/* Post Info */}
                  <div>
                    <h3 className="font-medium text-foreground mb-2">{post.look.name}</h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.look.tags.map(tag => (
                        <span 
                          key={tag}
                          className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors"
                      >
                        <Heart 
                          size={16} 
                          className={post.isLiked ? 'fill-accent text-accent' : ''} 
                        />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors">
                        <MessageCircle size={16} />
                        <span className="text-sm">12</span>
                      </button>
                    </div>
                    <button className="text-muted-foreground hover:text-accent transition-colors">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <Button 
                variant="secondary" 
                onClick={handleLoadMore}
                loading={loading}
              >
                {loading ? '加载中...' : '查看更多'}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomeFeed;