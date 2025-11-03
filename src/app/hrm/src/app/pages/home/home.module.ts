import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { MainComponent } from './features/main/main.component';
import { HrmHomeRoutingModule } from './home-routing-module';

@NgModule({
  imports: [
    CommonModule,
    HrmHomeRoutingModule
  ],
  declarations: [HomeComponent, MainComponent]
})
export class HomeModule { }
