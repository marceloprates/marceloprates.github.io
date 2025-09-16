"use client";

import { useRotation } from "./hooks";
import * as THREE from "three";

export function Box() {
    const meshRef = useRotation<THREE.Mesh>({ x: 0.005, y: 0.003 });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="coral" />
        </mesh>
    );
}