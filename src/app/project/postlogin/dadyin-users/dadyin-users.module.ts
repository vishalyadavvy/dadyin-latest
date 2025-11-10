import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DadyinUsersRoutingModule } from './dadyin-users-routing.module';
import { DayinUsersComponent } from './dayin-users.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';



@NgModule({
  declarations: [
    DayinUsersComponent
  ],
  imports: [
    CommonModule,
    DadyinUsersRoutingModule,
    MaterialModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    MatTabsModule
  ]
})
export class DadyinUsersModule { }
