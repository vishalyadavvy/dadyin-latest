import { VendorFormsService } from '../../service/vendor-forms.service';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ChangeDetectorRef,
  OnChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ContainerManagementService } from '../../../container-management/service/container-management.service';
import { BusinessAccountService } from '../../../business-account/business-account.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoteDialogComponent } from '../../shared/note-dialog/note-dialog.component';
import { environment } from 'src/environments/environment';
import { ReminderDialogComponent } from '../../shared/reminder-dialog/reminder-dialog.component';
import { VendorCustomerService } from '../../service/vendor-customer.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-vendor-customer-details',
  templateUrl: './vendor-customer-details.component.html',
  styleUrls: ['./vendor-customer-details.component.scss'],
})
export class VendorDetailsComponent implements OnInit, OnChanges {
  public imgUrl = environment.imgUrl;
  public keywordsList: any = [];
  public port: any = [];
  public city: any = [];
  public businessAccounts: any = [];
  public businessTypes: any = [];
  public editVendorData: any = [];
  public isShowKeyword: boolean = false;

  public businessAccountList: any[] = [];
  keyword = new FormControl();
  isEnabled: boolean = false;

  timeLimit = [
    { value: 60, label: 60 + '\n' + 'Days' },
    { value: 90, label: 90 + '\n' + 'Days' },
    { value: 120, label: 120 + '\n' + 'Days' },
    { value: 180, label: 180 + '\n' + 'Days' },
  ];
  public buyingTypeList: any[] = [
    { name: 'SKU', value: 'SKU' },
    { name: 'Truck Load', value: 'TRUCK' },
    { name: 'Pallet', value: 'PALLET' },
    { name: 'Container (20ft)', value: 'CONTAINER_20_FT' },
    { name: 'Container (40ft)', value: 'CONTAINER_40_FT' },
    { name: 'Container (40ft) HQ', value: 'CONTAINER_40_FT_HQ' },
  ];
  constructor(
    public apiService: ApiService,
    public toastr: ToastrService,
    public containerService: ContainerManagementService,
    public businessAccountService: BusinessAccountService,
    public vendorCustomerService: VendorCustomerService,
    public vendorFormsService: VendorFormsService,
    public ref: ChangeDetectorRef,
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    public route: ActivatedRoute
  ) { }

  ngOnChanges(): void {
    this.vendorForm
      .get('relationAccountDetail')
      .get('verifiedStatus')
      .valueChanges.subscribe((res) => {
        if (res != 'NONE') {
          this.disableBusinessDetail();
        }
      });
  }

  @Input('vendorForm') vendorForm: FormGroup;
  @Input('isCustomer') isCustomer: any;
  public industrySubTypes: any;
  @Input('countries') countries: any;
  @Output('emitBusinessAccountSelected')
  emitBusinessAccountSelected: EventEmitter<any> = new EventEmitter();
  @Output('emitClearBusinessAccount')
  emitClearBusinessAccount: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    this.loadPort();
    this.businessAccountService.Get_All_employees();
    this.containerService.Get_All_IncoTerms();
    this.containerService.Get_All_paymentTerms();
    this.loadEmployees();
    this.getIndustrySubTypes(this.industryTypeIds.value);
    this.industryTypeIds.valueChanges.subscribe((res) => {
      this.getIndustrySubTypes(res);
    });
    this.isEnabled = this.vendorForm.get('relationAccountDetail').get('name')
      .disabled
      ? true
      : false;

