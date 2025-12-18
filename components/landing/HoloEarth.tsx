'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

function DataSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create randomized data points for the "cloud" around earth
  const particles = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
        // Spherical distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 2.5 + (Math.random() * 0.2); // Radius slightly larger than the core sphere

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Colors (Blue to Teal gradient)
        colors[i * 3] = 0.2; // R
        colors[i * 3 + 1] = 0.5 + Math.random() * 0.5; // G
        colors[i * 3 + 2] = 1.0; // B
    }
    return { positions, colors };
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
        meshRef.current.rotation.y += delta * 0.05;
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group>
        {/* Core Wireframe Globe */}
        <Sphere args={[2.4, 64, 64]}>
            <meshBasicMaterial 
                color="#1a2b4b" 
                wireframe 
                transparent 
                opacity={0.1} 
            />
        </Sphere>
        
        {/* Inner Solid Core (Dark Ocean) */}
        <Sphere args={[2.35, 64, 64]}>
            <meshBasicMaterial color="#000000" />
        </Sphere>

        {/* Data Points Cloud */}
        <points ref={meshRef as any}>
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
                size={0.02}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>

        {/* Orbit Rings representing satellite paths */}
        <Ring radius={3} speed={0.2} color="#4ADE80" tilt={0.5} />
        <Ring radius={3.5} speed={-0.15} color="#F472B6" tilt={-0.8} />
    </group>
  );
}

function Ring({ radius, speed, color, tilt }: { radius: number, speed: number, color: string, tilt: number }) {
    const ref = useRef<THREE.Line>(null);
    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.z += delta * speed;
            ref.current.rotation.x = tilt;
        }
    });

    const points = useMemo(() => {
        const pts = [];
        const segments = 128;
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
        }
        return pts;
    }, [radius]);
    
    // Convert Vector3[] to Geometry for Line/LineLoop in R3F 
    // Usually easier to use <line> with buffer geometry
    const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

    return (
        // @ts-ignore
        <line ref={ref as any} geometry={geometry}>
            <lineBasicMaterial color={color} transparent opacity={0.3} />
        </line>
    );
}

export default function HoloEarth() {
  return (
    <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <fog attach="fog" args={['#080B14', 5, 15]} />
            <ambientLight intensity={0.5} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <DataSphere />
            <OrbitControls 
                enableZoom={false} 
                enablePan={false} 
                autoRotate 
                autoRotateSpeed={0.5} 
                minPolarAngle={Math.PI / 2.5} 
                maxPolarAngle={Math.PI / 1.5}
            />
        </Canvas>
        
        {/* Gradient Overlay to fade bottom into content */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080B14]" />
    </div>
  );
}
