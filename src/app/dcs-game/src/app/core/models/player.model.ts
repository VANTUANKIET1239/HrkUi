export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  statusCode: number;
}

export interface PlayerProfileDto {
  id: number;
  userId: string;
  playerName: string;
  level: number;
  createdOn: string;
  updatedOn: string;
}

export interface PlayerWalletDto {
  playerId: number;
  gold: number;
  diamonds: number;
  upgradeMaterials: number;
  maxCapacity: number;
  updatedOn: string;
}
