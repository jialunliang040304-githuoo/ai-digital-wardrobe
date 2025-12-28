/**
 * 备用Avatar组件 - 使用Three.js几何体创建简单人形模型
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FallbackAvatarProps {
  position?: [number, number, number];
  scale?: number;
}

const FallbackAvatar: React.FC<FallbackAvatarProps> = ({ 
  position = [0, -1, 0], 
  scale = 1 
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* 头部 */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* 身体 */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.4, 0.6, 0.2]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
      
      {/* 左臂 */}
      <mesh position={[-0.3, 1.3, 0]} rotation={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* 右臂 */}
      <mesh position={[0.3, 1.3, 0]} rotation={[0, 0, -0.2]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* 左腿 */}
      <mesh position={[-0.1, 0.5, 0]} castShadow>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* 右腿 */}
      <mesh position={[0.1, 0.5, 0]} castShadow>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* 左脚 */}
      <mesh position={[-0.1, 0.05, 0.1]} castShadow>
        <boxGeometry args={[0.12, 0.05, 0.25]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* 右脚 */}
      <mesh position={[0.1, 0.05, 0.1]} castShadow>
        <boxGeometry args={[0.12, 0.05, 0.25]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* 眼睛 */}
      <mesh position={[-0.05, 1.75, 0.12]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      <mesh position={[0.05, 1.75, 0.12]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* 嘴巴 */}
      <mesh position={[0, 1.65, 0.12]} castShadow>
        <boxGeometry args={[0.06, 0.01, 0.01]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
    </group>
  );
};

export default FallbackAvatar;