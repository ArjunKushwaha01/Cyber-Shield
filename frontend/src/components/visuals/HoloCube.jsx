import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// The Cube Mesh
const Cube = () => {
    const meshRef = useRef();
    const [hovered, setHover] = useState(false);

    useFrame((state, delta) => {
        // Rotation
        meshRef.current.rotation.x += delta * 0.2;
        meshRef.current.rotation.y += delta * 0.3;

        // Pulse Effect on Hover
        const scale = hovered ? 1.2 : 1;
        meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), delta * 2);
    });

    return (
        <mesh
            ref={meshRef}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            <boxGeometry args={[2.5, 2.5, 2.5]} />
            <meshPhysicalMaterial
                color={hovered ? "#0ea5e9" : "#6366f1"} /* Sky blue if hovered, Indigo otherwise */
                roughness={0}
                metalness={0.8}
                transmission={0.6} /* Glass-like */
                thickness={0.5}
                transparent={true}
                opacity={0.8}
                wireframe={true}
            />
            {/* Inner Core */}
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#ffffff" emissive="#0ea5e9" emissiveIntensity={2} />
            </mesh>
        </mesh>
    );
};

// Main Scene
const HoloCube = ({ className }) => {
    return (
        <div className={className}>
            <Canvas camera={{ position: [0, 0, 6] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} color="blue" intensity={1} />

                <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                    <Cube />
                </Float>

                {/* Background Stars (Subtle) */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            </Canvas>
        </div>
    );
};

export default HoloCube;
