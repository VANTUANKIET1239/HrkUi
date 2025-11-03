import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrmComponent } from './hrm.component';
import { HrmRoutingModule } from './hrm-routing-module';

@NgModule({
  imports: [
    CommonModule,
    HrmRoutingModule
  ],
  declarations: [HrmComponent]
})
export class HrmModule { }
