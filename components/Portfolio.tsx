'use client';

import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { projects } from '@/data/projects';
import { PortfolioProvider, usePortfolio } from '@/context/PortfolioContext';
import { Carousel } from '@/components/Carousel/Carousel';
import { CarouselScene } from '@/components/Carousel/CarouselScene';
import { Header } from '@/components/Header/Header';
import { Loader } from '@/components/Loader/Loader';
import { TitlePill } from '@/components/TitlePill/TitlePill';
import { AboutPanel } from '@/components/AboutPanel/AboutPanel';
import { ProjectDetail } from '@/components/ProjectDetail/ProjectDetail';

function PortfolioContent(): ReactElement {
  const { state, dispatch } = usePortfolio();
  const scene = useRef<CarouselScene | null>(null);
  const [carouselPosition, setCarouselPosition] = useState(0);
  const [aboutScrolled, setAboutScrolled] = useState(false);
  const onActiveChange = useCallback((index: number) => dispatch({ type: 'activeProjectChanged', index }), [dispatch]);
  const onPositionChange = useCallback((position: number) => setCarouselPosition(position), []);
  const onReady = useCallback(() => dispatch({ type: 'loadingComplete' }), [dispatch]);
  const onSceneReady = useCallback((instance: CarouselScene) => { scene.current = instance; }, []);
  const onProjectOpen = useCallback((index: number) => {
    dispatch({ type: 'detailOpened', index });
    scene.current?.open(index);
  }, [dispatch]);
  const closeDetail = useCallback(() => {
    if (state.detailProject === null) return;
    scene.current?.close(state.detailProject);
    dispatch({ type: 'detailClosed' });
  }, [dispatch, state.detailProject]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') closeDetail(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeDetail]);
  return (
    <>
      <Loader complete={state.loadingComplete} />
      <Header visible={state.loadingComplete && state.detailProject === null} aboutScrolled={aboutScrolled} />
      <Carousel locked={state.locked || state.aboutOpen} onActiveChange={onActiveChange} onPositionChange={onPositionChange} onProjectOpen={onProjectOpen} onReady={onReady} onSceneReady={onSceneReady} />
      <div style={{ opacity: state.aboutOpen || state.detailProject !== null ? .2 : 1, transition: 'opacity .6s' }}><TitlePill position={carouselPosition} /></div>
      <AboutPanel open={state.aboutOpen} onScrollChange={setAboutScrolled} />
      <ProjectDetail project={state.detailProject === null ? null : projects[state.detailProject]} onClose={closeDetail} />
    </>
  );
}

export default function Portfolio(): ReactElement {
  return <PortfolioProvider><PortfolioContent /></PortfolioProvider>;
}
