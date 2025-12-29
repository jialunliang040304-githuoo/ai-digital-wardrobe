/**
 * 3D Canvas组件 - 加载真实GLB模型并显示服装
 */

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html, useTexture } from '@react-three/drei';
import { RotateCcw } from 'lucide-react';
import * as THREE from 'three';
// 尝试不同的导入方式
// import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

interface Canvas3DProps {
  className?: string;
  currentClothing?: {
    top?: { texture?: string; name?: string };
    bottom?: { texture?: string; name?: string };
    shoes?: { texture?: string; name?: string };
    accessories?: Array<{ texture?: string; name?: string }>;
  };
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

// 服装贴图平面组件
function ClothingPlane({ 
  textureUrl, 
  position, 
  scale = [0.8, 0.8, 1],
  rotation = [0, 0, 0]
}: { 
  textureUrl: string; 
  position: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // 创建纹理
  const texture = useTexture(textureUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((state) => {
    if (meshRef.current) {
      // 轻微浮动效果
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation as any}>
      <planeGeometry args={[scale[0], scale[1]]} />
      <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

// Avatar模型组件 - 使用本地压缩模型
function AvatarModel({ url }: { url: string }) {
  const group = useRef<THREE.Group>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 使用本地压缩模型，备用CDN模型
  const fallbackUrls = [
    '/avatar.glb', // 本地压缩模型（12MB）
    'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb', // CDN备用
    'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb' // 小鸭子
  ];
  
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const modelUrl = fallbackUrls[currentUrlIndex];
  
  console.log(`🔗 使用模型链接 ${currentUrlIndex + 1}/${fallbackUrls.length}:`, modelUrl);
  
  try {
    // 先尝试不使用Meshopt解码器
    const { scene } = useGLTF(modelUrl);
    
    useFrame((state) => {
      if (group.current) {
        group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      }
    });

    useEffect(() => {
      if (scene) {
        console.log('✅ 模型场景加载成功:', modelUrl);
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.needsUpdate = true;
            }
          }
        });
      }
    }, [scene]);

    // 智能缩放 - 原始avatar.glb使用1.5，其他模型调整
    const scale = modelUrl.includes('avatar.glb') ? 1.5 : 
                  modelUrl.includes('RobotExpressive') ? 0.8 : 
                  modelUrl.includes('Duck') ? 2.0 : 1.2;

    return (
      <group ref={group}>
        <primitive 
          object={scene} 
          scale={scale}
          position={[0, -1, 0]}
        />
      </group>
    );
  } catch (err) {
    console.error('❌ Avatar加载错误:', err);
    
    // 尝试下一个备用URL
    if (currentUrlIndex < fallbackUrls.length - 1) {
      const nextIndex = currentUrlIndex + 1;
      const nextUrl = fallbackUrls[nextIndex];
      console.log(`🔄 尝试备用URL ${nextIndex + 1}:`, nextUrl);
      
      setTimeout(() => {
        setCurrentUrlIndex(nextIndex);
      }, 1000);
      
      return (
        <Html center>
          <div style={{ textAlign: 'center', color: '#f39c12' }}>
            <p>⏳ 尝试备用模型...</p>
            <p style={{ fontSize: '12px' }}>备用方案 {nextIndex + 1}/{fallbackUrls.length}</p>
          </div>
        </Html>
      );
    }
    
    setError(err instanceof Error ? err.message : '所有模型加载失败');
    
    return (
      <Html center>
        <div style={{ textAlign: 'center', color: '#e74c3c' }}>
          <p>❌ 模型加载失败</p>
          <p style={{ fontSize: '12px' }}>{error}</p>
          <p style={{ fontSize: '10px', marginTop: '8px' }}>
            已尝试 {fallbackUrls.length} 个备用方案
          </p>
        </div>
      </Html>
    );
  }
}

// 场景内容
function SceneContent({ 
  modelUrl, 
  currentClothing 
}: { 
  modelUrl: string;
  currentClothing?: Canvas3DProps['currentClothing'];
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      <Environment preset="city" />

      <Suspense fallback={<Loader />}>
        <AvatarModel url={modelUrl} />
        
        {/* 显示上装 */}
        {currentClothing?.top?.texture && currentClothing.top.texture.startsWith('data:image') && (
          <ClothingPlane 
            textureUrl={currentClothing.top.texture}
            position={[0.8, 1.3, 0.5]}
            scale={[0.6, 0.6, 1]}
            rotation={[0, -0.3, 0]}
          />
        )}
        
        {/* 显示下装 */}
        {currentClothing?.bottom?.texture && currentClothing.bottom.texture.startsWith('data:image') && (
          <ClothingPlane 
            textureUrl={currentClothing.bottom.texture}
            position={[-0.8, 0.8, 0.5]}
            scale={[0.5, 0.6, 1]}
            rotation={[0, 0.3, 0]}
          />
        )}
        
        {/* 显示鞋子 */}
        {currentClothing?.shoes?.texture && currentClothing.shoes.texture.startsWith('data:image') && (
          <ClothingPlane 
            textureUrl={currentClothing.shoes.texture}
            position={[0.8, 0.3, 0.5]}
            scale={[0.4, 0.4, 1]}
            rotation={[0, -0.2, 0]}
          />
        )}
        
        {/* 显示配饰 */}
        {currentClothing?.accessories?.[0]?.texture && currentClothing.accessories[0].texture.startsWith('data:image') && (
          <ClothingPlane 
            textureUrl={currentClothing.accessories[0].texture}
            position={[-0.8, 1.8, 0.5]}
            scale={[0.35, 0.35, 1]}
            rotation={[0, 0.2, 0]}
          />
        )}
      </Suspense>

      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={10} blur={2} far={4} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial color="#f0f0f0" transparent opacity={0.8} />
      </mesh>

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
  const [webglSupported, setWebglSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 检查WebGL支持
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        setWebglSupported(false);
        setErrorMessage('您的浏览器不支持WebGL，无法显示3D内容');
        return;
      }
      console.log('✅ WebGL支持检测通过');
    } catch (e) {
      console.error('WebGL检测失败:', e);
      setWebglSupported(false);
      setErrorMessage('WebGL初始化失败');
      return;
    }
  }, []);

