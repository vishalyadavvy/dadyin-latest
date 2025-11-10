import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';
import { BusinessAccountService } from '../business-account.service';
import { MatStepper } from '@angular/material/stepper';
import { BusinessRegistartionService } from '../services/business-registration.service';
import { ApiService } from 'src/app/service/api.service';
import { HeaderService } from 'src/app/service/header.service';
import { BusinessRegistrationFormsService } from '../services/business-registration-forms.service';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/service/common.service';
import { ContainerManagementService } from '../../container-management/service/container-management.service';
import { PaymentInfoList } from 'src/app/project/prelogin/subscription/payment-info-list';

@Component({
  selector: 'app-business-registration',
  templateUrl: './business-registration.html',
  styleUrls: ['./business-registration.scss'],
})
export class BusinessRegistrationComponent implements OnInit {
  imgUrl = environment.imgUrl;
  currentMainIndex = 0;
  currencyList: any = [];
  countries: any[] = [];
  imagesToShow: any = {};
  businessName = '';
  businessTypes: any[] = [];
  roles: any[] = [];
  branches: any[] = [];
  fromInvite = false;
  inviteId: any = null;
  businessAccount = null;
  branchTemporaryId = Math.floor(Math.random() * 90000) + 10000;
  public businessRegistrationForm: any;
  industrySubTypes: any[] = [];
  progressColor = 'blue';
  paymentInfoList = PaymentInfoList;
  subscriptionDetails;
  selectedSubscription;
  nextSubscription = null;
  paymentSuccess = false;
  toastTimer: any;

  constructor(
    private router: Router,
    private businessAccountService: BusinessAccountService,
    private businessRegistrationService: BusinessRegistartionService,
    private businessFormService: BusinessRegistrationFormsService,
    private toastr: ToastrService,
    public apiService: ApiService,
    private headerService: HeaderService,
    private commonService: CommonService,
    public containerService: ContainerManagementService,
    public ref: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.containerService.Get_All_ports();
    this.apiService.Get_Industry_Types();
    this.apiService.Get_Customer_Categories();
    this.apiService.Get_Product_Types();
    this.businessRegistrationForm = this.businessFormService.createBusinessForm();
  }

  mainTab: Array<any> = [
    {
      id: 1,
      name: 'Business Details',
      index: 0,
    },
    {
      id: 2,
      name: 'Employees',
      index: 1,
    },
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentMainIndex = params['currentMainIndex'] ?? 0;
      this.paymentSuccess = params['payment'] ?? false;

      console.log(this.paymentSuccess);
      if(this.paymentSuccess){
        this.showSuccessToast();

        setTimeout(() => {
          this.router.navigate([], {
            queryParams: { payment: null },
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
        }, 7500); // small delay (300ms is enough)
      }
    });
    this.loadBusinessTypeAndcategories();
    this.loadCountry();
    this.loadRoles();
    this.setData();
    this.getIndustrySubTypes(this.industryTypeIds.value);
    this.industryTypeIds.valueChanges.subscribe((res) => {
      this.getIndustrySubTypes(res);
    });
    // Setting validation to country code if number entered
    this.businessRegistrationForm.valueChanges.subscribe((val) => {
      if (
        this.businessRegistrationForm
          .get('primaryContact')
          .get('landline')
          .get('number').value != null
      ) {
        this.businessRegistrationForm
          .get('primaryContact')
          .get('landline')
          .get('countryId')
          .setValidators([Validators.required]);
      } else {
        this.businessRegistrationForm
          .get('primaryContact')
          .get('landline')
          .get('countryId')
          .setValidators(null);
      }
      this.businessRegistrationForm
        .get('primaryContact')
        .get('landline')
        .get('countryId')
        .updateValueAndValidity({ emitEvent: false });
    });
    this.branchDetails.valueChanges.subscribe((val: Array<any>) => {
      val.forEach((value, index) => {
        let form = this.branchDetails.controls[index];
        if (form.get('phone').get('number').value != null) {
          form
            .get('phone')
            .get('countryId')
            .setValidators([Validators.required]);
        } else {
          form.get('phone').get('countryId').setValidators(null);
        }
        this.branchDetails.controls[index]
          .get('phone')
          .get('countryId')
          .updateValueAndValidity({ emitEvent: false });
      });
    });
  }

