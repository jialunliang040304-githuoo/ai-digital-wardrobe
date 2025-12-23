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
      className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md border-t safe-area-pb"
      style={{ 
        backgroundColor: 'var(--card)', 
        borderColor: 'var(--border)',
        boxShadow: '0 -4px 6px rgba(0,0,0,0.05)'
      }}
      role="navigation"
      aria-label="主导航"
      id="navigation"
    >
      <div className="flex justify-around items-center px-4 py-2" role="tablist" aria-orientation="horizontal">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`
                group flex flex-col items-center justify-center min-h-touch min-w-touch p-2 rounded-xl transition-all duration-200
                ${isActive 
                  ? item.isCenter 
                    ? 'bg-gradient-accent text-accent-foreground shadow-accent scale-110' 
                    : 'text-accent bg-accent/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
                ${item.isCenter ? 'relative -mt-2' : ''}
              `}
              role="tab"
              aria-label={`切换到${item.label}页面`}
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              tabIndex={isActive ? 0 : -1}
            >
              <Icon 
                size={item.isCenter ? 22 : 20} 
                className={`transition-transform duration-200 ${isActive && !item.isCenter ? 'scale-110' : ''} group-hover:scale-110`}
                aria-hidden="true"
              />
              <span className={`text-xs mt-1 font-medium transition-all duration-200 ${
                item.isCenter && isActive ? 'text-accent-foreground' : ''
              }`}>
                {item.label}
              </span>
              
              {/* Active indicator for non-center items */}
              {isActive && !item.isCenter && (
                <div className="absolute -top-1 w-1 h-1 bg-accent rounded-full animate-pulse-dot" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;