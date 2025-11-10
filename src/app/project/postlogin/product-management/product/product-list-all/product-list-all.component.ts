import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { UomService } from 'src/app/service/uom.service';
import { FormsService } from 'src/app/service/forms.service';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FilterBoxComponent } from './filter-box/filter-box.component';
import { ProductService } from '../service/product.service';
import { BusinessAccountService } from '../../../business-account/business-account.service';
import { MatDialog } from '@angular/material/dialog';
import { CustomerDialogComponent } from '../modals/customer-dialog/customer-dialog.component';
import { ProductManagementService } from '../../service/product-management.service';
import { AddRawMaterialDialogComponent } from 'src/app/shared/dialogs/add-raw-material/add-raw-material-dialog.component';
import { Subject, Subscription, Observable } from 'rxjs';
import { switchMap, finalize, map } from 'rxjs/operators';

@Component({
  selector: 'app-product-list-all',
  templateUrl: './product-list-all.component.html',
  styleUrls: ['./product-list-all.component.scss'],
})
export class ProductListAllComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.uomSetting = false;
  }
  @ViewChild(FilterBoxComponent) filterBoxComponent: FilterBoxComponent;
  uomSetting = false;
  public preferForm: FormGroup = this.formsService.createPreferUomForm();
  public productsList: any[];
  public calculatorDetailsList: any[] = [];
  public processDetailsList: any[] = [];
  public filterValue: string;

  // Concurrency handling for search requests
  private searchRequestSubject = new Subject<{ filter: string; searchValue: string }>();
  private searchSubscription: Subscription;
  private currentRequestId = 0;

  // Tooltip related properties
  hoveredElement: any = null;
  loading = false;
  salesData: any[] = [];
  purchaseData: any[] = [];
  tooltipPosition = { top: 0, left: 0 };
  private apiCallInProgress = false;
  private currentProductId: number | null = null;
  private hoverTimeout: any = null;

  // QOH specific properties
  purchaseHoveredElement: any = null;
  purchaseLoading = false;
  private qohApiCallInProgress = false;
  private qohCurrentProductId: number | null = null;
  private qohHoverTimeout: any = null;
  public productEditLink: any = '/home/product-management/product/edit/';
  productSubtypeEditLink: any =
    '/home/product-management/product-type/subtype/edit/';
  productTypeEditLink: any = '/home/product-management/product-type/edit/';
  productTemplateEditLink: any =
    '/home/product-management/product-template/edit/';
  public headers = [
    { name: 'PRODUCT CODE', prop: 'productCode', sortable: true },
    { name: 'PRODUCT DETAILS', prop: 'description', sortable: true },
    {
      name: 'PRODUCT TYPE ',
      prop: 'productTypeDescription',
      sortable: true,
      isLink: true,
      link: this.productTypeEditLink,
      idKey: 'productTypeId',
    },
    {
      name: 'SUBTYPE',
      prop: 'productSubTypeDescription',
      sortable: true,
      isLink: true,
      link: this.productSubtypeEditLink,
      idKey: 'productSubTypeId',
    },
    {
      name: 'TEMPLATE',
      prop: 'productTemplateCode',
      sortable: true,
      isLink: true,
      link: this.productTemplateEditLink,
      idKey: 'productTemplateId',
    },
    { name: '#QOH(SKU)', prop: 'qoh', sortable: true },
    { name: 'MQS', prop: 'mqs', sortable: true },
    {
      name: 'METRIC COST',
      prop: 'metricCost',
      type: 'uom',
      dataType: 'number',
      hideNumberFormatter: true,
      isCurrency: true,
    },
    {
      name: 'SKU COST',
      prop: 'skuCost',
      type: 'uom',
      dataType: 'number',
      isCurrency: true,
      isTooltip: true,
    },
    {
      name: 'SKU PRICE',
      prop: 'skuPrice',
      type: 'uom',
      dataType: 'number',
      isCurrency: true,
      isTooltip: true,
    },
    {
      name: 'STATUS',
      prop: 'status',
      type: 'status',
      sortable: true,
      isTooltip: true,
    },

    { name: 'ACTIONS', prop: 'action', type: 'menu' },
  ];
  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
    {
      label: 'Copy',
      icon: 'content_copy',
    },
    {
      label: 'Copy For Customer',
      icon: 'workspace_premium',
    },
  ];
  public pageConfig = null;

  public activeTab = 'product-details';
  labelTooltip: string = '';
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'productCode';

  currentMainIndex: number = 0;
  mainTab: Array<any> = [
    {
      id: 1,
      title: 'Product Details',
      badge: 0,
      index: 0,
    },
  ];

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public apiService: ApiService,
    public http: HttpClient,
    public service: ProductManagementService,
    public formsService: FormsService,
    public toastr: ToastrService,
    public productService: ProductService,
    public businessAccountService: BusinessAccountService,
    public uomService: UomService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // this.apiService.clonePayload = null
    this.setupSearchSubscription();
    this.getPreference();
    this.pageConfig = {
      itemPerPage: 20,
      sizeOption: [20, 50, 75, 100],
    };
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    this.searchRequestSubject.complete();
  }

  private setupSearchSubscription(): void {
    // Use switchMap to cancel previous requests when a new search is initiated
    this.searchSubscription = this.searchRequestSubject
      .pipe(
        switchMap(({ filter, searchValue }) => {
          // Increment request ID to track the latest request
          const requestId = ++this.currentRequestId;
          return this.performProductSearch(filter, searchValue, requestId).pipe(
            finalize(() => {
              // Request completed (either successfully or cancelled)
            })
          );
        })
      )
      .subscribe(({ products, requestId }) => {
        // Only update if this is the latest request (safety check in case of race conditions)
        if (requestId === this.currentRequestId) {
          this.updateProductsList(products);
        }
      });
  }

  getPreference() {
    this.apiService.getPreferredUoms().subscribe((preference: any) => {
      const preferenceForContainer = preference.find(
        (item) => item.componentType == 'PRODUCT'
      );
      preferenceForContainer?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formsService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForContainer);
      if (this.filterBoxComponent) {
        this.filterBoxComponent?.apply();
      } else {
        this.loadProductsList();
      }
    });
  }

  get componentUoms() {
    return this.preferForm.get('componentUoms') as FormArray;
  }

  loadProductsList(filter: any = ''): void {
    // Emit search request through Subject to ensure proper concurrency handling
    const searchValue = this.searchControl.value || '';
    this.searchRequestSubject.next({ filter, searchValue });
  }

  private performProductSearch(filter: any, searchValue: string, requestId: number): Observable<{ products: any; requestId: number }> {
    // Build filter with status exclusion
    filter = filter + "&filter=status!'DELETED'";
    if (this.route.snapshot.queryParams['productTypeId']) {
      filter =
        filter +
        '&filter=productTypeId:' +
        this.route.snapshot.queryParams['productTypeId'];
    }

    if (this.route.snapshot.queryParams['productSubTypeId']) {
      filter =
        filter +
        '&filter=productSubTypeId:' +
        this.route.snapshot.queryParams['productSubTypeId'];
    }

    if (
      ['RETAILER', 'DISTRIBUTOR'].includes(
        this.businessAccountService.currentbusinessLines
      )
    ) {
      filter = filter + '&filter=audit.businessAccount.id!1';
    }

    const businessAccountId =
      this.businessAccountService.currentBusinessAccountId;
    if (businessAccountId == 1) {
      filter =
        filter +
        `&filter=audit.businessAccount.id:${businessAccountId} or isDadyInQuickCheckoutEligible:true`;
    }

    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);

    return this.apiService
      .Get_Product_List_By_Search(
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        uomQuery,
        searchValue,
        filter
      )
      .pipe(
        map((products: any) => {
          // Return both products and requestId to verify it's the latest request
          return { products, requestId };
        })
      );
  }

  private updateProductsList(products: any): void {
    this.pageConfig.totalElements = products?.totalElements;
    this.pageConfig.totalPages = products?.totalPages;
    this.productsList = products?.content;
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    this.productsList.forEach((x) => {
      x.createdBy =
        x.audit.businessAccountId == 1
          ? 'M'
          : x.audit.businessAccountId == loggedInAccountId &&
            x.isSelfProduct
          ? 'S'
          : 'T';
    });
    this.productsList.forEach((x) => {
      if (x.preferredCustomerId) {
        x.isMyProduct = true;
      }
      console.log(x.qoh < x.mqs);
      if (x.qoh < x.mqs) {
        x.showQohAlert = true;
      }
    });
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        if (event?.row?.id) {
          this.router.navigateByUrl(
            'home/product-management/product/edit/' + event.row.id
          );
        }
        break;
      case 'Copy':
        if (event?.row?.id) {
          this.copyProductDataById(event.row.id);
        }
        break;

      case 'Copy For Customer':
        if (!event?.row?.isCustomizable) {
          this.toastr.warning('This Product is not Customizable');
          return;
        }
        if (event?.row?.id) {
          this.openCustomerModal(event.row.id);
        }

        break;
      case 'Download':
        break;
    }
  }

  addProduct(): void {
    this.router.navigateByUrl('/home/product-management/product/add');
  }

  addRawMaterial(): void {
    this.dialog
      .open(AddRawMaterialDialogComponent, {
        width: '900px',
        disableClose: true,
        data: { type: 'add' },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          console.log(result);
        }
      });
  }

  onInput(): void {
    this.filterBoxComponent?.apply();
  }

  async copyProductDataById(id: any) {
    try {
      const res = await this.apiService.Copy_Product_ById(id);
      this.productService.clonePayload = res;
      this.toastr.success('Product copied Successfully');
      this.addProduct();
    } catch (err: any) {
      this.toastr.error("Product can't be copied");
    }
  }

  async copyProductDataForCustomerById(id: any, customerId: any) {
    try {
      const res = await this.apiService.Copy_ProductForCustomer_ById(
        id,
        customerId
      );
      this.productService.clonePayload = res;
      this.toastr.success('Product copied Successfully');
      this.addProduct();
    } catch (err: any) {
      this.toastr.error("Product can't be copied");
    }
  }

  editRecord(event): void {
    if (event?.data?.id) {
      this.router.navigate([
        'home/product-management/product/edit',
        event.data.id,
        event.data.createdBy,
      ]);
    }
  }

  sort(event) {
    if (event.active == 'lastModifiedDate') {
      this.sortQuery = 'audit.' + event.active + ',' + event.direction;
      this.loadProductsList();
    } else {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadProductsList();
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadProductsList();
  }

  changeMainTab(event: number): void {
    this.currentMainIndex = event;
    // this.navigateToUrl();
  }

  getUomByName(type: any) {
    const componentUoms: any = this.componentUoms.getRawValue();
    return componentUoms.find(
      (item) => item.attributeName?.toUpperCase() == type?.toUpperCase()
    )?.userConversionUom;
  }

  filterProducts(event) {
    this.loadProductsList(event);
  }

  openCustomerModal(id: any) {
    this.dialog
      .open(CustomerDialogComponent, {
        width: '500px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((customerId) => {
        if (customerId) {
          this.copyProductDataForCustomerById(id, customerId);
        }
      });
  }

  // Tooltip methods for SKU COST and SKU PRICE
  showPopover(product: any, event: MouseEvent, prop: string) {
    const productId = product.id;
    const businessAccountId =
      this.businessAccountService.currentBusinessAccountId;

    this.labelTooltip = prop == 'skuCost' ? 'Prev. Purchases' : 'Prev. Sales';

    if (!productId || !businessAccountId) {
      return;
    }

    this.hoveredElement = product;
    this.loading = true;
    this.salesData = [];

    // Wait for 2 seconds before making API call
    this.hoverTimeout = setTimeout(() => {
      // Double check if still hovering the same element
      if (this.hoveredElement === product) {
        this.loading = true;
        if (prop == 'skuCost') {
          this.fetchPreviousPurchaseData(productId, businessAccountId);
        } else if (prop == 'skuPrice') {
          this.fetchPreviousSalesData(productId, businessAccountId);
        }
      }
    }, 1000);
  }

  hidePopover() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    this.hoveredElement = null;
    this.salesData = [];
    this.loading = false;
  }

  fetchPreviousSalesData(productId: number, businessAccountId: number) {
    // Set flags to prevent multiple calls
    this.loading = true;

    // Call the API service to fetch previous sales data
    this.apiService
      .getPreviousSalesData(productId, businessAccountId)
      .subscribe((response: any) => {
        this.salesData = response.salesData || [];
        this.loading = false;
      });
  }

  fetchPreviousPurchaseData(productId: number, businessAccountId: number) {
    // Set flags to prevent multiple calls
    this.loading = true;

    // Call the API service to fetch previous sales data
    this.apiService
      .getPreviousPurchasesData(productId, businessAccountId)
      .subscribe((response: any) => {
        this.salesData = response.purchaseData || [];
        this.loading = false;
      });
  }

  // QOH specific methods
  showPurchasePopover(product: any, event: MouseEvent) {
    const productId = product.id;
    const businessAccountId =
      this.businessAccountService.currentBusinessAccountId;

    if (!productId || !businessAccountId) {
      return;
    }

    this.purchaseHoveredElement = product;
    this.purchaseLoading = true;
    this.salesData = [];

    // Add a small delay to prevent rapid hover events
    this.qohHoverTimeout = setTimeout(() => {
      this.fetchPurchaseData(productId, businessAccountId);
    }, 2000);
  }

  hidePurchasePopover() {
    if (this.qohHoverTimeout) {
      clearTimeout(this.qohHoverTimeout);
      this.qohHoverTimeout = null;
    }
    this.purchaseHoveredElement = null;
    this.salesData = [];
    this.purchaseLoading = false;
  }

  fetchPurchaseData(productId: number, businessAccountId: number) {
    // Set flags to prevent multiple calls
    this.purchaseLoading = true;

    // Call the API service to fetch QOH data
    this.apiService
      .getPreviousPurchasesData(productId, businessAccountId)
      .subscribe((response: any) => {
        this.salesData = response.purchaseData || [];
        this.purchaseLoading = false;
      });
  }
}
