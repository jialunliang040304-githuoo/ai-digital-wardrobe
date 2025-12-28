/**
 * 高斯泼溅3D查看器 - 简化稳定版本
 * 
 * 支持上传.splat/.ply文件查看
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { RotateCcw, Upload, Box, Sparkles } from 'lucide-react';

interface GaussianSplatViewerProps {
  splatUrl?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const GaussianSplatViewer: React.FC<GaussianSplatViewerProps> = ({
  splatUrl,
  className = '',
  onLoad,
  onError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hasModel, setHasModel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 动态加载GaussianSplats3D库
  const loadViewer = useCallback(async (url: string) => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setLoadError(null);
    setLoadProgress(0);

    try {
      // 动态导入库
      const GaussianSplats3D = await import('@mkkellogg/gaussian-splats-3d');
      
      // 清理旧的viewer
      if (viewerRef.current) {
        try {
          viewerRef.current.dispose();
        } catch (e) {
          console.warn('清理旧viewer失败:', e);
        }
        viewerRef.current = null;
      }

      // 清空容器
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      const viewer = new GaussianSplats3D.Viewer({
        cameraUp: [0, 1, 0],
        initialCameraPosition: [0, 1, 3],
        initialCameraLookAt: [0, 0.5, 0],
        rootElement: containerRef.current,
        selfDrivenMode: true,
        useBuiltInControls: true,
        gpuAcceleratedSort: false,
        sharedMemoryForWorkers: false,
        dynamicScene: false,
        sceneRevealMode: GaussianSplats3D.SceneRevealMode.Gradual,
        antialiased: false,
        sphericalHarmonicsDegree: 0,
        logLevel: GaussianSplats3D.LogLevel.None
      });

      viewerRef.current = viewer;

      await viewer.addSplatScene(url, {
        splatAlphaRemovalThreshold: 5,
        showLoadingUI: false,
        progressiveLoad: false
      });

      viewer.start();
      setHasModel(true);
      setIsLoading(false);
      onLoad?.();
    } catch (error: any) {
      console.error('加载高斯泼溅模型失败:', error);
      setIsLoading(false);
      setLoadError(error.message || '加载失败');
      onError?.(error);
    }
  }, [onLoad, onError]);

  // 处理文件上传
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.splat', '.ply', '.ksplat'];
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(ext)) {
      setLoadError('不支持的文件格式，请上传.splat/.ply/.ksplat文件');
      return;
    }

    const url = URL.createObjectURL(file);
    await loadViewer(url);
  }, [loadViewer]);

  // 加载URL
  useEffect(() => {
    if (splatUrl) {
      loadViewer(splatUrl);
    }
  }, [splatUrl, loadViewer]);

  // 清理
  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.dispose();
        } catch (e) {
          console.warn('清理viewer失败:', e);
        }
      }
    };
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative bg-gradient-to-b from-purple-50 to-indigo-100 rounded-2xl overflow-hidden ${className}`}>
      {/* 渲染容器 */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".splat,.ply,.ksplat"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">加载高斯泼溅模型...</p>
            <p className="text-purple-600 text-lg font-bold mt-2">{loadProgress}%</p>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 backdrop-blur-sm">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-600 font-medium mb-2">加载失败</p>
            <p className="text-red-400 text-sm mb-4">{loadError}</p>
            <button
              onClick={handleUploadClick}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              重新上传
            </button>
          </div>
        </div>
      )}

      {/* 无模型占位 */}
      {!splatUrl && !isLoading && !loadError && !hasModel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">高斯泼溅3D查看器</h3>
            <p className="text-gray-500 mb-4">上传.splat/.ply文件查看3D模型</p>
            
            <button
              onClick={handleUploadClick}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <Upload size={18} />
              上传模型文件
            </button>

            <div className="mt-6 flex gap-2 justify-center flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">.splat</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">.ply</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">.ksplat</span>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              基于开源库 · 完全免费
            </p>
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={handleUploadClick}
          className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all min-h-[44px] min-w-[44px]"
          aria-label="上传模型"
        >
          <Upload size={16} className="text-gray-700" />
        </button>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-600 bg-white/90 px-3 py-2 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          高斯泼溅 · 开源免费
        </div>
      </div>
    </div>
  );
};

export default GaussianSplatViewer;
