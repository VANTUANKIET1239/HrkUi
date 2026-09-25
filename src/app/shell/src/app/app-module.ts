import { APP_INITIALIZER, NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from '../../../app';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../../../../libs/core/core.module';
import { GlobalLoadingComponent } from '../../../../libs/shared/ui/components/global-loading/global-loading.component';
import { SessionExpiredModalComponent } from '../../../../libs/core/auth/components/session-expired-modal/session-expired-modal.component';
import { AppAuthConfigService } from '../../../../libs/core/auth/services/app-auth-config.service';

function initializeAppAuthConfig(configService: AppAuthConfigService): () => Promise<void> {
  return () => configService.load();
}

var AppModules = [
    CoreModule,
    GlobalLoadingComponent,
    SessionExpiredModalComponent
]

var CoreModules = [
  BrowserModule,
  AppRoutingModule,
  FormsModule,
]

@NgModule({
  declarations: [
    App
  ],
  imports: [
    ...CoreModules,
    ...AppModules
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppAuthConfig,
      deps: [AppAuthConfigService],
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule { }
