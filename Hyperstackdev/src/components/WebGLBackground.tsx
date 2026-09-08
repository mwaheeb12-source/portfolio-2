import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// An electron orbiting on a specific ring
const Electron = ({ 
  radius = 4, 
  speed = 2, 
  color = "#00ffff", 
  rotation = [0, 0, 0], 
  phase = 0 
}: { 
  radius?: number, 
  speed?: number, 
  color?: string, 
  rotation?: [number, number, number],
  phase?: number 
}) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      // Rotate the electron around the ring
      ref.current.rotation.z = (state.clock.elapsedTime * speed) + phase;
    }
  });

  return (
    <group rotation={new THREE.Euler(...rotation)}>
      {/* The Orbit Ring */}
      <mesh>
        <torusGeometry args={[radius, 0.04, 16, 100]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={1.5} 
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* The Electron Pivot */}
      <group ref={ref}>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
          <pointLight color={color} intensity={2} distance={5} />
          {/* Small inner glow for electron */}
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
          </mesh>
        </mesh>
      </group>
    </group>
  );
};

// The main Atom Structure
const Atom = () => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Slow global rotation for the entire atom
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.05;
      
      // Interactive tilt based on mouse position
      const targetX = state.pointer.y * 0.5;
      const targetY = state.pointer.x * 0.5;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.1;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.1;
    }
    
    // Pulse the core
    if (coreRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.5}>
      {/* Core Nucleus */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff" 
          emissiveIntensity={2.5} 
        />
        <pointLight color="#00ffff" intensity={8} distance={15} />
        {/* Core outer glow */}
        <mesh>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
        </mesh>
      </mesh>

      {/* Intersecting Orbits (like the image) */}
      {/* Cyan Orbit (Tilted left) */}
      <Electron 
        radius={5} 
        speed={1.5} 
        color="#00ffff" 
        rotation={[Math.PI / 2.5, Math.PI / 4, 0]} 
        phase={0} 
      />
      
      {/* Purple/Pink Orbit (Tilted right) */}
      <Electron 
        radius={5} 
        speed={1.2} 
        color="#c084fc" 
        rotation={[Math.PI / 2.5, -Math.PI / 4, 0]} 
        phase={Math.PI} 
      />
      
      {/* Blue Orbit (Horizontal) */}
      <Electron 
        radius={5} 
        speed={1.8} 
        color="#3b82f6" 
        rotation={[Math.PI / 2, 0, 0]} 
        phase={Math.PI / 2} 
      />
    </group>
  );
};

const WebGLBackground = () => {
  return (
    <div className="fixed inset-0 z-0 bg-[#050505] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <fog attach="fog" args={['#050505', 10, 40]} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <Atom />
      </Canvas>
    </div>
  );
};

export default WebGLBackground;
