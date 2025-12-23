import React from 'react';
import { X, Heart, Bookmark, MessageCircle, Share } from 'lucide-react';
import { FeedPost } from '../../types';
import { useAppContext, actions } from '../../context/AppContext';

interface PostDetailModalProps {
  post: FeedPost;
  isOpen: boolean;
  onClose: () => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, isOpen, onClose }) => {
  const { dispatch } = useAppContext();

  if (!isOpen) return null;

  const handleLike = () => {
    dispatch(actions.likePost(post.id));
  };

  const handleSave = () => {
    dispatch(actions.savePost(post.id));
  };

  const handleShare = () => {
    // 模拟分享功能
    if (navigator.share) {
      navigator.share({
        title: post.look.name,
        text: `来看看${post.username}的精彩穿搭：${post.look.name}`,
        url: window.location.href
      });
    } else {
      // 降级到复制链接
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div>
              <h3 className="font-medium text-gray-900">{post.username}</h3>
              <p className="text-sm text-gray-500">
                {post.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full min-h-touch min-w-touch"
            aria-label="关闭"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="overflow-y-auto max-h-[60vh]">
          {/* 3D渲染图片 */}
          <div className="aspect-[4/5] bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">3D穿搭渲染图</span>
          </div>

          {/* 穿搭信息 */}
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">{post.look.name}</h2>
            
            {/* 标签 */}
            {post.look.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.look.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 穿搭详情 */}
            <div className="space-y-2 text-sm text-gray-600">
              <p>这是一个精心搭配的3D穿搭作品，展现了独特的时尚品味和创意。</p>
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 p-2 rounded-lg transition-colors min-h-touch ${
                  post.isLiked 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                }`}
                aria-label={post.isLiked ? '取消点赞' : '点赞'}
              >
                <Heart 
                  size={20} 
                  className={post.isLiked ? 'fill-current' : ''} 
                />
                <span className="text-sm font-medium">{post.likes}</span>
              </button>

              <button
                className="flex items-center space-x-1 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-touch"
                aria-label="评论"
              >
                <MessageCircle size={20} />
                <span className="text-sm">评论</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-touch min-w-touch"
                aria-label="保存"
              >
                <Bookmark size={20} />
              </button>

              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-touch min-w-touch"
                aria-label="分享"
              >
                <Share size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;