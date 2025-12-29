/**
 * 测试3D Canvas组件 - 简化版本，用于调试
 */

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

interface TestCanvas3DProps {
  className?: string;
}

// 简单的加载器
function SimpleLoader() {
  return (
    <Html center>
      <div style={{ textAlign: 'center', color: '#666' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 10px'
        }}></div>
        <p>加载测试模型...</p>
      </div>
    </Html>
  );
}

// 简单的Avatar组件 - 不使用Meshopt
function SimpleAvatar() {
  const group = useRef<THREE.Group>(null);
  const [error, setError] = useState<string | null>(null);
  
  console.log('🔄 尝试加载 /avatar.glb');
  
  try {
    // 不使用Meshopt解码器，直接加载
    const { scene } = useGLTF('/avatar.glb');
    
    useFrame((state) => {
      if (group.current) {
        group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      }
    });

    useEffect(() => {
      if (scene) {
        console.log('✅ 测试模型加载成功!');
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }
    }, [scene]);

    return (
      <group ref={group}>
        <primitive 
          object={scene} 
          scale={1.5}
          position={[0, -1, 0]}
        />
      </group>
    );
  } catch (err) {
    console.error('❌ 测试模型加载错误:', err);
    setError(err instanceof Error ? err.message : '模型加载失败');
    
    return (
      <Html center>
        <div style={{ textAlign: 'center', color: '#e74c3c' }}>
          <p>❌ 测试模型加载失败</p>
          <p style={{ fontSize: '12px' }}>{error}</p>
        </div>
      </Html>
    );
  }
}

// 简单场景
function SimpleScene() {
  return (
    <>
      {/* 基础光照 */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      
      {/* 模型 */}
      <Suspense fallback={<SimpleLoader />}>
        <SimpleAvatar />
      </Suspense>
      
      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* 控制器 */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={8}
        target={[0, 0, 0]}
      />
    </>
  );
}

const TestCanvas3D: React.FC<TestCanvas3DProps> = ({ className = '' }) => {
  const [canvasError, setCanvasError] = useState<string | null>(null);

  const handleError = (error: any) => {
    console.error('❌ Canvas错误:', error);
    setCanvasError(error?.message || '渲染错误');
  };

  if (canvasError) {
    return (
      <div className={`relative bg-red-50 rounded-2xl overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">💥</div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">测试Canvas失败</h3>
            <p className="text-red-600 text-sm mb-4">{canvasError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-b from-blue-50 to-green-50 rounded-2xl overflow-hidden ${className}`}>
      <div className="w-full h-full" style={{ minHeight: '400px' }}>
        <Canvas
          camera={{ position: [0, 2, 6], fov: 50 }}
          onError={handleError}
        >
          <SimpleScene />
        </Canvas>
      </div>
      
      {/* 测试标识 */}
      <div className="absolute top-4 left-4 bg-blue-100 border border-blue-300 rounded-lg p-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-blue-700 font-medium">测试模式</span>
        </div>
      </div>
      
      {/* 操作提示 */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        拖动旋转 • 滚轮缩放
      </div>
    </div>
  );
};

export default TestCanvas3D;