import gsap from 'gsap';
import * as THREE from 'three';
import type { Project } from '@/types/project';
import { CAMERA_Z, CAROUSEL_EASE, DESKTOP_CARD_WIDTH, DRAG_SENSITIVITY, MAX_PIXEL_RATIO, MOBILE_BREAKPOINT, SWIPE_THRESHOLD, WHEEL_SENSITIVITY } from '@/lib/constants';
import { shortestDistance, wrapIndex } from '@/lib/carousel';
import { createProjectCard, type ProjectCardHandle } from './ProjectCard';
import { createCardCanvases, paintCard } from './paintCard';

export interface CarouselSceneCallbacks {
  onActiveChange: (index: number) => void;
  onPositionChange: (position: number) => void;
  onProjectOpen: (index: number) => void;
  onReady: () => void;
}

export class CarouselScene {
  private readonly canvas: HTMLCanvasElement;
  private readonly projects: Project[];
  private readonly callbacks: CarouselSceneCallbacks;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 10, 6000);
  private readonly cards: ProjectCardHandle[];
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly position = { value: 0 };
  private target = 0;
  private active = 0;
  private locked = true;
  private viewportWidth = 0;
  private viewportHeight = 0;
  private cardWidth = 0;
  private cardHeight = 0;
  private radius = 0;
  private lastPosition = 0;
  private velocity = 0;
  private pointerStart: number | null = null;
  private pointerStartY: number | null = null;
  private moved = 0;
  private readonly removeListeners: Array<() => void> = [];

  constructor(canvas: HTMLCanvasElement, projects: Project[], callbacks: CarouselSceneCallbacks) {
    this.canvas = canvas;
    this.projects = projects;
    this.callbacks = callbacks;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    this.camera.position.set(0, 0, CAMERA_Z);
    this.cards = projects.map((project, index) => {
      const card = createProjectCard(project, index);
      const canvases = createCardCanvases();
      card.canvases.front = canvases.front;
      card.canvases.back = canvases.back;
      card.frontTexture.image = canvases.front;
      card.backTexture.image = canvases.back;
      this.scene.add(card.mesh);
      paintCard(project, card.canvases);
      this.loadImage(card);
      return card;
    });
    this.addListeners();
    this.resize();
    this.setActive(0);
    this.cards.forEach((card) => { card.intro = 200; });
    this.startIntro();
  }

  setLocked(locked: boolean): void {
    this.locked = locked;
  }

  open(index: number): void {
    const card = this.cards[index];
    if (!card) return;
    this.locked = true;
    gsap.to(this.cards.filter((item) => item !== card), { fade: 1, duration: .5, ease: 'power2.out' });
    gsap.to(card, { open: 1, duration: 1, ease: 'expo.inOut' });
  }

  close(index: number): void {
    const card = this.cards[index];
    if (!card) return;
    gsap.to(card, { open: 0, duration: .8, ease: 'expo.inOut' });
    gsap.to(this.cards.filter((item) => item !== card), { fade: 0, duration: .5 });
    this.locked = false;
  }

  destroy(): void {
    this.removeListeners.forEach((remove) => remove());
    gsap.ticker.remove(this.tick);
    gsap.killTweensOf(this.position);
    gsap.killTweensOf(this.cards);
    this.cards.forEach((card) => {
      card.material.dispose();
      card.frontTexture.dispose();
      card.backTexture.dispose();
      card.mesh.geometry.dispose();
    });
    this.renderer.dispose();
  }

  private readonly tick = (): void => {
    this.velocity = this.position.value - this.lastPosition;
    this.lastPosition = this.position.value;
    this.callbacks.onPositionChange(this.position.value);
    this.render();
    this.renderer.render(this.scene, this.camera);
  };

  private startIntro(): void {
    const progress = { value: 0 };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.timeline()
      .to(progress, { value: 100, duration: reduced ? .2 : 1.6, ease: 'power2.inOut' })
      .to(this.cards, { intro: 0, duration: 1.2, ease: 'expo.out', stagger: .06, onComplete: () => { this.locked = false; this.callbacks.onReady(); } });
    gsap.ticker.add(this.tick);
  }

  private addListeners(): void {
    this.addListener(window, 'resize', this.resize);
    this.addListener(window, 'wheel', this.onWheel, { passive: true });
    this.addListener(this.canvas, 'pointerdown', this.onPointerDown);
    this.addListener(window, 'pointermove', this.onPointerMove);
    this.addListener(window, 'pointerup', this.onPointerUp);
    this.addListener(window, 'pointercancel', this.onPointerUp);
    this.addListener(window, 'keydown', this.onKeyDown);
    this.addListener(this.canvas, 'click', this.onClick);
  }

  private addListener<T extends EventTarget, K extends keyof WindowEventMap>(
    target: T, event: K, handler: (event: WindowEventMap[K]) => void, options?: AddEventListenerOptions
  ): void {
    target.addEventListener(event as string, handler as EventListener, options);
    this.removeListeners.push(() => target.removeEventListener(event as string, handler as EventListener, options));
  }

  private readonly onWheel = (event: WheelEvent): void => {
    this.nudge((event.deltaX + event.deltaY) * WHEEL_SENSITIVITY);
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.pointerStart = event.clientX;
    this.pointerStartY = event.clientY;
    this.moved = 0;
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (this.pointerStart === null || this.pointerStartY === null) return;
    const deltaX = event.clientX - this.pointerStart;
    const deltaY = event.clientY - this.pointerStartY;
    this.pointerStart = event.clientX;
    this.pointerStartY = event.clientY;
    this.moved += Math.max(Math.abs(deltaX), Math.abs(deltaY));
    const delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
    this.nudge(-delta * DRAG_SENSITIVITY);
  };

  private readonly onPointerUp = (): void => {
    this.pointerStart = null;
    this.pointerStartY = null;
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (this.locked) return;
    if (event.key === 'ArrowRight') this.go(Math.round(this.target) + 1);
    if (event.key === 'ArrowLeft') this.go(Math.round(this.target) - 1);
    if (event.key === 'Enter') this.callbacks.onProjectOpen(this.active);
  };

  private readonly onClick = (event: MouseEvent): void => {
    if (this.moved > SWIPE_THRESHOLD || this.locked) return;
    this.pointer.set((event.clientX / this.viewportWidth) * 2 - 1, -(event.clientY / this.viewportHeight) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const visible = this.cards.filter((card) => card.mesh.visible).map((card) => card.mesh);
    const hit = this.raycaster.intersectObjects(visible)[0];
    if (!hit) return;
    const index = Number(hit.object.userData.index);
    this.callbacks.onProjectOpen(index);
  };

  private nudge(delta: number): void {
    if (this.locked) return;
    this.target += delta;
    gsap.to(this.position, { value: this.target, duration: .45, ease: CAROUSEL_EASE, overwrite: true });
    this.setActive(Math.round(this.target));
  }

  private go(target: number): void {
    if (this.locked) return;
    this.target = target;
    gsap.to(this.position, { value: target, duration: 1.1, ease: 'expo.out', overwrite: true, onComplete: () => this.setActive(target) });
  }

  private setActive(rawIndex: number): void {
    const index = wrapIndex(rawIndex, this.projects.length);
    if (index === this.active && this.active !== -1) return;
    this.active = index;
    this.callbacks.onActiveChange(index);
  }

  private readonly resize = (): void => {
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    const mobile = this.viewportWidth < MOBILE_BREAKPOINT;
    this.cardWidth = mobile ? this.viewportWidth * .84 : Math.min(this.viewportWidth * .56, DESKTOP_CARD_WIDTH);
    this.cardHeight = this.cardWidth * .58;
    this.radius = this.cardWidth * (mobile ? .96 : 1.16);
    this.renderer.setSize(this.viewportWidth, this.viewportHeight);
    this.camera.aspect = this.viewportWidth / this.viewportHeight;
    this.camera.fov = 2 * Math.atan(this.viewportHeight / 2 / CAMERA_Z) * 180 / Math.PI;
    this.camera.updateProjectionMatrix();
    this.cards.forEach((card) => {
      card.material.uniforms.uW.value = this.cardWidth;
      card.material.uniforms.uR.value = this.cardWidth;
    });
  };

  private render(): void {
    const mobile = this.viewportWidth < MOBILE_BREAKPOINT;
    this.cards.forEach((card, index) => {
      const distance = shortestDistance(index, this.position.value, this.projects.length);
      const angle = distance * (mobile ? 1.06 : .82);
      const absoluteDistance = Math.abs(distance);
      const depth = Math.cos(angle);
      const side = Math.sin(angle);
      const open = card.open;
      const scale = (absoluteDistance < .01 ? 1 : Math.max(.56, 1 - absoluteDistance * .2));
      const widthScale = (absoluteDistance < .01 ? 1.04 : Math.max(.78, 1 - absoluteDistance * .1));
      const coverage = Math.max(this.viewportWidth / this.cardWidth, this.viewportHeight / this.cardHeight) * 1.02;
      const finalScale = scale + (coverage - scale) * open;
      const finalWidthScale = widthScale + (1 - widthScale) * open;
      const bend = 1 - open;
      card.mesh.position.set(this.radius * side * bend, (this.viewportHeight * (mobile ? .03 : .02) - card.intro) * bend, (this.radius * (depth - 1) - absoluteDistance * 55) * bend);
      card.mesh.rotation.set(0, angle * bend, -distance * 2 * Math.PI / 180);
      card.mesh.scale.set(this.cardWidth * finalWidthScale * finalScale, this.cardHeight * finalScale, finalScale);
      card.mesh.renderOrder = -Math.round(absoluteDistance * 10) + (open > 0 ? 50 : 0);
      card.mesh.visible = !(depth < .08 || absoluteDistance > 2.45);
      const uniforms = card.material.uniforms;
      uniforms.uK.value = bend;
      uniforms.uMix.value = open;
      uniforms.uAlpha.value = Math.max(.38, 1 - absoluteDistance * .2) * (1 - card.fade);
      uniforms.uDim.value = Math.min(.4, absoluteDistance * .4);
      uniforms.uGx.value = .52 - distance * .75;
      uniforms.uGl.value = .1 + Math.min(.5, Math.abs(this.velocity) * 25) * Math.max(0, 1 - absoluteDistance * .6);
    });
  }

  private loadImage(card: ProjectCardHandle): void {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => { paintCard(card.project, card.canvases, image); card.frontTexture.needsUpdate = true; card.backTexture.needsUpdate = true; };
    image.onerror = () => undefined;
    image.src = card.project.image ?? `/images/${card.project.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
  }
}
