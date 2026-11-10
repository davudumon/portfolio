declare module 'three' {
  export class Texture {
    image: HTMLCanvasElement | HTMLImageElement;
    anisotropy: number;
    needsUpdate: boolean;
    dispose(): void;
  }
  export class CanvasTexture extends Texture {
    constructor(image: HTMLCanvasElement);
  }
  export class ShaderMaterial {
    constructor(parameters: {
      vertexShader: string;
      fragmentShader: string;
      transparent: boolean;
      depthWrite: boolean;
      uniforms: Record<string, { value: Texture | number }>;
    });
    uniforms: Record<string, { value: Texture | number }>;
    dispose(): void;
  }
  export class PlaneGeometry {
    constructor(width: number, height: number, widthSegments: number, heightSegments: number);
    dispose(): void;
  }
  export class Mesh<TGeometry = PlaneGeometry, TMaterial = ShaderMaterial> {
    constructor(geometry: TGeometry, material: TMaterial);
    geometry: TGeometry;
    material: TMaterial;
    userData: Record<string, number>;
    position: { set(x: number, y: number, z: number): void };
    rotation: { set(x: number, y: number, z: number): void };
    scale: { set(x: number, y: number, z: number): void };
    renderOrder: number;
    visible: boolean;
  }
  export class Scene {
    add(object: Mesh): void;
  }
  export class PerspectiveCamera {
    aspect: number;
    fov: number;
    position: { set(x: number, y: number, z: number): void };
    updateProjectionMatrix(): void;
    constructor(fov: number, aspect: number, near: number, far: number);
  }
  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    constructor(parameters: { antialias: boolean; alpha: boolean; canvas: HTMLCanvasElement });
    setPixelRatio(value: number): void;
    setSize(width: number, height: number): void;
    render(scene: Scene, camera: PerspectiveCamera): void;
    dispose(): void;
  }
  export class Raycaster {
    setFromCamera(pointer: Vector2, camera: PerspectiveCamera): void;
    intersectObjects(objects: Mesh[]): Array<{ object: Mesh }>;
  }
  export class Vector2 {
    set(x: number, y: number): void;
  }
}
