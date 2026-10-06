export interface ProcessStatusUpdated {
  eventId: string;
  jobId: string;
  userId: string;
  processType: string;
  version: number;
  current: number;
  total: number;
  percentage: number;
  status: string;
  occurredAt: string;
  errorCode?: string;
  errorMessage?: string;
}
