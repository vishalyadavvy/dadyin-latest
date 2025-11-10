import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { AlertDialogComponent } from '../shared/component/alert-dialog/alert-dialog.component';

import { ComponentDialogComponent } from '../shared/dialogs/component-dialog/component-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(public dialog: MatDialog) {}

  getFieldErrorDesc(control: FormControl): string {
    if (control.errors?.required) {
      return ' Value is required ';
    }
    if (control.errors?.email) {
      return ' Incorrect email ';
    }
    if (control.errors?.minlength) {
      return `Too short, must be minimum ${control.errors.minlength.requiredLength} characters`;
    }
    if (control.errors?.maxlength) {
      return `Too long, must be maximum ${control.errors.maxlength.requiredLength} characters`;
    }
    if (control.errors?.PasswordMissMatch) {
      return 'New password and confirm password does not match';
    }
    if (control.errors?.InappropriateDate) {
      return 'Add appropriate date';
    }
    if (control.errors?.InappropriateTime) {
      return 'Add appropriate time';
    }
    if (control.errors?.PhoneNumberMatched) {
      return 'Add different phone number';
    }
    if (control.errors?.EmailsMatched) {
      return 'Add different email id';
    }
    if (control.errors?.userNameExists) {
      return 'User not found';
    }
    if (control.errors?.invalidDoj) {
      return 'Invalid date of joining';
    }
    if (control.errors?.wrongFileType) {
      return 'Invalid file uploaded';
    }
    if (control.errors?.exceedFileSize) {
      return 'File size exceeded';
    }
    if (control.errors?.invalidPincode) {
      return "Pincode doesn't exists";
    }
    if (control.errors?.minAgeGap18) {
      return 'Date must be greater than 18 years of birth date';
    }
    if (control.errors?.invalidEmployee) {
      return 'Employee does not exists.';
    }
    if (control.errors?.MinProduct) {
      return 'Select atleast minimum products.';
    }
    if (control.errors?.InvalidFMEDob) {
      return 'Employee must be younger than parents';
    }
    if (control.errors?.sameEmployeesFound) {
      return 'Both Employees are the same.';
    }
    if (control.errors?.invalidLandLine) {
      return 'Invalid landline number';
    }
    if (control.errors?.invalidDomain) {
      return "Domain doesn't exists. Please contact admin for support.";
    }
    if (control.errors?.duplicateEntry) {
      return 'Duplicate Entry Found';
    }
    if (control.errors?.max) {
      return `Max limit is ${control.errors.max?.max}`;
    }
    if (control.errors?.min) {
      return `Max limit is ${control.errors.min?.min}`;
    }
    if (control.errors?.deductionAmount) {
      return 'Invalid deduction amount';
    }
    if (control.errors?.additionAmount) {
      return 'Invalid addition amount';
    }
    if (control.errors?.invalidMatch) {
      return 'Searched value not found';
    }
    return 'Please check the value ';
  }

  showComponentDialog(data: MatDialogConfig): MatDialogRef<any> {
    return this.dialog.open(ComponentDialogComponent, data);
  }

  showAlertDialog(data: any): MatDialogRef<any> {
    return this.dialog.open(AlertDialogComponent, {
      width: '500px',
      disableClose: true,
      data,
    });
  }

  showHideLoader(showLoader: boolean = false) {}

  // Recursive function to find invalid control names
  findInvalidControlNames(formGroup: FormGroup | FormArray): string[] {
    const invalidControlNames: string[] = [];
    Object.keys(formGroup.controls).forEach((controlName) => {
      const control = formGroup.get(controlName);
      if (control instanceof FormGroup || control instanceof FormArray) {
        invalidControlNames.push(...this.findInvalidControlNames(control));
      } else if (control instanceof FormControl && !control.valid) {
        controlName = controlName
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (match) => match.toUpperCase());
        invalidControlNames.push(controlName);
      }
    });
    return invalidControlNames;
  }
}
