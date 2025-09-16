"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MotionValue } from "framer-motion";
import Tilt from '../Tilt';
import styles from '../TileButton.module.css';
import effects from '../CardEffects.module.css';

// Model component from CubeViewer with some adjustments for the card context
function Model({ url, rotationRef }: { url: string; rotationRef?: { current?: { rotateX: MotionValue<number>; rotateY: MotionValue<number> } } }) {
    const obj = useLoader(OBJLoader, url) as THREE.Group;
    const ref = useRef<THREE.Group>(null);

    // Apply rotation based on tilt values with smooth interpolation
    useFrame((state, delta) => {
        if (ref.current && rotationRef?.current) {
            // Convert motion values to radians and apply a dampening factor
            const dampening = 0.5;
            const targetX = rotationRef.current.rotateX.get() * (Math.PI / 180) * dampening;
            const targetY = rotationRef.current.rotateY.get() * (Math.PI / 180) * dampening;

            // Smooth interpolation factor (adjust this value to control smoothness)
            const smoothness = 8;

            // Apply smooth interpolation
            ref.current.rotation.x += (targetX - ref.current.rotation.x) * Math.min(delta * smoothness, 1);
            ref.current.rotation.y += (targetY - ref.current.rotation.y) * Math.min(delta * smoothness, 1);
        }
    });

    // Apply tilt-based rotation and gentle floating
    useFrame((state) => {
        if (ref.current) {
            // Keep just the gentle floating motion
            const t = state.clock.getElapsedTime();
            ref.current.position.y = 0 * Math.sin(t) * 0.1; // Gentle floating up/down
        }
    });

    useEffect(() => {
        if (!obj) return;
        const bbox = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
            const scale = 2 / maxDim; // Slightly smaller scale for card context
            obj.scale.setScalar(scale);
            // center
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            obj.position.sub(center.multiplyScalar(scale));
        }

        // Apply metallic material with a more pronounced effect
        obj.traverse((child) => {
            if ((child as any).isMesh) {
                const mesh = child as THREE.Mesh;
                const oldMat: any = mesh.material;

                let map: THREE.Texture | null = null;
                if (oldMat) {
                    if (Array.isArray(oldMat) && oldMat[0] && oldMat[0].map) {
                        map = oldMat[0].map;
                    } else if ((oldMat as any).map) {
                        map = (oldMat as any).map;
                    }
                }

                const metallic = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0x00ffff), // cyan
                    metalness: 0.9,
                    roughness: 0.2, // Smoother for more shine
                    envMapIntensity: 1.5, // Enhanced reflectivity
                });
                if (map) metallic.map = map;

                if (oldMat && (oldMat as any).side) (metallic as any).side = (oldMat as any).side;

                mesh.material = metallic;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });
    }, [obj]);

    return <primitive ref={ref} object={obj} />;
}

interface ModelCardProps {
    objPath: string;
    title: string;
    description?: string;
    className?: string;
}

interface TiltEvent {
    tiltX: number;
    tiltY: number;
}

export default function ModelCard({ objPath, title, description, className = '' }: ModelCardProps) {
    const [hasObj, setHasObj] = useState<boolean | null>(null);
    const rotationRef = useRef<{ rotateX: MotionValue<number>; rotateY: MotionValue<number> }>({ rotateX: null!, rotateY: null! });

    useEffect(() => {
        let canceled = false;
        fetch(objPath, { method: "HEAD" })
            .then((res) => {
                if (canceled) return;
                setHasObj(res.ok);
            })
            .catch(() => {
                if (canceled) return;
                setHasObj(false);
            });
        return () => {
            canceled = true;
        };
    }, [objPath]);

    return (
        <Tilt
            className={`relative block ${className}`}
            scale={1.05}
            rotationRef={rotationRef}>
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 shadow-lg group">
                {/* Card content */}
                <div className="absolute inset-0 p-4 z-10">
                    <h3 className="text-slate-900 font-semibold text-xl mb-2">{title}</h3>
                    {description && (
                        <p className="text-slate-700 text-sm">{description}</p>
                    )}
                </div>

                {/* 3D Model viewer */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    <Canvas
                        shadows
                        camera={{ position: [3, 3, 3], fov: 50 }}
                        className="transition-opacity duration-300 pointer-events-none"
                        style={{ opacity: 0.8 }} // Slightly more visible when in front
                    >
                        <Suspense fallback={null}>
                            <ambientLight intensity={0.5} />
                            <directionalLight
                                castShadow
                                position={[5, 5, 5]}
                                intensity={2}
                                shadow-mapSize-width={1024}
                                shadow-mapSize-height={1024}
                            />
                            {hasObj && <Model url={objPath} rotationRef={rotationRef} />}
                            <OrbitControls
                                enableZoom={false}
                                enablePan={false}
                                enableRotate={true}
                                autoRotate={false}
                                maxPolarAngle={Math.PI / 1.5}
                                minPolarAngle={Math.PI / 3}
                            />
                        </Suspense>
                    </Canvas>
                </div>

                {/* Hover effects */}
                <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${effects.shine}`}
                />
            </div>
        </Tilt>
    );
}