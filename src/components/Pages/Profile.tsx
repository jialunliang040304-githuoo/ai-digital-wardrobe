import React, { useState } from 'react';
import { Camera, Settings, User, Heart, Eye, Calendar, Share2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { StorageService } from '../../services/storageService';

interface ProfileProps {
  isActive: boolean;
}

const Profile: React.FC<ProfileProps> = ({ isActive }) => {
  const { state } = useAppContext();
  const [showSettings, setShowSettings] = useState(false);
  
  // 获取用户统计数据
  const stats = StorageService.getStorageStats();
  const userStats = {
    looksCreated: stats.totalLooks,
    publicLooks: stats.publicLooks,
    privateLooks: stats.privateLooks,
    followers: state.user?.stats?.followers || 0,
    following: state.user?.stats?.following || 0
  };
  return (
    <div className="h-full p-4 xs:p-3 sm:p-6">
      {/* 用户信息 */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4">
          {state.user?.avatar?.meshData ? (
            <img 
              src={state.user.avatar.meshData} 
              alt="用户头像"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
          )}
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          {state.user?.username || '时尚达人'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          加入于 {new Date().getFullYear()}年
        </p>
        
        {/* 统计数据 */}
        <div className="flex justify-center space-x-6 sm:space-x-8 mt-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{userStats.looksCreated}</div>
            <div className="text-xs sm:text-sm text-gray-600">造型</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{userStats.followers}</div>
            <div className="text-xs sm:text-sm text-gray-600">关注者</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{userStats.following}</div>
            <div className="text-xs sm:text-sm text-gray-600">关注中</div>
          </div>
        </div>

        {/* 详细统计 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Eye size={16} className="text-gray-500" />
              <span className="text-gray-600">公开造型</span>
              <span className="font-medium text-gray-900">{userStats.publicLooks}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart size={16} className="text-gray-500" />
              <span className="text-gray-600">私人造型</span>
              <span className="font-medium text-gray-900">{userStats.privateLooks}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-gray-600">本月创建</span>
              <span className="font-medium text-gray-900">{Math.min(userStats.looksCreated, 5)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Share2 size={16} className="text-gray-500" />
              <span className="text-gray-600">分享次数</span>
              <span className="font-medium text-gray-900">{userStats.publicLooks * 2}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 身体扫描功能 */}
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">身体扫描</h3>
          <p className="text-sm text-gray-600 mb-4">
            通过3D身体扫描获得更精准的试穿效果
          </p>
          
          {state.user?.avatar ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">当前身体模型</p>
                    <p className="text-xs text-green-600">
                      身高: {state.user.avatar.bodyMeasurements?.height || 170}cm
                    </p>
                  </div>
                </div>
                <button className="text-sm text-green-600 hover:text-green-700">
                  查看详情
                </button>
              </div>
              
              <button className="w-full bg-primary-500 text-white py-3 rounded-lg flex items-center justify-center space-x-2 min-h-touch hover:bg-primary-600 transition-colors">
                <Camera size={18} />
                <span className="font-medium">更新身体扫描</span>
              </button>
            </div>
          ) : (
            <button 
              className="w-full bg-primary-500 text-white py-3 rounded-lg flex items-center justify-center space-x-2 min-h-touch hover:bg-primary-600 transition-colors"
              onClick={() => {
                // 这里将来会跳转到身体扫描页面
                alert('身体扫描功能即将推出！\n\n扫描流程：\n1. 准备充足光线的环境\n2. 穿着贴身衣物\n3. 按照指引完成360度扫描\n4. 系统自动生成3D身体模型');
              }}
            >
              <Camera size={18} />
              <span className="font-medium">新建身体扫描</span>
            </button>
          )}
        </div>
      </div>
      
      {/* 我的造型管理 */}
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">我的造型</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors min-h-touch">
              <div className="text-sm font-medium text-gray-900">全部造型</div>
              <div className="text-xs text-gray-500 mt-1">{userStats.looksCreated} 个</div>
            </button>
            
            <button className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors min-h-touch">
              <div className="text-sm font-medium text-gray-900">公开造型</div>
              <div className="text-xs text-gray-500 mt-1">{userStats.publicLooks} 个</div>
            </button>
            
            <button className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors min-h-touch">
              <div className="text-sm font-medium text-gray-900">私人造型</div>
              <div className="text-xs text-gray-500 mt-1">{userStats.privateLooks} 个</div>
            </button>
            
            <button className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors min-h-touch">
              <div className="text-sm font-medium text-gray-900">收藏夹</div>
              <div className="text-xs text-gray-500 mt-1">0 个</div>
            </button>
          </div>
        </div>
      </div>

      {/* 设置选项 */}
      <div className="space-y-2">
        <button 
          className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg min-h-touch hover:bg-gray-100 transition-colors"
          onClick={() => setShowSettings(!showSettings)}
        >
          <span className="text-sm sm:text-base">个人资料设置</span>
          <Settings size={18} className="sm:w-5 sm:h-5 text-gray-400" />
        </button>
        
        {showSettings && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm min-h-touch">
              编辑个人信息
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm min-h-touch">
              隐私设置
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm min-h-touch">
              通知设置
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm min-h-touch">
              数据导出
            </button>
            <hr className="my-2" />
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-red-600 min-h-touch">
              退出登录
            </button>
          </div>
        )}
        
        <button className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg min-h-touch hover:bg-gray-100 transition-colors">
          <span className="text-sm sm:text-base">存储管理</span>
          <div className="text-xs text-gray-500">
            {stats.storagePercentage.toFixed(1)}% 已使用
          </div>
        </button>
        
        <button className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg min-h-touch hover:bg-gray-100 transition-colors">
          <span className="text-sm sm:text-base">帮助与反馈</span>
          <span className="text-xs text-gray-400">→</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;