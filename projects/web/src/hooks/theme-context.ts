import { createContext } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'fi-go.theme';

export interface ThemeContextType {
  /** Vom Nutzer gewählter Modus (inkl. „system"). */
  mode: ThemeMode;
  /** Effektiv aktiver Modus nach Auflösung von „system" gegen `prefers-color-scheme`. */
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
