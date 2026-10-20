import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HrkApiService } from '../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiMethod } from '../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { ApiEndpoints } from '../../../../../../libs/shared/common/constants/api-endpoints';
import { BaseResponse } from '../models/player.model';
import { CheckInCalendar, CheckInClaim } from '../models/check-in.model';

@Injectable({ providedIn: 'root' })
export class CheckInService {
  private readonly api = inject(HrkApiService);
  getCalendar(): Observable<BaseResponse<CheckInCalendar>> {
    return this.api.CallApi<BaseResponse<CheckInCalendar>>(ApiMethod.GET, ApiEndpoints.CheckIn.Calendar, { withCredentials: true });
  }
  claim(requestId: string): Observable<BaseResponse<CheckInClaim>> {
    return this.api.CallApi<BaseResponse<CheckInClaim>>(ApiMethod.POST, ApiEndpoints.CheckIn.Claim, { requestId }, { withCredentials: true });
  }
}
