import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { VendorFormsService } from '../service/vendor-forms.service';
import { FormArray } from '@angular/forms';
import { BusinessAccountService } from '../../business-account/business-account.service';

import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { VendorCustomerService } from '../service/vendor-customer.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-vendor-customer-home',
  templateUrl: './vendor-customer-home.component.html',
  styleUrls: ['./vendor-customer-home.component.scss'],
})
export class AddEditVendorComponent implements OnInit {
  public currentMainIndex: number = 0;

  public vendorForm: any;
  public vendorData: any = [];
  pageIndex: any = 0;
  pageS = 100;
  sortQuery: any = 'id,desc';
  mainTab: Array<any>;
  countries: any = [];
  industrySubTypes: any[] = [];
  isSendInvite: Boolean = false;
  isShowInvite: Boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: ApiService,
    public toastr: ToastrService,
    public vendorFormService: VendorFormsService,
    private vendorCustomerService: VendorCustomerService,
    public dialog: MatDialog,
    public businessAccountService: BusinessAccountService,
    private authService: AuthService
  ) {
    this.vendorForm = this.vendorFormService.createVendorForm();
  }

  ngOnInit(): void {
    this.service.getAllMetaDatas();
    this.service.Get_Product_Types();
    if (this.isCustomer || this.isLead || this.isProspect) {
      this.vendorForm.get('businessLine').setValue('RETAILER');
      if (this.isLead) {
        this.vendorForm.get('businessCategory').setValue('LEAD');
      } else if (this.isProspect) {
        this.vendorForm.get('businessCategory').setValue('PROSPECT');
      } else {
        this.vendorForm.get('businessCategory').setValue('CUSTOMER');
      }
      this.mainTab = [
        {
          id: 1,
          name:
            (this.isCustomer
              ? 'Customer '
              : this.isLead
                ? 'Lead '
                : this.isProspect
                  ? 'Prospect '
                  : ' ') + 'Details',
          index: 0,
        },
        {
          id: 2,
          name: 'Warehouse Details',
          index: 1,
        },
        {
          id: 3,
          name: 'Account Details',
          index: 2,
        },
        {
          id: 4,
          name: 'Transaction Details',
          index: 3,
        },
      ];
    } else {
      this.vendorForm.get('businessCategory').setValue('VENDOR');
      this.mainTab = [
        {
          id: 1,
          name: 'Vendor Details',
          index: 0,
        },
        {
          id: 2,
          name: 'Warehouse Details',
          index: 1,
        },
        {
          id: 3,
          name: 'Account Details',
          index: 2,
        },
        {
          id: 4,
          name: 'Transaction Details',
          index: 3,
        },
      ];
    }
    if (this.route.snapshot.params.id) {
      this.vendorBinding();
    }

    this.loadCountry();
  }

  loadCountry() {
    this.businessAccountService.getCountry().subscribe((data) => {
      this.countries = data;
    });
  }

  get industryTypeIds() {
    return this.vendorForm.get('industryTypeIds');
  }

  get industrySubTypeIds() {
    return this.vendorForm.get('industrySubTypeIds');
  }

  async vendorBinding() {
    try {
      const data = await this.service
        .Get_Single_customer(this.route.snapshot.params.id)
        .toPromise();
      const contacts = this.vendorForm.get('contacts') as FormArray;
      data?.contacts?.forEach((ele) => {
        const warehouseForm = this.vendorFormService.contactDetailForm();
        contacts.push(warehouseForm);
      });

      const warehouses = this.vendorForm.get('warehouses') as FormArray;

      data?.warehouses?.forEach((ele) => {
        const warehouseForm = this.vendorFormService.warehouseDetailForm();
        warehouses.push(warehouseForm);
      });

      const purchaseDepartmentPricings = this.vendorForm.get(
        'purchaseDepartmentPricings'
      ) as FormArray;

      data?.purchaseDepartmentPricings?.forEach((ele) => {
        const purchaseDepartmentPricingForm =
          this.vendorFormService.purchaseDepartmentPricingForm();
        purchaseDepartmentPricings.push(purchaseDepartmentPricingForm);
      });

      const branches = this.vendorForm
        .get('relationAccountDetail')
        .get('branchDetails') as FormArray;

      data?.relationAccountDetail?.branchDetails?.forEach((ele) => {
        const branchForm = this.vendorFormService.branchDetailForm();
        branches.push(branchForm);
      });

      const notes = this.vendorForm.get('notes') as FormArray;

      data?.notes?.forEach((ele) => {
        const notesForm = this.vendorFormService.noteForm();
        notes.push(notesForm);
      });

      const reminders = this.vendorForm.get('reminders') as FormArray;

      data?.reminders?.forEach((ele) => {
        const remindersForm = this.vendorFormService.reminderForm();
        reminders.push(remindersForm);
      });
      this.vendorForm.patchValue(data);
    } catch (err: any) {
      if (err?.status === 404) {
        this.toastr.warning('Account Not Found');
        this.navigate();
      } else {
        this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
      }
    }
  }

  saveCustomer() {
    let req = this.vendorForm.getRawValue();

    if (req?.invite?.id == null) {
      delete req.invite;
    }
    this.service.saveCustomerDetail(req).subscribe(
      () => {
        if (this.route.snapshot.params.id) {
          this.toastr.success('Details Updated Successfully.');
        } else {
          this.toastr.success('Details Added Successfully.');
        }
        if (this.isCustomer || this.isLead || this.isProspect) {
          this.businessAccountService.Get_All_Customers_Non_Cache();
        } else {
          this.businessAccountService.Get_All_Vendors_Non_Cache();
          this.businessAccountService.Get_All_Exporter_Vendors_Non_Cache();
        }
        this.navigate();
      },
      (err: any) => {
        this.toastr.error(err?.error?.userMessage ?? 'Error Occurred');
      }
    );
  }

  get headingVendorName() {
    return this.vendorForm.get('relationAccountDetail').get('name').value;
  }

  navigate() {
    if (this.isCustomer || this.isLead || this.isProspect) {
      if (this.vendorForm.get('businessCategory').value == 'CUSTOMER') {
        this.router.navigateByUrl('/home/customer/list?currentStepIndex=1');
      } else if (this.vendorForm.get('businessCategory').value == 'LEAD') {
        this.router.navigateByUrl('/home/lead/list?currentStepIndex=2');
      } else if (this.vendorForm.get('businessCategory').value == 'PROSPECT') {
        this.router.navigateByUrl('/home/prospect/list?currentStepIndex=3');
      } else {
        this.router.navigate(['/home/customer']);
      }
    } else {
      this.router.navigate(['/home/vendor']);
    }
  }

  action(event) {
    this.currentMainIndex = event.index;
  }

  confirmDelete() {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.deleteRelation();
        }
      });
  }

  async deleteRelation() {
    try {
      const businessAccountId: any = this.route.snapshot.params.id;
      const data = await this.businessAccountService
        .deleteRelationAccount(businessAccountId)
        .toPromise();
      this.toastr.success('Successfully Deleted');
      this.navigate();
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  get isCustomer() {
    if (window.location.href.includes('customer')) {
      return true;
    } else {
      return false;
    }
  }

  get isVendor() {
    if (window.location.href.includes('vendor')) {
      return true;
    } else {
      return false;
    }
  }

  get isLead() {
    if (window.location.href.includes('lead')) {
      return true;
    } else {
      return false;
    }
  }

  get isProspect() {
    if (window.location.href.includes('prospect')) {
      return true;
    } else {
      return false;
    }
  }

  get inviteStatus() {
    return this.vendorForm.get('invite').get('status');
  }
  get relationAcceptedStatus() {
    return this.vendorForm.get('relationAcceptedStatus');
  }
  get reverseRelation() {
    return this.vendorForm.get('reverseRelation');
  }
  get verifiedStatus() {
    return this.vendorForm.get('relationAccountDetail')?.get('verifiedStatus');
  }
  get inviteCreatedDate() {
    return this.vendorForm.get('invite')?.get('audit')?.get('createdDate');
  }
  get businessAccountId() {
    return this.vendorForm.get('relationAccountDetail').value?.id;
  }

  checkInviteDate(date: any) {
    if (!date) {
      return false;
    }
    const today = new Date();
    const inputDateObj = new Date(date);

    // Calculate the difference in milliseconds
    const differenceInMilliseconds = today.getTime() - inputDateObj.getTime();

    // Convert milliseconds to days
    const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);

    // Check if the difference is less than 30 days
    return differenceInDays > 30 ? true : false;
  }

  resendInvite() {
    let inviteDetail = {
      invitedTo: this.vendorForm.get('relationAccountDetail').get('name').value,
      email: this.vendorForm
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('email').value,
      phone: this.vendorForm
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('phone').value,
      inviteType: 'RELATION',
      inviteTypeReferenceId: this.vendorForm.get('id').value,
      redirectType: 'HOME',
      businessAccountToId:
        this.vendorForm.get('relationAccountDetail')?.get('id')?.value || null,
    };
    if (this.router.url.includes('edit')) {
      this.authService.sendInvite(inviteDetail).subscribe((res) => {
        this.vendorForm.get('invite').patchValue(res);
      });
    }
  }

  businessAccountSelected() {
    this.isShowInvite = false;
  }

  async updateRelationStatus(status: any) {
    try {
      const data = await this.businessAccountService
        .updateRelationStatus(this.route.snapshot.params.id, status)
        .toPromise();
      this.vendorBinding();
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async updateCategory() {
    let newCategory = '';
    if (this.isLead) newCategory = 'PROSPECT';
    if (this.isProspect) newCategory = 'CUSTOMER';
    try {
      const data = await this.vendorCustomerService
        .updateLeadField(
          this.route.snapshot.params.id,
          'BUSINESS_CATEGORY',
          newCategory
        )
        .toPromise();
      if (data.status == 'FAILED') {
        this.toastr.error(data?.errorMessage);
        return;
      }
      this.toastr.success(data?.message);
      if (this.isLead) {
        this.router.navigateByUrl(
          `/home/prospect/edit/${this.route.snapshot.params.id}`
        );
      } else {
        this.router.navigateByUrl(
          `/home/customer/edit/${this.route.snapshot.params.id}`
        );
      }
    } catch (err: any) {
      this.toastr.error(err?.error?.errorMessage ?? 'Some Error Occurred');
    }
  }

  businessAccountCleared() {
    this.isShowInvite = true;
  }
}
