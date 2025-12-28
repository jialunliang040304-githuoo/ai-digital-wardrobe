/**
 * 颜色搭配助手组件
 * 提供智能颜色匹配建议和色彩理论指导
 */

import React, { useState, useEffect } from 'react';
import { Palette, Eye, Lightbulb, RefreshCw } from 'lucide-react';
import { ClothingItem } from '../../types';

interface ColorMatcherProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: ClothingItem;
  availableItems: ClothingItem[];
  onSelectMatch: (items: ClothingItem[]) => void;
}

interface ColorInfo {
  name: string;
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
}

interface ColorScheme {
  name: string;
  description: string;
  colors: ColorInfo[];
  type: 'complementary' | 'analogous' | 'triadic' | 'monochromatic';
}

// 预定义颜色库
const colorPalette: ColorInfo[] = [
  { name: '纯白', hex: '#FFFFFF', rgb: [255, 255, 255], hsl: [0, 0, 100] },
  { name: '象牙白', hex: '#FFFBF0', rgb: [255, 251, 240], hsl: [44, 100, 97] },
  { name: '米白', hex: '#F5F5DC', rgb: [245, 245, 220], hsl: [60, 56, 91] },
  { name: '浅灰', hex: '#D3D3D3', rgb: [211, 211, 211], hsl: [0, 0, 83] },
  { name: '中灰', hex: '#808080', rgb: [128, 128, 128], hsl: [0, 0, 50] },
  { name: '深灰', hex: '#404040', rgb: [64, 64, 64], hsl: [0, 0, 25] },
  { name: '纯黑', hex: '#000000', rgb: [0, 0, 0], hsl: [0, 0, 0] },
  { name: '海军蓝', hex: '#000080', rgb: [0, 0, 128], hsl: [240, 100, 25] },
  { name: '天空蓝', hex: '#87CEEB', rgb: [135, 206, 235], hsl: [197, 71, 73] },
  { name: '深蓝', hex: '#003366', rgb: [0, 51, 102], hsl: [210, 100, 20] },
  { name: '薄荷绿', hex: '#98FB98', rgb: [152, 251, 152], hsl: [120, 93, 79] },
  { name: '森林绿', hex: '#228B22', rgb: [34, 139, 34], hsl: [120, 61, 34] },
  { name: '橄榄绿', hex: '#808000', rgb: [128, 128, 0], hsl: [60, 100, 25] },
  { name: '珊瑚红', hex: '#FF7F50', rgb: [255, 127, 80], hsl: [16, 100, 66] },
  { name: '深红', hex: '#8B0000', rgb: [139, 0, 0], hsl: [0, 100, 27] },
  { name: '粉红', hex: '#FFC0CB', rgb: [255, 192, 203], hsl: [350, 100, 88] },
  { name: '紫色', hex: '#800080', rgb: [128, 0, 128], hsl: [300, 100, 25] },
  { name: '薰衣草', hex: '#E6E6FA', rgb: [230, 230, 250], hsl: [240, 67, 94] },
  { name: '金黄', hex: '#FFD700', rgb: [255, 215, 0], hsl: [51, 100, 50] },
  { name: '橙色', hex: '#FFA500', rgb: [255, 165, 0], hsl: [39, 100, 50] },
  { name: '棕色', hex: '#8B4513', rgb: [139, 69, 19], hsl: [25, 76, 31] },
  { name: '卡其', hex: '#F0E68C', rgb: [240, 230, 140], hsl: [54, 77, 75] }
];

const ColorMatcher: React.FC<ColorMatcherProps> = ({
  isOpen,
  onClose,
  selectedItem,
  availableItems,
  onSelectMatch
}) => {
  const [selectedColor, setSelectedColor] = useState<ColorInfo | null>(null);
  const [colorSchemes, setColorSchemes] = useState<ColorScheme[]>([]);
  const [matchingItems, setMatchingItems] = useState<ClothingItem[]>([]);
  const [activeScheme, setActiveScheme] = useState<string>('complementary');

  // 颜色理论函数
  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // 生成配色方案
  const generateColorSchemes = (baseColor: ColorInfo): ColorScheme[] => {
    const [h, s, l] = baseColor.hsl;
    const schemes: ColorScheme[] = [];

    // 互补色
    const complementaryHue = (h + 180) % 360;
    const complementaryRgb = hslToRgb(complementaryHue, s, l);
    schemes.push({
      name: '互补色搭配',
      description: '对比强烈，视觉冲击力强',
      type: 'complementary',
      colors: [
        baseColor,
        {
          name: '互补色',
          hex: rgbToHex(...complementaryRgb),
          rgb: complementaryRgb,
          hsl: [complementaryHue, s, l]
        }
      ]
    });

    // 类似色
    const analogous1Hue = (h + 30) % 360;
    const analogous2Hue = (h - 30 + 360) % 360;
    const analogous1Rgb = hslToRgb(analogous1Hue, s, l);
    const analogous2Rgb = hslToRgb(analogous2Hue, s, l);
    schemes.push({
      name: '类似色搭配',
      description: '和谐统一，温和舒适',
      type: 'analogous',
      colors: [
        {
          name: '类似色1',
          hex: rgbToHex(...analogous2Rgb),
          rgb: analogous2Rgb,
          hsl: [analogous2Hue, s, l]
        },
        baseColor,
        {
          name: '类似色2',
          hex: rgbToHex(...analogous1Rgb),
          rgb: analogous1Rgb,
          hsl: [analogous1Hue, s, l]
        }
      ]
    });

    // 三角色
    const triadic1Hue = (h + 120) % 360;
    const triadic2Hue = (h + 240) % 360;
    const triadic1Rgb = hslToRgb(triadic1Hue, s, l);
    const triadic2Rgb = hslToRgb(triadic2Hue, s, l);
    schemes.push({
      name: '三角色搭配',
      description: '活泼生动，平衡协调',
      type: 'triadic',
      colors: [
        baseColor,
        {
          name: '三角色1',
          hex: rgbToHex(...triadic1Rgb),
          rgb: triadic1Rgb,
          hsl: [triadic1Hue, s, l]
        },
        {
          name: '三角色2',
          hex: rgbToHex(...triadic2Rgb),
          rgb: triadic2Rgb,
          hsl: [triadic2Hue, s, l]
        }
      ]
    });

    // 单色系
    const mono1Rgb = hslToRgb(h, s, Math.max(10, l - 20));
    const mono2Rgb = hslToRgb(h, s, Math.min(90, l + 20));
    schemes.push({
      name: '单色系搭配',
      description: '优雅简约，层次丰富',
      type: 'monochromatic',
      colors: [
        {
          name: '深色调',
          hex: rgbToHex(...mono1Rgb),
          rgb: mono1Rgb,
          hsl: [h, s, Math.max(10, l - 20)]
        },
        baseColor,
        {
          name: '浅色调',
          hex: rgbToHex(...mono2Rgb),
          rgb: mono2Rgb,
          hsl: [h, s, Math.min(90, l + 20)]
        }
      ]
    });

    return schemes;
  };

  // 计算颜色相似度
  const calculateColorSimilarity = (color1: ColorInfo, color2: ColorInfo): number => {
    const [h1, s1, l1] = color1.hsl;
    const [h2, s2, l2] = color2.hsl;
    
    // 色相差异（考虑环形特性）
    const hueDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
    const satDiff = Math.abs(s1 - s2);
    const lightDiff = Math.abs(l1 - l2);
    
    // 加权计算相似度
    const similarity = 100 - (hueDiff * 0.4 + satDiff * 0.3 + lightDiff * 0.3);
    return Math.max(0, similarity);
  };

  // 查找匹配的服装
  const findMatchingItems = (targetColors: ColorInfo[]) => {
    const matches: ClothingItem[] = [];
    
    availableItems.forEach(item => {
      // 这里简化处理，实际应该分析服装的主要颜色
      // 现在随机选择一些物品作为匹配结果
      if (Math.random() > 0.7) {
        matches.push(item);
      }
    });
    
    setMatchingItems(matches.slice(0, 6)); // 最多显示6个匹配项
  };

  useEffect(() => {
    if (selectedColor) {
      const schemes = generateColorSchemes(selectedColor);
      setColorSchemes(schemes);
      
      const activeSchemeData = schemes.find(s => s.type === activeScheme);
      if (activeSchemeData) {
        findMatchingItems(activeSchemeData.colors);
      }
    }
  }, [selectedColor, activeScheme, availableItems]);

  const getSchemeIcon = (type: string) => {
    switch (type) {
      case 'complementary': return '🎯';
      case 'analogous': return '🌈';
      case 'triadic': return '🔺';
      case 'monochromatic': return '🎨';
      default: return '🎨';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="text-pink-500" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">颜色搭配助手</h2>
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
          {/* 颜色选择器 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">选择基础颜色</h3>
            <div className="grid grid-cols-6 gap-2">
              {colorPalette.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    selectedColor?.hex === color.hex
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
            {selectedColor && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg border border-gray-200"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{selectedColor.name}</div>
                    <div className="text-xs text-gray-500">{selectedColor.hex}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 配色方案 */}
          {selectedColor && colorSchemes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">配色方案</h3>
              <div className="space-y-3">
                {colorSchemes.map((scheme, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      activeScheme === scheme.type
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveScheme(scheme.type)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getSchemeIcon(scheme.type)}</span>
                        <span className="font-medium text-gray-900">{scheme.name}</span>
                      </div>
                      {activeScheme === scheme.type && (
                        <Eye className="text-pink-500" size={16} />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{scheme.description}</p>
                    <div className="flex gap-2">
                      {scheme.colors.map((color, colorIndex) => (
                        <div key={colorIndex} className="text-center">
                          <div
                            className="w-8 h-8 rounded-lg border border-gray-200 mb-1"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="text-xs text-gray-500 w-8 truncate">
                            {color.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 匹配的服装 */}
          {matchingItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">匹配的服装</h3>
                <button
                  onClick={() => findMatchingItems(colorSchemes.find(s => s.type === activeScheme)?.colors || [])}
                  className="text-xs text-pink-600 hover:text-pink-700 flex items-center gap-1"
                >
                  <RefreshCw size={12} />
                  刷新
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {matchingItems.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                      {item.texture && item.texture.startsWith('data:image') ? (
                        <img 
                          src={item.texture} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl">
                          {item.category === 'tops' ? '👕' :
                           item.category === 'bottoms' ? '👖' :
                           item.category === 'shoes' ? '👟' : '👜'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 truncate">{item.name}</div>
                  </div>
                ))}
              </div>
              
              {matchingItems.length > 0 && (
                <button
                  onClick={() => onSelectMatch(matchingItems)}
                  className="w-full mt-4 bg-pink-500 text-white py-3 rounded-xl font-medium hover:bg-pink-600 transition-colors"
                >
                  应用搭配建议
                </button>
              )}
            </div>
          )}

          {/* 颜色理论小贴士 */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="text-blue-600" size={16} />
              <h4 className="text-sm font-medium text-blue-900">搭配小贴士</h4>
            </div>
            <div className="space-y-1 text-xs text-blue-700">
              <div>• 互补色搭配适合需要突出重点的场合</div>
              <div>• 类似色搭配营造和谐统一的视觉效果</div>
              <div>• 单色系搭配显得优雅且不易出错</div>
              <div>• 三角色搭配适合活泼年轻的风格</div>
              <div>• 中性色（黑白灰）是万能的搭配基础</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorMatcher;