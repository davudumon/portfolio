'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import gsap from 'gsap';
import styles from './AboutPanel.module.css';

export function AboutPanel({ open, onScrollChange }: { open: boolean; onScrollChange?: (scrolled: boolean) => void }): ReactElement {
  const panel = useRef<HTMLElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [hoveredPhoto, setHoveredPhoto] = useState<HoveredPhoto | null>(null);
  useEffect(() => {
    [
      ...experiences.map((experience) => experience.image).filter(Boolean),
      '/images/idic.webp',
      '/images/unib.webp',
    ].forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);
  useEffect(() => {
    const element = panel.current;
    if (!element) return;
    const handleScroll = () => onScrollChange?.(element.scrollTop > 12);
    element.addEventListener('scroll', handleScroll, { passive: true });
    onScrollChange?.(open && element.scrollTop > 12);
    const content = element.querySelectorAll(`.${styles.big}, .${styles.col}`);
    timeline.current?.kill();
    if (open) {
      gsap.set(element, { visibility: 'visible', clipPath: 'inset(0 0 100% 0)' });
      timeline.current = gsap.timeline()
        .to(element, { clipPath: 'inset(0 0 0% 0)', duration: .9, ease: 'expo.inOut' })
        .fromTo(content, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .8, ease: 'expo.out' }, '-=.4');
    } else {
      gsap.set(element, { visibility: 'visible' });
      timeline.current = gsap.timeline({ onComplete: () => gsap.set(element, { visibility: 'hidden' }) })
        .to(content, { y: -24, opacity: 0, stagger: .04, duration: .35, ease: 'power2.in' })
        .to(element, { clipPath: 'inset(0 0 100% 0)', duration: .7, ease: 'expo.inOut' }, '-=.12');
    }
    return () => {
      element.removeEventListener('scroll', handleScroll);
      timeline.current?.kill();
      timeline.current = null;
    };
  }, [onScrollChange, open]);
  return (
    <section ref={panel} className={styles.panel} aria-label="About" aria-hidden={!open}>
      <div className={styles.grid}>
        <p className={styles.big}>I build reliable software, develop AI-powered systems, and create digital products that solve real-world problems.</p>
        <div className={styles.col}><strong>About</strong><p className={styles.text}>Nawwaf Zayyan Musyafa</p><p className={styles.text}>Diploma student in Software Engineering Technology at the Vocational College of Universitas Gadjah Mada</p><p className={styles.text}>GPA 3.79</p><p className={styles.text}>Focused on backend development and continuous improvement through organizations, volunteering, and internship opportunities</p></div>
        <div className={styles.col}><strong>Skills</strong><SkillList /></div>
        <div className={styles.col}><strong>Experience</strong><ExperienceList onPhotoHover={setHoveredPhoto} /></div>
        <div className={styles.col}><strong>Education</strong><EducationList /></div>
        <div className={styles.col}><strong>Achievements</strong><AchievementList onPhotoHover={setHoveredPhoto} /></div>
        <div className={styles.col}><strong>Contact</strong><IconList items={[
          { icon: <MailIcon />, content: <a href="mailto:nawwafzayyan27@gmail.com">nawwafzayyan27@gmail.com</a> },
          { icon: <GithubIcon />, content: <a href="https://github.com/davudumon">github.com/davudumon</a> },
          { icon: <DocumentIcon />, content: <a href="/CV_Nawwaf_Zayyan_Musyafa.pdf" download>Download CV</a> }
        ]} /></div>
      </div>
      <PhotoPreload />
      <PhotoPreview photo={hoveredPhoto} />
    </section>
  );
}

type HoveredPhoto = {
  src: string;
  alt: string;
  x: number;
  y: number;
  centered?: boolean;
};

type PhotoHoverHandler = (photo: HoveredPhoto | null) => void;

const skills = [
  ['Python', 'python'], ['Java', 'openjdk'], ['PHP', 'php'], ['JavaScript', 'javascript'],
  ['TypeScript', 'typescript'], ['Kotlin', 'kotlin'], ['Next.js', 'nextdotjs'], ['React', 'react'],
  ['Laravel', 'laravel'], ['NestJS', 'nestjs'], ['Prisma', 'prisma'], ['MySQL', 'mysql'],
  ['PostgreSQL', 'postgresql'], ['Oracle', 'oracle'], ['Docker', 'docker'], ['Git', 'git'],
  ['Selenium', 'selenium'], ['Cucumber BDD', 'cucumber']
] as const;

const experiences = [
  { role: 'Technology Development Lead', organization: 'ASSETS UGM', period: '2025 - 2026', logo: '/images/assets.webp', image: '/images/assets-experience.webp' },
  { role: 'Software Research and Development', organization: 'KOMATIK UGM', period: '2026 - present', logo: '/images/komatik.webp', image: '/images/komatik-experience.webp' },
  { role: 'Hacker', organization: 'Google Developer Group on Campus UGM', period: '2025 - 2026', logo: '/images/gdgoc.webp', image: '/images/gdg-2.webp' },
  { role: 'Programming Lab Assistant', organization: 'Sekolah Vokasi UGM', period: '2025', logo: '/images/ugm.webp', image: '/images/asprak.webp' },
] as const;

