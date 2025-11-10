import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { Invite } from 'src/app/model/common/invite';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { AuthService } from 'src/app/service/auth.service';

import { TokenService } from 'src/app/service/token.service';

@Component({
  selector: 'app-invite-dialog',
  templateUrl: './invite-dialog.component.html',
  styleUrls: ['./invite-dialog.component.scss'],
})
export class InviteDialogComponent implements OnInit, OnDestroy {
  public submitted = false;
  public disableSubmitBtn = false;
  public inviteFriend: boolean = false;
  // public inviteeGroup: FormGroup;
  public inviteDetailGroup: FormGroup;
  private invite: Invite;
  public userDetail = { name: null, role: null, branchName: null };
  public businessCategories: any = [];
  public businessType: any = [];
  public catalogs: any = [];
  public refData: any;
  public radioOptions: any = [
    {
      label: 'Yes',
      value: 'Y',
    },
    {
      label: 'No',
      value: 'N',
    },
  ];

  public selectedInviteType = '';
  public selectedBusinessType = '';
  public selectedCatalog = '';
  public countries: any[] = [];
  constructor(
    public dialogRef: MatDialogRef<InviteDialogComponent>,
    private fb: FormBuilder,
    private tokenService: TokenService,
    private authService: AuthService,
    private toastr: ToastrService,
    private businessService: BusinessAccountService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.refData = data;
  }

  ngOnInit(): void {
    this.initInviteDetailForm();
    // this.initInviteeDetailForm();
    this.inviteDetailGroup.get('shareCatelog').setValue('N');
    this.loadBusnessCategories();
    if (this.data.inviteFriend == true) {
      this.inviteFriend = true;
      return;
    }
    this.loadCountry();
  }

  loadBusnessCategories() {
    this.businessService.getBusinessCategories().subscribe((data) => {
      data.forEach((element) => {
        if (element == 'LOGISTIC' || element == 'BUSINESSOWNER') {
          this.businessCategories.push({
            label: element,
            value: element,
          });
        }
      });
    });

    this.businessService.getBusinessTypes().subscribe((data) => {
      data.forEach((element) => {
        this.businessType.push({
          label: element,
          value: element,
        });
      });
    });

    this.catalogs.push({
      label: 'Catelog 1',
      value: 'Catelog 1',
    });
    this.catalogs.push({
      label: 'Catelog 2',
      value: 'Catelog 2',
    });
  }

  initInviteDetailForm(): void {
    this.inviteDetailGroup = this.fb.group({
      inviteType: [null, Validators.required],
      businessType: [null],
      shareCatelog: [null, Validators.required],
      catelog: [null],
      message: [null],
      inviteTo: [null, Validators.required],
      email: [null, Validators.email],
      phone: this.fb.group({
        countryId: [null],
        countryCode: [null],
        number: [null],
        extension: [],
      }),
    });
  }

  // convenience getter for easy access to form fields
  // get invitee() { return this.inviteeGroup.controls; }
  get inviteDetail() {
    return this.inviteDetailGroup.controls;
  }

  ngOnDestroy() { }

  onInviteTypeChange() {
    if (this.inviteDetailGroup.get('inviteType').value == 'BUSINESSOWNER') {
      this.inviteDetailGroup
        .get('businessType')
        .setValidators([null, Validators.required]);
      this.inviteDetailGroup.get('shareCatelog').setValue('N');
    } else {
      this.inviteDetailGroup.get('shareCatelog').setValue('N');
      this.inviteDetailGroup.get('businessType').clearValidators();
    }
    this.inviteDetailGroup.get('shareCatelog').updateValueAndValidity();

    this.inviteDetailGroup.get('businessType').updateValueAndValidity();
  }

  onShareCatelogChange(event) {
    this.inviteDetailGroup.get('shareCatelog').setValue(event);

    if (this.inviteDetailGroup.get('shareCatelog').value === 'Y') {
      this.inviteDetailGroup.addControl(
        'catelog',
        this.fb.control(null, Validators.required)
      );
    } else {
      this.inviteDetailGroup.get('catelog').clearValidators();
    }
    this.inviteDetailGroup.get('catelog').updateValueAndValidity();
  }

  onSubmit() {
    this.submitted = true;
    this.inviteDetailGroup.get('inviteType').setValue(this.selectedInviteType);
    if (this.inviteDetailGroup.invalid) {
      return;
    }
    this.invite = this.inviteDetailGroup.value;

    this.invite.email = this.inviteDetailGroup.get('email').value;
    this.invite.phone = this.inviteDetailGroup.get('phone').value;
    this.invite.invitedTo = this.inviteDetailGroup.get('inviteTo').value;
    this.invite.redirectType = 'HOME';
    this.invite.redirectReferenceId = this.refData.redirectReferenceId ?? null;

    this.invite.invitedByBusinessAccountId =
      this.tokenService.getBusinessAccountIdToken();
    this.authService.sendInvite(this.invite).subscribe((respone) => {
      if (respone.status === 'SENT') {
        this.disableSubmitBtn = true;
        this.toastr.success('Invite sent to ' + this.invite.email);
        this.dialogRef.close();
      } else if (respone.message === 'USER_ALREADY_EXIST') {
        this.toastr.info('User already exist on DADYIN platform');
      }
    }, (err) => {
      this.disableSubmitBtn = false;
      this.toastr.error('Invite not sent.');
    });
  }

  onCancelCLicked() {
    this.dialogRef.close();
  }

  customSearchFn(term: string, item: any) {
    if (term.toLowerCase().includes('us')) {
      term = 'United states';
    }
    term = term.toLowerCase();
    return item.name.toLowerCase().indexOf(term) > -1;
  }

  loadCountry() {
    this.businessService.getCountry().subscribe((data) => {
      this.countries = data;
    });
  }
}
