import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarModelProps {
  url: string;
}

const AvatarModel: React.FC<AvatarModelProps> = ({ url }) => {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  // 添加轻微的旋转动画
  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={scene} scale={1.5} position={[0, -1, 0]} />
    </group>
  );
};

interface AvatarSceneProps {
  className?: string;
  modelUrl?: string;
}

const AvatarScene: React.FC<AvatarSceneProps> = ({ 
  className = '', 
  modelUrl = '/avatar.glb' 
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* 环境光照 */}
          <Environment preset="studio" />
          
          {/* 主光源 */}
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* 补光 */}
          <ambientLight intensity={0.3} />
          
          {/* 3D模型 */}
          <AvatarModel url={modelUrl} />
          
          {/* 地面阴影 */}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={3}
            blur={2}
            far={2}
          />
          
          {/* 相机控制 */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={5}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

// 预加载模型
useGLTF.preload('/avatar.glb');

export default AvatarScene;