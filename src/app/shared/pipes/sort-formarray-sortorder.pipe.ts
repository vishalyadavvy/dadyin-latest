import { Pipe, PipeTransform } from '@angular/core';
import { FormGroup, FormArray, AbstractControl } from '@angular/forms';

@Pipe({
  name: 'sortFormArray'
})
export class SortFormArrayPipe implements PipeTransform {
  transform(formArray: any): AbstractControl[] {
    const controls = formArray;
    controls.sort((a, b) => {
      const sortOrderA = (a as FormGroup).controls['sortOrder'].value;
      const sortOrderB = (b as FormGroup).controls['sortOrder'].value;
      return sortOrderA - sortOrderB;
    });
    return controls;
  }
}