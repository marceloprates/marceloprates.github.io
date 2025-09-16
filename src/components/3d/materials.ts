import * as THREE from "three";

interface MaterialOptions {
    color?: THREE.ColorRepresentation;
    map?: THREE.Texture | null;
    metalness?: number;
    roughness?: number;
    side?: THREE.Side;
}

const DEFAULT_MATERIAL_OPTIONS: MaterialOptions = {
    color: 0xff7f50, // coral
    metalness: 0.9,
    roughness: 0.5,
    side: THREE.DoubleSide,
};

export function createMetallicMaterial(options: MaterialOptions = {}) {
    const finalOptions = { ...DEFAULT_MATERIAL_OPTIONS, ...options };
    return new THREE.MeshStandardMaterial(finalOptions);
}

export function applyMaterialToMesh(mesh: THREE.Mesh, material: THREE.Material) {
    mesh.material = material;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
}

export function extractTextureMapFromMaterial(material: THREE.Material | THREE.Material[]): THREE.Texture | null {
    if (Array.isArray(material)) {
        const firstMat = material[0];
        return (firstMat && 'map' in firstMat && firstMat.map instanceof THREE.Texture) ? firstMat.map : null;
    }
    return ('map' in material && material.map instanceof THREE.Texture) ? material.map : null;
}