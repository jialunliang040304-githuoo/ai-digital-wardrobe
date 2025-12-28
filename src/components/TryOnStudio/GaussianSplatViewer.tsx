/**
 * 3D Gaussian Splatting 查看器
 * 
 * 使用WebGL渲染高斯泼溅模型
 * 支持.splat和.ply格式
 */

import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Download, Share2 } from 'lucide-react';

interface GaussianSplatViewerProps {
  splatUrl?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// 简化的高斯泼溅渲染器
// 实际生产中建议使用 @mkkellogg/gaussian-splats-3d 或 gsplat.js
class SimpleSplatRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private rotation = { x: 0, y: 0 };
  private zoom = 1;
  private isDragging = false;
  private lastMouse = { x: 0, y: 0 };
  private animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.initGL();
    this.setupEvents();
  }

  private initGL() {
    this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
    if (!this.gl) {
      console.error('WebGL不支持');
      return;
    }

    const gl = this.gl;
    gl.clearColor(0.95, 0.95, 0.98, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  private setupEvents() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.onWheel.bind(this));
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  private onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.lastMouse = { x: e.clientX, y: e.clientY };
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.lastMouse.x;
    const dy = e.clientY - this.lastMouse.y;
    this.rotation.y += dx * 0.5;
    this.rotation.x += dy * 0.5;
    this.lastMouse = { x: e.clientX, y: e.clientY };
  }

  private onMouseUp() {
    this.isDragging = false;
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();
    this.zoom *= e.deltaY > 0 ? 0.95 : 1.05;
    this.zoom = Math.max(0.5, Math.min(3, this.zoom));
  }

  private onTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  private onTouchMove(e: TouchEvent) {
    if (!this.isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - this.lastMouse.x;
    const dy = e.touches[0].clientY - this.lastMouse.y;
    this.rotation.y += dx * 0.5;
    this.rotation.x += dy * 0.5;
    this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  private onTouchEnd() {
    this.isDragging = false;
  }

  async loadSplat(url: string): Promise<void> {
    // 实际实现中需要解析.splat文件格式
    // 这里简化为显示占位内容
    console.log('Loading splat from:', url);
    this.render();
  }

  render() {
    if (!this.gl) return;

    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 简化渲染 - 实际需要实现高斯泼溅着色器
    // 这里只是占位

    this.animationId = requestAnimationFrame(() => this.render());
  }

  reset() {
    this.rotation = { x: 0, y: 0 };
    this.zoom = 1;
  }

  zoomIn() {
    this.zoom = Math.min(3, this.zoom * 1.2);
  }

  zoomOut() {
    this.zoom = Math.max(0.5, this.zoom * 0.8);
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

const GaussianSplatViewer: React.FC<GaussianSplatViewerProps> = ({
  splatUrl,
  className = '',
  onLoad,
  onError
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SimpleSplatRenderer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    rendererRef.current = new SimpleSplatRenderer(canvasRef.current);

    if (splatUrl) {
      setIsLoading(true);
      setLoadError(null);
      
      rendererRef.current.loadSplat(splatUrl)
        .then(() => {
          setIsLoading(false);
          onLoad?.();
        })
        .catch((error) => {
          setIsLoading(false);
          setLoadError(error.message);
          onError?.(error);
        });
    } else {
      setIsLoading(false);
    }

    return () => {
      rendererRef.current?.dispose();
    };
  }, [splatUrl]);

  const handleReset = () => rendererRef.current?.reset();
  const handleZoomIn = () => rendererRef.current?.zoomIn();
  const handleZoomOut = () => rendererRef.current?.zoomOut();

  return (
    <div className={`relative bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl overflow-hidden ${className}`}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">加载高斯泼溅模型...</p>
            <p className="text-gray-400 text-sm mt-1">3D Gaussian Splatting</p>
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
          </div>
        </div>
      )}

      {/* 无模型占位 */}
      {!splatUrl && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">高斯泼溅3D查看器</h3>
            <p className="text-gray-500">上传视频或图片生成3D模型</p>
            <div className="mt-4 flex gap-2 justify-center">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">支持.splat</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">支持.ply</span>
            </div>
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
          onClick={handleZoomIn}
          className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all min-h-[44px] min-w-[44px]"
          aria-label="放大"
        >
          <ZoomIn size={16} className="text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all min-h-[44px] min-w-[44px]"
          aria-label="缩小"
        >
          <ZoomOut size={16} className="text-gray-700" />
        </button>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="text-xs text-gray-600 bg-white/90 px-3 py-2 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            3D Gaussian Splatting
          </div>
        </div>
        
        {splatUrl && (
          <div className="flex gap-2">
            <button className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-all">
              <Download size={14} className="text-gray-600" />
            </button>
            <button className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-all">
              <Share2 size={14} className="text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GaussianSplatViewer;
