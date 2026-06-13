export interface Hero {
  id: number;
  name: string;
  avatar: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
  position: number; // 1 to 5
  team: 'left' | 'right';
  statusEffects?: string[];
  skills?: string[];
  level?: number; // 1 to 4 passive tier level
}
