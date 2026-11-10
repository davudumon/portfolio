'use client';

import { type ReactElement } from 'react';
import { projects } from '@/data/projects';
import styles from './TitlePill.module.css';

export function TitlePill({ position }: { position: number }): ReactElement {
  const safePosition = Number.isFinite(position) ? position : 0;
  const normalizedPosition = ((safePosition % projects.length) + projects.length) % projects.length;
  const progress = Math.min(1, Math.max(0, normalizedPosition / projects.length));
  const titleItems = projects.map((project, index) => {
    let distance = ((index - position) % projects.length + projects.length) % projects.length;
    if (distance > projects.length / 2) distance -= projects.length;
    const absoluteDistance = Math.abs(distance);
    return (
      <span
        key={project.title}
        style={{
          transform: `translate(-50%, ${distance * 110}%) scale(${1 - Math.min(absoluteDistance, 1) * .12})`,
          opacity: Math.max(0, 1 - absoluteDistance * 1.3)
        }}
      >
        {project.title}
      </span>
    );
  });
  return (
    <div className={styles.bottom}>
      <svg className={styles.progress} viewBox="0 0 156 25" aria-hidden="true">
        <path className={styles.track} pathLength="1" strokeDasharray="1" d="M2 23 A142 142 0 0 1 154 23" />
        <path className={styles.bar} pathLength="1" strokeDasharray="1" d="M2 23 A142 142 0 0 1 154 23" style={{ strokeDashoffset: 1 - progress }} />
      </svg>
      <div className={styles.pill} aria-live="polite">
        <b className={styles.label}>{titleItems}</b>
      </div>
    </div>
  );
}
