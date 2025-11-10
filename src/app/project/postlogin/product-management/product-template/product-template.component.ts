import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { FormsService } from 'src/app/service/forms.service';

@Component({
  selector: 'app-product-template',
  templateUrl: './product-template.component.html',
  styleUrls: ['./product-template.component.scss'],
})
export class ProductTemplateComponent implements OnInit {

  public templateProcesses: FormArray = this.fb.array([
    this.formsService.createProcessForm(),
  ]);

  constructor(private fb:FormBuilder,private formsService:FormsService) {}

  ngOnInit(): void {}
}
