import { BattleHeroStatisticsDto, StartBattleResultDto } from './battle.model';
import { HeroStatsDto, PlayerHeroDto } from './player-hero.model';

export interface LabBuild {
  level: number; stars: number; auraTier: number; rollSeed: number;
  equipment: { itemTemplateId: number; enhancement: number; stars: number }[];
}
export interface LabSlot { heroTemplateId: number; position: number; mode?: 'CUSTOM' | 'BUILD'; stats?: HeroStatsDto; build?: LabBuild; }
export interface LabItemOption { id: number; name: string; category: string; levelReq: number; }
export interface LabRequest {
  left: LabSlot[]; right: LabSlot[]; seed: number; count: number;
  maxRounds: number; defenseConstant: number;
}
export interface LabCatalog { heroes: PlayerHeroDto[]; defenseConstant: number; equipment: LabItemOption[]; }
export interface LabReport {
  reportVersion: number;
  snapshotHash: string;
  createdAtUtc: string;
  engineVersion: string;
  resolvedSnapshot: import('./battle.model').BattleInitialStateDto;
  resolvedBuilds: unknown[];
  battleConfigs: Record<string, number>;
  warnings: string[];
  skills: { actorId: number; skillId: string; school: string; hits: number; hpDamage: number; critHits: number }[];
  settings: LabRequest;
  runs: { seed: number; winner: string; rounds: number; heroes: { statistics: BattleHeroStatisticsDto; remainingHp: number; skillCasts: number; energyCasts: number }[] }[];
  totals: BattleHeroStatisticsDto[];
  replays: StartBattleResultDto[];
}
