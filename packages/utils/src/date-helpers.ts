/**
 * Helpers date pour IDEL Care
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}
