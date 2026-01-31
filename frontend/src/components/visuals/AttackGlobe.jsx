
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';

// --- Utils for Geolocation on Sphere ---
// Convert Lat/Lon to 3D position vector
const latLongToVector3 = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
};

// Generate curved line (Bezier) between two points on sphere
const getSplineFromCoords = (startLat, startLon, endLat, endLon, radius) => {
    const start = latLongToVector3(startLat, startLon, radius);
    const end = latLongToVector3(endLat, endLon, radius);

    // Control points height depends on distance
    const distance = start.distanceTo(end);
    const height = distance * 0.5; // Arch height

    // Midpoint projected outward
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const midLength = mid.length();
    mid.normalize().multiplyScalar(midLength + height);

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve;
};

// --- Sub-Components ---

const AttackArc = ({ start, end, color }) => {
    const curve = useMemo(() => getSplineFromCoords(start[0], start[1], end[0], end[1], 10), [start, end]);
    const points = useMemo(() => curve.getPoints(50), [curve]);
    const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

    return (
        <line geometry={geometry}>
            <lineBasicMaterial attach="material" color={color} opacity={0.6} transparent linewidth={1} />
        </line>
    );
};

const GlowingMarker = ({ lat, lon, color, label }) => {
    const position = useMemo(() => latLongToVector3(lat, lon, 10.1), [lat, lon]);

    return (
        <mesh position={position}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
            {label && (
                <Html distanceFactor={15}>
                    <div className="bg-black/80 text-xs text-white px-2 py-1 rounded pointer-events-none whitespace-nowrap border border-white/20 select-none">
                        {label}
                    </div>
                </Html>
            )}
        </mesh>
    );
};

const EarthCore = () => {
    return (
        <group>
            {/* Base Dark Sphere */}
            <Sphere args={[10, 64, 64]}>
                <meshPhongMaterial
                    color="#0f172a"
                    emissive="#020617"
                    specular="#1e293b"
                    shininess={10}
                    transparent
                    opacity={0.9}
                />
            </Sphere>

            {/* Wireframe Overlay */}
            <Sphere args={[10.05, 32, 32]}>
                <meshBasicMaterial
                    color="#0ea5e9" // sky-500
                    wireframe
                    transparent
                    opacity={0.15}
                />
            </Sphere>
        </group>
    );
}


// --- Main Data ---
const ATTACKS = [
    { from: [37.77, -122.41], to: [51.50, -0.12], color: '#ef4444' }, // SF -> London
    { from: [35.67, 139.65], to: [40.71, -74.00], color: '#f59e0b' }, // Tokyo -> NY
    { from: [55.75, 37.61], to: [48.85, 2.35], color: '#8b5cf6' },    // Moscow -> Paris
    { from: [-33.86, 151.20], to: [22.31, 114.16], color: '#10b981' }, // Sydney -> HK
    { from: [52.52, 13.40], to: [-23.55, -46.63], color: '#ef4444' }, // Berlin -> Sao Paulo
    { from: [19.07, 72.87], to: [55.75, 37.61], color: '#f59e0b' },   // Mumbai -> Moscow
    { from: [30.04, 31.23], to: [40.71, -74.00], color: '#ef4444' },   // Cairo -> NY
    { from: [39.90, 116.40], to: [37.77, -122.41], color: '#ef4444' }, // Beijing -> SF
];

const LOCATIONS = [
    { coords: [37.77, -122.41], label: "San Francisco", color: "#0ea5e9" },
    { coords: [40.71, -74.00], label: "New York", color: "#0ea5e9" },
    { coords: [51.50, -0.12], label: "London", color: "#0ea5e9" },
    { coords: [35.67, 139.65], label: "Tokyo", color: "#ef4444" }, // Under Attack
    { coords: [55.75, 37.61], label: "Moscow", color: "#f59e0b" },
    { coords: [-33.86, 151.20], label: "Sydney", color: "#0ea5e9" },
    { coords: [48.85, 2.35], label: "Paris", color: "#0ea5e9" },
    { coords: [-23.55, -46.63], label: "Sao Paulo", color: "#0ea5e9" },
    { coords: [22.31, 114.16], label: "Hong Kong", color: "#ef4444" },
    { coords: [52.52, 13.40], label: "Berlin", color: "#0ea5e9" },
];


const AttackGlobe = () => {
    return (
        <div className="w-full h-[600px] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 relative group">
            <div className="absolute top-4 left-4 z-10 space-y-2 pointer-events-none select-none">
                <h2 className="text-xl font-bold text-white tracking-widest uppercase layer-shadow">Global Threat Map</h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse box-shadow-glow"></span>
                    <span className="text-xs text-red-400 font-mono">LIVE THREAT FEED ACTIVE</span>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 z-10 text-right pointer-events-none select-none opacity-50 text-[10px] text-slate-500 font-mono">
                LAT/LON GEOLOCATION ENALBED<br />
                BEZIER TRAJECTORY CALC
            </div>

            <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#38bdf8" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f472b6" />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <EarthCore />

                {/* Render Attacks */}
                {ATTACKS.map((attack, i) => (
                    <AttackArc key={i} start={attack.from} end={attack.to} color={attack.color} />
                ))}

                {/* Render Locations */}
                {LOCATIONS.map((loc, i) => (
                    <GlowingMarker key={i} lat={loc.coords[0]} lon={loc.coords[1]} color={loc.color} label={loc.label} />
                ))}

                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={15}
                    maxDistance={40}
                    autoRotate
                    autoRotateSpeed={0.8}
                />
            </Canvas>
        </div>
    );
};

export default AttackGlobe;
