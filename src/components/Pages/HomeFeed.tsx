import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FeedPost } from '../../types';
import Card from '../UI/Card';
import Button from '../UI/Button';
import SectionLabel from '../UI/SectionLabel';
import { Heart, MessageCircle, Share2, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

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
    username: '穿搭博主ANNA',
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
  }
];

const HomeFeed: React.FC<HomePageProps> = ({ isActive }) => {
  const { state } = useAppContext();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isActive && posts.length === 0) {
      setLoading(true);
      setTimeout(() => {
        setPosts(mockPosts);
        setLoading(false);
      }, 500);
    }
  }, [isActive, posts.length]);

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <SectionLabel className="mb-8 animate-float">
            AI数字衣柜
          </SectionLabel>
          
          <h1 className="font-display text-5xl md:text-7xl mb-6 text-foreground leading-tight">
            发现你的
            <span className="gradient-text block animate-float-delayed">专属风格</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
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
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-accent rounded-full opacity-20 animate-float" />
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-accent/30 rounded-full animate-float-delayed" />
      </section>

      {/* Stats Section - Inverted */}
      <section className="bg-foreground text-background py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-float">
              <div className="font-display text-4xl mb-2 text-white">10K+</div>
              <div className="text-gray-300">活跃用户</div>
            </div>
            <div className="animate-float-delayed">
              <div className="font-display text-4xl mb-2 text-white">50K+</div>
              <div className="text-gray-300">穿搭作品</div>
            </div>
            <div className="animate-float">
              <div className="font-display text-4xl mb-2 text-white">100K+</div>
              <div className="text-gray-300">服装单品</div>
            </div>
            <div className="animate-float-delayed">
              <div className="font-display text-4xl mb-2 text-white">1M+</div>
              <div className="text-gray-300">试穿次数</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel className="mb-6">
              精选作品
            </SectionLabel>
            
            <h2 className="font-display text-4xl mb-6 text-foreground">
              今日热门穿搭
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              发现社区中最受欢迎的3D穿搭作品
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post, index) => (
              <Card 
                key={post.id} 
                variant={index === 0 ? 'gradient' : 'default'}
                className="group relative"
              >
                {/* Featured Badge */}
                {index === 0 && (
                  <div className="absolute -top-3 -right-3 bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <TrendingUp size={14} />
                    热门
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Post Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center text-white font-semibold">
                      {post.username.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {post.username}
                      </div>
                      <div className="text-xs text-muted-foreground">2小时前</div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="aspect-square bg-muted rounded-xl flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200">
                    <Sparkles size={48} className="text-accent" />
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-foreground px-2 py-1 rounded-lg text-xs font-medium">
                      3D试穿
                    </div>
                  </div>

                  {/* Post Info */}
                  <div>
                    <h3 className="font-semibold mb-2">
                      {post.look.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.look.tags.map(tag => (
                        <span 
                          key={tag}
                          className="bg-accent/10 text-accent px-2 py-1 rounded-lg text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors"
                      >
                        <Heart 
                          size={16} 
                          className={post.isLiked ? 'fill-accent text-accent' : ''} 
                        />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors">
                        <MessageCircle size={16} />
                        <span>12</span>
                      </button>
                    </div>
                    <button className="hover:text-accent transition-colors">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="secondary" 
              loading={loading}
              showArrow
            >
              {loading ? '加载中...' : '查看更多'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeFeed;