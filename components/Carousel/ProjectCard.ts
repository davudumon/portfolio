import * as THREE from 'three';
import type { Project } from '@/types/project';
import { CARD_SEGMENTS } from '@/lib/constants';
import { fragmentShader, vertexShader } from './shaders';
import type { PaintedCard } from './paintCard';

export interface CardUniforms {
  uMap: { value: THREE.Texture };
  uMap2: { value: THREE.Texture };
  uMix: { value: number };
  uW: { value: number };
  uR: { value: number };
  uK: { value: number };
  uDim: { value: number };
  uAlpha: { value: number };
  uGx: { value: number };
  uGl: { value: number };
}

export interface ProjectCardHandle {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  material: THREE.ShaderMaterial & { uniforms: CardUniforms };
  frontTexture: THREE.CanvasTexture;
  backTexture: THREE.CanvasTexture;
  canvases: PaintedCard;
  project: Project;
  index: number;
  intro: number;
  open: number;
  fade: number;
}

export function createProjectCard(project: Project, index: number): ProjectCardHandle {
  const canvases = { front: document.createElement('canvas'), back: document.createElement('canvas') };
  canvases.front.width = canvases.back.width = 1600;
  canvases.front.height = canvases.back.height = 930;
  const frontTexture = new THREE.CanvasTexture(canvases.front);
  const backTexture = new THREE.CanvasTexture(canvases.back);
  frontTexture.anisotropy = 8;
  backTexture.anisotropy = 8;
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMap: { value: frontTexture }, uMap2: { value: backTexture }, uMix: { value: 0 },
      uW: { value: 1 }, uR: { value: 1 }, uK: { value: 1 }, uDim: { value: 0 },
      uAlpha: { value: 1 }, uGx: { value: .5 }, uGl: { value: .1 }
    }
  }) as THREE.ShaderMaterial & { uniforms: CardUniforms };
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, CARD_SEGMENTS, 1), material);
  mesh.userData.index = index;
  return { mesh, material, frontTexture, backTexture, canvases, project, index, intro: 0, open: 0, fade: 0 };
}
