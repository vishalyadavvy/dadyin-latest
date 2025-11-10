import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class UserFormsService {
  constructor(public _fb: FormBuilder) { }

  createUserForm(): FormGroup {
    return this._fb.group({
      roleName:[]
    });
  }
}