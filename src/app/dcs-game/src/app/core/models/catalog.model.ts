export interface CatalogHero {
  id: number;
  name: string;
  avatar: string;
  factionId: number;
  factionCode: string;
  factionName: string;
  classId: number;
  classCode: string;
  className: string;
  rarityId: number;
  rarityCode: string;
  rarityName: string;
  rarityColorHex?: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
}

export interface CatalogItem {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  rarityId: number;
  rarityCode: string;
  rarityName: string;
  imagePath?: string;
  icon?: string;
  levelReq: number;
  description?: string;
  baseStats?: Record<string, number>;
  attributes?: Array<{ attributeName: string; value: number; isPercentage: boolean }>;
}

export interface CatalogGroup<T> {
  code: string;
  name: string;
  color: string;
  items: T[];
}
