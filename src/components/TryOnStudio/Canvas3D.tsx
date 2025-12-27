import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import * as THREE from 'three';

interface Canvas3DProps {
  className?: string;
  currentClothing?: any;
}

// Avatar组件 - 修复版本
function Avatar() {
  const avatarRef = useRef<THREE.Group>(null);
  
  const { scene, error } = useGLTF('/avatar.glb', true);
  
  useEffect(() => {
    if (error) {
      console.error('GLTF loading error:', error);
    }
  }, [error]);
  
  if (error || !scene) {
    // 如果模型加载失败，显示一个简单的人形几何体
    return (
      <group ref={avatarRef}>
        {/* 身体 */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.6, 1.6, 0.3]} />
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>
        {/* 头部 */}
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[0.25]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        {/* 左臂 */}
        <mesh position={[-0.5, 1.2, 0]}>
          <boxGeometry args={[0.15, 0.8, 0.15]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        {/* 右臂 */}
        <mesh position={[0.5, 1.2, 0]}>
          <boxGeometry args={[0.15, 0.8, 0.15]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        {/* 左腿 */}
        <mesh position={[-0.15, 0.1, 0]}>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color="#4a90e2" />
        </mesh>
        {/* 右腿 */}
        <mesh position={[0.15, 0.1, 0]}>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color="#4a90e2" />
        </mesh>
      </group>
    );
  }
  
  // 克隆场景以避免多次使用同一对象的问题
  const clonedScene = scene.clone();
  
  // 确保材质正确设置
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        child.material.needsUpdate = true;
      }
    }
  });
  
  return (
    <group ref={avatarRef}>
      <primitive 
        object={clonedScene} 
        scale={[1, 1, 1]} 
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

// 错误边界组件
class Canvas3DErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Canvas3D Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 rounded-2xl" style={{ minHeight: '400px' }}>
          <div className="text-center p-8">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">3D模型准备中</h3>
            <p className="text-gray-600 text-sm mb-4">正在初始化您的虚拟试衣间...</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 加载中组件
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 rounded-2xl">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">正在加载3D模型...</p>
        <p className="text-gray-400 text-xs mt-1">请稍候片刻</p>
      </div>
    </div>
  );
}

const Canvas3D: React.FC<Canvas3DProps> = ({ className = '', currentClothing }) => {
  const [controlsRef, setControlsRef] = useState<any>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // 检查WebGL支持
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGLSupported(false);
      }
    } catch (e) {
      setIsWebGLSupported(false);
    }
    
    // 模拟加载时间
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleReset = () => {
    if (controlsRef) {
      controlsRef.reset();
    }
  };

  const handleZoomIn = () => {
    if (controlsRef) {
      controlsRef.dollyIn(0.9);
      controlsRef.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef) {
      controlsRef.dollyOut(1.1);
      controlsRef.update();
    }
  };

  // 如果不支持WebGL，显示备用界面
  if (!isWebGLSupported) {
    return (
      <div className={`relative bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="text-center p-8">
            <div className="text-6xl mb-4">👗</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">3D试穿工作室</h3>
            <p className="text-gray-600">您的浏览器不支持3D渲染</p>
            <p className="text-gray-500 text-sm mt-2">请使用现代浏览器体验完整功能</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Canvas3DErrorBoundary>
      <div className={`relative bg-gradient-to-b from-blue-50 to-purple-50 rounded-2xl overflow-hidden ${className}`}>
        {/* 3D场景容器 */}
        <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
          {isLoading && <LoadingFallback />}
          
          <Canvas
            camera={{ 
              position: [0, 1.6, 4], 
              fov: 45,
              near: 0.1,
              far: 1000
            }}
            gl={{ 
              antialias: true,
              alpha: true,
              powerPreference: "high-performance"
            }}
            onCreated={({ gl }) => {
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
            }}
          >
            {/* 改进的光照系统 */}
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[5, 10, 5]} 
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-5, 5, 5]} intensity={0.3} />

            {/* 环境光 */}
            <Environment preset="studio" />

            {/* 3D模型 */}
            <Suspense fallback={null}>
              <Avatar />
            </Suspense>

            {/* 改进的地面 */}
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, -0.1, 0]}
              receiveShadow
            >
              <circleGeometry args={[3, 64]} />
              <meshLambertMaterial 
                color="#ffffff" 
                transparent 
                opacity={0.6}
              />
            </mesh>

            {/* 轨道控制器 */}
            <OrbitControls
              ref={setControlsRef}
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={8}
              target={[0, 1, 0]}
              autoRotate={false}
              enableDamping={true}
              dampingFactor={0.05}
            />
          </Canvas>
        </div>

        {/* 3D控制按钮 */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={handleReset}
            className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all duration-200 min-h-touch min-w-touch hover:shadow-xl backdrop-blur-sm"
            aria-label="重置视图"
          >
            <RotateCcw size={16} className="text-gray-700" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all duration-200 min-h-touch min-w-touch hover:shadow-xl backdrop-blur-sm"
            aria-label="放大"
          >
            <ZoomIn size={16} className="text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all duration-200 min-h-touch min-w-touch hover:shadow-xl backdrop-blur-sm"
            aria-label="缩小"
          >
            <ZoomOut size={16} className="text-gray-700" />
          </button>
        </div>

        {/* 状态指示器 */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-600 bg-white/90 px-3 py-2 rounded-lg shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            3D试穿工作室已就绪
          </div>
        </div>

        {/* 当前穿着指示器 */}
        {currentClothing && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-xs text-gray-600 mb-1">当前穿着</div>
            <div className="flex gap-1">
              {currentClothing.top && <div className="w-3 h-3 bg-blue-500 rounded"></div>}
              {currentClothing.bottom && <div className="w-3 h-3 bg-green-500 rounded"></div>}
              {currentClothing.shoes && <div className="w-3 h-3 bg-red-500 rounded"></div>}
              {currentClothing.accessories?.length > 0 && <div className="w-3 h-3 bg-purple-500 rounded"></div>}
            </div>
          </div>
        )}
      </div>
    </Canvas3DErrorBoundary>
  );
};

// 预加载模型（安全版本）
useGLTF.preload('/avatar.glb');

export default Canvas3D;