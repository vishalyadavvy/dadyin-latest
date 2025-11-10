import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-dropdown-field-modal',
  templateUrl: './create-dropdown-field-modal.component.html',
  styleUrls: ['./create-dropdown-field-modal.component.scss']
})
export class CreateDropdownFieldModalComponent implements OnInit {

  attributeValueExpression: FormArray;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { attributeName: FormControl, attributeType: any ,attributeValueExpression:any},
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateDropdownFieldModalComponent>
  ) {
    this.attributeValueExpression = this.fb.array([])
  }

  ngOnInit(): void {
    this.attributeValueExpression.clear()
   const attributeExpression = this.getArray(this.data.attributeValueExpression)
   if(attributeExpression?.length>0) {
     attributeExpression.forEach(element => {
      const form = this.createAttributeExpression()
      form.patchValue(element)
      this.attributeValueExpression.push(form)
      });
   }
    
  }

  addArray() {
    this.attributeValueExpression.push(this.createAttributeExpression())
  }

  createAttributeExpression() {
    return this.fb.group({
      choice: [''],
      attributeValue: [''],
      userConversionUom: [''],
    });
  }

  onCancel() {
    this.attributeValueExpression.clear()
  }

  removeArray(index) {
    this.attributeValueExpression.removeAt(index)
  }

  onConfirm() {
    let data = {
      attributeName: this.data.attributeName.value,
      attributeValueExpression: JSON.stringify(this.attributeValueExpression.value),
    }
    this.attributeValueExpression.clear()
    this.dialogRef.close(data);
  }

  getArray(str: String) {
    if(!str) {
      return []
    }
    let prop = JSON.parse(str?.replace(/'/g, '"'));
    return prop;
  }
}
