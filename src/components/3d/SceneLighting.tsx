"use client";

import { useCameraFollowingLights } from "./hooks";

export function SceneLighting() {
    const { frontLightRef, backLightRef } = useCameraFollowingLights();

    return (
        <>
            <ambientLight intensity={1.5} />
            <hemisphereLight
                intensity={1}
                color="#ffffff"
                groundColor="#444444"
                position={[0, 1, 0]}
            />
            <directionalLight
                ref={frontLightRef}
                castShadow
                intensity={3}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                target-position={[0, 0, 0]}
            />
            <directionalLight
                ref={backLightRef}
                intensity={2.5}
                color="#ffffff"
            />
        </>
    );
}