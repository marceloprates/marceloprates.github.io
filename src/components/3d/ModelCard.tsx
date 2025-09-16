"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MotionValue } from "framer-motion";
import Tilt from '../Tilt';
import effects from '../CardEffects.module.css';

// Model component from CubeViewer with some adjustments for the card context
function Model({ url, rotationRef }: { url: string; rotationRef?: { current?: { rotateX: MotionValue<number>; rotateY: MotionValue<number> } } }) {
    const obj = useLoader(OBJLoader, url) as THREE.Group;
    const ref = useRef<THREE.Group>(null);
    const { camera } = useThree();
    // store a permanent base rotation (radians) so we can apply tilt on top
    const baseRotation = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // Apply rotation based on tilt values with smooth interpolation
    useFrame((state, delta) => {
        if (ref.current && rotationRef?.current) {
            // Convert motion values to radians and apply a dampening factor
            const dampening = 0.5;
            const targetX = rotationRef.current.rotateX.get() * (Math.PI / 180) * dampening;
            const targetY = rotationRef.current.rotateY.get() * (Math.PI / 180) * dampening;

            // Smooth interpolation factor (adjust this value to control smoothness)
            const smoothness = 8;

            // Apply smooth interpolation towards baseRotation + tilt target
            const desiredX = baseRotation.current.x + targetX;
            const desiredY = baseRotation.current.y + targetY;

            // Apply smooth interpolation
            ref.current.rotation.x += (desiredX - ref.current.rotation.x) * Math.min(delta * smoothness, 1);
            ref.current.rotation.y += (desiredY - ref.current.rotation.y) * Math.min(delta * smoothness, 1);
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
            // Compute the model scale based on the camera's vertical frustum height at the
            // model's distance. This is robust to different viewport sizes and pixel ratios
            // so the model appears the same relative size whether running locally or on GitHub Pages.
            // Get model center in world coordinates
            const center = new THREE.Vector3();
            bbox.getCenter(center); // center in local object space
            // Ensure world matrices are up to date
            obj.updateMatrixWorld(true);
            const centerWorld = center.clone().applyMatrix4(obj.matrixWorld);

            // Determine distance from camera to model center
            const camPos = (camera as THREE.Camera).position.clone();
            const distance = camPos.distanceTo(centerWorld);

            // Use perspective camera FOV to compute frustum (vertical) height at that distance
            const perspective = camera as THREE.PerspectiveCamera;
            const fov = perspective.fov; // degrees
            const frustumHeight = 2 * distance * Math.tan((fov * Math.PI) / 180 / 2);

            // targetSize is fraction of the vertical view we want the model to occupy
            const targetSize = frustumHeight * 0.8; // keep similar to previous behaviour
            const scale = targetSize / maxDim;
            obj.scale.setScalar(scale);

            // center the model so its bounding-box center sits at the origin
            // after scaling, translate by scaled center
            obj.position.sub(center.multiplyScalar(scale));

            // Set a permanent base Y rotation so models load with a nicer facing
            baseRotation.current.y = -Math.PI / 6;
            if (ref.current) ref.current.rotation.y = baseRotation.current.y;
        }

        // Apply metallic material with a more pronounced effect
        obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const mesh = child as THREE.Mesh;
                const oldMat = mesh.material;

                let map: THREE.Texture | null = null;
                if (oldMat) {
                    if (Array.isArray(oldMat) && oldMat[0] && 'map' in oldMat[0] && oldMat[0].map instanceof THREE.Texture) {
                        map = oldMat[0].map;
                    } else if (!Array.isArray(oldMat) && 'map' in oldMat && oldMat.map instanceof THREE.Texture) {
                        map = oldMat.map;
                    }
                }

                const metallic = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0x00ffff), // cyan
                    metalness: 0.9,
                    roughness: 0.5, // Smoother for more shine
                    envMapIntensity: 1.5, // Enhanced reflectivity
                });
                if (map) metallic.map = map;

                if (oldMat && !Array.isArray(oldMat) && 'side' in oldMat) metallic.side = oldMat.side;

                mesh.material = metallic;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });
    }, [obj, camera]);

    return <primitive ref={ref} object={obj} />;
}

// Headlight that follows the active camera so lighting doesn't rotate with the model
function Headlight({ intensity = 1.0 }: { intensity?: number }) {
    const lightRef = useRef<THREE.DirectionalLight>(null);
    const { camera, scene } = useThree();

    // Add the light to the scene once
    useEffect(() => {
        const light = lightRef.current;
        if (!light) return;
        scene.add(light);
        return () => {
            scene.remove(light);
        };
    }, [scene]);

    // Sync light position and target with camera each frame
    useFrame(() => {
        if (!lightRef.current) return;
        // Position the light at the camera position
        lightRef.current.position.copy((camera as THREE.Camera).position as THREE.Vector3);
        // Make the light point forward from the camera
        const matrix = new THREE.Matrix4();
        matrix.extractRotation(camera.matrixWorld);
        const forward = new THREE.Vector3(0, 0, -1).applyMatrix4(matrix).normalize();
        // place target a bit in front of camera
        const targetPos = new THREE.Vector3().copy((camera as THREE.Camera).position as THREE.Vector3).add(forward.multiplyScalar(10));
        if (lightRef.current.target) {
            lightRef.current.target.position.copy(targetPos);
            lightRef.current.target.updateMatrixWorld();
        }
    });

    return (
        <directionalLight
            ref={lightRef}
            intensity={intensity}
            castShadow={false}
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
            // initial position, will be synced in useFrame
            position={[0, 0, 0]}
        />
    );
}

interface ModelCardProps {
    objPath: string;
    title: string;
    description?: string;
    className?: string;
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
                        camera={{ position: [0, 3, 2.5], fov: 50 }}
                        className="transition-opacity duration-300 pointer-events-none"
                        style={{ opacity: 0.9 }} // Slightly more visible
                    >
                        <Suspense fallback={null}>
                            <ambientLight intensity={0.5} />
                            {/* A scene directional light for general illumination (reduced so headlight takes precedence) */}
                            <directionalLight
                                castShadow
                                position={[5, 5, 5]}
                                intensity={0.8}
                                shadow-mapSize-width={1024}
                                shadow-mapSize-height={1024}
                            />

                            {/* Headlight: follows the active camera so the model stays lit from the view direction */}
                            <Headlight intensity={1.6} />
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