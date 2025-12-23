import React, { useState } from 'react';
import { Heart, Bookmark, MessageCircle } from 'lucide-react';
import { FeedPost } from '../../types';
import { useAppContext, actions } from '../../context/AppContext';
import PostDetailModal from './PostDetailModal';

interface FeedCardProps {
  post: FeedPost;
}

const FeedCard: React.FC<FeedCardProps> = ({ post }) => {
  const { dispatch } = useAppContext();
  const [showDetail, setShowDetail] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(actions.likePost(post.id));
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(actions.savePost(post.id));
  };

  const handleCardClick = () => {
    setShowDetail(true);
  };

  // 随机高度模拟不同的3D渲染图片比例
  const aspectRatios = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-[2/3]', 'aspect-square'];
  const randomAspect = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 touch-item"
      onClick={handleCardClick}
    >
      {/* 3D渲染图片区域 */}
      <div className={`bg-gray-200 ${randomAspect} flex items-center justify-center relative`}>
        <span className="text-gray-500 text-sm">3D穿搭渲染</span>
        
        {/* 保存按钮 */}
        <button
          onClick={handleSave}
          className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors min-h-touch min-w-touch"
          aria-label="保存穿搭"
        >
          <Bookmark size={16} className="text-gray-600" />
        </button>
      </div>

      {/* 卡片内容 */}
      <div className="p-3">
        {/* 用户信息 */}
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <span className="text-sm font-medium text-gray-900">{post.username}</span>
        </div>

        {/* 造型信息 */}
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
          {post.look.name}
        </h3>
        
        {/* 标签 */}
        {post.look.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.look.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 互动按钮 */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 p-1 rounded transition-colors min-h-touch ${
              post.isLiked 
                ? 'text-red-500' 
                : 'text-gray-500 hover:text-red-500'
            }`}
            aria-label={post.isLiked ? '取消点赞' : '点赞'}
          >
            <Heart 
              size={16} 
              className={post.isLiked ? 'fill-current' : ''} 
            />
            <span className="text-xs">{post.likes}</span>
          </button>

          <button
            className="flex items-center space-x-1 p-1 text-gray-500 hover:text-gray-700 transition-colors min-h-touch"
            aria-label="评论"
          >
            <MessageCircle size={16} />
            <span className="text-xs">评论</span>
          </button>
        </div>
      </div>

      {/* 详情模态框 */}
      <PostDetailModal 
        post={post}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </div>
  );
};

export default FeedCard;