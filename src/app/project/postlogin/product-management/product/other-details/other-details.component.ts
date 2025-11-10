import { FormArray, FormGroup } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/service/forms.service';
import { ContainerManagementService } from '../../../container-management/service/container-management.service';
import { BusinessAccountService } from '../../../business-account/business-account.service';
@Component({
  selector: 'app-other-details',
  templateUrl: './other-details.component.html',
  styleUrls: ['./other-details.component.scss'],
})
export class OtherDetailsComponent implements OnInit {

  @Input() productForm: FormGroup;

  @Input() componentUoms: FormArray;
  constructor(
    public toastr: ToastrService,
    public apiService: ApiService,
    public formsService: FormsService,
    public containerService: ContainerManagementService,
    public businessAccountService: BusinessAccountService
  ) { }

  ngOnInit(): void {
    this.businessAccountService.Get_All_Vendors()
    this.getAllProductsForPackage()
  }


  getAllProductsForPackage() {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      uomQuery =
        uomQuery +
        `&uomMap[${element.get('attributeName').value}]=${element.get('userConversionUom').value
        }`;
    });
    uomQuery = encodeURI(uomQuery);
    this.apiService.Get_All_Product_List_IsPackage(uomQuery, '').subscribe(res => {
      this.apiService.allproductsWithIsPackage = res
    })
  }





  get similarProducts() {
    return this.productForm.get('similarProducts') as FormArray;
  }

  removeSimilarProduct(i) {
    this.similarProducts.removeAt(i);
  }

  addSimilarProductForm() {
    this.similarProducts.push(this.formsService.createSimilarProductForm());
  }

  get keywords() {
    return this.productForm.get('keyWords');
  }

  addKeyword(inp: any) {
    if (!inp.value) {
      return;
    }
    let data: any = this.keywords.value
    data.push(inp.value)
    inp.value = ''
    this.keywords.setValue(data);
  }

  removeKeyword(i: any) {
    let data: any = this.keywords.value
    data.splice(i, 1)
    this.keywords.setValue(data);
  }

  setProductName(event: any, similarProduct) {
    const product = this.apiService.allproductsWithIsPackage.find(item => item.productCode == event)
    similarProduct.get('productName').setValue(product.description)   
     similarProduct.get('productId').setValue(product.id)
  }

  setProductCode(event: any, similarProduct) {
    const product = this.apiService.allproductsWithIsPackage.find(item => item.description == event)
    similarProduct.get('productCode').setValue(product.productCode)
    similarProduct.get('productId').setValue(product.id)
  }


  onHoverImage(similarProduct: any) {
    if (similarProduct.get('productImage').value || similarProduct.get('productImage').value == 'null') {
      return
    }
    else {
      const product = this.apiService.allproductsWithIsPackage.find(item => item.description == similarProduct.get('productName').value)

    }
  }


}
