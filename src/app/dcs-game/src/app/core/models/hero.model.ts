export interface Hero {
  id: number;
  heroTemplateId?: number;
  heroCode?: string;
  name: string;
  avatar: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
  power?: number;
  magicDamage?: number;
  magicResistance?: number;
  position: number; // 1 to 5
  team: 'left' | 'right';
  statusEffects?: string[];
  battleStatuses?: BattleStatusEffectViewModel[];
  skills?: string[];
  level?: number; // 1 to 4 passive tier level
  defaultFacing?: 'left' | 'right';
  stars?: number;
  auraTier?: number;
  starAura?: HeroStarAuraConfig | null;
}

export interface HeroStarAuraConfig {
  heroTemplateId: number;
  starLevel: number;
  auraCode: string;
  visualKey: string;
  name: string;
  description?: string | null;
  primaryColorHex?: string | null;
  secondaryColorHex?: string | null;
  intensity: number;
  particleLevel: number;
}

export interface BattleStatusModifierViewModel {
  attributeCode: string;
  attributeName?: string;
  valueType: 'FLAT' | 'PERCENT' | string;
  value: number;
}

export interface BattleStatusEffectViewModel {
  instanceId: string;
  code: string;
  name: string;
  description?: string | null;
  iconPath: string;
  colorHex: string;
  category: 'BUFF' | 'DEBUFF' | 'CONTROL' | 'SPECIAL';
  value: number;
  remainingTurns: number;
  stacks: number;
  modifiers: BattleStatusModifierViewModel[];
  sourceSkillId?: string | null;
}
