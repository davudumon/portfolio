'use client';

import { useEffect, useState, type ReactElement } from 'react';
import styles from './Loader.module.css';

export function Loader({ complete }: { complete: boolean }): ReactElement {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (complete) return;
    const timer = window.setInterval(() => setValue((current) => Math.min(current + 1, 100)), 16);
    return () => window.clearInterval(timer);
  }, [complete]);
  return <div className={`${styles.loader} ${complete ? styles.hidden : ''}`} aria-hidden="true">{String(value).padStart(6, '0')}</div>;
}