function ExperienceList({ onPhotoHover }: { onPhotoHover: PhotoHoverHandler }): ReactElement {
  return <ul className={styles.list}>{experiences.map((experience) => (
    <li
      className={styles.experience}
      key={`${experience.role}-${experience.organization}`}
      onMouseEnter={(event) => experience.image && onPhotoHover({ src: experience.image, alt: experience.organization, x: event.clientX, y: event.clientY })}
      onMouseMove={(event) => experience.image && onPhotoHover({ src: experience.image, alt: experience.organization, x: event.clientX, y: event.clientY })}
      onMouseLeave={() => onPhotoHover(null)}
      onClick={(event) => {
        if (!experience.image || !window.matchMedia('(pointer: coarse)').matches) return;
        const current = event.currentTarget;
        onPhotoHover(current.dataset.photoOpen === 'true'
          ? null
          : { src: experience.image, alt: experience.organization, x: 0, y: 0, centered: true });
        current.dataset.photoOpen = current.dataset.photoOpen === 'true' ? 'false' : 'true';
      }}
    >
      <span className={styles.experienceLogoSlot}>
        {experience.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.experienceLogo} src={experience.logo} alt="" aria-hidden="true" />
        ) : null}
      </span>
      <span className={styles.experienceInfo}>
        <span className={styles.experienceOrganization}>{experience.organization} <span className={styles.experiencePeriod}>({experience.period})</span></span>
        <span className={styles.experienceRole}>{experience.role}</span>
      </span>
    </li>
  ))}</ul>;
}

function IconList({ items }: { items: Array<{ icon: ReactNode; content: ReactNode }> }): ReactElement {
  return <ul className={styles.iconList}>{items.map((item, index) => (
    <li className={styles.iconListItem} key={index}>
      <span className={styles.listIcon} aria-hidden="true">{item.icon}</span>
      <span>{item.content}</span>
    </li>
  ))}</ul>;
}

function MailIcon(): ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>;
}

function GithubIcon(): ReactElement {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.61-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 7c.85 0 1.7.11 2.49.32 1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  </svg>;
}

function DocumentIcon(): ReactElement {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>;
}

function EducationList(): ReactElement {
  const education = [
    { logo: '/images/ugm.webp', text: 'Diploma in Software Engineering Technology, UGM, GPA 3.79, 2024 - present' },
    { logo: '/images/sman4.webp', text: 'SMA Negeri 4 Surakarta, Mathematics and Science, 2021 - 2024' }
  ];
  return <ul className={styles.list}>{education.map((item) => (
    <li className={styles.experience} key={item.text}>
      <span className={styles.experienceLogoSlot}>
        {item.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.experienceLogo} src={item.logo} alt="" aria-hidden="true" />
        ) : null}
      </span>
      <span className={styles.educationInfo}>{item.text}</span>
    </li>
  ))}</ul>;
}

function AchievementList({ onPhotoHover }: { onPhotoHover: PhotoHoverHandler }): ReactElement {
  const achievements = [
    { position: '3rd', text: 'International Dam Innovation Contest (IDIC), CEIC Universitas Diponegoro, 2026', image: '/images/idic.webp' },
    { position: '2nd', text: 'National Student Scientific Writing Competition, Pesta Rakyat UNIB x Fision, 2025', image: '/images/unib.webp' }
  ];
  return <ul className={styles.iconList}>{achievements.map((achievement) => (
    <li
      className={styles.iconListItem}
      key={achievement.position}
      onMouseEnter={(event) => achievement.image && onPhotoHover({ src: achievement.image, alt: achievement.text, x: event.clientX, y: event.clientY })}
      onMouseMove={(event) => achievement.image && onPhotoHover({ src: achievement.image, alt: achievement.text, x: event.clientX, y: event.clientY })}
      onMouseLeave={() => onPhotoHover(null)}
      onClick={(event) => {
        if (!achievement.image || !window.matchMedia('(pointer: coarse)').matches) return;
        const current = event.currentTarget;
        onPhotoHover(current.dataset.photoOpen === 'true'
          ? null
          : { src: achievement.image, alt: achievement.text, x: 0, y: 0, centered: true });
        current.dataset.photoOpen = current.dataset.photoOpen === 'true' ? 'false' : 'true';
      }}
    >
      <span className={`${styles.achievementPosition} ${achievement.position === '3rd' ? styles.bronze : styles.silver}`}>{achievement.position}</span>
      <span>{achievement.text}</span>
    </li>
  ))}</ul>;
}

function PhotoPreview({ photo }: { photo: HoveredPhoto | null }): ReactElement | null {
  if (!photo?.src) return null;

  const style = photo.centered
    ? undefined
    : { transform: `translate3d(${photo.x + 18}px, ${photo.y + 18}px, 0)` } as CSSProperties;

  return (
    <div className={`${styles.photoPreview} ${photo.centered ? styles.photoPreviewCentered : ''}`} style={style} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt="" />
    </div>
  );
}

function PhotoPreload(): ReactElement {
  const sources = [
    ...experiences.map((experience) => experience.image).filter(Boolean),
    '/images/idic.webp',
    '/images/unib.webp',
  ];

  return (
    <div className={styles.photoPreload} aria-hidden="true">
      {sources.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" />
      ))}
    </div>
  );
}

function SkillList(): ReactElement {
  return <div className={styles.skills}>{skills.map(([name, icon]) => (
    <span className={styles.skill} key={name}>
      {/* External Simple Icons keep the skill list dependency-free. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://cdn.simpleicons.org/${icon}`} alt="" aria-hidden="true" />
      {name}
    </span>
  ))}<span className={styles.skill}>RESTful API</span><span className={styles.skill}>MVC</span><span className={styles.skill}>AI/LLM</span></div>;
}
