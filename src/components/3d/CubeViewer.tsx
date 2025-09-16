"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

function Box() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.005;
            meshRef.current.rotation.y += 0.003;
        }
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="coral" />
        </mesh>
    );
}

function Model({ url }: { url: string }) {
    // useLoader will work inside Suspense
    const obj = useLoader(OBJLoader, url) as THREE.Group;
    const ref = useRef<THREE.Group>(null);

    // small rotation for nicer presentation
    useFrame(() => {
        if (ref.current) ref.current.rotation.y += 0.004;
    });

    // Try to normalize scale a little if model is huge/small
    useEffect(() => {
        if (!obj) return;
        const bbox = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
            const scale = 2.5 / maxDim; // scale to roughly fit the view
            obj.scale.setScalar(scale);
            // center
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            obj.position.sub(center.multiplyScalar(scale));
        }

        // Replace or adjust materials to a metallic MeshStandardMaterial so the OBJ looks metallic
        obj.traverse((child) => {
            // isMesh is a standard flag on THREE.Mesh instances
            if ((child as any).isMesh) {
                const mesh = child as THREE.Mesh;
                const oldMat: any = mesh.material;

                // Prefer original texture map if present; otherwise force a coral color
                let map: THREE.Texture | null = null;
                if (oldMat) {
                    if (Array.isArray(oldMat) && oldMat[0] && oldMat[0].map) {
                        map = oldMat[0].map;
                    } else if ((oldMat as any).map) {
                        map = (oldMat as any).map;
                    }
                }

                const metallic = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0xff7f50), // coral
                    metalness: 0.9,
                    roughness: 0.3,
                    side: THREE.DoubleSide, // Render both sides of each face
                });
                if (map) metallic.map = map;

                mesh.material = metallic;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });
    }, [obj]);

    return <primitive ref={ref} object={obj} />;
}

export default function CubeViewer({ objPath = "/models/som4.obj" }: { objPath?: string }) {
    const [hasObj, setHasObj] = useState<boolean | null>(null);

    useEffect(() => {
        let canceled = false;
        // Check if the OBJ exists before trying to load it to avoid render errors
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
        <div className="h-[500px] w-full">
            <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={1.5} />
                    <hemisphereLight
                        intensity={1}
                        color="#ffffff"
                        groundColor="#444444"
                        position={[0, 1, 0]}
                    />
                    {/* Front light that follows the camera */}
                    <directionalLight
                        castShadow
                        intensity={3}
                        shadow-mapSize-width={1024}
                        shadow-mapSize-height={1024}
                        ref={(l) => {
                            if (!l) return;

                            // Update light position on every frame based on camera position
                            useFrame(({ camera }) => {
                                // Get camera position and add offset for light position
                                const cameraPosition = camera.position.clone();
                                const lightOffset = new THREE.Vector3(2, 2, 2); // Offset from camera
                                l.position.copy(cameraPosition).add(lightOffset);

                                // Point light at the origin/center
                                const target = l.target as THREE.Object3D;
                                target.position.set(0, 0, 0);
                            });

                            // Create target at origin
                            const target = new THREE.Object3D();
                            target.position.set(0, 0, 0);
                            if (l.parent) l.parent.add(target);
                            l.target = target;
                        }}
                    />
                    {/* Back light that follows the camera from the opposite side */}
                    <directionalLight
                        intensity={2.5}
                        color="#ffffff"
                        ref={(l) => {
                            if (!l) return;

                            // Update light position on every frame based on camera position
                            useFrame(({ camera }) => {
                                // Get camera position and add opposite offset for back light
                                const cameraPosition = camera.position.clone();
                                const lightOffset = new THREE.Vector3(-2, 2, -2); // Opposite offset from camera
                                l.position.copy(cameraPosition).add(lightOffset);

                                // Point light at the origin/center
                                l.lookAt(0, 0, 0);
                            });
                        }}
                    />
                    {hasObj === null ? (
                        // still checking, show the box as a visual placeholder
                        <Box />
                    ) : hasObj ? (
                        <Model url={objPath} />
                    ) : (
                        <Box />
                    )}
                    <OrbitControls enableZoom={true} />
                </Suspense>
            </Canvas>
        </div>
    );
}