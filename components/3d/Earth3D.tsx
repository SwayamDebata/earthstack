'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function Earth3D() {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Rotate the Earth
  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
    
    // Subtle mouse gyroscope effect
    if (earthRef.current) {
      const x = (state.mouse.x * Math.PI) / 20;
      const y = (state.mouse.y * Math.PI) / 20;
      earthRef.current.rotation.x = THREE.MathUtils.lerp(
        earthRef.current.rotation.x,
        y,
        0.05
      );
      earthRef.current.rotation.z = THREE.MathUtils.lerp(
        earthRef.current.rotation.z,
        x,
        0.05
      );
    }
  });

  // Create Earth texture (using gradient for now, can be replaced with actual texture)
  const earthMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1a4d7a',
      roughness: 0.7,
      metalness: 0.2,
      emissive: '#0a2540',
      emissiveIntensity: 0.2,
    });
  }, []);

  return (
    <group>
      {/* Main Earth sphere */}
      <Sphere ref={earthRef} args={[2.5, 64, 64]} material={earthMaterial}>
        <meshStandardMaterial
          color="#1a4d7a"
          roughness={0.7}
          metalness={0.2}
          emissive="#0a2540"
          emissiveIntensity={0.2}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere ref={atmosphereRef} args={[2.7, 64, 64]}>
        <meshBasicMaterial
          color="#2D82FF"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Inner glow */}
      <Sphere args={[2.6, 64, 64]}>
        <meshBasicMaterial
          color="#22C1EE"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Lights */}
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#2D82FF" />
      <ambientLight intensity={0.3} />
    </group>
  );
}
