# 🚀 Vercel部署指南

## 1. 导入项目到Vercel

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "New Project"
3. 从GitHub导入 `ai-digital-wardrobe` 仓库
4. 选择 "Import" 

## 2. 配置环境变量

在Vercel项目设置 → Environment Variables 中添加：

### 必需变量
```
DATABASE_URL=file:./dev.db
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

### AI服务API密钥（可选）
```
OPENAI_API_KEY=sk-your-openai-api-key
REPLICATE_API_TOKEN=r8_your-replicate-token
STABILITY_API_KEY=sk-your-stability-api-key
```

## 3. 部署设置

Vercel会自动检测到：
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 4. 部署

点击 "Deploy" 按钮，Vercel将：
1. 安装前端和后端依赖
2. 生成Prisma客户端
3. 构建前端应用
4. 编译后端TypeScript
5. 部署到全球CDN

## 5. 访问应用

部署完成后，你将获得：
- 生产URL: `https://your-app-name.vercel.app`
- 预览URL: 每次推送都会生成新的预览链接

## 6. 数据库配置

### 开发环境
使用本地SQLite数据库（已配置）

### 生产环境（推荐）
1. 注册 [PlanetScale](https://planetscale.com) 或 [Railway](https://railway.app)
2. 创建MySQL数据库
3. 更新Vercel环境变量中的 `DATABASE_URL`
4. 重新部署

## 7. 自动部署

每次推送到 `main` 分支都会触发自动部署：
```bash
git add .
git commit -m "更新功能"
git push origin main
```

## 8. 监控和日志

- 访问Vercel Dashboard查看部署状态
- 查看Functions日志监控API性能
- 设置域名和SSL证书（自动配置）

## 🎯 部署完成！

你的AI数字衣柜应用现已在全球CDN上运行，支持：
- ⚡ 极速加载
- 🌍 全球访问
- 🔒 HTTPS安全
- 📱 移动优化
- 🤖 AI功能集成