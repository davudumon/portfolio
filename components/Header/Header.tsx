'use client';

import { type ReactElement } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import styles from './Header.module.css';

export function Header({ visible, aboutScrolled }: { visible: boolean; aboutScrolled: boolean }): ReactElement {
  const { state, dispatch } = usePortfolio();
  return (
    <header className={`${styles.header} ${visible ? styles.visible : styles.hidden}`}>
      <div className={`${styles.identity} ${state.aboutOpen && aboutScrolled ? styles.identityHidden : ''}`}>
        <div className={styles.name}>Nawwaf Zayyan Musyafa</div>
        <div className={styles.role}>Software and AI Engineer</div>
      </div>
      <button
        className={styles.aboutButton}
        type="button"
        aria-expanded={state.aboutOpen}
        disabled={state.detailProject !== null}
        onClick={() => dispatch({ type: 'aboutToggled' })}
      >
        {state.aboutOpen ? 'Close' : 'About'}
      </button>
    </header>
  );
}
