/**
 * 穿搭日历组件
 * 记录和管理每日穿搭，提供穿搭历史回顾
 */

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Eye, Edit3, Trash2, Camera } from 'lucide-react';
import { ClothingItem, SavedLook } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface OutfitCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOutfit: (date: Date) => void;
}

interface DailyOutfit {
  date: string; // YYYY-MM-DD format
  look: SavedLook;
  weather?: {
    temperature: number;
    condition: string;
  };
  occasion?: string;
  notes?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  outfit?: DailyOutfit;
  isToday: boolean;
}

const OutfitCalendar: React.FC<OutfitCalendarProps> = ({
  isOpen,
  onClose,
  onCreateOutfit
}) => {
  const { state } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dailyOutfits, setDailyOutfits] = useState<DailyOutfit[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showOutfitDetail, setShowOutfitDetail] = useState(false);

  // 生成日历数据
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);
    
    // 调整到周的开始和结束
    startDate.setDate(startDate.getDate() - startDate.getDay());
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    const today = new Date();
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const outfit = dailyOutfits.find(o => o.date === dateStr);
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        outfit,
        isToday: current.toDateString() === today.toDateString()
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // 模拟加载穿搭数据
  useEffect(() => {
    if (isOpen) {
      // 模拟一些穿搭记录
      const mockOutfits: DailyOutfit[] = [
        {
          date: new Date().toISOString().split('T')[0],
          look: {
            id: 'today-look',
            name: '今日休闲装',
            userId: 'user1',
            clothing: { accessories: [] },
            screenshot: '',
            tags: ['休闲', '舒适'],
            isPublic: false,
            createdAt: new Date()
          },
          weather: { temperature: 22, condition: 'sunny' },
          occasion: '日常工作',
          notes: '今天天气不错，选择了轻松的搭配'
        },
        {
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          look: {
            id: 'yesterday-look',
            name: '昨日正装',
            userId: 'user1',
            clothing: { accessories: [] },
            screenshot: '',
            tags: ['正式', '商务'],
            isPublic: true,
            createdAt: new Date(Date.now() - 86400000)
          },
          weather: { temperature: 18, condition: 'cloudy' },
          occasion: '重要会议',
          notes: '参加重要会议，选择了正式的商务装'
        }
      ];
      setDailyOutfits(mockOutfits);
    }
  }, [isOpen]);

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    if (day.outfit) {
      setShowOutfitDetail(true);
    } else {
      // 创建新的穿搭记录
      onCreateOutfit(day.date);
    }
  };

  const getOutfitPreview = (outfit: DailyOutfit) => {
    const items = [
      outfit.look.clothing.top,
      outfit.look.clothing.bottom,
      outfit.look.clothing.shoes,
      ...(outfit.look.clothing.accessories || [])
    ].filter(Boolean);

    return items.slice(0, 3); // 最多显示3个物品
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'snowy': return '❄️';
      default: return '🌤️';
    }
  };

  const calendarDays = generateCalendarDays();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="text-green-500" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">穿搭日历</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* 日历导航 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
              </h3>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  viewMode === 'month' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                月
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  viewMode === 'week' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                周
              </button>
            </div>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 日历网格 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square p-1 rounded-lg text-sm transition-all relative
                  ${day.isCurrentMonth 
                    ? 'text-gray-900 hover:bg-gray-100' 
                    : 'text-gray-400'
                  }
                  ${day.isToday 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : ''
                  }
                  ${day.outfit 
                    ? 'bg-blue-50 border-2 border-blue-200' 
                    : ''
                  }
                `}
              >
                <div className="text-xs font-medium">
                  {day.date.getDate()}
                </div>
                
                {/* 穿搭指示器 */}
                {day.outfit && (
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5">
                    {getOutfitPreview(day.outfit).map((_, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="w-1 h-1 bg-blue-500 rounded-full"
                      />
                    ))}
                  </div>
                )}
                
                {/* 天气指示器 */}
                {day.outfit?.weather && (
                  <div className="absolute top-0 right-0 text-xs">
                    {getWeatherIcon(day.outfit.weather.condition)}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* 统计信息 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">本月统计</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {dailyOutfits.filter(o => {
                    const outfitDate = new Date(o.date);
                    return outfitDate.getMonth() === currentDate.getMonth() &&
                           outfitDate.getFullYear() === currentDate.getFullYear();
                  }).length}
                </div>
                <div className="text-xs text-gray-600">记录天数</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {dailyOutfits.filter(o => o.look.isPublic).length}
                </div>
                <div className="text-xs text-gray-600">公开分享</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {new Set(dailyOutfits.flatMap(o => o.look.tags)).size}
                </div>
                <div className="text-xs text-gray-600">风格标签</div>
              </div>
            </div>
          </div>

          {/* 最近穿搭 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">最近穿搭</h4>
            <div className="space-y-3">
              {dailyOutfits.slice(0, 3).map((outfit, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(outfit.date).toLocaleDateString('zh-CN', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {outfit.weather && (
                        <span className="text-xs text-gray-500">
                          {getWeatherIcon(outfit.weather.condition)} {outfit.weather.temperature}°C
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Eye size={14} className="text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit3 size={14} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {getOutfitPreview(outfit).map((item, itemIndex) => (
                        <div key={itemIndex} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          {item?.texture && item.texture.startsWith('data:image') ? (
                            <img 
                              src={item.texture} 
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-xs">
                              {item?.category === 'tops' ? '👕' :
                               item?.category === 'bottoms' ? '👖' :
                               item?.category === 'shoes' ? '👟' : '👜'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{outfit.look.name}</div>
                      <div className="text-xs text-gray-500">{outfit.occasion}</div>
                    </div>
                  </div>
                  
                  {outfit.notes && (
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                      {outfit.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 快速添加按钮 */}
          <button
            onClick={() => onCreateOutfit(new Date())}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <Camera size={18} />
            记录今日穿搭
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutfitCalendar;