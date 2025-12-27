import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FeedPost } from '../../types';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Marquee from '../UI/Marquee';
import AvatarScene from '../3D/AvatarScene';
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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero Section with Kinetic Typography */}
      <section className="relative py-20 px-4">
        {/* Digital Decorations */}
        <div className="decoration-absolute decoration-top-left decoration-number animate-glitch text-accent">
          01
        </div>
        <div className="decoration-absolute decoration-top-right decoration-number animate-color-shift text-accent-alt">
          3D
        </div>
        <div className="decoration-absolute decoration-bottom-left decoration-number text-accent-blue">
          AI
        </div>
        <div className="decoration-absolute decoration-bottom-right decoration-number animate-glitch text-accent-yellow">
          24
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Marquee Label */}
          <div className="mb-8">
            <Marquee speed={30} className="font-mono text-vw-sm text-accent">
              <span className="mx-8">AI数字衣柜</span>
              <span className="mx-8">3D试穿体验</span>
              <span className="mx-8">智能穿搭推荐</span>
              <span className="mx-8">虚拟时尚</span>
            </Marquee>
          </div>
          
          <h1 className="font-display text-vw-4xl mb-8 text-foreground leading-none">
            发现你的
            <br />
            <span className="text-accent animate-color-shift">专属风格</span>
          </h1>
          
          <p className="font-mono text-vw-base text-foreground mb-12 max-w-2xl mx-auto uppercase tracking-wider">
            通过AI技术打造个性化3D试穿体验
            <br />
            探索无限穿搭可能性
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button variant="primary" size="lg">
              开始试穿
            </Button>
            <Button variant="secondary" size="lg">
              浏览作品
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section - Color Inverted */}
      <section className="invert-colors py-16 px-4 relative">
        {/* Background Marquees */}
        <div className="absolute inset-0 opacity-10">
          <Marquee direction="left" speed={20} className="font-display text-vw-6xl">
            <span className="mx-16">DIGITAL</span>
            <span className="mx-16">WARDROBE</span>
            <span className="mx-16">3D</span>
            <span className="mx-16">AI</span>
          </Marquee>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-display text-vw-3xl mb-2 text-accent">10K+</div>
              <div className="font-mono text-vw-sm uppercase tracking-wider">活跃用户</div>
            </div>
            <div>
              <div className="font-display text-vw-3xl mb-2 text-accent-alt">50K+</div>
              <div className="font-mono text-vw-sm uppercase tracking-wider">穿搭作品</div>
            </div>
            <div>
              <div className="font-display text-vw-3xl mb-2 text-accent-blue">100K+</div>
              <div className="font-mono text-vw-sm uppercase tracking-wider">服装单品</div>
            </div>
            <div>
              <div className="font-display text-vw-3xl mb-2 text-accent-yellow">1M+</div>
              <div className="font-mono text-vw-sm uppercase tracking-wider">试穿次数</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-20 px-4 relative">
        {/* Section Header with Marquee */}
        <div className="text-center mb-16">
          <Marquee direction="right" speed={25} className="font-mono text-vw-sm text-accent mb-8">
            <span className="mx-8">精选作品</span>
            <span className="mx-8">今日热门</span>
            <span className="mx-8">社区推荐</span>
            <span className="mx-8">3D穿搭</span>
          </Marquee>
          
          <h2 className="font-display text-vw-3xl mb-8 text-foreground leading-none">
            今日<span className="text-accent-alt">热门</span>穿搭
          </h2>
          
          <p className="font-mono text-vw-base text-foreground max-w-2xl mx-auto uppercase tracking-wide">
            发现社区中最受欢迎的3D穿搭作品
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post, index) => (
              <Card 
                key={post.id} 
                variant={index === 0 ? 'inverted' : 'default'}
                className="group relative"
              >
                {/* Digital decoration for featured post */}
                {index === 0 && (
                  <div className="absolute -top-4 -right-4 font-display text-vw-lg text-accent-alt animate-glitch">
                    HOT
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Post Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent border-2 border-background flex items-center justify-center">
                      <span className="font-display text-background text-sm">
                        {post.username.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-sm uppercase tracking-wide">
                        {post.username}
                      </div>
                      <div className="font-mono text-xs opacity-70">2小时前</div>
                    </div>
                    {index === 0 && (
                      <div className="ml-auto">
                        <div className="flex items-center gap-1 bg-accent-alt text-background px-2 py-1 font-mono text-xs font-bold uppercase">
                          <TrendingUp size={12} />
                          热门
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post Content - 3D Avatar Scene */}
                  <div className="aspect-square border-4 border-current relative overflow-hidden">
                    <AvatarScene className="w-full h-full" />
                    <div className="absolute bottom-2 left-2 bg-accent text-background px-2 py-1 font-mono text-xs font-bold uppercase">
                      3D试穿
                    </div>
                  </div>

                  {/* Post Info */}
                  <div>
                    <h3 className="font-mono font-bold text-sm uppercase tracking-wide mb-2">
                      {post.look.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.look.tags.map(tag => (
                        <span 
                          key={tag}
                          className="bg-foreground text-background px-2 py-1 font-mono text-xs font-bold uppercase border-2 border-current"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t-4 border-current">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wide hover:text-accent transition-colors"
                      >
                        <Heart 
                          size={16} 
                          className={post.isLiked ? 'fill-accent text-accent' : ''} 
                        />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wide hover:text-accent-alt transition-colors">
                        <MessageCircle size={16} />
                        <span>12</span>
                      </button>
                    </div>
                    <button className="hover:text-accent-blue transition-colors">
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
            >
              {loading ? '加载中...' : '查看更多'}
            </Button>
          </div>
        </div>
      </section>

      {/* Bottom Marquee */}
      <section className="py-8">
        <Marquee speed={40} className="font-display text-vw-2xl text-accent opacity-50">
          <span className="mx-12">AI DIGITAL WARDROBE</span>
          <span className="mx-12">3D FASHION EXPERIENCE</span>
          <span className="mx-12">VIRTUAL STYLING</span>
          <span className="mx-12">FUTURE OF FASHION</span>
        </Marquee>
      </section>
    </div>
  );
};

export default HomeFeed;