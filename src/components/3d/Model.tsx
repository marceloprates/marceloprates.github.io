"use client";

import { useLoader } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { useRotation } from "./hooks";
import { createMetallicMaterial, applyMaterialToMesh, extractTextureMapFromMaterial } from "./materials";

interface ModelProps {
    url: string;
}

export function Model({ url }: ModelProps) {
    const obj = useLoader(OBJLoader, url) as THREE.Group;
    const ref = useRotation<THREE.Group>({ y: 0.004 });

    useEffect(() => {
        if (!obj) return;

        const bbox = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);

        if (maxDim > 0) {
            const scale = 2 / maxDim; // Fixed scale value that was previously 0
            obj.scale.setScalar(scale);

            const center = new THREE.Vector3();
            bbox.getCenter(center);
            obj.position.sub(center.multiplyScalar(scale));
        }

        obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const mesh = child as THREE.Mesh;
                const oldMat = mesh.material;
                const map = oldMat ? extractTextureMapFromMaterial(oldMat) : null;
                const side = (!Array.isArray(oldMat) && oldMat && 'side' in oldMat) ? oldMat.side : undefined;

                const material = createMetallicMaterial({ map, side });
                applyMaterialToMesh(mesh, material);
            }
        });
    }, [obj]);

    return <primitive ref={ref} object={obj} />;
}