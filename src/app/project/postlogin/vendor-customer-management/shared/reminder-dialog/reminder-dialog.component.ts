import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VendorFormsService } from '../../service/vendor-forms.service';
import { VendorCustomerService } from '../../service/vendor-customer.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-reminder-dialog',
  templateUrl: './reminder-dialog.component.html',
  styleUrls: ['./reminder-dialog.component.scss'],
})
export class ReminderDialogComponent implements OnInit {
  reminderForm: FormGroup;
  minDateTime;
  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public vendorFormService: VendorFormsService,
    public vendorCustomerService: VendorCustomerService,
    public toastr: ToastrService
  ) {
    const now = new Date();
    this.minDateTime = now.toISOString().slice(0, 16); // format to match the "datetime-local" input

    this.reminderForm = this.vendorFormService.reminderForm();
  }

  ngOnInit(): void {}

  async addReminder() {
    try {
      if (this.reminderForm?.invalid) {
        this.reminderForm.markAllAsTouched();
        return;
      }
      const id = this.data.id;
      const data = this.reminderForm.getRawValue();
      if (data.reminderTime) {
        data.reminderTime = data.reminderTime + ':00Z';
      }
      const resp = await this.vendorCustomerService
        .addReminder(id, data)
        .toPromise();
      this.close();
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  close() {
    this.dialog.closeAll();
  }
}
