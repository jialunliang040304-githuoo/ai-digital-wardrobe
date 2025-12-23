import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, AppAction, TabType } from '../types';
import { StorageService } from '../services/storageService';

// 模拟衣柜数据
const mockWardrobeItems = [
  {
    id: '1',
    name: '白色基础T恤',
    category: 'tops' as const,
    type: 'shirt' as const,
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: ['基础款', '百搭'],
    createdAt: new Date()
  },
  {
    id: '2',
    name: '蓝色牛仔裤',
    category: 'bottoms' as const,
    type: 'pants' as const,
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: ['休闲', '牛仔'],
    createdAt: new Date()
  },
  {
    id: '3',
    name: '白色运动鞋',
    category: 'shoes' as const,
    type: 'sneakers' as const,
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: ['运动', '舒适'],
    createdAt: new Date()
  },
  {
    id: '4',
    name: '黑色棒球帽',
    category: 'accessories' as const,
    type: 'hat' as const,
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: ['帽子', '街头'],
    createdAt: new Date()
  },
  {
    id: '5',
    name: '黑色连帽衫',
    category: 'tops' as const,
    type: 'jacket' as const,
    meshData: '',
    texture: '',
    mountPoints: [],
    tags: ['外套', '保暖'],
    createdAt: new Date()
  }
];

// 初始状态
const initialState: AppState = {
  user: null,
  wardrobe: mockWardrobeItems,
  currentLook: {
    accessories: []
  },
  savedLooks: StorageService.getSavedLooks(), // 从本地存储加载
  feed: [],
  ui: {
    activeTab: 'home',
    loading: false,
    selectedCategory: 'all',
    isStudioMode: false
  }
};

// Reducer函数
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      };
    
    case 'ADD_CLOTHING_ITEM':
      return {
        ...state,
        wardrobe: [...state.wardrobe, action.payload]
      };
    
    case 'WEAR_CLOTHING':
      const { item, slot } = action.payload;
      if (slot === 'accessories') {
        return {
          ...state,
          currentLook: {
            ...state.currentLook,
            accessories: [...state.currentLook.accessories, item]
          }
        };
      } else {
        return {
          ...state,
          currentLook: {
            ...state.currentLook,
            [slot]: item
          }
        };
      }
    
    case 'SAVE_LOOK':
      return {
        ...state,
        savedLooks: [...state.savedLooks, action.payload]
      };
    
    case 'SHARE_TO_FEED':
      return {
        ...state,
        feed: [action.payload, ...state.feed]
      };
    
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeTab: action.payload
        }
      };
    
    case 'SET_CATEGORY':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedCategory: action.payload
        }
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.payload
        }
      };
    
    case 'TOGGLE_STUDIO_MODE':
      return {
        ...state,
        ui: {
          ...state.ui,
          isStudioMode: !state.ui.isStudioMode
        }
      };
    
    case 'LIKE_POST':
      return {
        ...state,
        feed: state.feed.map(post => 
          post.id === action.payload 
            ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
            : post
        )
      };
    
    case 'SAVE_POST':
      // 这里可以添加保存到收藏的逻辑
      return state;
    
    case 'CLEAR_LOOK':
      return {
        ...state,
        currentLook: {
          accessories: []
        }
      };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

// Provider组件
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 监听存储变化，同步状态
  useEffect(() => {
    const handleStorageChange = () => {
      // 这里可以添加一个新的action来同步存储的造型
      // const savedLooks = StorageService.getSavedLooks();
      // dispatch({ type: 'SYNC_SAVED_LOOKS', payload: savedLooks });
    };

    // 监听storage事件（跨标签页同步）
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// 便捷的action creators
export const actions = {
  setUser: (user: any) => ({ type: 'SET_USER' as const, payload: user }),
  addClothingItem: (item: any) => ({ type: 'ADD_CLOTHING_ITEM' as const, payload: item }),
  wearClothing: (item: any, slot: keyof any) => ({ type: 'WEAR_CLOTHING' as const, payload: { item, slot } }),
  saveLook: (look: any) => ({ type: 'SAVE_LOOK' as const, payload: look }),
  shareToFeed: (post: any) => ({ type: 'SHARE_TO_FEED' as const, payload: post }),
  setActiveTab: (tab: TabType) => ({ type: 'SET_ACTIVE_TAB' as const, payload: tab }),
  setCategory: (category: any) => ({ type: 'SET_CATEGORY' as const, payload: category }),
  setLoading: (loading: boolean) => ({ type: 'SET_LOADING' as const, payload: loading }),
  toggleStudioMode: () => ({ type: 'TOGGLE_STUDIO_MODE' as const }),
  likePost: (postId: string) => ({ type: 'LIKE_POST' as const, payload: postId }),
  savePost: (postId: string) => ({ type: 'SAVE_POST' as const, payload: postId }),
  clearLook: () => ({ type: 'CLEAR_LOOK' as const })
};