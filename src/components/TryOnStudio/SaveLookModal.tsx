import React, { useState, useEffect } from 'react';
import { Save, X, Tag, Globe, Lock } from 'lucide-react';
import { SavedLook, WornClothing } from '../../types';
import { useAppContext, actions } from '../../context/AppContext';
import { StorageService } from '../../services/storageService';
import Modal from '../UI/Modal';

interface SaveLookModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLook: WornClothing;
}

const SaveLookModal: React.FC<SaveLookModalProps> = ({
  isOpen,
  onClose,
  currentLook
}) => {
  const { state, dispatch } = useAppContext();
  const [lookName, setLookName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 重置表单函数
  const resetForm = () => {
    setLookName('');
    setTags([]);
    setNewTag('');
    setIsPublic(false);
    setIsSaving(false);
  };

  // 当模态框关闭时重置表单
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!lookName.trim()) {
      alert('请输入造型名称');
      return;
    }

    // 检查存储空间
    const storageCheck = StorageService.checkStorageSpace();
    if (!storageCheck.hasSpace) {
      alert(`存储空间不足（已使用${storageCheck.usagePercentage.toFixed(1)}%），请删除一些旧造型后重试`);
      return;
    }

    setIsSaving(true);

    try {
      // 创建新的造型保存
      const newLook: SavedLook = {
        id: `look_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        name: lookName.trim(),
        userId: state.user?.id || 'anonymous',
        clothing: currentLook,
        screenshot: '', // 这里将来会是3D渲染的截图
        tags: tags,
        isPublic: isPublic,
        createdAt: new Date()
      };

      // 保存到本地存储
      const saveSuccess = StorageService.saveLook(newLook);
      
      if (!saveSuccess) {
        throw new Error('本地存储失败');
      }

      // 保存到应用状态
      dispatch(actions.saveLook(newLook));

      // 如果是公开造型，分享到社区信息流
      if (isPublic) {
        const feedPost = {
          id: `post_${newLook.id}`,
          userId: newLook.userId,
          username: state.user?.username || '匿名用户',
          userAvatar: state.user?.avatar?.meshData || '',
          look: newLook,
          likes: 0,
          isLiked: false,
          createdAt: new Date()
        };
        dispatch(actions.shareToFeed(feedPost));
      }

      // 重置表单
      resetForm();

      onClose();
      
      // 显示保存成功信息和存储统计
      const stats = StorageService.getStorageStats();
      const shareMessage = isPublic ? '\n已分享到社区！' : '';
      alert(`造型保存成功！${shareMessage}\n已保存 ${stats.totalLooks} 个造型，存储使用率：${stats.storagePercentage.toFixed(1)}%`);
    } catch (error) {
      console.error('保存造型失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const getCurrentLookSummary = () => {
    const items = [];
    if (currentLook.top) items.push(currentLook.top.name);
    if (currentLook.bottom) items.push(currentLook.bottom.name);
    if (currentLook.shoes) items.push(currentLook.shoes.name);
    if (currentLook.accessories.length > 0) {
      items.push(...currentLook.accessories.map(item => item.name));
    }
    return items.length > 0 ? items.join(' + ') : '暂无选择的服装';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">保存造型</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-touch min-w-touch"
            aria-label="关闭"
          >
            <X size={20} />
          </button>
        </div>

        {/* 当前造型预览 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">当前造型</h3>
          <p className="text-sm text-gray-600">{getCurrentLookSummary()}</p>
        </div>

        {/* 造型名称 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            造型名称 *
          </label>
          <input
            type="text"
            value={lookName}
            onChange={(e) => setLookName(e.target.value)}
            placeholder="为你的造型起个名字..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            maxLength={50}
          />
          <p className="text-xs text-gray-500 mt-1">{lookName.length}/50</p>
        </div>

        {/* 标签 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tag size={16} className="inline mr-1" />
            标签
          </label>
          
          {/* 已添加的标签 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 hover:text-primary-600 min-h-touch min-w-touch"
                    aria-label={`删除标签 ${tag}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 添加新标签 */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="添加标签..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              maxLength={20}
            />
            <button
              onClick={handleAddTag}
              disabled={!newTag.trim() || tags.includes(newTag.trim()) || tags.length >= 10}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-touch"
            >
              添加
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">最多可添加10个标签</p>
        </div>

        {/* 隐私设置 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            隐私设置
          </label>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="privacy"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
                className="mr-3"
              />
              <Lock size={16} className="mr-2 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900">私人</div>
                <div className="text-sm text-gray-500">只有你可以看到这个造型</div>
              </div>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="privacy"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
                className="mr-3"
              />
              <Globe size={16} className="mr-2 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900">公开</div>
                <div className="text-sm text-gray-500">分享到社区，让其他人看到你的造型</div>
              </div>
            </label>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors min-h-touch"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!lookName.trim() || isSaving}
            className="flex-1 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-touch flex items-center justify-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>保存中...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>保存造型</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SaveLookModal;