  get branchDetails() {
    return this.businessRegistrationForm.get('branchDetails') as FormArray;
  }
  get employeeDetails() {
    return this.businessRegistrationForm.get('employees') as FormArray;
  }

  get logoImage() {
    return this.businessRegistrationForm.get('businessLogo');
  }
  get businessLines() {
    return this.businessRegistrationForm.get('businessLines');
  }

  get addressCountry() {
    return this.businessRegistrationForm
      .get('primaryContact')
      .get('address')
      .get('addressCountry');
  }

  onAddressSelection(event: any, control) {
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
      if (element.types.includes('administrative_area_level_3')) {
        address.addressCity = element.long_name;
      }
      if (element.types.includes('postal_code')) {
        address.addressZipCode = element.long_name;
      }
    });
    control.patchValue(address);
    if (address?.addressCountry) {
      const country = this.countries.find(
        (item) =>
          item?.name?.toUpperCase() == address?.addressCountry?.toUpperCase()
      );
      this.businessRegistrationForm
        .get('primaryContact')
        .get('landline')
        .get('countryId').value ??
        this.businessRegistrationForm
          .get('primaryContact')
          .get('landline')
          .get('countryId')
          .setValue(country?.id);
      this.businessRegistrationForm
        .get('primaryContact')
        .get('phone')
        .get('countryId').value ??
        this.businessRegistrationForm
          .get('primaryContact')
          .get('phone')
          .get('countryId')
          .setValue(country?.id);
      this.businessRegistrationForm
        .get('primaryContact')
        .get('fax')
        .get('countryId').value ??
        this.businessRegistrationForm
          .get('primaryContact')
          .get('fax')
          .get('countryId')
          .setValue(country?.id);
      this.ref.detectChanges();
    }
  }

  action(event) {
    this.currentMainIndex = event.index;
  }

  loadRoles() {
    this.businessRegistrationService.getAllRoles().subscribe((data) => {
      this.roles = data;
    });
  }

  loadBusinessTypeAndcategories() {
    this.businessAccountService.getBusinessTypes().subscribe((res) => {
      this.businessTypes = res;
      this.businessTypes = this.businessTypes.map((item) => ({
        id: item,
        description: item,
      }));
    });
  }

  onNext(stepper: MatStepper) {
    stepper.next();
  }

  loadCountry() {
    this.businessAccountService.getCountry().subscribe((data) => {
      this.countries = data;
      if (this.countries != null) {
        this.countries.forEach((c) => {
          this.currencyList.push({
            value: c.currency,
            label: c.currency,
          });
        });
      }
    });
  }

  setData() {
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.patchData(res);
      this.setSubscriptionData(res);
    });
    // this.businessAccountService.getBusinessAccountDetail().subscribe((data: any) => {
    //     this.patchData(data)
    // });
  }

  patchData(data: any) {
    this.branchDetails.clear();
    data?.branchDetails.forEach((branch) => {
      const form = this.businessFormService.branchDetailForm();
      this.branchDetails.push(form);
    });
    this.employeeDetails.clear();
    data?.employees.forEach((employee) => {
      const form = this.businessFormService.employeeForm();
      this.employeeDetails.push(form);
    });

    this.businessRegistrationForm.patchValue(data);
  }

  setSubscriptionData(res) {
    this.subscriptionDetails = res?.businessSubscriptionUsageDetails;
    if (this.subscriptionDetails) {
      this.selectedSubscription = this.paymentInfoList.find((val: any) => val.businessSubscriptionId === this.subscriptionDetails?.businessSubscriptionId);
    } else {
      this.selectedSubscription = this.paymentInfoList[0];
      // Call API
    }
    const nextSubscriptionId = this.selectedSubscription?.businessSubscriptionId + 1;
    const nextSubscription = this.paymentInfoList.find(val => val.businessSubscriptionId === nextSubscriptionId);
    if (nextSubscription) {
      this.nextSubscription = nextSubscription;
    }
  }

  getPendingDays() {
    const startDate = new Date(this.subscriptionDetails?.subscriptionStart);
    const supportMonths = this.selectedSubscription?.productSupportValue; // '2M' means 2 months
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + supportMonths);

    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const pendingDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0); // Avoid negative days
    return pendingDays;
  }

  getCompletionDate(): Date {
    const startDate = new Date(this.subscriptionDetails?.subscriptionStart);
    const supportMonths = this.selectedSubscription?.productSupportValue;
    const completionDate = new Date(startDate);
    completionDate.setMonth(completionDate.getMonth() + supportMonths);
    return completionDate;
  }

  getAutoRenewsDate() {
    const date = new Date(this.subscriptionDetails?.subscriptionEnd);
    date.setDate(date.getDate() + 1);
    const nextDay = date.toISOString(); // or format as needed
    return nextDay;
  }

  navigateToSubscriptionPage() {
    this.router.navigateByUrl('/subscription', { state: { from: 'business-registration', paymentInfoId: this.nextSubscription?.businessSubscriptionId } });
  }

  customSearchFn(term: string, item: any) {
    if (term.toLowerCase().includes('us')) {
      term = 'United states';
    }
    term = term.toLowerCase();
    return item.name.toLowerCase().indexOf(term) > -1;
  }

  goBackToBD() {
    this.router.navigateByUrl('/home/business-details');
  }

  addBranchLineItem() {
    const branchForm = this.businessFormService.branchDetailForm();
    this.branchTemporaryId = this.branchTemporaryId + 1;
    branchForm.patchValue(this.businessRegistrationForm.value?.primaryContact);
    branchForm.get('temporaryId').patchValue(this.branchTemporaryId);
    branchForm
      .get('sortOrder')
      .patchValue(this.branchDetails?.controls?.length + 1);
    branchForm.get('id').patchValue(null);
    branchForm
      .get('phone')
      .patchValue(
        this.businessRegistrationForm.value?.primaryContact?.landline
      );
    this.branchDetails.push(branchForm);
  }

  deleteBranchLineItem(i) {
    this.branchDetails.removeAt(i);
  }

  addEmployeeItem() {
    const employeeForm = this.businessFormService.employeeForm();
    employeeForm
      .get('sortOrder')
      .patchValue(this.employeeDetails?.controls?.length + 1);
    this.employeeDetails.push(employeeForm);
  }
  deleteEmployeeItem(i) {
    this.employeeDetails.removeAt(i);
  }

  imageselected(event: any) {
    this.uploadFile(event.target.files);
  }

  async uploadFile(imgfile) {
    try {
      const res: any = await this.apiService.uploadFiles(imgfile);
      this.logoImage.setValue(res?.data[0].media_url);
    } catch (err: any) {
      console.log(err);
    }
  }

  removeImage() {
    this.logoImage.setValue('');
  }

  onSubmit() {
    if (this.businessRegistrationForm.invalid) {
      const invalidControlNames = this.commonService.findInvalidControlNames(
        this.businessRegistrationForm
      );
      this.toastr.error('Fields Invalid: ' + invalidControlNames);
      return;
    }
    if (
      this.businessRegistrationForm.get('verifiedStatus').value == null ||
      this.businessRegistrationForm.get('verifiedStatus').value == 'NONE'
    ) {
      this.businessRegistrationForm.get('verifiedStatus').setValue('SELF');
    }
    if (this.fromInvite) {
      this.businessRegistrationForm.get('fromInvite').setValue(true);
      this.businessRegistrationForm.get('inviteId').setValue(this.inviteId);
    } else {
      this.businessRegistrationForm.get('fromInvite').setValue(false);
    }
    let formData: any = this.businessRegistrationForm.getRawValue();
    formData?.employees.forEach((employee) => {
      if (employee.branchId == 'null') {
        employee.branchId = null;
      }
    });
    if (!Array.isArray(formData.businessLines)) {
      formData.businessLines = [formData.businessLines]; // If it's already an array, return it as is
    }
    this.businessAccountService.updateBusinessAccount(formData).subscribe(
      (data) => {
        this.patchData(data);
        this.headerService.logoChanged.next(true);
        this.toastr.success('Details saved successfully');
      },
      (error) => {
        this.toastr.error(
          error?.error?.userMessage ?? 'Something Went Wrong,Please Try again'
        );
      }
    );
  }

  onSelectBranch(employee, event) {
    if (event.target.value == null || event.target.value == 'null') {
      let optionText: any =
        event.target.options[event.target.options.selectedIndex].text;
      const branchItem = this.branchDetails?.value.find(
        (item) => item.id == null && item.name == optionText
      );
      employee.get('temporaryBranchId').setValue(branchItem.temporaryId);
    }
  }

  jumpToDashboard() {
    this.router.navigateByUrl('/home');
  }

  sendInvite(employee: any) {
    let data: any = {
      invitedTo: employee.firstName,
      email: employee.email,
      phone: {
        countryCode: employee.countryCode,
        number: employee.number,
      },
      inviteType: 'EMPLOYEE',
      inviteTypeReferenceId: employee.id,
      businessType: 'IMPORTER',
      shareCatelog: 'N',
      catelog: null,
      redirectType: 'HOME',
      redirectReferenceId: null,
      message:
        'You are invited to join the Account' +
        this.businessRegistrationForm.value.name,
    };
    this.businessRegistrationService
      .sendInvite(data)
      .pipe(first())
      .subscribe(
        (data: any) => { },
        (error) => {
          this.toastr.error(
            error?.error?.userMessage ?? 'Something Went Wrong,Please Try again'
          );
        }
      );
  }

  onBackStep(index) {
    this.currentMainIndex = index - 1;
  }
  getIndustrySubTypes(industryTypeIds: any) {
    this.industrySubTypes = [];
    this.apiService.allIndustryTypes.forEach((obj) => {
      obj.industryTypeSubTypes.forEach((subtype) => {
        if (industryTypeIds?.includes(obj.id)) {
          this.industrySubTypes.push({
            id: subtype.id,
            description:
              obj.description + ' - ' + subtype.industrySubType.description,
          });
        }
      });
    });
  }

  handleProductTypeClick(event: string) {
    if (event) {
      this.apiService.Get_Product_Types(event);
    }
  }

  assignLeadsToEmployee(employee) {
    this.router.navigateByUrl(
      '/home/lead/list?currentStepIndex=2&assignedSalesId=' + employee?.id
    );
  }

  viewAssignedLeadsToEmployee(id) {
    this.router.navigateByUrl(
      '/home/lead/list?currentStepIndex=2&employeeId=' + id
    );
  }

  get industryTypeIds() {
    return this.businessRegistrationForm.get('industryTypeIds');
  }
  get industrySubTypeIds() {
    return this.businessRegistrationForm.get('industrySubTypeIds');
  }

  get productTypeIds() {
    return this.businessRegistrationForm.get('productTypeIds');
  }

  get productCategoryIds() {
    return this.businessRegistrationForm.get('productCategoryIds');
  }

  getSupportProgressValue(): number {
  // Calculate total days between start and end date
  if (!this.subscriptionDetails?.subscriptionStart || !this.selectedSubscription?.productSupportValue) {
    return 0;
  }
  const startDate = new Date(this.subscriptionDetails.subscriptionStart);
  const supportMonths = this.selectedSubscription.productSupportValue;
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + supportMonths);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const today = new Date();
  const elapsedDays = Math.min(Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)), totalDays);
  if (totalDays <= 0) return 100;
  return Math.min(Math.round((elapsedDays / totalDays) * 100), 100);
}

  showSuccessToast() {
    this.paymentSuccess = true;

    // Auto-hide after 5 seconds
    this.toastTimer = setTimeout(() => {
      this.paymentSuccess = false;
    }, 7500);
  }

  hideSuccessToast() {
    this.paymentSuccess = false;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }
}
