import React from 'react';
import { useAppContext } from '../../context/AppContext';
import BottomNavigation from './BottomNavigation';
import PageContainer from './PageContainer';

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-lg relative">
      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden pb-20">
        <PageContainer />
      </div>
      
      {/* 底部导航栏 - 固定在底部 */}
      <BottomNavigation />
    </div>
  );
};

export default Layout;