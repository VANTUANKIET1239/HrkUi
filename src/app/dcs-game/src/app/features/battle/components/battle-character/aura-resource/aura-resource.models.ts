export type AuraResourceKey = 'thanh-thai-aura' | 'siba-angel-blessing';

export interface AuraResourceInputs {
  currentAura: number;
  maxAura: number;
  auraTier: number;
  isFullAura: boolean;
  visualSpeed: number;
  team?: 'left' | 'right';
  facing?: 'left' | 'right';
}
