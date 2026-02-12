/**
 * Wrapper optionnel autour d'expo-clipboard.
 * Si le module natif n'est pas disponible (ex. Expo Go), les appels sont des no-op.
 */

let clipboard: typeof import('expo-clipboard') | null | undefined = undefined;

function getClipboard(): typeof import('expo-clipboard') | null {
  if (clipboard === undefined) {
    try {
      clipboard = require('expo-clipboard');
    } catch {
      clipboard = null;
    }
  }
  return clipboard ?? null;
}

export function isClipboardAvailable(): boolean {
  return getClipboard() != null;
}

export async function setStringAsync(text: string): Promise<void> {
  const mod = getClipboard();
  if (!mod) return;
  try {
    await mod.setStringAsync(text);
  } catch {
    // Module natif indisponible (ex. Expo Go)
  }
}
