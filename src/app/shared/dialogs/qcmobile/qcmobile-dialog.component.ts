import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'qcmobile-dialog',
  templateUrl: './qcmobile-dialog.component.html',
  styleUrls: ['./qcmobile-dialog.component.scss'],
})
export class QcmobileDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<QcmobileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public authService: AuthService,
    public router: Router
  ) {
  }

  viewProducts(): void {
    window.location.href =
      window.location.origin +
      '#/home/quick-checkout/order?category=pharmacy&vendorKey=dayana&viewType=flyer';
    this.dialogRef.close();
  }

  shareLink() {
    if (this.data.qcData) {
      const url =
        window.location.origin +
        '#/home/quick-checkout/order/' +
        this.data.qcData.id;
      window.navigator.clipboard.writeText(url);
      window.navigator.share({ text: url });
      this.authService.logout();
      window.location.href =
        window.location.origin +
        '#/home/quick-checkout/order?category=pharmacy&vendorKey=dayana&viewType=flyer';
      this.dialogRef.close();
    } else {
      const url =
        window.location.origin +
        '#/home/quick-checkout/order?category=pharmacy&vendorKey=dayana&viewType=flyer';
      window.navigator.clipboard.writeText(url);
      window.navigator.share({ text: url });
      this.authService.logout();
      window.location.href = url;
      this.dialogRef.close();
    }
  }
}
