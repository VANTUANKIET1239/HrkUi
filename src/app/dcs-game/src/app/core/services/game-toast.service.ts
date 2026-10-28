import { Inject, Injectable, Optional } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { textKey } from '@hrk/localization/text-key';
import { Subject } from 'rxjs';
import { toAppError } from '../../../../../../libs/core/http/hrk-api/app-error';
import { GameToastEvent, GameToastOptions, GameToastType } from '../models/game-toast.model';

const DURATION: Record<GameToastType, number> = { success: 3000, info: 3500, warning: 4500, error: 6000 };
const DEDUPE_WINDOW_MS = 2000;

@Injectable({ providedIn: 'root' })
export class GameToastService {
  private readonly eventsSubject = new Subject<GameToastEvent>();
  readonly events$ = this.eventsSubject.asObservable();
  private readonly recent = new Map<string, { id: string; time: number }>();
  private sequence = 0;
  constructor(@Optional() @Inject(TranslateService) private readonly translate: TranslateService | null = null) {}

  /** Tagged template preserves dynamic notification values without losing the translation key. */
  text(parts: TemplateStringsArray, ...values: unknown[]): string {
    const template = parts.reduce((text, part, index) => text + (index ? `{{p${index - 1}}}` : '') + part, '');
    const key = textKey(template);
    const parameters = Object.fromEntries(values.map((value, index) => [`p${index}`, String(value ?? '')]));
    const translated = this.translate?.instant(key, parameters);
    if (typeof translated === 'string' && translated !== key) return translated;
    return template.replace(/\{\{p(\d+)\}\}/g, (_, index) => String(values[Number(index)] ?? ''));
  }

  show(message: string, type: GameToastType = 'info', options: GameToastOptions = {}): string {
    const now = Date.now();
    for (const [key, entry] of this.recent) {
      if (now - entry.time >= DEDUPE_WINDOW_MS) this.recent.delete(key);
    }
    const key = options.dedupeKey ?? `${type}:${message}`;
    const id = this.recent.get(key)?.id ?? `game-toast-${++this.sequence}`;
    this.recent.set(key, { id, time: now });
    const durationMs = Number.isFinite(options.durationMs) ? Math.max(0, options.durationMs!) : DURATION[type];
    this.eventsSubject.next({ action: 'show', toast: { id, type, message, title: options.title, durationMs } });
    return id;
  }

  success(message: string, options?: GameToastOptions): string { return this.show(message, 'success', options); }
  warning(message: string, options?: GameToastOptions): string { return this.show(message, 'warning', options); }
  info(message: string, options?: GameToastOptions): string { return this.show(message, 'info', options); }
  error(message: string, options?: GameToastOptions): string { return this.show(message, 'error', options); }

  fromError(error: unknown, fallbackMessage = 'Không thể thực hiện thao tác.'): string | null {
    const failure = toAppError(error);
    // Expired sessions already have a dedicated dialog in AuthInterceptor.
    if (failure.type === 'auth' && failure.status === 401) return null;
    const message = failure.type === 'system' ? fallbackMessage : failure.message;
    return failure.expected ? this.warning(message) : this.error(message);
  }

  dismiss(id: string): void {
    for (const [key, entry] of this.recent) {
      if (entry.id === id) this.recent.delete(key);
    }
    this.eventsSubject.next({ action: 'dismiss', id });
  }

  clear(): void {
    this.recent.clear();
    this.eventsSubject.next({ action: 'clear' });
  }
}
