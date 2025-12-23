# 🎯 AI数字衣柜 - 3D试穿应用

基于React + AI的现代化3D数字衣柜应用，支持AI人体建模、服装生成和智能试穿。

## ✨ 核心功能

- 🤖 **AI人体3D建模** - 从照片/视频生成专属3D人体模型
- 👕 **AI服装生成** - 拍照自动生成3D服装模型
- 🎯 **智能试穿** - AI驱动的服装与人体智能贴合
- 📱 **移动优先** - 完美适配移动端体验
- 🎨 **炫酷UI** - 黑色霓虹主题设计

## 🛠 技术栈

### 前端
- React 18 + TypeScript
- Vite + Tailwind CSS
- React Three Fiber (3D渲染)
- Zustand (状态管理)

### 后端
- Express.js + TypeScript
- Prisma ORM + SQLite
- JWT认证 + bcrypt
- AI服务集成 (OpenAI, Replicate, Stability AI)

## 🚀 快速开始

### 本地开发

1. **克隆项目**
```bash
git clone <your-repo-url>
cd digital-wardrobe
```

2. **安装依赖**
```bash
npm install
cd backend && npm install
```

3. **配置环境变量**
```bash
# 前端
cp .env.example .env

# 后端
cp backend/.env.example backend/.env
# 编辑 backend/.env 添加你的AI服务API密钥
```

4. **数据库初始化**
```bash
cd backend
npx prisma migrate dev
```

5. **启动服务**
```bash
# 启动前端 (终端1)
npm run dev

# 启动后端 (终端2)
cd backend && npm run dev
```

访问 http://localhost:3000

### Vercel部署

1. **推送到GitHub**
```bash
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **在Vercel中导入项目**
- 访问 [vercel.com](https://vercel.com)
- 连接GitHub账户
- 导入你的仓库

3. **配置环境变量**
在Vercel项目设置中添加：
```
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
OPENAI_API_KEY=your-openai-api-key
REPLICATE_API_TOKEN=your-replicate-token
STABILITY_API_KEY=your-stability-api-key
```

## 📱 使用指南

### AI人体建模
1. 点击左上角"AI人体扫描"按钮
2. 上传1-10张不同角度的全身照片
3. 选择质量和输出格式
4. 等待AI生成专属3D模型

### AI服装生成
1. 点击左上角"AI服装生成"按钮
2. 选择服装类型（上装/下装/鞋子/配饰）
3. 拍照或上传服装图片
4. AI自动生成3D服装模型

### 智能试穿
1. 在试穿工作室中选择服装
2. 点击服装即可智能贴合到人体模型
3. 保存喜欢的造型到衣柜

## 🔧 开发指南

### 项目结构
```
├── src/                    # 前端源码
│   ├── components/         # React组件
│   │   ├── AI/            # AI功能组件
│   │   ├── TryOnStudio/   # 试穿工作室
│   │   └── ...
│   ├── services/          # API服务
│   └── types/             # TypeScript类型
├── backend/               # 后端源码
│   ├── src/
│   │   ├── routes/        # API路由
│   │   ├── services/      # AI服务
│   │   └── middleware/    # 中间件
│   └── prisma/            # 数据库
└── .kiro/specs/           # 功能规范文档
```

### API接口

#### AI服务
- `POST /api/ai/generate-body-model` - 生成人体3D模型
- `POST /api/ai/generate-clothing-model` - 生成服装3D模型
- `GET /api/ai/service-status` - 获取AI服务状态

#### 用户管理
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/users/me` - 获取用户信息

#### 服装管理
- `GET /api/clothing` - 获取服装列表
- `POST /api/clothing` - 创建服装
- `PUT /api/clothing/:id` - 更新服装
- `DELETE /api/clothing/:id` - 删除服装

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) - 3D渲染
- [OpenAI](https://openai.com) - AI视觉识别
- [Replicate](https://replicate.com) - AI模型服务
- [Stability AI](https://stability.ai) - 图像增强

---

**🎯 体验未来的AI试穿技术！**