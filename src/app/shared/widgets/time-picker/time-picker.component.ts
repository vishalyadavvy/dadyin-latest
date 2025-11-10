
import { Component, OnInit, Input, forwardRef, ChangeDetectorRef, AfterContentChecked } from '@angular/core';

import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl, ControlContainer } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { CommonService } from 'src/app/service/common.service';



@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TimePickerComponent), multi: true },
  ]
})
export class TimePickerComponent implements OnInit, ControlValueAccessor, AfterContentChecked {

  @Input() class = '';
  @Input() label = "";
  @Input() leftHint = "";
  @Input() rightHint = "";
  @Input() customError = "";
  @Input() formControlName = '';
  @Input() inputWidth = "100%";
  @Input() isRequired: boolean = false;
  @Input() placeholder = '';
  @Input() format = 24;
  @Input() minutesGap = 5;

  control!: FormControl;

  onChange: any = () => { };
  onTouched: any = () => { };

  @Input('value') _value: any;
  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }
  get value() {
    return this._value;
  }


  darkTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: '#fff',
      buttonColor: '#32338E'
    },
    dial: {
      dialBackgroundColor: '#32338E',
    },
    clockFace: {
      clockFaceBackgroundColor: '#fff',
      clockHandColor: '#32338E',
    }
  };


  constructor(private commonService: CommonService, private controlContainer: ControlContainer, private cdr: ChangeDetectorRef) {
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    if (this.controlContainer.control) {
      this.control = this.controlContainer.control.get(this.formControlName) as FormControl;
    }
  }

  writeValue(event: any) {
    if (event) {
      if (typeof event === 'string') {
        this.value = event;
      } else if (typeof event === "object") {
        this.value = event;
      } else {
        const element = event.currentTarget as HTMLInputElement
        this.value = element?.value;
      }
    } else {
      this.value = "";
    }
  }
  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
    this.onTouched = fn;
  }


  showFieldError() {
    if (this.control?.errors) {
      if (this.control.dirty || this.control.touched) {
        return true;
      }
    }
    return false;
  }

  getFieldErrorDesc() {
    if (this.customError.length) {
      return this.customError;
    }
    return this.commonService.getFieldErrorDesc(this.control);
  }
}
