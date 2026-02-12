/**
 * Wrapper optionnel autour d'expo-local-authentication.
 * Si le module natif n'est pas disponible (ex. Expo Go), l'API retourne des valeurs "non disponible".
 */

type LocalAuthModule = typeof import('expo-local-authentication');

let localAuth: LocalAuthModule | null | undefined = undefined;

function getLocalAuth(): LocalAuthModule | null {
  if (localAuth === undefined) {
    try {
      localAuth = require('expo-local-authentication');
    } catch {
      localAuth = null;
    }
  }
  return localAuth ?? null;
}

export function isLocalAuthAvailable(): boolean {
  return getLocalAuth() != null;
}

export async function hasHardwareAsync(): Promise<boolean> {
  const mod = getLocalAuth();
  if (!mod) return false;
  try {
    return await mod.hasHardwareAsync();
  } catch {
    return false;
  }
}

export async function isEnrolledAsync(): Promise<boolean> {
  const mod = getLocalAuth();
  if (!mod) return false;
  try {
    return await mod.isEnrolledAsync();
  } catch {
    return false;
  }
}

export async function authenticateAsync(options?: {
  promptMessage?: string;
  cancelLabel?: string;
}): Promise<{ success: boolean; error?: string }> {
  const mod = getLocalAuth();
  if (!mod) return { success: false, error: 'unavailable' };
  try {
    const result = await mod.authenticateAsync(options ?? {});
    return {
      success: result.success,
      error: result.error,
    };
  } catch {
    return { success: false, error: 'unavailable' };
  }
}