    // Setting validation to country code if number entered
    this.vendorForm.valueChanges.subscribe((val) => {
      let landlineNumber = this.vendorForm
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('landline')
        .get('number').value;
      if (landlineNumber != null) {
        this.vendorForm
          .get('relationAccountDetail')
          .get('primaryContact')
          .get('landline')
          .get('countryId')
          .setValidators([Validators.required]);
      } else {
        this.vendorForm
          .get('relationAccountDetail')
          .get('primaryContact')
          .get('landline')
          .get('countryId')
          .setValidators(null);
      }

      let phoneNumber = this.vendorForm
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('phone')
        .get('number').value;
      if (phoneNumber == null || phoneNumber == '') {
        this.vendorForm
          .get('relationAccountDetail')
          .get('primaryContact')
          .get('phone')
          .get('countryId')
          .setValidators(null);
      } else {
        this.vendorForm
          .get('relationAccountDetail')
          .get('primaryContact')
          .get('phone')
          .get('countryId')
          .setValidators([Validators.required]);
      }

      let faxNumber = this.vendorForm
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('fax')
        .get('number').value;
      if (faxNumber == null || faxNumber == '') {
        this.vendorForm
          .get('relationAccountDetail')
          .get('primaryContact')
          .get('fax')
          .get('countryId')
          .setValidators(null);
      } else {
        this.vendorForm
          .get('relationAccountDetail')
          .get('primaryContact')
          .get('fax')
          .get('countryId')
          .setValidators([Validators.required]);
      }
      this.vendorForm
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('landline')
        .get('countryId')
        .updateValueAndValidity({ emitEvent: false });
      this.vendorForm
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('phone')
        .get('countryId')
        .updateValueAndValidity({ emitEvent: false });
      this.vendorForm
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('fax')
        .get('countryId')
        .updateValueAndValidity({ emitEvent: false });
    });
    this.businessAddress.valueChanges.subscribe((val: Array<any>) => {
      val.forEach((value, index) => {
        let form = this.businessAddress.controls[index];
        if (form.get('phone').get('number').value != null) {
          form
            .get('phone')
            .get('countryId')
            .setValidators([Validators.required]);
        } else {
          form.get('phone').get('countryId').setValidators(null);
        }
        this.businessAddress.controls[index]
          .get('phone')
          .get('countryId')
          .updateValueAndValidity({ emitEvent: false });
      });
    });
  }

  handleSelectKeyWordClick(event: string) {
    if (event) {
      this.loadKeywords(event);
    }
  }

  getIndustrySubTypes(industryTypeIds: any) {
    this.industrySubTypes = [];
    this.apiService.allIndustryTypes.forEach((obj) => {
      obj.industryTypeSubTypes.forEach((subtype) => {
        if (industryTypeIds?.includes(obj.id)) {
          this.industrySubTypes.push({
            id: subtype.industrySubType.id,
            description:
              obj.description + ' - ' + subtype.industrySubType.description,
          });
        }
      });
    });
  }

  getBusinessAccounts(event: any, type: any) {
    const x = event.target.value + '';
    this.businessAccountList = [];
    if (x?.length >= 1) {
      this.businessAccountService
        .getBusinessAccountsListBySearchTerm(type, x)
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe((data) => {
          let businessId = this.businessAccountService.currentBusinessAccountId;
          this.businessAccountList = data.filter((obj) => obj.id != businessId);
        });
    }
  }

  selectBusinessAccount(item) {
    this.vendorForm.get('relationAccountDetail').patchValue(item);
    this.disableBusinessDetail();
    this.emitBusinessAccountSelected.emit();
  }

  customSearchFn(term: string, item: any) {
    if (term.toLowerCase().includes('us')) {
      term = 'United states';
    }
    term = term.toLowerCase();
    return item.name.toLowerCase().indexOf(term) > -1;
  }

  onAddressSelection(event: any, control, isPrimary) {
    let address: any = {
      addressLine: '',
      addressCountry: '',
      addressState: '',
      addressCity: '',
      addressZipCode: '',
    };
    address.addressLine = event.formatted_address;
    event.address_components.forEach((element) => {
      if (element.types.includes('country')) {
        address.addressCountry = element.long_name;
      }
      if (element.types.includes('administrative_area_level_1')) {
        address.addressState = element.long_name;
      }
      if (
        element.types.includes('administrative_area_level_3') ||
        element.types.includes('sublocality') ||
        element.types.includes('sublocality_level_1')
      ) {
        address.addressCity = element.long_name;
      }
      if (element.types.includes('postal_code')) {
        address.addressZipCode = element.long_name;
      }
    });
    control.patchValue(address);

    if (address?.addressCountry && isPrimary) {
      const country = this.countries.find(
        (item) =>
          item?.name?.toUpperCase() == address?.addressCountry?.toUpperCase()
      );
      this.primaryContact.get('landline').get('countryId').value ??
        this.primaryContact
          .get('landline')
          .get('countryId')
          .setValue(country?.id);
      this.primaryContact.get('phone').get('countryId').value ??
        this.primaryContact.get('phone').get('countryId').setValue(country?.id);
      this.primaryContact.get('fax').get('countryId').value ??
        this.primaryContact.get('fax').get('countryId').setValue(country?.id);
      this.ref.detectChanges();
    }
  }

  compareFun(item1, item2) {
    return item1 && item2 ? item1.id === item2.id : item1 === item2;
  }

  get industryTypeIds() {
    return this.vendorForm.get('industryTypeIds');
  }
  get industrySubTypeIds() {
    return this.vendorForm.get('industrySubTypeIds');
  }
  get keywords() {
    return this.vendorForm.get('keywords');
  }
  get productCategoryIds() {
    return this.vendorForm.get('productCategoryIds');
  }

  get productTypesIds() {
    return this.vendorForm.get('productTypeIds');
  }

  toggleType(value) {
    this.isImportExport.setValue(value);
  }

  get isImportExport() {
    return this.vendorForm.get('isImportExport');
  }

  get businessLine() {
    return this.vendorForm.get('businessLine');
  }
  get logoImage() {
    return this.vendorForm.get('relationAccountDetail').get('businessLogo');
  }
  get addressCountry() {
    return this.vendorForm
      .get('relationAccountDetail')
      .get('primaryContact')
      .get('address')
      .get('addressCountry');
  }
  loadPort() {
    this.containerService.Get_All_ports();
  }

  loadKeywords(searchString?: string) {
    this.businessAccountService
      .getAllKeywords(searchString)
      .subscribe((data) => {
        this.keywordsList = data;
      });
  }

  loadEmployees() {
    this.businessAccountService.employeesList.forEach((e) => {
      this.businessAccounts.push({
        //firstName display bz username getting null
        label: e.firstName,
        value: e.id,
      });
    });
  }

  loadCitiesByCountry(id: any) {
    const x = Number(id);
    this.businessAccountService.getCityByCountry(x).subscribe((data) => {
      data.forEach((c) => {
        this.city.push(c);
      });
    });
  }

  selectIndustryTypeIds(event: any) { }

  addBranchLineItem() {
    const branchForm = this.vendorFormsService.branchDetailForm();
    branchForm.patchValue(this.primaryContact.value);
    branchForm.get('id').setValue(null);
    this.businessAddress.push(branchForm);
  }
  deleteBranchLineItem(i) {
    this.businessAddress.removeAt(i);
  }

  removeImage() {
    this.logoImage.setValue('');
  }

  imageselected(event: any) {
    this.uploadFile(event.target.files[0]);
  }

  async uploadFile(imgfile) {
    try {
      const res: any = await this.apiService.uploadFiles([imgfile]);
      this.logoImage.setValue(res.data[0]?.media_url);
    } catch (err: any) {
      this.toastr.error(err?.error?.message || 'Error uploading file');
    }
  }

  get businessAddress() {
    return this.vendorForm
      .get('relationAccountDetail')
      .get('branchDetails') as FormArray;
  }
  get primaryContact() {
    return this.vendorForm.get('relationAccountDetail').get('primaryContact');
  }
  get notes() {
    return this.vendorForm.get('notes') as FormArray;
  }

  get reminders() {
    return this.vendorForm.get('reminders') as FormArray;
  }

  openNoteDialog() {
    this.dialog.open(NoteDialogComponent, {
      width: '60%',
      data: {
        notes: this.notes,
        relationStatusId: this.vendorForm.get('relationStatusId').value,
        businessCategory: this.vendorForm.value.businessCategory,
        id: this.vendorForm.get('id').value,
      },
    });
  }
  openReminderDialog() {
    this.dialog.open(ReminderDialogComponent, {
      width: '60%',
      data: {
        reminders: this.reminders.value,
        id: this.vendorForm.get('id').value,
      },
    });
  }

  disableBusinessDetail() {
    this.vendorForm
      .get('relationAccountDetail')
      .get('name')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('primaryContact')
      .get('address')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('primaryContact')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('taxId')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('gst')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('panCard')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('einNumber')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('ssnNumber')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('itinNumber')
      .disable({ onlySelf: true, emitEvent: false });
    this.isEnabled = true;
  }

  clear() {
    this.vendorForm.get('relationAccountDetail').reset();
    this.vendorForm
      .get('relationAccountDetail')
      .get('name')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('primaryContact')
      .get('address')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('primaryContact')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('taxId')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('gst')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('panCard')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('einNumber')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('ssnNumber')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm
      .get('relationAccountDetail')
      .get('itinNumber')
      .enable({ onlySelf: true, emitEvent: false });
    this.isEnabled = false;
    this.emitClearBusinessAccount.emit();
  }

  sendInvite() {
    this.vendorForm
      .get('sendInvite')
      .setValue(!this.vendorForm.get('sendInvite').value);
    if (this.vendorForm.get('sendInvite').value == true) {
      let inviteDetail = {
        invitedTo: this.vendorForm.get('relationAccountDetail').get('name')
          .value,
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
          this.vendorForm.get('relationAccountDetail')?.get('id')?.value ||
          null,
      };
      if (this.router.url.includes('edit')) {
        this.authService.sendInvite(inviteDetail).subscribe((res) => {
          this.vendorForm.get('invite').patchValue(res);
        });
      }
    }
  }

  getLabel() {
    if (this.vendorForm.get('businessCategory').value == 'CUSTOMER') {
      return 'Customer';
    } else if (this.vendorForm.get('businessCategory').value == 'LEAD') {
      return 'Lead';
    } else if (this.vendorForm.get('businessCategory').value == 'PROSPECT') {
      return 'Prospect';
    } else {
      return 'Vendor';
    }
  }
}
