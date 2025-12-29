# CORS修复方案

## 腾讯云COS配置

需要在腾讯云对象存储控制台设置：

1. **登录腾讯云控制台**
2. **进入对象存储COS**
3. **找到存储桶： wardrobe-models-1328066145**
4. **点击「基础配置」->「跨域访问CORS」**
5. **添加CORS规则：**

```xml
来源：*
允许方法：GET, HEAD, OPTIONS
允许头部：*
暴露头部：Content-Type, Content-Length
缓存时间：300秒
```

6. **设置Content-Type：**
   - 在存储桶中选择avatar.glb
   - 右键 -> 「设置Header」
   - 添加：Content-Type = model/gltf-binary

## Vercel环境变量

在Vercel项目设置中添加：
```
NODE_ENV=production
```

## 备用方案

如果CORS修复仍有问题，使用以下CDN替换：
- https://cdn.jsdelivr.net/gh/your-repo/models/avatar.glb
- https://unpkg.com/your-package/avatar.glb