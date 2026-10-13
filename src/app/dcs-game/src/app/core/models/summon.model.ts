export type SummonCount = 1 | 10;
export type SummonCurrency = 'GOLD' | 'DIAMOND';
export interface SummonHero {
  heroTemplateId: number;
  name: string;
  avatar: string;
  rarityCode: string;
  rarityName: string;
  rarityColorHex?: string | null;
}
export interface SummonPoolHero extends SummonHero { probabilityPercent: number; }
export interface SummonPool {
  code: string;
  name: string;
  currency: SummonCurrency;
  singleCost: number;
  tenCost: number;
  heroes: SummonPoolHero[];
}
export interface SummonWallet { gold: number; diamonds: number; }
export interface SummonConfiguration { playerId: number; wallet: SummonWallet; pools: SummonPool[]; }
export interface SummonRequest { requestId: string; poolCode: string; count: SummonCount; }
export interface SummonReward extends SummonHero {
  drawIndex: number;
  isNew: boolean;
  stoneItemTemplateId?: number | null;
  stoneName?: string | null;
  stoneQuantity: number;
}
export interface SummonResult extends SummonRequest {
  currency: SummonCurrency;
  cost: number;
  wallet: SummonWallet;
  items: SummonReward[];
}
