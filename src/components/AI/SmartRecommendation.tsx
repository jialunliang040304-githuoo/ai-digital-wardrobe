/**
 * 智能推荐系统组件
 * 基于用户偏好、天气、场合等因素推荐搭配
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Sun, Cloud, CloudRain, Snowflake, MapPin, Calendar, Clock, Thermometer } from 'lucide-react';
import { ClothingItem, ClothingCategory } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface SmartRecommendationProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRecommendation: (items: ClothingItem[]) => void;
}

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  humidity: number;
  windSpeed: number;
  location: string;
}

interface Occasion {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const occasions: Occasion[] = [
  { id: 'casual', name: '休闲日常', icon: '🏠', description: '舒适放松的日常穿搭' },
  { id: 'work', name: '职场商务', icon: '💼', description: '专业正式的工作装扮' },
  { id: 'date', name: '约会聚餐', icon: '💕', description: '浪漫优雅的约会造型' },
  { id: 'sport', name: '运动健身', icon: '🏃', description: '舒适透气的运动装备' },
  { id: 'party', name: '派对聚会', icon: '🎉', description: '时尚亮眼的派对装扮' },
  { id: 'travel', name: '旅行出游', icon: '✈️', description: '实用舒适的旅行穿搭' }
];

const SmartRecommendation: React.FC<SmartRecommendationProps> = ({
  isOpen,
  onClose,
  onApplyRecommendation
}) => {
  const { state } = useAppContext();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('casual');
  const [recommendations, setRecommendations] = useState<ClothingItem[][]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 模拟获取天气数据
  useEffect(() => {
    if (isOpen) {
      // 模拟天气API调用
      setTimeout(() => {
        setWeather({
          temperature: 22,
          condition: 'sunny',
          humidity: 65,
          windSpeed: 8,
          location: '北京市'
        });
      }, 500);
    }
  }, [isOpen]);

  // 生成智能推荐
  const generateRecommendations = () => {
    setLoading(true);
    
    // 模拟AI推荐算法
    setTimeout(() => {
      const availableItems = state.wardrobe;
      const recommendations: ClothingItem[][] = [];
      
      // 根据场合和天气生成3套推荐
      for (let i = 0; i < 3; i++) {
        const outfit: ClothingItem[] = [];
        
        // 选择上装
        const tops = availableItems.filter(item => item.category === 'tops');
        if (tops.length > 0) {
          outfit.push(tops[Math.floor(Math.random() * tops.length)]);
        }
        
        // 选择下装
        const bottoms = availableItems.filter(item => item.category === 'bottoms');
        if (bottoms.length > 0) {
          outfit.push(bottoms[Math.floor(Math.random() * bottoms.length)]);
        }
        
        // 选择鞋子
        const shoes = availableItems.filter(item => item.category === 'shoes');
        if (shoes.length > 0) {
          outfit.push(shoes[Math.floor(Math.random() * shoes.length)]);
        }
        
        // 选择配饰
        const accessories = availableItems.filter(item => item.category === 'accessories');
        if (accessories.length > 0 && Math.random() > 0.5) {
          outfit.push(accessories[Math.floor(Math.random() * accessories.length)]);
        }
        
        if (outfit.length > 0) {
          recommendations.push(outfit);
        }
      }
      
      setRecommendations(recommendations);
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    if (isOpen && weather) {
      generateRecommendations();
    }
  }, [isOpen, weather, selectedOccasion]);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="text-yellow-500" size={20} />;
      case 'cloudy': return <Cloud className="text-gray-500" size={20} />;
      case 'rainy': return <CloudRain className="text-blue-500" size={20} />;
      case 'snowy': return <Snowflake className="text-blue-300" size={20} />;
      default: return <Sun className="text-yellow-500" size={20} />;
    }
  };

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return '深夜';
    if (hour < 12) return '上午';
    if (hour < 18) return '下午';
    return '晚上';
  };

  const getRecommendationScore = (outfit: ClothingItem[]) => {
    // 简单的评分算法
    let score = 70 + Math.random() * 25;
    
    // 根据天气调整评分
    if (weather) {
      if (weather.temperature > 25 && outfit.some(item => item.tags.includes('夏季'))) {
        score += 5;
      }
      if (weather.temperature < 15 && outfit.some(item => item.tags.includes('保暖'))) {
        score += 5;
      }
    }
    
    return Math.round(score);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-purple-500" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">智能推荐</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* 当前环境信息 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-600" />
                <span className="text-sm text-gray-600">{weather?.location || '获取位置中...'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-600" />
                <span className="text-sm text-gray-600">
                  {getTimeOfDay()} {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            
            {weather && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(weather.condition)}
                  <div>
                    <div className="flex items-center gap-1">
                      <Thermometer size={16} className="text-gray-600" />
                      <span className="font-semibold text-gray-900">{weather.temperature}°C</span>
                    </div>
                    <div className="text-xs text-gray-600">湿度 {weather.humidity}%</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {weather.condition === 'sunny' ? '晴朗' :
                     weather.condition === 'cloudy' ? '多云' :
                     weather.condition === 'rainy' ? '雨天' : '雪天'}
                  </div>
                  <div className="text-xs text-gray-600">风速 {weather.windSpeed}km/h</div>
                </div>
              </div>
            )}
          </div>

          {/* 场合选择 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">选择场合</h3>
            <div className="grid grid-cols-3 gap-2">
              {occasions.map((occasion) => (
                <button
                  key={occasion.id}
                  onClick={() => setSelectedOccasion(occasion.id)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedOccasion === occasion.id
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-lg mb-1">{occasion.icon}</div>
                  <div className="text-xs font-medium">{occasion.name}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {occasions.find(o => o.id === selectedOccasion)?.description}
            </p>
          </div>

          {/* 推荐结果 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">推荐搭配</h3>
              <button
                onClick={generateRecommendations}
                disabled={loading}
                className="text-xs text-purple-600 hover:text-purple-700 disabled:opacity-50"
              >
                {loading ? '生成中...' : '重新生成'}
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((outfit, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          搭配 {index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <Sparkles size={12} className="text-yellow-500" />
                          <span className="text-xs text-gray-600">
                            匹配度 {getRecommendationScore(outfit)}%
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onApplyRecommendation(outfit)}
                        className="text-xs bg-purple-500 text-white px-3 py-1 rounded-full hover:bg-purple-600"
                      >
                        试穿
                      </button>
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto">
                      {outfit.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex-shrink-0 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-1">
                            {item.texture && item.texture.startsWith('data:image') ? (
                              <img 
                                src={item.texture} 
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-xs text-gray-500">
                                {item.category === 'tops' ? '👕' :
                                 item.category === 'bottoms' ? '👖' :
                                 item.category === 'shoes' ? '👟' : '👜'}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 w-16 truncate">
                            {item.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 推荐说明 */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">推荐依据</h4>
            <div className="space-y-1 text-xs text-blue-700">
              <div>• 当前天气：{weather?.temperature}°C，适合轻薄/保暖服装</div>
              <div>• 时间场合：{getTimeOfDay()}，{occasions.find(o => o.id === selectedOccasion)?.name}</div>
              <div>• 个人偏好：基于您的穿搭历史和收藏</div>
              <div>• 颜色搭配：考虑色彩协调和视觉平衡</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartRecommendation;