/**
 * 高斯泼溅3D查看器 - 使用开源库 @mkkellogg/gaussian-splats-3d
 * 
 * 免费开源方案，支持.splat/.ply/.ksplat格式
 * GitHub: https://github.com/mkkellogg/GaussianSplats3D
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Download, Share2, Upload, Camera } from 'lucide-react';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

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
  const [isViewerReady, setIsViewerReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化查看器
  const initViewer = useCallback(async () => {
    if (!containerRef.current || viewerRef.current) return;

    try {
      const viewer = new GaussianSplats3D.Viewer({
        cameraUp: [0, 1, 0],
        initialCameraPosition: [0, 1, 3],
        initialCameraLookAt: [0, 0.5, 0],
        rootElement: containerRef.current,
        selfDrivenMode: true,
        useBuiltInControls: true,
        gpuAcceleratedSort: true,
        sharedMemoryForWorkers: false, // 避免CORS问题
        dynamicScene: false,
        sceneRevealMode: GaussianSplats3D.SceneRevealMode.Gradual,
        antialiased: true,
        sphericalHarmonicsDegree: 0,
        logLevel: GaussianSplats3D.LogLevel.None
      });

      viewerRef.current = viewer;
      setIsViewerReady(true);
    } catch (error) {
      console.error('初始化高斯泼溅查看器失败:', error);
      setLoadError('WebGL初始化失败');
    }
  }, []);

  // 加载splat文件
  const loadSplatFile = useCallback(async (url: string) => {
    if (!viewerRef.current) {
      await initViewer();
    }

    if (!viewerRef.current) return;

    setIsLoading(true);
    setLoadError(null);
    setLoadProgress(0);

    try {
      // 移除之前的场景
      viewerRef.current.removeSplatScene?.(0);

      await viewerRef.current.addSplatScene(url, {
        splatAlphaRemovalThreshold: 5,
        showLoadingUI: false,
        progressiveLoad: true,
        onProgress: (progress: number) => {
          setLoadProgress(Math.round(progress * 100));
        }
      });

      viewerRef.current.start();
      setIsLoading(false);
      onLoad?.();
    } catch (error: any) {
      console.error('加载splat文件失败:', error);
      setIsLoading(false);
      setLoadError(error.message || '文件加载失败');
      onError?.(error);
    }
  }, [initViewer, onLoad, onError]);

  // 处理本地文件上传
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
    await loadSplatFile(url);
  }, [loadSplatFile]);

  // 初始化
  useEffect(() => {
    initViewer();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.dispose?.();
        viewerRef.current = null;
      }
    };
  }, [initViewer]);

  // 加载URL
  useEffect(() => {
    if (splatUrl && isViewerReady) {
      loadSplatFile(splatUrl);
    }
  }, [splatUrl, isViewerReady, loadSplatFile]);

  // 控制函数
  const handleReset = () => {
    if (viewerRef.current) {
      viewerRef.current.setCamera?.([0, 1, 3], [0, 0.5, 0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl overflow-hidden ${className}`}>
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
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">加载高斯泼溅模型...</p>
            <p className="text-purple-600 text-lg font-bold mt-2">{loadProgress}%</p>
            <div className="w-48 h-2 bg-gray-200 rounded-full mt-2 mx-auto">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/80 backdrop-blur-sm">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-600 font-medium">模型加载失败</p>
            <p className="text-red-400 text-sm mt-1">{loadError}</p>
            <button
              onClick={handleUploadClick}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              重新上传
            </button>
          </div>
        </div>
      )}

      {/* 无模型占位 */}
      {!splatUrl && !isLoading && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">高斯泼溅3D查看器</h3>
            <p className="text-gray-500 mb-4">上传.splat/.ply/.ksplat文件查看3D模型</p>
            
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
              基于开源库 GaussianSplats3D · 完全免费
            </p>
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={handleReset}
          className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all min-h-[44px] min-w-[44px]"
          aria-label="重置视图"
        >
          <RotateCcw size={16} className="text-gray-700" />
        </button>
        <button
          onClick={handleUploadClick}
          className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all min-h-[44px] min-w-[44px]"
          aria-label="上传模型"
        >
          <Upload size={16} className="text-gray-700" />
        </button>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="text-xs text-gray-600 bg-white/90 px-3 py-2 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            高斯泼溅 · 开源免费
          </div>
        </div>
        
        <div className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
          拖动旋转 · 滚轮缩放
        </div>
      </div>
    </div>
  );
};

export default GaussianSplatViewer;
