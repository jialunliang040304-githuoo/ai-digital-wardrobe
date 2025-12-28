/**
 * 增强分享组件
 * 提供多平台分享、生成分享卡片、添加水印等功能
 */

import React, { useState, useRef, useEffect } from 'react';
import { Share2, Download, Copy, QrCode, Instagram, MessageCircle, Mail, Link, Image as ImageIcon, Palette, Type, Sparkles } from 'lucide-react';
import { SavedLook } from '../../types';

interface ShareEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  look: SavedLook;
  screenshot?: string;
}

interface ShareTemplate {
  id: string;
  name: string;
  preview: string;
  style: {
    background: string;
    textColor: string;
    accentColor: string;
    layout: 'minimal' | 'detailed' | 'story';
  };
}

const shareTemplates: ShareTemplate[] = [
  {
    id: 'minimal',
    name: '简约风格',
    preview: '🎨',
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      accentColor: '#ffd700',
      layout: 'minimal'
    }
  },
  {
    id: 'elegant',
    name: '优雅风格',
    preview: '✨',
    style: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      textColor: '#ffffff',
      accentColor: '#ffffff',
      layout: 'detailed'
    }
  },
  {
    id: 'modern',
    name: '现代风格',
    preview: '🌟',
    style: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      textColor: '#ffffff',
      accentColor: '#ffff00',
      layout: 'story'
    }
  },
  {
    id: 'dark',
    name: '暗黑风格',
    preview: '🖤',
    style: {
      background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      textColor: '#ffffff',
      accentColor: '#00d4ff',
      layout: 'minimal'
    }
  }
];

const ShareEnhanced: React.FC<ShareEnhancedProps> = ({
  isOpen,
  onClose,
  look,
  screenshot
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(shareTemplates[0]);
  const [customText, setCustomText] = useState(`刚刚用AI数字衣柜创建了这个穿搭：${look.name} ✨`);
  const [showQR, setShowQR] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成分享卡片
  const generateShareCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸 (Instagram Story 比例)
    canvas.width = 1080;
    canvas.height = 1920;

    // 绘制背景
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (selectedTemplate.style.background.includes('gradient')) {
      // 解析渐变色
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制主要内容区域
    const contentY = 400;
    const contentHeight = 1120;
    
    // 绘制白色内容背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.roundRect(80, contentY, canvas.width - 160, contentHeight, 40);
    ctx.fill();

    // 绘制穿搭截图区域
    if (screenshot) {
      const img = new Image();
      img.onload = () => {
        const imgSize = 600;
        const imgX = (canvas.width - imgSize) / 2;
        const imgY = contentY + 60;
        
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgSize, imgSize, 20);
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        ctx.restore();
        
        // 继续绘制其他元素
        drawTextElements();
      };
      img.src = screenshot;
    } else {
      // 绘制占位符
      ctx.fillStyle = '#f0f0f0';
      const imgSize = 600;
      const imgX = (canvas.width - imgSize) / 2;
      const imgY = contentY + 60;
      ctx.roundRect(imgX, imgY, imgSize, imgSize, 20);
      ctx.fill();
      
      // 绘制占位符图标
      ctx.fillStyle = '#cccccc';
      ctx.font = '120px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('👗', canvas.width / 2, imgY + imgSize / 2 + 40);
      
      drawTextElements();
    }

    function drawTextElements() {
      // 绘制标题
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(look.name, canvas.width / 2, contentY + 760);

      // 绘制标签
      const tags = look.tags.slice(0, 3);
      let tagY = contentY + 840;
      tags.forEach((tag, index) => {
        const tagWidth = 200;
        const tagHeight = 60;
        const tagX = (canvas.width - (tags.length * tagWidth + (tags.length - 1) * 20)) / 2 + index * (tagWidth + 20);
        
        // 绘制标签背景
        ctx.fillStyle = selectedTemplate.style.accentColor;
        ctx.roundRect(tagX, tagY, tagWidth, tagHeight, 30);
        ctx.fill();
        
        // 绘制标签文字
        ctx.fillStyle = '#ffffff';
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`#${tag}`, tagX + tagWidth / 2, tagY + 40);
      });

      // 绘制自定义文字
      ctx.fillStyle = '#666666';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      const lines = wrapText(ctx, customText, canvas.width - 200);
      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, contentY + 980 + index * 50);
      });

      // 绘制底部品牌信息
      ctx.fillStyle = '#999999';
      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('AI数字衣柜 - 智能穿搭助手', canvas.width / 2, contentY + contentHeight - 60);

      // 绘制装饰元素
      drawDecorations();
    }

    function drawDecorations() {
      // 绘制顶部装饰
      ctx.fillStyle = selectedTemplate.style.accentColor;
      for (let i = 0; i < 5; i++) {
        const x = 200 + i * 160;
        const y = 200;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // 绘制底部装饰
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i < 3; i++) {
        const x = 300 + i * 240;
        const y = 1700;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    }

    // 转换为图片
    const dataURL = canvas.toDataURL('image/png', 0.9);
    setGeneratedImage(dataURL);
  };

  useEffect(() => {
    if (isOpen) {
      generateShareCard();
    }
  }, [isOpen, selectedTemplate, customText, screenshot]);

  const handleShare = async (platform: string) => {
    if (!generatedImage) return;

    switch (platform) {
      case 'download':
        // 下载图片
        const link = document.createElement('a');
        link.download = `${look.name}-分享卡片.png`;
        link.href = generatedImage;
        link.click();
        break;
        
      case 'copy':
        // 复制链接
        const shareUrl = `${window.location.origin}/look/${look.id}`;
        await navigator.clipboard.writeText(shareUrl);
        alert('链接已复制到剪贴板');
        break;
        
      case 'instagram':
        // Instagram 分享 (需要用户手动操作)
        alert('请保存图片后在Instagram中分享');
        break;
        
      case 'wechat':
        // 微信分享 (显示二维码)
        setShowQR(true);
        break;
        
      default:
        console.log(`分享到 ${platform}`);
    }
  };

  const shareOptions = [
    { id: 'download', name: '下载图片', icon: Download, color: 'bg-green-500' },
    { id: 'copy', name: '复制链接', icon: Copy, color: 'bg-blue-500' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500' },
    { id: 'wechat', name: '微信', icon: MessageCircle, color: 'bg-green-600' },
    { id: 'email', name: '邮件', icon: Mail, color: 'bg-gray-500' },
    { id: 'link', name: '生成链接', icon: Link, color: 'bg-purple-500' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="text-blue-500" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">分享穿搭</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* 模板选择 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Palette size={16} />
              选择模板
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {shareTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedTemplate.id === template.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{template.preview}</div>
                  <div className="text-xs font-medium text-gray-700">{template.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 自定义文字 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Type size={16} />
              自定义文字
            </h3>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="添加你的分享文字..."
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* 预览区域 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <ImageIcon size={16} />
              预览效果
            </h3>
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              {generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt="分享卡片预览"
                  className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                  style={{ maxHeight: '300px' }}
                />
              ) : (
                <div className="py-12">
                  <Sparkles className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500">正在生成分享卡片...</p>
                </div>
              )}
            </div>
          </div>

          {/* 分享选项 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">分享到</h3>
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleShare(option.id)}
                  className={`p-4 rounded-xl text-center transition-all hover:scale-105 ${option.color} text-white`}
                >
                  <option.icon size={24} className="mx-auto mb-2" />
                  <div className="text-xs font-medium">{option.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 分享统计 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">分享统计</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">0</div>
                <div className="text-xs text-gray-600">今日分享</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">0</div>
                <div className="text-xs text-gray-600">总分享数</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">0</div>
                <div className="text-xs text-gray-600">获得点赞</div>
              </div>
            </div>
          </div>
        </div>

        {/* 隐藏的画布 */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {/* 二维码模态框 */}
        {showQR && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
            <div className="bg-white rounded-2xl p-6 max-w-sm mx-4">
              <div className="text-center">
                <QrCode size={32} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">微信扫码分享</h3>
                <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-500">二维码占位符</span>
                </div>
                <button
                  onClick={() => setShowQR(false)}
                  className="w-full bg-gray-500 text-white py-2 rounded-lg"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareEnhanced;