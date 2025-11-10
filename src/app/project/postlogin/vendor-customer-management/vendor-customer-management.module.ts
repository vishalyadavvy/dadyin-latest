import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorManagementRoutingModule } from './vendor-customer-management-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NoteDialogComponent } from './shared/note-dialog/note-dialog.component';
import { AccountDetailsComponent } from './shared/account-details/account-details.component';
import { WarehouseDetailsComponent } from './shared/warehouse-details/warehouse-details.component';
import { VendorDetailsComponent } from './vendor-customer-home/vendor-customer-details/vendor-customer-details.component';
import { AddEditVendorComponent } from './vendor-customer-home/vendor-customer-home.component';
import { VendorCustomerManagementComponent } from './vendor-customer-management.component';
import { CustomerManagementModule } from '../order-management/customer-modules/customer-management.module';
import { VendorManagementModule } from '../order-management/vendor-modules/vendor-management.module';
import { ReminderDialogComponent } from './shared/reminder-dialog/reminder-dialog.component';
import { EmailDialogComponent } from './shared/email-dialog/email-dialog.component';
import { LeadFilterBoxComponent } from './shared/lead-filter-box/lead-filter-box.component';
import { selectSalesRepDialogComponent } from './shared/select-salesrep-dialog/select-salesrep-dialog.component';

@NgModule({
  declarations: [
    NoteDialogComponent,
    ReminderDialogComponent,
    EmailDialogComponent,
    VendorCustomerManagementComponent,
    AddEditVendorComponent,
    VendorDetailsComponent,
    WarehouseDetailsComponent,
    AccountDetailsComponent,
    LeadFilterBoxComponent,
    selectSalesRepDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    VendorManagementRoutingModule,
    CustomerManagementModule,
    VendorManagementModule
    
  ],
  exports:[
    CustomerManagementModule,
    VendorManagementModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class VendorCustomerManagementModule { }
