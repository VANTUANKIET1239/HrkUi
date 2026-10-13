import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { HrkModalConfig, HrkModalConfigSource, modalDefaults, MODAL_ICONS } from '../../../../../../libs/shared/ui/modal/modal-config';
import { GAME_MODAL_PRESETS } from '../configs/game-modal-presets';
import { BaseResponse } from '../models/player.model';

@Injectable({ providedIn:'root' })
export class GameModalConfigService implements HrkModalConfigSource {
  private readonly api = inject(HrkApiService);
  private readonly presets = signal<Record<string, Partial<HrkModalConfig>>>({});
  private loading = false;
  private refreshAfter = 0;

  load(force = false): void {
    if (this.loading || (!force && Date.now() < this.refreshAfter)) return;
    this.loading = true;
    this.api.CallApi<BaseResponse<unknown[]>>('GET', ApiEndpoints.GameConfig.Modals,
      { withCredentials:true, loading:'none' }).pipe(finalize(() => this.loading = false)).subscribe({
      next: response => {
        if (!response.success || !Array.isArray(response.data)) { this.refreshAfter = Date.now() + 30000; return; }
        const entries: Record<string, Partial<HrkModalConfig>> = {};
        for (const value of response.data) {
          if (!value || typeof value !== 'object') continue;
          const row = value as Record<string, unknown>;
          if (typeof row['code'] !== 'string' || !/^[A-Z][A-Z0-9_]{0,99}$/.test(row['code'])) continue;
          const safe: Partial<HrkModalConfig> = {};
          for (const field of ['title', 'messageTemplate', 'confirmText', 'cancelText'] as const) {
            const text = row[field];
            const max = field === 'messageTemplate' ? 2000 : field === 'title' ? 200 : 60;
            if (typeof text === 'string' && text.length <= max && (text.trim() || field === 'messageTemplate')) safe[field] = text;
          }
          if (['CONFIRMATION','CONTENT','NOTICE'].includes(String(row['kind']))) safe.kind = row['kind'] as HrkModalConfig['kind'];
          if (['SM','MD','LG','FULLSCREEN'].includes(String(row['size']))) safe.size = row['size'] as HrkModalConfig['size'];
          if (['DEFAULT','WARNING','DANGER','SUCCESS'].includes(String(row['tone']))) safe.tone = row['tone'] as HrkModalConfig['tone'];
          if (typeof row['iconKey'] === 'string' && Object.hasOwn(MODAL_ICONS, row['iconKey'])) safe.iconKey = row['iconKey'];
          if (typeof row['revision'] === 'number' && Number.isSafeInteger(row['revision']) && row['revision'] > 0) safe.revision = row['revision'];
          for (const field of ['closeOnBackdrop','closeOnEscape'] as const) if (typeof row[field] === 'boolean') safe[field] = row[field];
          entries[row['code']] = safe;
        }
        this.presets.set(entries);
        this.refreshAfter = Date.now() + 60000;
      },
      error: () => this.refreshAfter = Date.now() + 30000 // Local presets keep every confirmation available.
    });
  }

  resolve(code: string, fallback: Partial<HrkModalConfig>, parameters: Record<string, string | number> = {}): HrkModalConfig {
    const local = modalDefaults(code, { ...GAME_MODAL_PRESETS[code], ...fallback });
    const remote = this.presets()[code];
    const result = { ...local, ...(remote?.kind === local.kind ? remote : {}) };
    for (const field of ['title','messageTemplate'] as const) {
      const render = (text: string) => text.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g,
        (token, key: string) => Object.hasOwn(parameters, key) ? String(parameters[key]) : token);
      const rendered = render(result[field]);
      result[field] = /\{[a-zA-Z][a-zA-Z0-9_]*\}/.test(rendered) ? render(local[field]) : rendered;
    }
    return result;
  }
}
