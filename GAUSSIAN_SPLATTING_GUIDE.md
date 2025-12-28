# 高斯泼溅 & Luma AI 3D建模指南

## 🎯 技术概述

### 3D Gaussian Splatting (高斯泼溅)
一种革命性的3D重建技术，通过学习场景中的3D高斯分布来表示场景，实现：
- 实时渲染速度 (100+ FPS)
- 照片级真实感
- 支持视频/多图输入
- 输出.splat/.ply格式

### Luma AI
业界领先的3D捕捉平台，提供：
- 视频转3D高斯泼溅
- 图片转3D模型
- 高质量纹理重建
- API接口调用

---

## 🛠️ 已实现功能

### 后端服务
- `backend/src/services/providers/lumaService.ts` - Luma AI集成
- `backend/src/services/providers/gaussianSplattingService.ts` - 高斯泼溅服务
- `backend/src/routes/ai.ts` - API端点

### 前端组件
- `src/components/AI/VideoCapture3D.tsx` - 视频捕捉组件
- `src/components/TryOnStudio/GaussianSplatViewer.tsx` - 高斯泼溅查看器
- `src/services/aiService.ts` - AI服务客户端

---

## 📱 使用流程

### 人体3D建模
1. 打开试穿工作室
2. 点击紫色视频图标 📹
3. 让朋友围绕你拍摄15-20秒视频
4. 等待高斯泼溅处理完成
5. 查看3D模型

### 服装3D建模
1. 将服装平放或挂起
2. 围绕服装拍摄视频
3. 选择服装类别
4. 等待处理完成
5. 添加到衣柜

---

## 🔧 API配置

### Luma AI
```env
# backend/.env
LUMA_API_KEY=your_luma_api_key
```

获取方式：
1. 访问 https://lumalabs.ai
2. 注册开发者账号
3. 申请API访问权限

### Replicate (高斯泼溅模型)
```env
REPLICATE_API_TOKEN=r8_xxxxxxxx
```

---

## 💰 费用估算

| 服务 | 单次费用 | 处理时间 |
|------|----------|----------|
| Luma AI | $0.10-0.50 | 5-15分钟 |
| Replicate高斯泼溅 | $0.05-0.20 | 3-10分钟 |
| 转换为Mesh | $0.02-0.05 | 1-2分钟 |

---

## 🎨 渲染技术

### 高斯泼溅渲染
- 使用WebGL 2.0
- 支持实时旋转/缩放
- 点云渲染优化
- 自适应LOD

### 兼容性
- Chrome 90+
- Firefox 88+
- Safari 14+
- 移动端支持

---

## 📋 拍摄技巧

### 人体扫描
- ✅ 站立姿势，双臂微张
- ✅ 均匀光线，避免强烈阴影
- ✅ 缓慢平稳移动相机
- ✅ 完整360度覆盖
- ❌ 避免快速移动
- ❌ 避免遮挡

### 服装扫描
- ✅ 平放或悬挂展示
- ✅ 纯色背景
- ✅ 多角度覆盖
- ✅ 细节特写
- ❌ 避免褶皱过多
- ❌ 避免反光材质

---

## 🚀 下一步

1. 配置Luma AI API密钥
2. 测试视频捕捉功能
3. 优化高斯泼溅渲染器
4. 添加模型编辑功能

---

## 📚 参考资料

- [3D Gaussian Splatting论文](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)
- [Luma AI文档](https://docs.lumalabs.ai/)
- [gsplat.js库](https://github.com/mkkellogg/GaussianSplats3D)