  // 预加载模型 - 使用本地压缩文件
  useEffect(() => {
    if (!webglSupported) return;
    
    const loadModel = async () => {
      try {
        console.log('🔄 开始加载本地压缩avatar.glb模型...');
        setIsLoading(true);
        setHasError(false);
        
        // 检查本地压缩模型文件是否存在
        const response = await fetch('/avatar.glb', { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`本地压缩模型文件不存在: HTTP ${response.status}`);
        }
        
        const fileSize = response.headers.get('content-length');
        console.log(`✅ 本地压缩avatar.glb文件存在，大小: ${fileSize} bytes`);
        
        // 预加载本地压缩模型
        useGLTF.preload('/avatar.glb');
        console.log('✅ 本地压缩模型预加载完成');
        
        // 延迟一点时间确保加载完成
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('❌ 本地压缩模型加载失败:', error);
        console.log('🔄 尝试备用模型...');
        
        // 尝试备用模型
        try {
          const fallbackUrl = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';
          useGLTF.preload(fallbackUrl);
          console.log('✅ 备用模型预加载完成');
          setIsLoading(false);
        } catch (fallbackError) {
          console.error('❌ 备用模型也加载失败:', fallbackError);
          setHasError(true);
          setIsLoading(false);
          setErrorMessage('所有模型加载失败，请检查网络连接');
        }
      }
    };
    
    loadModel();
  }, [webglSupported]);

  // 错误处理函数
  const handleCanvasError = (error: any) => {
    console.error('❌ Canvas渲染错误:', error);
    setHasError(true);
    setErrorMessage('3D渲染出现错误: ' + (error?.message || '未知错误'));
  };

  // WebGL不支持的回退UI
  if (!webglSupported) {
    return (
      <div className={`relative bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">WebGL不支持</h3>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <p className="text-sm text-gray-500">请使用支持WebGL的现代浏览器</p>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态的回退UI
  if (hasError) {
    return (
      <div className={`relative bg-gradient-to-b from-red-50 to-red-100 rounded-2xl overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">3D模型加载失败</h3>
            <p className="text-red-600 text-sm mb-4">{errorMessage}</p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  console.log('🔄 用户点击重新加载');
                  setHasError(false);
                  setIsLoading(true);
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors mr-2"
              >
                重新加载
              </button>
              <button
                onClick={() => window.open('/test-avatar.html', '_blank')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                测试模型
              </button>
            </div>
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
            try {
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
              gl.outputColorSpace = THREE.SRGBColorSpace;
              console.log('✅ Canvas初始化成功');
            } catch (error) {
              console.error('❌ Canvas初始化错误:', error);
              handleCanvasError(error);
            }
          }}
          onError={handleCanvasError}
        >
          <color attach="background" args={['#f8fafc']} />
          <SceneContent modelUrl="/avatar.glb" currentClothing={currentClothing} />
        </Canvas>
      </div>

      {/* 加载状态覆盖 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">加载3D模型中...</p>
            <p className="text-gray-500 text-sm mt-2">正在加载avatar.glb文件</p>
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => {
            console.log('🔄 重置视图');
            window.location.reload();
          }}
          className="p-3 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all min-h-[44px] min-w-[44px]"
          aria-label="重置视图"
        >
          <RotateCcw size={16} className="text-gray-700" />
        </button>
      </div>

      {/* 状态指示器 */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-600 bg-white/90 px-3 py-2 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${hasError ? 'bg-red-500' : isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
          {hasError ? '模型加载失败' : isLoading ? '加载中...' : '3D试穿工作室'}
        </div>
      </div>

      {/* 当前穿着指示器 */}
      {currentClothing && !isLoading && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-xs text-gray-600 mb-1">当前穿着</div>
          <div className="flex gap-1">
            {currentClothing.top && <div className="w-3 h-3 bg-blue-500 rounded" title="上装"></div>}
            {currentClothing.bottom && <div className="w-3 h-3 bg-gray-700 rounded" title="下装"></div>}
            {currentClothing.shoes && <div className="w-3 h-3 bg-white border border-gray-300 rounded" title="鞋子"></div>}
            {(currentClothing.accessories?.length ?? 0) > 0 && <div className="w-3 h-3 bg-purple-500 rounded" title="配饰"></div>}
          </div>
        </div>
      )}

      {/* 操作提示 */}
      {!isLoading && !hasError && (
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
          拖动旋转 • 滚轮缩放
        </div>
      )}
    </div>
  );
};

// 预加载本地压缩模型
useGLTF.preload('/avatar.glb');

export default Canvas3D;