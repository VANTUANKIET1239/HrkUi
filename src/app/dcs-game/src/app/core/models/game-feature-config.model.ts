export interface GameFeatureConfig {
  id: number;
  code: string;
  name: string;
  icon?: string;
  parentFeatureId?: number;
  placement: string;
  actionCode?: string;
  displayOrder: number;
  isLocked: boolean;
  hasNotification: boolean;
  children: GameFeatureConfig[];
}
