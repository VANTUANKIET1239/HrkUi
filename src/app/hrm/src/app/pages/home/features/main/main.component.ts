import { TokenManagerService } from './../../../../../../../../libs/core/auth/services/token-manager';
import { ApiMethod } from './../../../../../../../../libs/shared/common/constants/ApiMethod.constants';
import { Component, OnInit } from '@angular/core';
import { HrkApiService } from '../../../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { ApiEndpoints } from '../../../../../../../shell/src/app/core/api-enpoints/api-endpoints';
import { NavigationService } from '../../../../../../../../libs/core/services/navigation.service';

@Component({
  selector: 'app-main',
  standalone: false,
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  public readonly authApi = ApiEndpoints.Auth;

  constructor(private hrkApiService: HrkApiService, private navigationService: NavigationService, private tokenManager: TokenManagerService) { }

  ngOnInit() {
  }


  onclicktest(){
      this.hrkApiService.CallApi(ApiMethod.POST,this.authApi.Logout,
          {
              withCredentials: true
            }).subscribe({
              next: (res) => {
                  this.tokenManager.forceDeleteAllCache();
                  this.navigationService.goTo('/login');
              },
              error: (err) => {
                console.error('API error:', err);
              },
              complete: () => {
              }
            });

  }
}
