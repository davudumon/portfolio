'use client';

import { useEffect, useRef, type ReactElement } from 'react';
import gsap from 'gsap';
import type { Project } from '@/types/project';
import styles from './ProjectDetail.module.css';

const iconSlugs: Record<string, string> = {
  'AI': 'googlegemini',
  'Computer Vision': 'opencv',
  'Cucumber': 'cucumber',
  'Gemini': 'googlegemini',
  'Gemini AI': 'googlegemini',
  'NestJS': 'nestjs',
  'Next.js': 'nextdotjs',
  'NextAuth': 'nextdotjs',
  'Prisma': 'prisma',
  'REST API': 'fastapi',
  'Supabase': 'supabase',
  'Swagger': 'swagger',
  'Vercel': 'vercel',
  'WebSocket': 'websocket'
};

function StackIcons({ stack }: { stack: string }): ReactElement {
  return (
    <div className={styles.stackList}>
      {stack.split(', ').map((technology) => {
        const slug = iconSlugs[technology] ?? technology.toLowerCase().replace(/[+.]/g, '').replace(/\s+/g, '');
        return (
          <span className={styles.stackItem} key={technology}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://cdn.simpleicons.org/${slug}`} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            {technology}
          </span>
        );
      })}
    </div>
  );
}

export function ProjectDetail({ project, onClose }: { project: Project | null; onClose: () => void }): ReactElement {
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!project || !panel.current) return;
    const context = gsap.context(() => {
      gsap.fromTo(panel.current, { opacity: 0, clipPath: 'inset(0 0 100% 0)', visibility: 'hidden' }, { opacity: 1, clipPath: 'inset(0 0 0% 0)', visibility: 'visible', duration: .5, ease: 'power2.out' });
      const element = panel.current;
      if (element) gsap.fromTo(element.querySelectorAll(`.${styles.title}, .${styles.col}`), { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .9, ease: 'expo.out', delay: .3 });
    }, panel);
    return () => context.revert();
  }, [project]);
  return (
    <>
      <section ref={panel} className={styles.panel} aria-label="Detail project" aria-hidden={!project}>
        {project && <div className={styles.grid}>
          <h1 className={styles.title}>{project.title}</h1>
          <div className={styles.col}><strong>Year</strong><span>{project.year}</span></div>
          <div className={styles.col}><strong>Role</strong><span>{project.role}</span></div>
          <div className={styles.col}><strong>Stack</strong><StackIcons stack={project.stack} /></div>
          <div className={`${styles.col} ${styles.wide}`}>{project.description}</div>
        </div>}
      </section>
      <button className={styles.close} type="button" onClick={onClose} aria-label="Close project detail" style={{ visibility: project ? 'visible' : 'hidden' }}>Close</button>
    </>
  );
}
