'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Earth3D from './Earth3D';
import StarsBackground from './StarsBackground';

export default function EarthScene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        className="w-full h-full"
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        
        <Suspense fallback={null}>
          <StarsBackground />
          <Earth3D />
        </Suspense>

        {/* Disable controls for production, enable for debugging */}
        {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
      </Canvas>
    </div>
  );
}
