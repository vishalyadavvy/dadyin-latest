import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'add-cost',
  templateUrl: './add-cost-dialog.component.html',
  styleUrls: ['./add-cost-dialog.component.scss'],
})
export class AddCostDialogComponent implements OnInit {
  addCost: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddCostDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.addCost = this._fb.group({
      costName: [''],
      price: [''],
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    const costData = {
      description: this.addCost.value.costName,
      amount: parseFloat(this.addCost.value.price),
    };
    this.dialogRef.close(costData);
  }
}
