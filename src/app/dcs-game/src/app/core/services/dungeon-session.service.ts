import { Injectable, signal } from '@angular/core';
import { StartDungeonStageResult } from '../models/dungeon.model';

@Injectable({providedIn:'root'})
export class DungeonSessionService {
  private readonly storageKey='hrk-dungeon-current-run';
  private readonly mapStorageKey='hrk-dungeon-current-map';
  readonly current = signal<StartDungeonStageResult|null>(this.restore());
  readonly currentMapId = signal<number|null>(this.restoreMapId());
  set(value:StartDungeonStageResult,mapId:number):void { this.current.set(value);this.currentMapId.set(mapId);sessionStorage.setItem(this.storageKey,JSON.stringify(value));sessionStorage.setItem(this.mapStorageKey,String(mapId)); }
  clear():void { this.current.set(null);this.currentMapId.set(null);sessionStorage.removeItem(this.storageKey);sessionStorage.removeItem(this.mapStorageKey); }
  private restore():StartDungeonStageResult|null { try { const value=sessionStorage.getItem(this.storageKey);return value?JSON.parse(value) as StartDungeonStageResult:null; } catch { return null; } }
  private restoreMapId():number|null { const value=sessionStorage.getItem(this.mapStorageKey);const mapId=value?Number(value):NaN;return Number.isFinite(mapId)&&mapId>0?mapId:null; }
}
