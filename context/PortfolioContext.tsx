'use client';

import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode, type ReactElement } from 'react';

interface PortfolioState {
  activeProject: number;
  aboutOpen: boolean;
  detailProject: number | null;
  loadingComplete: boolean;
  locked: boolean;
}

type PortfolioAction =
  | { type: 'activeProjectChanged'; index: number }
  | { type: 'aboutToggled' }
  | { type: 'detailOpened'; index: number }
  | { type: 'detailClosed' }
  | { type: 'loadingComplete' }
  | { type: 'lockedChanged'; locked: boolean };

interface PortfolioContextValue {
  state: PortfolioState;
  dispatch: Dispatch<PortfolioAction>;
}

const initialState: PortfolioState = {
  activeProject: 0,
  aboutOpen: false,
  detailProject: null,
  loadingComplete: false,
  locked: true
};

function reducer(state: PortfolioState, action: PortfolioAction): PortfolioState {
  switch (action.type) {
    case 'activeProjectChanged': return { ...state, activeProject: action.index };
    case 'aboutToggled': return { ...state, aboutOpen: !state.aboutOpen, locked: !state.aboutOpen };
    case 'detailOpened': return { ...state, detailProject: action.index, locked: true };
    case 'detailClosed': return { ...state, detailProject: null, locked: false };
    case 'loadingComplete': return { ...state, loadingComplete: true, locked: false };
    case 'lockedChanged': return { ...state, locked: action.locked };
    default: return state;
  }
}

export function PortfolioProvider({ children }: { children: ReactNode }): ReactElement {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function usePortfolio(): PortfolioContextValue {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used inside PortfolioProvider');
  return context;
}
