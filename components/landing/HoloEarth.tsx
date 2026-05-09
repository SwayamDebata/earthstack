'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import { useInView } from 'framer-motion';
import * as THREE from 'three';

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function DataSphere() {
  const meshRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const rand = mulberry32(0x5f3759df);
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = 2.5 + rand() * 0.22;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      colors[i * 3] = 0.15 + rand() * 0.1;
      colors[i * 3 + 1] = 0.45 + rand() * 0.55;
      colors[i * 3 + 2] = 1;
    }
    return { positions, colors };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.05;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
  });

  return (
    <group>
      <Sphere args={[2.4, 48, 48]}>
        <meshBasicMaterial color="#1e3a5f" wireframe transparent opacity={0.12} />
      </Sphere>

      <Sphere args={[2.35, 48, 48]}>
        <meshBasicMaterial color="#020617" />
      </Sphere>

      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.positions.length / 3}
            array={particles.positions}
            itemSize={3}
            args={[particles.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particles.colors.length / 3}
            array={particles.colors}
            itemSize={3}
            args={[particles.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.018}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <Ring radius={3} speed={0.2} color="#22d3ee" tilt={0.45} />
      <Ring radius={3.55} speed={-0.14} color="#a78bfa" tilt={-0.75} />
    </group>
  );
}

function Ring({ radius, speed, color, tilt }: { radius: number; speed: number; color: string; tilt: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += delta * speed;
    groupRef.current.rotation.x = tilt;
  });

  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  return (
    <group ref={groupRef}>
      <lineLoop geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.35} />
      </lineLoop>
    </group>
  );
}

export default function HoloEarth() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasVisible = useInView(rootRef, { amount: 0.06, margin: '0px 0px -10% 0px' });

  return (
    <div ref={rootRef} className="absolute inset-0 z-0">
      {canvasVisible ? (
        <Canvas
          camera={{ position: [0, 0, 6.2], fov: 42 }}
          dpr={[1, 1.35]}
          gl={{ antialias: true, powerPreference: 'high-performance', stencil: false, depth: true }}
        >
          <color attach="background" args={['#050816']} />
          <fog attach="fog" args={['#050816', 6, 16]} />
          <ambientLight intensity={0.55} />
          <Stars radius={120} depth={48} count={3500} factor={3.5} saturation={0} fade speed={0.5} />
          <DataSphere />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.4}
            minPolarAngle={Math.PI / 2.55}
            maxPolarAngle={Math.PI / 1.48}
          />
        </Canvas>
      ) : (
        <div
          className="absolute inset-0 bg-[#050816]"
          style={{
            backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(34,211,238,0.08), transparent 65%)',
          }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050816]" />
      <div className="landing-grain pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay" />
    </div>
  );
}
