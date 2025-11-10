import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllBusinessComponent } from './all-business.component';
import { AllBusinessRoutingModule } from './all-business-routing.module';
import { AllBusinessListComponent } from './all-business-list/all-business-list.component';



@NgModule({
  declarations: [
    AllBusinessComponent,
    AllBusinessListComponent
  ],
  imports: [
    CommonModule,
    AllBusinessRoutingModule
  ],
  exports: [
    AllBusinessComponent,
    AllBusinessListComponent
  ]
})
export class AllBusinessModule { }
