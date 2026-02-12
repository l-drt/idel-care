import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/services/api';

const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'user';
const BIOMETRIC_ENABLED_KEY = 'biometricEnabled';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export type Pending2FA = {
  userId: string;
  needMethodChoice?: boolean;
  qrCode?: string;
  secret?: string;
  method?: 'TOTP' | 'SMS' | 'EMAIL';
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Après login, si 2FA requise (choix méthode, setup ou vérification) */
  pending2FA: Pending2FA | null;
  /** Session en cours : déverrouillage biométrique requis avant d'accéder aux tabs */
  needsBiometricUnlock: boolean;
  /** Proposer d'activer Face ID / Touch ID après une connexion réussie */
  shouldOfferBiometric: boolean;
  /** Déverrouillage biométrique activé par l'utilisateur (lu au checkAuth) */
  biometricEnabled: boolean;

  login: (email: string, password: string) => Promise<void>;
  choose2FAMethod: (userId: string, method: 'TOTP' | 'SMS' | 'EMAIL') => Promise<void>;
  setPending2FA: (data: Pending2FA | null) => void;
  verify2FA: (userId: string, code: string) => Promise<void>;
  enable2FA: (userId: string, code: string) => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  unlockWithBiometricSuccess: () => void;
  declineBiometricOffer: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  pending2FA: null,
  needsBiometricUnlock: false,
  shouldOfferBiometric: false,
  biometricEnabled: false,

  login: async (email: string, password: string) => {
    const res = await api.login(email, password);
    if ('requires2FASetup' in res && res.requires2FASetup) {
      if ('needMethodChoice' in res && res.needMethodChoice) {
        set({ pending2FA: { userId: res.userId, needMethodChoice: true } });
      } else if ('qrCode' in res && res.qrCode) {
        set({ pending2FA: { userId: res.userId, qrCode: res.qrCode, secret: res.secret } });
      } else {
        set({ pending2FA: { userId: res.userId } });
      }
      return;
    }
    if ('requires2FA' in res && res.requires2FA) {
      set({
        pending2FA: {
          userId: res.userId,
          method: res.method ?? 'TOTP',
        },
      });
      return;
    }
  },

  choose2FAMethod: async (userId: string, method: 'TOTP' | 'SMS' | 'EMAIL') => {
    const res = await api.choose2FAMethod(userId, method);
    if (res.method === 'TOTP' && 'qrCode' in res) {
      set({
        pending2FA: {
          userId,
          qrCode: res.qrCode,
          secret: res.secret,
        },
      });
    } else {
      set({
        pending2FA: {
          userId,
          method: res.method as 'SMS' | 'EMAIL',
        },
      });
    }
  },

  setPending2FA: (data) => set({ pending2FA: data }),

  verify2FA: async (userId: string, code: string) => {
    const data = await api.verify2FA(userId, code);
    await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));
    set({ user: data.user, isAuthenticated: true, pending2FA: null, shouldOfferBiometric: true });
  },

  enable2FA: async (userId: string, code: string) => {
    const data = await api.enable2FA(userId, code);
    await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));
    set({ user: data.user, isAuthenticated: true, pending2FA: null, shouldOfferBiometric: true });
  },

  setBiometricEnabled: async (enabled: boolean) => {
    if (enabled) {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
      set({ shouldOfferBiometric: false, biometricEnabled: true });
    } else {
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      set({ shouldOfferBiometric: false, biometricEnabled: false });
    }
  },

  unlockWithBiometricSuccess: () => set({ needsBiometricUnlock: false }),

  declineBiometricOffer: () => set({ shouldOfferBiometric: false }),

  logout: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) await api.logout(token);
    } catch (_) {}
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    set({ user: null, isAuthenticated: false, pending2FA: null, needsBiometricUnlock: false, shouldOfferBiometric: false, biometricEnabled: false });
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userStr = await SecureStore.getItemAsync(USER_KEY);
      const biometricEnabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          needsBiometricUnlock: biometricEnabled === 'true',
          biometricEnabled: biometricEnabled === 'true',
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
