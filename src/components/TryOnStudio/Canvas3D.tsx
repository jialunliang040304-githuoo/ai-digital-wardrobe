/**
 * 3D Canvas组件 - 加载真实GLB模型
 */

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei';
import { RotateCcw } from 'lucide-react';
import * as THREE from 'three';

interface Canvas3DProps {
  className?: string;
  currentClothing?: any;
}

// 加载中显示
function Loader() {
  return (
    <Html center>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">加载3D模型...</p>
      </div>
    </Html>
  );
}

// Avatar模型组件
function AvatarModel({ url }: { url: string }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  
  // 自动旋转
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  // 克隆场景并设置材质
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  // 计算模型边界来自动缩放和居中
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  
  // 计算缩放比例，使模型高度约为2.5单位
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2.5 / maxDim;

  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        scale={scale}
        position={[-center.x * scale, -center.y * scale + 0.1, -center.z * scale]}
      />
    </group>
  );
}

// 场景内容
function SceneContent({ modelUrl }: { modelUrl: string }) {
  return (
    <>
      {/* 光照 */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      {/* 环境 */}
      <Environment preset="city" />

      {/* 3D模型 */}
      <Suspense fallback={<Loader />}>
        <AvatarModel url={modelUrl} />
      </Suspense>

      {/* 地面阴影 */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />

      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial color="#f0f0f0" transparent opacity={0.8} />
      </mesh>

      {/* 控制器 */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={10}
        target={[0, 1, 0]}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

const Canvas3D: React.FC<Canvas3DProps> = ({ className = '', currentClothing }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 检查WebGL支持
  const [webglSupported, setWebglSupported] = useState(true);
  
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        setWebglSupported(false);
      }
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  // 预加载模型
  useEffect(() => {
    const loadModel = () => {
      try {
        setIsLoading(true);
        useGLTF.preload('/avatar.glb');
        setIsLoading(false);
        setHasError(false);
      } catch (error) {
        console.error('模型加载失败:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };
    loadModel();
  }, []);

  // WebGL不支持
  if (!webglSupported) {
    return (
      <div className={`relative bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">WebGL不支持</h3>
            <p className="text-gray-600">请使用支持WebGL的现代浏览器</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 rounded-2xl overflow-hidden ${className}`}>
      <div className="w-full h-full" style={{ minHeight: '400px' }}>
        <Canvas
          shadows
          camera={{ position: [0, 1.5, 5], fov: 45 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: 'high-performance'
          }}
          onCreated={({ gl }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
          onError={() => setHasError(true)}
        >
          <color attach="background" args={['#f8fafc']} />
          <SceneContent modelUrl="/avatar.glb" />
        </Canvas>
      </div>

      {/* 加载状态覆盖 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">加载3D模型中...</p>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 backdrop-blur-sm rounded-2xl">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">模型加载失败</h3>
            <p className="text-red-600 text-sm mb-4">请检查avatar.glb文件是否存在</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              重新加载
            </button>
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => window.location.reload()}
          className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all min-h-[44px] min-w-[44px]"
          aria-label="重置视图"
        >
          <RotateCcw size={16} className="text-gray-700" />
        </button>
      </div>

      {/* 状态指示器 */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-600 bg-white/90 px-3 py-2 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${hasError ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
          {hasError ? '模型加载失败' : '3D试穿工作室'}
        </div>
      </div>

      {/* 当前穿着指示器 */}
      {currentClothing && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-xs text-gray-600 mb-1">当前穿着</div>
          <div className="flex gap-1">
            {currentClothing.top && <div className="w-3 h-3 bg-blue-500 rounded" title="上装"></div>}
            {currentClothing.bottom && <div className="w-3 h-3 bg-gray-700 rounded" title="下装"></div>}
            {currentClothing.shoes && <div className="w-3 h-3 bg-white border border-gray-300 rounded" title="鞋子"></div>}
            {currentClothing.accessories?.length > 0 && <div className="w-3 h-3 bg-purple-500 rounded" title="配饰"></div>}
          </div>
        </div>
      )}

      {/* 操作提示 */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        拖动旋转 • 滚轮缩放
      </div>
    </div>
  );
};

// 预加载模型
useGLTF.preload('/avatar.glb');

export default Canvas3D;