import { createContext, useContext } from 'react';
import type { JCSession, JCScreen } from '../types';

interface AppContextValue {
  session: JCSession | null;
  navigate: (screen: JCScreen) => void;
  logout: () => void;
}

export const AppContext = createContext<AppContextValue>({
  session: null,
  navigate: () => {},
  logout: () => {},
});

export function useApp() { return useContext(AppContext); }
