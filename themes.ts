
export interface ThemeGroup {
  id: string;
  name: string;
  darkId: string;
  lightId: string;
  primaryColor: string;
  backgroundColor: string;
}

export const THEME_GROUPS: ThemeGroup[] = [
  {
    id: 'finance',
    name: 'Finance Gradient',
    darkId: 'theme-finance-dark',
    lightId: 'theme-finance-light',
    primaryColor: '#00ffa5',
    backgroundColor: '#14121a'
  },
  {
    id: 'analytics',
    name: 'Analytics Purple',
    darkId: 'theme-analytics-dark',
    lightId: 'theme-analytics-light',
    primaryColor: '#725cff',
    backgroundColor: '#0f0a20'
  },
  {
    id: 'store',
    name: 'Store Soft Dark',
    darkId: 'theme-store-dark',
    lightId: 'theme-store-light',
    primaryColor: '#5a87ff',
    backgroundColor: '#12141c'
  },
  {
    id: 'frosted',
    name: 'Frosted Dark',
    darkId: 'theme-frosted-dark',
    lightId: 'theme-frosted-light',
    primaryColor: '#4aa8ff',
    backgroundColor: '#0d1117'
  },
  {
    id: 'neon',
    name: 'Neon Gradient',
    darkId: 'theme-neon-gradient',
    lightId: 'theme-neon-light',
    primaryColor: '#00c6ff',
    backgroundColor: '#000428'
  },
  {
    id: 'fog',
    name: 'Deep Fog Blue',
    darkId: 'theme-fog-dark',
    lightId: 'theme-fog-light',
    primaryColor: '#3c83ff',
    backgroundColor: '#0a0f14'
  }
];
