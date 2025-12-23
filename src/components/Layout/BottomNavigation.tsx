import React from 'react';
import { Home, Shirt, Camera, User, Scan } from 'lucide-react';
import { useAppContext, actions } from '../../context/AppContext';
import { TabType } from '../../types';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isCenter?: boolean;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: '首页',
    icon: Home
  },
  {
    id: 'wardrobe',
    label: '衣柜',
    icon: Shirt
  },
  {
    id: 'studio',
    label: '试穿',
    icon: Camera,
    isCenter: true
  },
  {
    id: 'scan',
    label: '扫描',
    icon: Scan
  },
  {
    id: 'profile',
    label: '我的',
    icon: User
  }
];

const BottomNavigation: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { activeTab } = state.ui;

  const handleTabChange = (tab: TabType) => {
    dispatch(actions.setActiveTab(tab));
  };

  return (
    <nav 
      className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2 safe-area-pb"
      role="navigation"
      aria-label="主导航"
      id="navigation"
    >
      <div className="flex justify-around items-center" role="tablist" aria-orientation="horizontal">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`
                flex flex-col items-center justify-center min-h-touch min-w-touch p-2 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
                ${item.isCenter ? 'bg-primary-500 text-white hover:bg-primary-600 rounded-full p-2 sm:p-3' : ''}
              `}
              role="tab"
              aria-label={`切换到${item.label}页面`}
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              tabIndex={isActive ? 0 : -1}
            >
              <Icon 
                size={item.isCenter ? 20 : 18} 
                className={`sm:w-6 sm:h-6 ${item.isCenter && !isActive ? 'text-white' : ''}`}
                aria-hidden="true"
              />
              <span className={`text-xs mt-1 ${item.isCenter ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;