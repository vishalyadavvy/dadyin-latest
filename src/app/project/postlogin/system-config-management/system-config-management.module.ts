import { GoogleMapsModule } from '@angular/google-maps';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemConfigRoutingModule} from './system-config-management-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { IndustryTypeComponent } from './industry-type/industry-type.component';
import { SystemConfigManagementComponent } from './system-config-management.component';

@NgModule({
  declarations: [
    SystemConfigManagementComponent,
    IndustryTypeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SystemConfigRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class SystemConfigModule { }
