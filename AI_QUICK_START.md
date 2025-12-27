# AI功能快速启动指南

## 🎯 当前状态
- ✅ 3D显示已修复 (使用CSS 3D，100%兼容)
- ✅ AI服务框架已搭建
- ⏳ 需要配置API密钥启用真实AI功能

## 🚀 启用AI功能 - 3步完成

### 第1步: 获取Replicate API密钥
1. 访问 https://replicate.com
2. 注册账号 (可用GitHub登录)
3. 进入 Settings → API tokens
4. 复制你的API token

### 第2步: 配置环境变量
```bash
# 编辑 backend/.env 文件
echo "REPLICATE_API_TOKEN=r8_你的token" >> backend/.env
```

### 第3步: 重启后端服务
```bash
cd backend
npm run dev
```

## 💰 费用说明
- Replicate按使用量计费
- 图片转3D: 约$0.02-0.05/次
- 虚拟试穿: 约$0.03-0.05/次
- 新用户有免费额度

## 🔧 测试AI服务
```bash
# 检查AI服务状态
curl http://localhost:5001/api/ai/test
```

## 📱 使用流程
1. 打开应用 → 点击"试穿"
2. 点击右上角人形图标 → AI人体扫描
3. 点击衣服图标 → AI服装生成
4. 选择衣柜中的服装 → 虚拟试穿

## 🎨 当前3D效果
- 使用CSS 3D变换的卡通人物
- 支持拖动旋转
- 支持缩放
- 自动旋转动画

## 📞 需要帮助?
查看完整文档: AI_IMPLEMENTATION_GUIDE.md