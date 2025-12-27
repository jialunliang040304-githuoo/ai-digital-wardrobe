import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

interface Canvas3DProps {
  className?: string;
  currentClothing?: any;
}

const Canvas3D: React.FC<Canvas3DProps> = ({ className = '', currentClothing }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const avatarRef = useRef<THREE.Group>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 初始化场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // 初始化相机
    const camera = new THREE.PerspectiveCamera(
      50,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 3);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    canvasRef.current.appendChild(renderer.domElement);

    // 添加光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // 添加地面
    const groundGeometry = new THREE.CircleGeometry(2, 32);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 加载avatar.glb模型
    const loader = new GLTFLoader();
    loader.load(
      '/avatar.glb',
      (gltf: any) => {
        const avatar = gltf.scene;
        avatar.scale.set(1, 1, 1);
        avatar.position.set(0, 0, 0);
        
        // 启用阴影
        avatar.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(avatar);
        avatarRef.current = avatar;
        setIsLoading(false);
      },
      (progress: any) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (error: any) => {
        console.error('Error loading avatar:', error);
        setIsLoading(false);
      }
    );

    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // 处理窗口大小变化
    const handleResize = () => {
      if (!canvasRef.current || !camera || !renderer) return;
      
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvasRef.current && renderer.domElement) {
        canvasRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 处理服装换装
  useEffect(() => {
    if (!avatarRef.current || !currentClothing) return;

    // 这里将来实现服装换装逻辑
    console.log('应用服装:', currentClothing);
  }, [currentClothing]);

  const handleReset = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 1.6, 3);
      cameraRef.current.lookAt(0, 1, 0);
    }
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.9);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.1);
    }
  };

  return (
    <div className={`relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* 3D场景容器 */}
      <div 
        ref={canvasRef}
        className="w-full h-full relative"
        style={{ minHeight: '400px' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">加载3D模型中...</p>
            </div>
          </div>
        )}
      </div>

      {/* 3D控制按钮 */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={handleReset}
          className="p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors min-h-touch min-w-touch"
          aria-label="重置视图"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors min-h-touch min-w-touch"
          aria-label="放大"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors min-h-touch min-w-touch"
          aria-label="缩小"
        >
          <ZoomOut size={16} />
        </button>
      </div>

      {/* 状态指示器 */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        {isLoading ? '加载中...' : '3D模型就绪'}
      </div>
    </div>
  );
};

export default Canvas3D;