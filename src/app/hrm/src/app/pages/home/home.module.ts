import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { MainComponent } from './features/main/main.component';
import { HrmHomeRoutingModule } from './home-routing-module';

@NgModule({
  imports: [HrkTranslatePipe,
    CommonModule,
    HrmHomeRoutingModule
  ],
  declarations: [HomeComponent, MainComponent]
})
export class HomeModule { }
