import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import * as THREE from 'three';

interface Canvas3DProps {
  className?: string;
  currentClothing?: any;
}

// Avatar组件
function Avatar({ currentClothing }: { currentClothing?: any }) {
  const { scene } = useGLTF('/avatar.glb');
  const avatarRef = useRef<THREE.Group>(null);

  // 复制场景以避免重复使用同一个对象
  const clonedScene = scene.clone();

  useFrame(() => {
    // 这里可以添加动画逻辑
  });

  return (
    <group ref={avatarRef}>
      <primitive 
        object={clonedScene} 
        scale={1} 
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

// 加载中组件
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-muted-foreground text-sm">加载3D模型中...</p>
      </div>
    </div>
  );
}

const Canvas3D: React.FC<Canvas3DProps> = ({ className = '', currentClothing }) => {
  const [controlsRef, setControlsRef] = useState<any>(null);

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

  return (
    <div className={`relative bg-gradient-to-b from-muted to-gray-100 rounded-2xl overflow-hidden ${className}`}>
      {/* 3D场景容器 */}
      <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
        <Canvas
          camera={{ 
            position: [0, 1.6, 3], 
            fov: 50,
            near: 0.1,
            far: 1000
          }}
          shadows
          gl={{ 
            antialias: true,
            alpha: true,
            outputColorSpace: THREE.SRGBColorSpace
          }}
        >
          {/* 环境光照 */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          {/* 环境贴图 */}
          <Environment preset="studio" />

          {/* 3D模型 */}
          <Suspense fallback={null}>
            <Avatar currentClothing={currentClothing} />
          </Suspense>

          {/* 地面阴影 */}
          <ContactShadows 
            position={[0, 0, 0]} 
            opacity={0.4} 
            scale={2} 
            blur={2} 
            far={2}
          />

          {/* 轨道控制器 */}
          <OrbitControls
            ref={setControlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={10}
            target={[0, 1, 0]}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
        </Canvas>

        {/* 加载状态 */}
        <Suspense fallback={<LoadingFallback />}>
          <div />
        </Suspense>
      </div>

      {/* 3D控制按钮 */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={handleReset}
          className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-md transition-all duration-200 min-h-touch min-w-touch hover:shadow-lg"
          aria-label="重置视图"
        >
          <RotateCcw size={16} className="text-foreground" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-md transition-all duration-200 min-h-touch min-w-touch hover:shadow-lg"
          aria-label="放大"
        >
          <ZoomIn size={16} className="text-foreground" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-md transition-all duration-200 min-h-touch min-w-touch hover:shadow-lg"
          aria-label="缩小"
        >
          <ZoomOut size={16} className="text-foreground" />
        </button>
      </div>

      {/* 状态指示器 */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-white/90 px-3 py-2 rounded-lg shadow-sm">
        3D模型就绪
      </div>
    </div>
  );
};

// 预加载模型
useGLTF.preload('/avatar.glb');

export default Canvas3D;