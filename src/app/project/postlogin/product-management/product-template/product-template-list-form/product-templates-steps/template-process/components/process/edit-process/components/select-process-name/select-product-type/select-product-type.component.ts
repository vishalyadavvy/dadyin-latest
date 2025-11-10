import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';


@Component({
  selector: 'app-select-product-type',
  templateUrl: './select-product-type.component.html',
  styleUrls: ['./select-product-type.component.scss']
})
export class SelectProductTypeComponent implements OnInit {

  subProductType=new FormControl()

  constructor(public dialogRef: MatDialogRef<SelectProductTypeComponent>,public apiService:ApiService, @Inject(MAT_DIALOG_DATA) public data: any) {
   this.subProductType.setValue(this.data.control.value)
   }

  ngOnInit(): void {
  }


   onClose() {
     this.dialogRef.close(this.subProductType.value)
   }


}
