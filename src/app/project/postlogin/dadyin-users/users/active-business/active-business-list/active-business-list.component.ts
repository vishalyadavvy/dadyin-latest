import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { DadyinUsersService } from '../../../services/dadyin-users.service';

@Component({
  selector: 'app-active-business-list',
  templateUrl: './active-business-list.component.html',
  styleUrls: ['./active-business-list.component.scss']
})
export class ActiveBusinessListComponent implements OnInit {
  uomSetting = false;
  public preferredUoms: any[];
  public preferForm: FormGroup = this.formService.createPreferUomForm();
  public allBusinessList: any[];
  public filterValue: string;
  public headers = [
    { name: 'Business Id', prop: 'id', sortable: true },
    { name: 'Business Name', prop: 'name', sortable: true },
    { name: 'Town | State | Country', prop: 'address', sortable: true },
    { name: 'Business Type', prop: 'businessType', sortable: true },
    { name: 'Industry/Retail Type', prop: 'industryTypes', sortable: true },
    { name: 'As Customer', prop: 'asCustomer', sortable: true },
    { name: 'As Vendor', prop: 'asVendor', sortable: true },
    { name: 'Turnover', prop: 'totalTransactionMillion', sortable: true, subText: 'Millions' },
    { name: 'Total Sales', prop: 'totalSellMillion', sortable: true, subText: 'Millions' },
    {
      name: 'Total Purchase',
      prop: 'totalPurchaseMillion',
      sortable: true,
      subText: 'Millions'
    },
    { name: 'Subscription', prop: 'subscriptionPlan', sortable: true },
    { name: 'Exp Date', prop: 'subscriptionEnd', type: 'date', sortable: true },
    { name: 'Rating', prop: 'totalRating', sortable: true },
    { name: 'User Since', prop: 'userSince', sortable: true },
    // { name: 'ACTIONS', prop: 'action', type: 'menu' },
  ];

  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
  ];
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'audit.lastModifiedDate,desc';
  @Input() role: any;
  @Input() single = false;
  @Input('customerId') customerId: any = null;

  public pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
  };
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public userService: DadyinUsersService,
    public apiService: ApiService,
    public formService: FormsService,
    public http: HttpClient,
    public fb: FormBuilder
  ) { }

  ngOnInit() {
    this.getBusinessList();
  }

  getBusinessList(): void {
    let filter = '';
    if (this.customerId) {
      filter = `&filter=requestTo.id:${this.customerId}`;
    }
    if (this.filterValue) {
      filter = filter + `&searchString=${this.filterValue}`;
    }
    this.userService
      .getAllBusinessAccount(
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        filter
      )
      .subscribe((res) => {
        this.allBusinessList = res.content;
        this.allBusinessList.map((item) => {
          item.industryTypes = item.industryTypes || item.productCategories || item.relationIndustryTypes || item.relationProductCategories;
          item.subscriptionPlan = `${item.subscriptionPlan} (${item.subscriptionType})` ;
          item.totalPurchaseMillion = '$' + item.totalPurchaseMillion;
          item.totalSellMillion = '$' + item.totalSellMillion;
          item.totalTransactionMillion = '$' + item.totalTransactionMillion;
        });
        this.pageConfig.totalElements = res?.totalElements;
        this.pageConfig.totalPages = res?.totalPages;
      });
  }

  get componentUoms() {
    return this.preferForm.get('componentUoms') as FormArray;
  }

  onActionClick(event) {
    // switch (event.action.label) {
    //   case 'Edit':
    //     if (event?.row?.id) {
    //       this.router.navigateByUrl(
    //         'home/order-management/' +
    //         this.role +
    //         '/receivedRfq/view/' +
    //         event.row.id
    //       );
    //     }
    //     break;
    // }
  }

  onInput(filterValue: string): void {
    this.filterValue = filterValue;
  }

  viewRecord(event): void {
    // this.router.navigateByUrl(
    //   'home/order-management/' +
    //   this.role +
    //   '/receivedRfq/view/' +
    //   event.data.id
    // );
  }

  sort(event) {
    this.getBusinessList();
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.getBusinessList();
  }
}
