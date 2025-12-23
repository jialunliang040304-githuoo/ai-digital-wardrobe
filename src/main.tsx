import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { OfflineService } from './services/offlineService'
import { KeyboardNavigationService } from './services/keyboardNavigationService'

// 初始化离线服务
OfflineService.init().then((success) => {
  if (success) {
    console.log('离线功能已启用');
  } else {
    console.log('离线功能不可用');
  }
});

// 初始化键盘导航服务
KeyboardNavigationService.init();
KeyboardNavigationService.addSkipLinks();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)