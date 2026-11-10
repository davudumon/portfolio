'use client';

import { useEffect, useRef, type ReactElement } from 'react';
import { projects } from '@/data/projects';
import { CarouselScene } from './CarouselScene';
import styles from './Carousel.module.css';

interface CarouselProps {
  locked: boolean;
  onActiveChange: (index: number) => void;
  onPositionChange: (position: number) => void;
  onProjectOpen: (index: number) => void;
  onReady: () => void;
  onSceneReady: (scene: CarouselScene) => void;
}

export function Carousel({ locked, onActiveChange, onPositionChange, onProjectOpen, onReady, onSceneReady }: CarouselProps): ReactElement {
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<CarouselScene | null>(null);
  useEffect(() => {
    if (!canvas.current) return;
    const instance = new CarouselScene(canvas.current, projects, { onActiveChange, onPositionChange, onProjectOpen, onReady });
    scene.current = instance;
    onSceneReady(instance);
    return () => { instance.destroy(); scene.current = null; };
  }, [onActiveChange, onPositionChange, onProjectOpen, onReady, onSceneReady]);
  useEffect(() => {
    scene.current?.setLocked(locked);
  }, [locked]);
  return <main className={styles.stage} aria-label="Project"><canvas ref={canvas} /></main>;
}
