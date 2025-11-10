import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class CategoryManagementFormsService {
  constructor(public _fb: FormBuilder) { }



  createCategoryForm(): FormGroup {
    return this._fb.group({
      id: [],
      productSubTypeIds:[null],
      description: [null],
      categoryIndustryTypes: [null],
      categoryProductTypes:[null],
      buyingCapacityType: [null]
    })
  }
}