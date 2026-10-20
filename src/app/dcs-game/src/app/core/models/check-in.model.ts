export interface CheckInReward {
  type: string;
  name: string;
  code?: string | null;
  imagePath?: string | null;
  quantity: number;
}
export interface CheckInDay {
  dayOfMonth: number;
  status: 'CLAIMED' | 'CLAIMABLE' | 'MISSED' | 'LOCKED';
  rewards: CheckInReward[];
  claimedAtUtc: string | null;
}
export interface CheckInCalendar {
  calendarId: number | null;
  name: string;
  monthKey: string | null;
  gameDate: string | null;
  serverTimeUtc: string;
  nextResetAtUtc: string | null;
  isOpen: boolean;
  canClaim: boolean;
  reason: string | null;
  claimedDays: number;
  days: CheckInDay[];
}
export interface CheckInClaim {
  requestId: string;
  calendarId: number;
  checkInDate: string;
  claimedAtUtc: string;
  configVersion: number;
  alreadyClaimed: boolean;
  rewards: CheckInReward[];
}
