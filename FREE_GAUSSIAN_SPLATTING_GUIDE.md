# 免费高斯泼溅3D建模方案

## 概述

本项目现已集成开源高斯泼溅查看器，完全免费，无需付费API。

## 技术栈

### 前端查看器 (已集成)
- **@mkkellogg/gaussian-splats-3d** - Three.js高斯泼溅渲染器
- 支持格式: `.splat`, `.ply`, `.ksplat`
- GitHub: https://github.com/mkkellogg/GaussianSplats3D

### 本地3D模型生成 (免费开源)

#### 方案1: OpenSplat (推荐)
```bash
# 安装
git clone https://github.com/pierotofy/OpenSplat
cd OpenSplat
pip install -r requirements.txt

# 从图片生成3D模型
python opensplat.py --input ./photos --output model.ply
```
- GitHub: https://github.com/pierotofy/OpenSplat
- 支持CPU/GPU，跨平台

#### 方案2: gsplat (Python)
```bash
pip install gsplat

# 训练模型
python train.py --data_dir ./images --output_dir ./output
```
- GitHub: https://github.com/nerfstudio-project/gsplat
- CUDA加速，高性能

#### 方案3: 3D Gaussian Splatting (原版)
```bash
git clone https://github.com/graphdeco-inria/gaussian-splatting
cd gaussian-splatting
pip install -r requirements.txt

# 训练
python train.py -s ./data/your_scene
```
- 原始论文实现
- 需要CUDA GPU

## 工作流程

### 1. 拍摄照片/视频
- 围绕物体拍摄30-100张照片
- 或录制环绕视频后提取帧

### 2. 本地生成3D模型
```bash
# 使用OpenSplat
opensplat --input ./photos --output model.splat
```

### 3. 上传到Web查看器
- 打开App的"高斯泼溅"模式
- 点击上传按钮
- 选择生成的.splat文件

## 在线免费工具

### Polycam (有限免费)
- https://poly.cam
- 手机App拍摄，云端处理
- 免费版有限制

### Luma AI (有限免费)
- https://lumalabs.ai
- 手机App，免费试用

### Meshroom (完全免费)
- https://alicevision.org/meshroom
- 开源摄影测量软件
- 生成网格后可转换

## 文件格式转换

### PLY转SPLAT
```bash
# 使用GaussianSplats3D工具
node util/create-ksplat.js input.ply output.ksplat
```

### 压缩优化
```bash
# 创建压缩版本 (更小文件)
node util/create-ksplat.js input.ply output.ksplat --compressionLevel 2
```

## 性能优化

### 模型大小限制
| 球谐度 | 最大splat数 |
|--------|-------------|
| 0      | ~16,000,000 |
| 1      | ~11,000,000 |
| 2      | ~8,000,000  |

### 推荐设置
```javascript
const viewer = new GaussianSplats3D.Viewer({
  sphericalHarmonicsDegree: 0,  // 更快渲染
  gpuAcceleratedSort: true,
  antialiased: true
});
```

## 成本对比

| 方案 | 成本 | 质量 | 速度 |
|------|------|------|------|
| Luma AI API | $0.5-2/模型 | 高 | 快 |
| OpenSplat本地 | 免费 | 中高 | 中 |
| gsplat本地 | 免费 | 高 | 快(需GPU) |
| 原版GS | 免费 | 最高 | 慢 |

## 示例代码

### React组件使用
```tsx
import GaussianSplatViewer from './components/TryOnStudio/GaussianSplatViewer';

function App() {
  return (
    <GaussianSplatViewer
      splatUrl="/models/avatar.splat"
      onLoad={() => console.log('加载完成')}
      onError={(e) => console.error(e)}
    />
  );
}
```

### 加载本地文件
```tsx
<GaussianSplatViewer />
// 组件内置上传按钮，支持拖放
```

## 资源链接

- [GaussianSplats3D Demo](https://projects.markkellogg.org/threejs/demo_gaussian_splats_3d.php)
- [OpenSplat GitHub](https://github.com/pierotofy/OpenSplat)
- [gsplat文档](https://docs.gsplat.studio)
- [3DGS论文](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)
- [antimatter15/splat](https://github.com/antimatter15/splat) - 轻量WebGL查看器
