import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from '../../../app';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthModule } from './pages/auth/auth-module';
import { CoreModule } from '../../../../libs/core/core.module';
import { GlobalLoadingComponent } from '../../../../libs/shared/ui/components/global-loading/global-loading.component';


var AppModules = [
    AuthModule,
    CoreModule,
    GlobalLoadingComponent
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
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
