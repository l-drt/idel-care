import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0D9488',
    primaryContainer: '#CCFBF1',
    secondary: '#64748B',
    surface: '#FFFFFF',
    background: '#F8FAFC',
    outline: '#E2E8F0',
  },
  roundness: 12,
};

export const colors = {
  primary: '#0D9488',
  primaryLight: '#CCFBF1',
  text: '#0F172A',
  textMuted: '#64748B',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
  error: '#DC2626',
} as const;
