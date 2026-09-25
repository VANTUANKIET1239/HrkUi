export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  statusCode: number;
}

export interface PlayerGameInfoDto {
  profile: PlayerProfileDto | null;
  wallet: PlayerWalletDto | null;
  selectedFormationId?: number | null;
  selectedFormationCode?: string | null;
  selectedFormationName?: string | null;
  formationPower?: number;
}

export interface PlayerProfileDto {
  id: number;
  userId: string;
  playerName: string;
  level: number;
  exp: number;
  maxExp: number;
  power?: number;
  avatarType: 'TEMPLATE' | 'CUSTOM';
  avatarTemplateId?: number;
  avatarUrl?: string;
  avatarVersion: number;
  createdOn: string;
  updatedOn: string;
}

export interface PlayerAvatarTemplateDto {
  id: number;
  code: string;
  name: string;
  imagePath: string;
  isSelected: boolean;
}

export interface PlayerWalletDto {
  playerId: number;
  gold: number;
  diamonds: number;
  upgradeMaterials: number;
  maxCapacity: number;
  updatedOn: string;
}
