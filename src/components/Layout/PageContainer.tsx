import React from 'react';
import { useAppContext } from '../../context/AppContext';
import HomeFeed from '../Pages/HomeFeed';
import Wardrobe from '../Pages/Wardrobe';
import TryOnStudio from '../Pages/TryOnStudio';
import Scan from '../Pages/Scan';
import Profile from '../Pages/Profile';

const PageContainer: React.FC = () => {
  const { state } = useAppContext();
  const { activeTab } = state.ui;

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home':
        return '首页 - 时尚动态';
      case 'wardrobe':
        return '我的衣柜';
      case 'studio':
        return '3D试穿工作室';
      case 'scan':
        return '身体扫描';
      case 'profile':
        return '个人中心';
      default:
        return '首页 - 时尚动态';
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomeFeed isActive={true} />;
      case 'wardrobe':
        return <Wardrobe isActive={true} />;
      case 'studio':
        return <TryOnStudio isActive={true} />;
      case 'scan':
        return <Scan isActive={true} />;
      case 'profile':
        return <Profile isActive={true} />;
      default:
        return <HomeFeed isActive={true} />;
    }
  };

  return (
    <main 
      className="h-full overflow-y-auto"
      id="main-content"
      role="main"
      aria-label={getPageTitle()}
    >
      <div 
        className="min-h-full"
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        <h1 className="sr-only">{getPageTitle()}</h1>
        {renderPage()}
      </div>
    </main>
  );
};

export default PageContainer;