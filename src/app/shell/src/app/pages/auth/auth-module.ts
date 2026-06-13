import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { RegisterComponent } from './components/register/register.component';
import { HrkInputComponent } from "../../../../../../libs/shared/ui/controls/hrk-input/hrk-input.component";
import { HrkIconComponent } from "../../../../../../libs/shared/ui/controls/hrk-icon/hrk-icon.component";
import { HrkCheckboxComponent } from "../../../../../../libs/shared/ui/controls/hrk-checkbox/hrk-checkbox.component";
import { HrkButtonComponent } from "../../../../../../libs/shared/ui/controls/hrk-button/hrk-button.component";
import { HrkImageComponent } from "../../../../../../libs/shared/ui/controls/hrk-image/hrk-image.component";
import { MultiSelectComponent } from "../../../../../../libs/shared/ui/controls/multi-select/multi-select.component";



@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    HrkInputComponent,
    HrkIconComponent,
    HrkCheckboxComponent,
    HrkButtonComponent,
    HrkImageComponent,
    MultiSelectComponent
]
})
export class AuthModule { }
