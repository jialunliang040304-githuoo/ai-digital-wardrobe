// 用户模型
export interface User {
  id: string;
  username: string;
  avatar: AvatarModel;
  stats: {
    looksCreated: number;
    followers: number;
    following: number;
  };
}

// 虚拟形象模型
export interface AvatarModel {
  id: string;
  userId: string;
  bodyMeasurements: BodyMeasurements;
  pose: 'A-pose' | 'T-pose';
  meshData: string; // 3D模型数据路径
}

// 身体测量数据
export interface BodyMeasurements {
  height: number;
  chest: number;
  waist: number;
  hips: number;
  shoulderWidth: number;
}

// 服装物品
export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  type: ClothingType;
  meshData: string; // 3D模型数据路径
  texture: string; // 纹理贴图路径
  mountPoints: MountPoint[];
  tags: string[];
  createdAt: Date;
}

export type ClothingCategory = 'tops' | 'bottoms' | 'shoes' | 'accessories';
export type ClothingType = 'shirt' | 'pants' | 'dress' | 'jacket' | 'sneakers' | 'hat';

// 挂载点
export interface MountPoint {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

// 穿着的服装
export interface WornClothing {
  top?: ClothingItem;
  bottom?: ClothingItem;
  shoes?: ClothingItem;
  accessories: ClothingItem[];
}

// 保存的造型
export interface SavedLook {
  id: string;
  name: string;
  userId: string;
  clothing: WornClothing;
  screenshot: string; // 3D渲染截图
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
}

// 社区动态
export interface FeedPost {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  look: SavedLook;
  likes: number;
  isLiked: boolean;
  createdAt: Date;
}

// 导航标签类型
export type TabType = 'home' | 'wardrobe' | 'studio' | 'profile' | 'scan';
export type CategoryFilter = ClothingCategory | 'all';

// 全局应用状态
export interface AppState {
  user: User | null;
  wardrobe: ClothingItem[];
  currentLook: WornClothing;
  savedLooks: SavedLook[];
  feed: FeedPost[];
  ui: UIState;
}

// UI状态
export interface UIState {
  activeTab: TabType;
  loading: boolean;
  selectedCategory: CategoryFilter;
  isStudioMode: boolean;
}

// 状态操作
export type AppAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'ADD_CLOTHING_ITEM'; payload: ClothingItem }
  | { type: 'WEAR_CLOTHING'; payload: { item: ClothingItem; slot: keyof WornClothing } }
  | { type: 'SAVE_LOOK'; payload: SavedLook }
  | { type: 'SHARE_TO_FEED'; payload: FeedPost }
  | { type: 'SET_ACTIVE_TAB'; payload: TabType }
  | { type: 'SET_CATEGORY'; payload: CategoryFilter }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_STUDIO_MODE' }
  | { type: 'LIKE_POST'; payload: string }
  | { type: 'SAVE_POST'; payload: string }
  | { type: 'CLEAR_LOOK' };

// 3D场景配置
export interface SceneConfig {
  camera: {
    position: [number, number, number];
    fov: number;
    near: number;
    far: number;
  };
  lighting: {
    ambient: { intensity: number; color: string };
    directional: { 
      position: [number, number, number]; 
      intensity: number; 
      color: string;
    };
    point: {
      position: [number, number, number];
      intensity: number;
      color: string;
    };
  };
  platform: {
    radius: number;
    height: number;
    material: string;
  };
}