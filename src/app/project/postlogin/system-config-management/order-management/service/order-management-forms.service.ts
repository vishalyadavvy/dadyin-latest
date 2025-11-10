import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class OrderManagementFormsService {
  constructor(public _fb: FormBuilder) { }

 
  noteForm(): FormGroup {
    return this._fb.group({
      id:[null],
      note_title: [null],
      description: [null],
      transaction_categories: [null],
    });
  }
  createAttributeConfigForm(): FormGroup {
    return  this._fb.group({
      id:[],
      attributes: [null],
      description: [null],
      transactionCategory: [null],
      priceOptions: [null],
      productOptions:[null],
      productTypeId: [null],
      infoOptions: this._fb.group({
        METRICCOST: [null],
        VOLUME: [null],
        WEIGHT: [null]
      })
    })
  }

 
}