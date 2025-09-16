"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface RotationHookOptions {
    x?: number;
    y?: number;
    z?: number;
}

export function useRotation<T extends THREE.Object3D>(options: RotationHookOptions = {}) {
    const ref = useRef<T>(null);
    const { x = 0, y = 0, z = 0 } = options;

    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.x += x;
            ref.current.rotation.y += y;
            ref.current.rotation.z += z;
        }
    });

    return ref;
}

export function useCameraFollowingLights() {
    const frontLightRef = useRef<THREE.DirectionalLight>(null);
    const backLightRef = useRef<THREE.DirectionalLight>(null);

    useFrame(({ camera }) => {
        if (frontLightRef.current) {
            const cameraPosition = camera.position.clone();
            const lightOffset = new THREE.Vector3(2, 2, 2);
            frontLightRef.current.position.copy(cameraPosition).add(lightOffset);
        }
        if (backLightRef.current) {
            const cameraPosition = camera.position.clone();
            const lightOffset = new THREE.Vector3(-2, 2, -2);
            backLightRef.current.position.copy(cameraPosition).add(lightOffset);
            backLightRef.current.lookAt(0, 0, 0);
        }
    });

    return { frontLightRef, backLightRef };
}

export function useObjectAvailability(objPath: string) {
    const [hasObj, setHasObj] = useState<boolean | null>(null);

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

    return hasObj;
}