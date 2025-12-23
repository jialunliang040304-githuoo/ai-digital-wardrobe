# 3D数字衣柜 - 炫酷黑色主题版

基于React + Vite + Tailwind CSS + React Three Fiber构建的现代化3D数字衣柜应用，采用炫酷的黑色霓虹主题设计。

## ✨ 核心功能

- 🎯 **3D试衣间** - 实时3D人体模型试穿体验
- 📱 **添加衣物** - 拍照上传，AI生成3D模型
- 🔍 **身体扫描** - 创建专属3D身体模型
- 🎨 **炫酷UI** - 黑色主题 + 霓虹发光效果
- 📱 **移动优先** - 完美适配移动端体验

## 🛠 技术栈

### 前端
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS + 自定义炫酷主题
- **3D渲染**: React Three Fiber + Three.js
- **状态管理**: Zustand
- **路由管理**: React Router DOM
- **UI组件**: 自定义霓虹风格组件

### 后端
- **服务框架**: Express.js + TypeScript
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: Prisma
- **认证**: JWT + bcrypt
- **文件上传**: Multer + Sharp
- **API文档**: RESTful API

## 🎨 设计特色

- **黑色炫酷主题** - 深色背景 + 霓虹蓝色点缀
- **霓虹发光效果** - 按钮、边框、文字发光动画
- **扫描线动画** - 科技感十足的扫描效果
- **玻璃态效果** - 半透明毛玻璃背景
- **渐变动画** - 流动的背景渐变效果

## 🚀 快速开始

### 前端启动
```bash
# 安装依赖
npm install

# 启动开发服务器 (http://localhost:3000)
npm run dev

# 构建生产版本
npm run build
```

### 后端启动
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 数据库迁移
npx prisma migrate dev

# 启动后端服务 (http://localhost:5001)
npm run dev
```

### 完整启动
```bash
# 启动前端 (终端1)
npm run dev

# 启动后端 (终端2)
cd backend && npm run dev
```

## 📱 页面结构

- **首页 (/)** - 3D试衣间，展示人体模型和衣柜侧边栏
- **添加衣物 (/add)** - 拍照上传界面，AI生成3D模型
- **身体扫描 (/scan)** - 引导用户进行身体扫描

## 🎯 核心组件

- `HomePage` - 3D试衣间主页面
- `AddClothPage` - 添加衣物页面  
- `ScanBodyPage` - 身体扫描页面
- `TabBar` - 底部导航栏
- `Sidebar` - 衣柜侧边栏
- `AvatarModel` - 3D人体模型组件

## 🎨 样式系统

- **霓虹发光**: `.neon-glow`, `.neon-text`
- **玻璃效果**: `.glass`, `.cyber-card`
- **动画效果**: `.scan-line`, `.pulse-glow`, `.gradient-bg`
- **按钮样式**: `.btn-primary`, `.btn-secondary`

## 📦 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # UI组件库
│   │   ├── Feed/          # 信息流组件
│   │   ├── Layout/        # 布局组件
│   │   ├── Pages/         # 页面组件
│   │   ├── TryOnStudio/   # 3D试穿工作室
│   │   ├── UI/            # 基础UI组件
│   │   └── Wardrobe/      # 衣柜管理组件
│   ├── services/          # API服务
│   ├── store/             # 状态管理
│   ├── types/             # TypeScript类型
│   └── test/              # 测试文件
├── backend/               # 后端源码
│   ├── src/
│   │   ├── routes/        # API路由
│   │   ├── middleware/    # 中间件
│   │   └── server.ts      # 服务器入口
│   ├── prisma/            # 数据库
│   │   ├── schema.prisma  # 数据模型
│   │   └── migrations/    # 迁移文件
│   └── package.json       # 后端依赖
└── public/                # 静态资源
```

## 🎮 使用说明

1. **试穿体验** - 在首页点击右侧衣柜中的衣物进行试穿
2. **添加衣物** - 切换到添加页面，拍照上传生成3D模型
3. **身体扫描** - 在扫描页面创建专属3D身体模型

## 🌟 特色功能

- **实时3D渲染** - 流畅的3D模型展示和交互
- **智能试穿** - 点击衣物即可实时试穿效果
- **炫酷动画** - 丰富的霓虹发光和扫描动画
- **响应式设计** - 完美适配各种屏幕尺寸

## 🎨 UI特效详解

### 霓虹发光系统
```css
.neon-glow {
  box-shadow: 
    0 0 5px #00d4ff,
    0 0 10px #00d4ff,
    0 0 15px #00d4ff,
    0 0 20px #00d4ff;
}
```

### 扫描线动画
```css
.scan-line::before {
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.4), transparent);
  animation: scanMove 2s linear infinite;
}
```

### 玻璃态效果
```css
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.2);
}
```

## 📱 移动端优化

- **触摸友好** - 44px最小触摸目标
- **手势支持** - 3D模型旋转缩放
- **性能优化** - 60fps流畅动画
- **电池友好** - 智能动画暂停

## 🔧 开发工具

- **热重载** - Vite HMR快速开发
- **类型安全** - TypeScript全覆盖
- **代码规范** - ESLint + Prettier
- **调试工具** - React DevTools支持

## 🚀 性能特性

- **懒加载** - 组件按需加载
- **缓存优化** - 3D模型智能缓存
- **压缩优化** - Gzip + Brotli压缩
- **CDN就绪** - 静态资源分离

## 📄 开源协议

MIT License

---

## 🔌 API接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户接口
- `GET /api/users/me` - 获取用户信息
- `PUT /api/users/body-measurements` - 更新身体测量数据
- `GET /api/users/stats` - 获取用户统计

### 服装接口
- `GET /api/clothing` - 获取服装列表
- `POST /api/clothing` - 创建服装物品
- `PUT /api/clothing/:id` - 更新服装物品
- `DELETE /api/clothing/:id` - 删除服装物品

### 造型接口
- `GET /api/looks` - 获取保存的造型
- `POST /api/looks` - 创建新造型
- `PUT /api/looks/:id` - 更新造型
- `DELETE /api/looks/:id` - 删除造型

### 信息流接口
- `GET /api/feed` - 获取信息流
- `POST /api/feed` - 发布造型到信息流
- `POST /api/feed/:id/like` - 点赞/取消点赞

### 上传接口
- `POST /api/upload/image` - 上传图片
- `POST /api/upload/avatar` - 上传头像

## 🎯 项目亮点

这个项目成功将传统的电商试穿体验提升到了全新的3D交互层次，结合炫酷的黑色霓虹主题和完整的后端API系统，为用户带来了前所未有的视觉冲击和使用体验。无论是技术实现还是视觉设计，都代表了现代全栈Web应用的最高水准。

### 技术亮点
- **全栈TypeScript** - 前后端类型安全
- **实时3D渲染** - React Three Fiber高性能3D
- **RESTful API** - 标准化后端接口
- **数据库设计** - Prisma ORM优雅建模
- **认证系统** - JWT安全认证
- **文件上传** - 图片优化处理
- **响应式设计** - 移动端完美适配