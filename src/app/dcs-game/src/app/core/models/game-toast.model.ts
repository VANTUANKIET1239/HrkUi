export type GameToastType = 'success' | 'warning' | 'info' | 'error';

export interface GameToastOptions {
  title?: string;
  /** Zero keeps the toast open until dismissed. */
  durationMs?: number;
  dedupeKey?: string;
}

export interface GameToast {
  id: string;
  type: GameToastType;
  message: string;
  title?: string;
  durationMs: number;
}

export type GameToastEvent =
  | { action: 'show'; toast: GameToast }
  | { action: 'dismiss'; id: string }
  | { action: 'clear' };
