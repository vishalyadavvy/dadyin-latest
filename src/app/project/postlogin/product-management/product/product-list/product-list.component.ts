import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { CommonService } from 'src/app/service/common.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { QuickPricingModalComponent } from '../modals/attribute-value-modal/quick-pricing-modal.component';
import { BusinessAccountService } from '../../../business-account/business-account.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { ProductService } from '../service/product.service';
import { OrderManagementService } from '../../../order-management/service/order-management.service';
import { RawMaterialPriceModalComponent } from '../../common-modals/raw-material-price-modal/raw-material-price-modal.component';
import { SeoService } from 'src/app/core/seo.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.uomSetting = false;
  }

  // ************* Variable Declarations *************
  loadingProductTemplateDetail = false;
  currentBusinessAccount: any;
  uomSetting = false;
  currentStepIndex = 0;
  loaded = false;
  public preferredUoms: any[];
  public preferForm: FormGroup = this.formsService.createPreferUomForm();

  public productForm = this.formsService.createProductForm();

  costType = new FormControl('UNIT');
  productDetail: any;
  createdBy;

  constructor(
    public apiService: ApiService,
    public productService: ProductService,
    public commonService: CommonService,
    private fb: FormBuilder,
    private formsService: FormsService,
    public route: ActivatedRoute,
    public uomService: UomService,
    public toastr: ToastrService,
    public router: Router,
    public businessAccountService: BusinessAccountService,
    public dialog: MatDialog,
    public ordermanagementService: OrderManagementService,
    private seoService: SeoService // <-- Inject SeoService
  ) { }

  async ngOnInit() {
    this.createdBy = this.route.snapshot.params.createdBy;
    this.getBusinessAccountDetail();
    this.getPreference();
    this.apiService.getAllDatas();

    if (this.productService.clonePayload && !this.route.snapshot.params.id) {
      this.patchDataOnEdit(this.productService.clonePayload, true);
    }

    if (this.route.snapshot.params.id) {
      this.getProductDataById(this.route.snapshot.params.id);
    } else {
      this.loaded = true;
    }
  }

  ngOnDestroy() {
    this.productService.clonePayload = null;
  }

  get editMode() {
    if (this.route.snapshot.params.id) {
      return true;
    } else {
      return false;
    }
  }

  confirmActivate() {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
        data: {
          title:
            'Are you sure you want to activate the product ? We suggest you to verify the details before publishing the product.',
        },
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.activateProduct();
        }
      });
  }

  confirmDelete() {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.deleteProduct();
        }
      });
  }

  async deleteProduct() {
    try {
      const id = this.route.snapshot.params.id;
      const res = await this.apiService.delete_Product(id);
      this.toastr.success('Successfully Deleted');
      this.router.navigateByUrl('/home/product-management/product');
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async patchDataOnEdit(res, emit?: any) {
    this.loaded = false;
    this.productDetail = res;
    if (this.productDetail?.inventoryDetail?.inventoryAddedOn) {
      this.productDetail.inventoryDetail.inventoryAddedOn =
        this.productDetail?.inventoryDetail?.inventoryAddedOn?.slice(0, 10) ??
        null;
    }
    if (this.productDetail?.inventoryDetail?.inventoryAddedOn) {
      this.productDetail.inventoryDetail.inventoryAddedOn =
        this.productDetail?.inventoryDetail?.inventoryAddedOn?.slice(0, 10) ??
        null;
    }
    this.productAttributeValues.clear();
    this.productDetail?.productAttributeValues?.forEach((attributeValue) => {
      this.productAttributeValues.push(this.formsService.createAttributeForm());
    });
    this.productInformationValues.clear();
    this.productDetail?.productInformationValues?.forEach(
      (informationValue) => {
        this.productInformationValues.push(
          this.formsService.createProductInformationForm()
        );
      }
    );
    this.additionalCosts.clear();
    this.productDetail?.additionalCosts?.forEach((additionalCost) => {
      this.additionalCosts.push(this.formsService.createAdditionalCostForm());
    });
    this.images.clear();
    this.productDetail?.productMeta?.images.forEach((img) => {
      this.images.push(this.formsService.createImageForm());
    });
    // for product expense
    this.productExpenseValues.clear();
    this.productDetail?.productExpense?.expenseValues.forEach(
      (element, index) => {
        this.productForm.get('isExtraExpense').setValue(true);
        this.productExpenseValues.push(
          this.formsService.createProductExpenseForm()
        );
      }
    );
    this.productExpenseConversionTypes.clear();
    this.productDetail?.productExpense?.expenseConversionTypes.forEach(
      (expenseConversionType, index) => {
        this.productExpenseConversionTypes.push(
          this.formsService.createProductExpenseConversionTypeForm()
        );
      }
    );
    if (this.productDetail?.productExpense?.expenseValues.length > 0) {
      this.productForm.get('isExtraExpense').setValue(true);
    } else {
      this.productForm.get('isExtraExpense').setValue(false);
    }
    let tierPricingCustomization = this.productForm
      .get('tierPricingDetail')
      .get('tierPricingCustomization') as FormArray;
    tierPricingCustomization.clear();
    this.productDetail?.tierPricingDetail?.tierPricingCustomization.forEach(
      (element, index) => {
        const Form = this.formsService.createCustomTierPricingForm();
        Form.get('sortOrder').patchValue(index + 1);
        let deliveryPricingArray = Form.get('deliveryPricing') as FormArray;
        deliveryPricingArray.clear();
        element?.deliveryPricing.forEach((deliveryPrice, j) => {
          const deliveryForm = this.formsService.createDeliveryPricingForm();
          deliveryForm.get('sortOrder').patchValue(j + 1);
          deliveryPricingArray.push(deliveryForm);
        });
        tierPricingCustomization.push(Form);
      }
    );

    let tierPricingQuickCheckout = this.productForm
      .get('tierPricingDetail')
      .get('tierPricingQuickCheckout') as FormArray;
    tierPricingQuickCheckout.clear();
    this.productDetail?.tierPricingDetail?.tierPricingQuickCheckout.forEach(
      (element, index) => {
        const Form = this.formsService.createQuickCheckoutTierPricingForm();
        Form.get('sortOrder').setValue(index + 1);
        let deliveryPricingArray = Form.get('deliveryPricing') as FormArray;
        deliveryPricingArray.clear();
        element?.deliveryPricing.forEach((deliveryPrice, j) => {
          const deliveryForm = this.formsService.createDeliveryPricingForm();
          deliveryForm.get('sortOrder').setValue(j + 1);
          deliveryPricingArray.push(deliveryForm);
        });
        tierPricingQuickCheckout.push(Form);
      }
    );

    let similarProducts = this.productForm.get('similarProducts') as FormArray;
    similarProducts.clear();
    this.productDetail?.similarProducts.forEach((similarProduct, index) => {
      similarProducts.push(this.formsService.createSimilarProductForm());
    });

    let buyingCapacities = this.productForm.get(
      'productBuyingCapacities'
    ) as FormArray;
    buyingCapacities.clear();
    this.productDetail?.productBuyingCapacities?.forEach((element, index) => {
      buyingCapacities.push(this.formsService.createBuyingCapacityForm());
    });

    // for packages

    this.packages.clear();
    this.productDetail?.packages?.forEach((element, index) => {
      if (element.isSku == null) {
        element.isSku = false;
      }
      let form = this.formsService.createPackageForm();
      let packageExpenseValues = form
        .get('packageExpense')
        .get('expenseValues') as FormArray;
      let packageExpenseConversionTypes = form
        .get('packageExpense')
        .get('expenseConversionTypes') as FormArray;
      element?.packageExpense?.expenseValues?.forEach((el, j) => {
        packageExpenseValues.push(this.formsService.createPackageExpenseForm());
      });
      element?.packageExpense?.expenseConversionTypes?.forEach((el, k) => {
        packageExpenseConversionTypes.push(
          this.formsService.createPackageExpenseConversionTypeForm()
        );
      });

      let packageAttributeValues = form.get(
        'packageAttributeValues'
      ) as FormArray;

      element?.packageAttributeValues?.forEach((el, n) => {
        packageAttributeValues.push(this.formsService.createAttributeForm());
      });

      let packageConversionTypes = form.get(
        'packageAttributeValues'
      ) as FormArray;

      element?.packageConversionTypes?.forEach((el, n) => {
        packageConversionTypes.push(
          this.formsService.createPackageExpenseConversionTypeForm()
        );
      });

      let packageImages = form.get('packageImages') as FormArray;
      element?.packageImages?.forEach((el, n) => {
        packageImages.push(this.formsService.createImageForm());
      });

      let palletRows = form
        .get('palletInformation')
        .get('palletRows') as FormArray;
      element?.palletInformation?.palletRows?.forEach((el, n) => {
        palletRows.push(this.formsService.createPalletRowForm());
      });
      this.packages.push(form);
      form.patchValue(element);
    });

    this.productForm.patchValue(this.productDetail, {
      emitEvent: emit,
      onlySelf: true,
    });

    this.loaded = true;
    this.updateGlobalUoms();
    // Related to uoms
    if (this.disableForThirdPartyProduct) {
      this.productForm.get('upcCode').disable();
      this.productForm.get('eanCode').disable();
      this.productForm.get('unitName').disable();
      this.productForm.get('purchaseDescription').disable();
      this.productForm.get('unitCount').disable();
      this.productForm.get('skuName').disable();
      this.productForm.get('productTypeId').disable();
      this.productForm.get('productSubTypeId').disable();
      this.productForm.get('productMeta').disable();
      this.productAttributeValues.disable();
      this.packages.disable();
      this.consideredCostControl.enable();
      const isSkuIndex = this.packages.controls?.findIndex(
        (pck) => pck.get('isSku').value
      );
      this.packages.controls.forEach((pck, index) => {
        if (index < isSkuIndex) {
          pck.disable();
        }
      });
    }

    if (this.isThirdPartyProductMeta) {
      this.productForm.get('upcCode').disable();
      this.productForm.get('eanCode').disable();
      this.productForm.get('unitName').disable();
      this.productForm.get('skuName').disable();
      this.productForm.get('productMeta').disable();
      this.productForm.get('unitCount').disable();
    }

    if (emit) {
      this.calculateValues();
    }
  }

  get isThirdPartyProductMeta() {
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    const product = this.productForm.getRawValue();
    if (!product?.id) {
      return false;
    }
    if (product?.productMeta?.audit?.businessAccountId != loggedInAccountId) {
      return true;
    } else {
      return false;
    }
  }

  get disableForThirdPartyProduct() {
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    const product = this.productForm.getRawValue();
    if (!product?.id) {
      return false;
    }
    if (
      product?.audit?.businessAccountId != loggedInAccountId &&
      product?.productMeta?.audit?.businessAccountId != loggedInAccountId
    ) {
      return true;
    } else {
      return false;
    }
  }

  get inDraftMode() {
    return this.productForm.get('inDraftMode');
  }

  async getProductDataById(id: any) {
    try {
      const res = await this.apiService.Get_Product_ById(id) as any;
      this.patchDataOnEdit(res, true);
      // Update meta description dynamically
      this.seoService.updateTitle(res.productMeta.metaTitle || 'DadyIn Product UI - Efficient Business Management SaaS Platform');
      this.seoService.updateMetaTags([
        { property: 'og:description', content: res.productMeta.metaDescription || 'Experience the power of DadyIn SaaS platform, specially designed to efficiently manage and grow your business operations.' },
        { property: 'og:title', content: res.productMeta.metaTitle || 'DadyIn Product UI - Efficient Business Management SaaS Platform' },
        { property: 'og:site_name', content: res.productMeta.metaName || 'DadyIn Product' }
      ]);
    } catch (err) {
      if (err?.status === 404) {
        this.toastr.warning('Transaction Not Found');
        this.router.navigateByUrl(
          '/home/product-management'
        );
      } else {
        this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
      }
    }
  }

  updateGlobalUoms() {
    this.componentUoms.controls.forEach((item) => {
      if (item.value.attributeName?.toUpperCase() == 'DENSITY') {
        item
          ?.get('userConversionUom')
          .setValue(
            this.productForm.get('density').get('userConversionUom').value
          );
      }
      if (item.value.attributeName?.toUpperCase() == 'METRICCOST') {
        item
          ?.get('userConversionUom')
          .setValue(
            this.productForm.get('metricCost').get('userConversionUom').value
          );
      }
      if (item.value.attributeName?.toUpperCase() == 'COST') {
        item
          ?.get('userConversionUom')
          .setValue(
            this.productForm.get('cost').get('userConversionUom').value
          );
      }
      if (item.value.attributeName?.toUpperCase() == 'VOLUME') {
        item
          ?.get('userConversionUom')
          .setValue(
            this.productForm.get('volume').get('userConversionUom').value
          );
      }
    });
  }

  async onClickNext() {
    try {
      // this.setUomsUnits();
      this.currentStepIndex++;
    } catch (err: any) { }
  }

  public onClickBack(): void {
    if (this.currentStepIndex >= 1) {
      this.currentStepIndex--;
    }
  }

  get skusInPallet() {
    const skusInPallet = this.productForm
      .get('productSummary')
      .get('skusInPallet');
    return skusInPallet;
  }
  get skusInContainer() {
    const skusInContainer = this.productForm
      .get('productSummary')
      .get('skusInContainer');
    return skusInContainer;
  }

  getHoverSummaryValue(type1) {
    const totalCostFg = this.productForm.get('productSummary').get(type1);
    return totalCostFg.get('attributeValue').value;
  }
  getHoverSummaryUom(type1) {
    const totalCostFg = this.productForm.get('productSummary').get(type1);
    return totalCostFg.get('userConversionUom').value;
  }

  getSummaryUnit(type1, type2, type3) {
    const totalCostFg = this.productForm.get('productSummary').get(type1);
    return totalCostFg.get(type2).get(type3).get('attributeValue').value;
  }

  getSummaryUnitControl(type1, type2, type3) {
    const totalCostFg = this.productForm.get('productSummary').get(type1);
    return totalCostFg.get(type2).get(type3).get('attributeValue');
  }

  getSummaryUnitUom(type1, type2, type3) {
    const totalCostFg = this.productForm.get('productSummary').get(type1);
    return totalCostFg.get(type2).get(type3).get('userConversionUom').value;
  }

  /// GETTER FOR FORM ARRAY

  get productExpenseValues() {
    return this.productForm
      .get('productExpense')
      .get('expenseValues') as FormArray;
  }

  get productExpenseConversionTypes() {
    return this.productForm
      .get('productExpense')
      .get('expenseConversionTypes') as FormArray;
  }

  get productAttributeValues() {
    return this.productForm.get('productAttributeValues') as FormArray;
  }

  get productInformationValues() {
    return this.productForm.get('productInformationValues') as FormArray;
  }

  get additionalCosts() {
    return this.productForm.get('additionalCosts') as FormArray;
  }

  get packages() {
    return this.productForm.get('packages') as FormArray;
  }

  get images() {
    return this.productForm.get('productMeta').get('images') as FormArray;
  }
  get productexpenseValues() {
    return this.productForm
      .get('productExpense')
      .get('expenseValues') as FormArray;
  }

  get productexpenseConversionTypes() {
    return this.productForm
      .get('productExpense')
      .get('expenseConversionTypes') as FormArray;
  }

  async calculateValues() {
    try {
      let data: any = this.productForm.getRawValue();
      data.productTemplateForCalculation =
        this.apiService.productTemplateForCalculation.value;
      data.productTypeForCalculation =
        this.apiService.productTypeForCalculation.value;
      const res: any = await this.apiService.calculateProductValues(data);
      this.patchDataOnEdit(res, false);
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async onClickSave(draftMode: any) {
    try {
      if (this.productForm.get('isCustomizable').value) {
        const productAttributeValues =
          this.productForm.getRawValue().productAttributeValues;
        const productAttributeIds = productAttributeValues?.map(
          (it) => it.attributeId
        );
        if (
          !productAttributeIds.some((item) =>
            [45, 47, 48, 49, 50, 51].includes(item)
          )
        ) {
          this.toastr.error(
            'Customised Product should contain atleast one customizable attribute'
          );
          return;
        }
      }
      if (this.productForm.get('productMeta').get('productCode').invalid) {
        this.toastr.error('Product Code is Empty');
        this.productForm.markAllAsTouched();
        return;
      }
      if (this.productForm.invalid && !draftMode) {
        const invalidControlNames = this.commonService.findInvalidControlNames(
          this.productForm
        );
        this.toastr.error('Invalid Fields: ' + invalidControlNames);
        this.productForm.markAllAsTouched();
        return;
      }

      this.inDraftMode.setValue(draftMode);

      let data = this.productForm.getRawValue();
      if (draftMode) {
        data.status = 'DRAFT';
      } else {
        data.status = 'PUBLISHED';
      }
      this.productForm.markAllAsTouched();
      const res = await this.apiService.saveProductValues(data);
      this.productForm.patchValue(res);
      const productIndex = this.route.snapshot.queryParams['productIndex'];
      if (productIndex) {
        this.router.navigateByUrl(
          `/home/order-management/customer/receivedPo/edit/${this.route.snapshot.queryParams['receivedPOId']}?productIndex=${productIndex}`
        );
        this.toastr.success('Product cloned Successfully');
      } else {
        this.toastr.success('Product saved Successfully');
      }
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async activateProduct() {
    try {
      const data = this.productForm.getRawValue();
      data.status = 'DRAFT';
      const res = await this.apiService.saveProductValues(data);
      this.patchDataOnEdit(res, false);
      this.toastr.success('Product activated Successfully');
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async changeValue() {
    // this.setUomsUnits();
    setTimeout(() => {
      this.calculateValues();
    }, 500);
  }

  setCheckboxValue(event: any, index: any) {
    if (event.target.checked) {
      if (index == 1) {
        this.isInventoryListed.setValue(true);
        if (this.checkIfProductIsAdvanced()) {
          this.isAdvanceProduct.setValue(true);
        }
      }
      if (index == 2) {
        this.isImportExportable.setValue(true);
        if (this.checkIfProductIsAdvanced()) {
          this.isAdvanceProduct.setValue(true);
        }
      }
      if (index == 3) {
        this.isAdvanceProduct.setValue(true);
        this.isInventoryListed.setValue(true);
        this.isImportExportable.setValue(true);
        this.isProductAttributes.setValue(true);
        this.isPackageAttributes.setValue(true);
      }
      if (index == 4) {
        this.isCustomizable.setValue(true);
      }

      if (index == 5) {
        this.isProductAttributes.setValue(true);
        if (this.checkIfProductIsAdvanced()) {
          this.isAdvanceProduct.setValue(true);
        }
      }
      if (index == 6) {
        this.isPackageAttributes.setValue(true);
        if (this.checkIfProductIsAdvanced()) {
          this.isAdvanceProduct.setValue(true);
        }
      }
    } else {
      if (index == 1) {
        this.isInventoryListed.setValue(false);
        this.isAdvanceProduct.setValue(false);
      }
      if (index == 2) {
        this.isImportExportable.setValue(false);
        this.isAdvanceProduct.setValue(false);
      }
      if (index == 3) {
        this.isAdvanceProduct.setValue(false);
        this.isInventoryListed.setValue(false);
        this.isImportExportable.setValue(false);
        this.isProductAttributes.setValue(false);
        this.isPackageAttributes.setValue(false);
      }
      if (index == 4) {
        this.isCustomizable.setValue(false);
      }
      if (index == 5) {
        this.isProductAttributes.setValue(false);
        this.isAdvanceProduct.setValue(false);
      }
      if (index == 6) {
        this.isPackageAttributes.setValue(false);
        this.isAdvanceProduct.setValue(false);
      }
    }
  }

  checkIfProductIsAdvanced() {
    if (
      this.isProductAttributes.value &&
      this.isInventoryListed.value &&
      this.isImportExportable.value &&
      this.isPackageAttributes.value
    ) {
      return true;
    } else {
      return false;
    }
  }

  get isProductAttributes() {
    return this.productForm.get('isProductAttributes');
  }

  get isPackageAttributes() {
    return this.productForm.get('isPackageAttributes');
  }

  get isCustomizable() {
    return this.productForm.get('isCustomizable');
  }

  get isInventoryListed() {
    return this.productForm.get('isInventoryListed');
  }

  get isImportExportable() {
    return this.productForm.get('isImportExportable');
  }

  get isAdvanceProduct() {
    return this.productForm.get('isAdvanceProduct');
  }

  getPreference() {
    this.apiService.getPreferredUoms().subscribe((preference: any) => {
      this.preferredUoms = preference;
      const preferenceForContainer = this.preferredUoms.find(
        (item) => item.componentType == 'PRODUCT'
      );
      preferenceForContainer?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formsService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForContainer);

      this.setDefaultUom();
    });
  }

  setDefaultUom() {
    const metricCost = this.componentUoms.controls.find(
      (item) => item.value.attributeName?.toUpperCase() == 'METRICCOST'
    );
    const density = this.componentUoms.controls.find(
      (item) => item.value.attributeName?.toUpperCase() == 'DENSITY'
    );
    const cost = this.componentUoms.controls.find(
      (item) => item.value.attributeName?.toUpperCase() == 'COST'
    );
    const volume = this.componentUoms.controls.find(
      (item) => item.value.attributeName?.toUpperCase() == 'VOLUME'
    );

    this.productForm
      .get('cost')
      .get('userConversionUom')
      .setValue(cost?.get('userConversionUom').value);
    this.productForm
      .get('density')
      .get('userConversionUom')
      .setValue(density?.get('userConversionUom').value);
    this.productForm
      .get('metricCost')
      .get('userConversionUom')
      .setValue(metricCost?.get('userConversionUom').value);
    this.productForm
      .get('volume')
      .get('userConversionUom')
      .setValue(volume?.get('userConversionUom').value);
    this.uomService.availableWeightDefaultUom.valueChanges.subscribe((res) => {
      if (!this.productForm.get('weight').get('userConversionUom').value) {
        this.productForm.get('weight').get('userConversionUom').setValue(res);
      }
    });
  }

  get componentUoms() {
    return this.preferForm.get('componentUoms') as FormArray;
  }

  isGlobalUomDisabled() {
    if (this.productForm.get('productTypeId').value) {
      return true;
    } else {
      return false;
    }
  }

  openQuickPricingModal() {
    let dialogRef = this.dialog.open(QuickPricingModalComponent, {
      data: {
        tierPricingDetail: this.productForm.get('tierPricingDetail'),
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.calculateValues();
      }
    });
  }

  getBusinessAccountDetail() {
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.currentBusinessAccount = res;
    });
  }

  loadedProductTemplateDetail() {
    this.loadingProductTemplateDetail = true;
  }

  goBack() {
    if (this.productForm.dirty) {
      this.dialog
        .open(ConfirmDialogComponent, {
          width: '25%',
        })
        .afterClosed()
        .subscribe(async (res) => {
          if (res) {
            this.router.navigateByUrl('/home/product-management/product');
          }
        });
    } else {
      this.router.navigateByUrl('/home/product-management/product');
    }
  }

  get tierPricingQuickCheckout() {
    return this.productForm
      .get('tierPricingDetail')
      .get('tierPricingQuickCheckout') as FormArray;
  }

  get consideredCostControl() {
    const skuControl = this.packages.controls.find(
      (item) => item.get('isSku').value
    );

    if (skuControl) {
      return skuControl.get('considerCost');
    } else {
      const fg = this.fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      });
      return fg;
    }
  }

  onConsiderCostChanges(event: any) {
    this.productForm
      .get('skuCost')
      .get('attributeValue')
      .setValue(event.target.value);
    this.calculateValues();
  }

  get isRawMaterial() {
    return this.productForm.get('isRawMaterial');
  }

  refreshRawMaterialPricing() {
    this.dialog
      .open(RawMaterialPriceModalComponent, {
        width: '25%',
        data: {
          id: this.productForm.get('id').value,
        },
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
        }
      });
  }
}
