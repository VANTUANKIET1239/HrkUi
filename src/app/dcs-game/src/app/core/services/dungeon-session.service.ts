import { Injectable, signal } from '@angular/core';
import { StartDungeonStageResult } from '../models/dungeon.model';

interface DungeonRunSessionMetadata {
  runId: number;
  battleId: string;
  mapId: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class DungeonSessionService {
  private readonly storageKey = 'hrk-dungeon-current-run';
  private readonly mapStorageKey = 'hrk-dungeon-current-map';
  // The battle timeline can be several MB, so the playable payload stays in RAM.
  readonly current = signal<StartDungeonStageResult | null>(null);
  private readonly metadata = signal<DungeonRunSessionMetadata | null>(this.restoreMetadata());
  readonly currentMapId = signal<number | null>(this.metadata()?.mapId ?? this.restoreMapId());

  set(value: StartDungeonStageResult, mapId: number): void {
    const metadata: DungeonRunSessionMetadata = {
      runId: value.result.runId,
      battleId: value.battle.battleId,
      mapId,
      createdAt: new Date().toISOString()
    };

    this.current.set(value);
    this.metadata.set(metadata);
    this.currentMapId.set(mapId);

    // Remove the legacy full battle snapshot before saving compact metadata.
    this.removeStoredValue(this.storageKey);
    this.setStoredValue(this.storageKey, JSON.stringify(metadata));
    this.setStoredValue(this.mapStorageKey, String(mapId));
  }

  clear(): void {
    this.current.set(null);
    this.metadata.set(null);
    this.currentMapId.set(null);
    this.removeStoredValue(this.storageKey);
    this.removeStoredValue(this.mapStorageKey);
  }

  private restoreMetadata(): DungeonRunSessionMetadata | null {
    try {
      const rawValue = sessionStorage.getItem(this.storageKey);
      if (!rawValue) return null;

      const value = JSON.parse(rawValue) as Partial<DungeonRunSessionMetadata>;
      const isValid =
        typeof value.runId === 'number' &&
        Number.isFinite(value.runId) &&
        typeof value.battleId === 'string' &&
        value.battleId.length > 0 &&
        typeof value.mapId === 'number' &&
        Number.isFinite(value.mapId) &&
        value.mapId > 0;

      if (!isValid) {
        this.removeStoredValue(this.storageKey);
        return null;
      }

      return value as DungeonRunSessionMetadata;
    } catch {
      this.removeStoredValue(this.storageKey);
      return null;
    }
  }

  private restoreMapId(): number | null {
    try {
      const value = sessionStorage.getItem(this.mapStorageKey);
      const mapId = value ? Number(value) : NaN;
      return Number.isFinite(mapId) && mapId > 0 ? mapId : null;
    } catch {
      return null;
    }
  }

  private setStoredValue(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // The in-memory session remains usable if storage is full or unavailable.
    }
  }

  private removeStoredValue(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Storage may be unavailable in restricted browser contexts.
    }
  }
}
