import { Injectable } from '@angular/core';
import {
  apiModules,
  container,
  customer,
  orderConfigModule,
  userApiModules,
} from 'src/app/shared/constant';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { BusinessAccounts, User } from 'src/app/model/common/business-account';
import { City, Country, State } from 'src/app/model/common/geo';
import { TokenService } from 'src/app/service/token.service';

@Injectable({ providedIn: 'root' })
export class BusinessAccountService {
  vendorId = 301;
  vendorListLoaded = new BehaviorSubject<any>(null);
  public $currentBusinessAccount = new BehaviorSubject<any>(null);
  vendorList: any[] = [];
  exportersVendorList: any[] = [];
  customerList: any[] = [];
  lcpList: any[] = [];
  notesList: any[] = [];
  currentBusinessAccountId: any = null;
  currentbusinessLines: any = null;
  employeesList: any[] = [];
  employeesListForDataTable: any[] = [];

  constructor(
    private httpService: HttpService,
    public tokenService: TokenService
  ) {
    this.currentBusinessAccountId =
      this.tokenService.getBusinessAccountIdToken();

    this.getBusinessAccount();
  }

  getBusinessAccount() {
    this.getBusinessAccountDetail().subscribe((res) => {
      this.$currentBusinessAccount.next(res);
      this.currentBusinessAccountId = res?.id;
      this.currentbusinessLines = res?.businessLines;
    },(err)=>{
      this.$currentBusinessAccount.next(null);
      console.log(err)
    });
  }

  saveBusinessAccount(businessAccount: any, userId): Observable<any> {
    return this.httpService.post<any>(
      `${apiModules.register_business_account}` + '/' + userId,
      businessAccount
    );
  }

  deleteRelationAccount(businessAccountId: any): Observable<any> {
    return this.httpService.delete<any>(
      `${apiModules.delete_relation}${businessAccountId}`
    );
  }

  updateBusinessAccount(businessAccount: any): Observable<any> {
    return this.httpService.post<any>(
      `${apiModules.update_business_account}`,
      businessAccount
    );
  }

  getBusinessAccountDetailFromInvite(userId): Observable<BusinessAccounts> {
    return this.httpService.get<BusinessAccounts>(
      `${apiModules.get_business_account_from_invite}` + '/' + userId
    );
  }

  getAllKeywords(searchString?: string): Observable<any> {
    return this.httpService.get<any>(`${apiModules.keywords}`, {
      searchString: searchString,
    });
  }
  getBusinessAccountDetail(baId?: any): Observable<any> {
    const businessAccountId =
      baId ?? this.tokenService.getBusinessAccountIdToken();
    if (!businessAccountId || businessAccountId === 'null') {
      return new Observable((observer) => {
        observer.error('Business Account ID is not available');
        observer.complete();
      });
    }
    return this.httpService.get<any>(
      `${apiModules.get_business_account}` + '/' + businessAccountId
    );
  }

  getBusinessTypes(): Observable<string[]> {
    return this.httpService.get<string[]>(`${apiModules.get_business_type}`);
  }

  getBusinessCategories(): Observable<string[]> {
    return this.httpService.get<string[]>(
      `${apiModules.get_business_categories}`
    );
  }

  getCountry(): Observable<Country[]> {
    return this.httpService.get<Country[]>(`${apiModules.get_countries}`);
  }

  getState(countryId): Observable<State[]> {
    return this.httpService.get<State[]>(
      `${apiModules.get_countries}` + '/' + countryId + '/' + `states`
    );
  }

  getCity(cityId): Observable<City[]> {
    return this.httpService.get<City[]>(
      `${apiModules.get_city}` + '/' + cityId + '/' + `cities`
    );
  }

  getCityByCountry(countryId): Observable<City[]> {
    return this.httpService.get<City[]>(
      `${apiModules.get_cityFrom_country}` + '/' + countryId + '/' + `cities`
    );
  }

  getBusinessAccountsListBySearchTerm(type: any, term: any): Observable<any[]> {
    let query: any = '';
    query = type + "~'" + term + "*'";
    query = encodeURI(query);
    return this.httpService.get<any[]>(
      `${apiModules.get_businessaccounts_byterm}?filter=${query}`
    );
  }

  getAllUsersForFilter(): Observable<User[]> {
    return this.httpService.get<User[]>(`${apiModules.getAllUsers}/forProduct`);
  }
  Get_All_CustomersList() {
    this.httpService
      .get(
        customer.getAllCustomerList + "all?filter=businessCategory:'CUSTOMER'"
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.customerList = [];
        this.customerList = res;
      });
  }

  Get_All_Lcp(): Observable<any[]> {
    let apiUrl =
      customer.getAllCustomerList +
      `all?filter=businessCategory in ('CUSTOMER','LEAD','PROSPECT')`;
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }

  Get_All_Customers_Non_Cache() {
    this.httpService
      .get(
        customer.getAllCustomerList +
          "all?filter=businessCategory:'CUSTOMER'&noncache=true"
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.customerList = [];
        this.customerList = res;
      });
  }

  Get_All_Vendors() {
    this.httpService
      .get(customer.getAllCustomerList + "all?filter=businessCategory:'VENDOR'")
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.vendorList = [];
        this.vendorList = res;
        this.vendorListLoaded.next(true);
      });
  }

  Get_All_Exporter_Vendors() {
    this.httpService
      .get(
        customer.getAllCustomerList +
          "?filter=businessCategory:'VENDOR'&filter=businessLine:'EXPORTER'"
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.exportersVendorList = [];
        this.exportersVendorList = res?.content;
      });
  }

  Get_All_Vendors_Non_Cache() {
    this.httpService
      .get(
        customer.getAllCustomerList +
          "?filter=businessCategory:'VENDOR'&noncache=true"
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.vendorList = [];
        this.vendorList = res?.content;
      });
  }

  Get_All_Exporter_Vendors_Non_Cache() {
    this.httpService
      .get(
        customer.getAllCustomerList +
          "?filter=businessCategory:'VENDOR'&filter=businessLine:'EXPORTER'&noncache=true"
      )
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.exportersVendorList = [];
        this.exportersVendorList = res?.content;
      });
  }

  updateRelationStatus(id: any, status: any): Observable<any> {
    const obj = {
      id: id,
      relationAcceptedStatus: status,
    };
    return this.httpService.post<any>(
      `${apiModules.updateRelationStatus}`,
      obj
    );
  }

  getAllNotifications() {
    return this.httpService.get(`${userApiModules.get_all_notifications}`).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }
  Get_All_Notes() {
    this.httpService
      .get(orderConfigModule.getAllNotes)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.notesList = [];
        this.notesList = res;
        this.notesList.unshift({ id: null, note_title: 'None' });
      });
  }
  changeNotificationSeenStatus(id: any) {
    return this.httpService
      .put(`${userApiModules.change_seen_status}?notification_id=${id}`)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      );
  }

  getOwner(audit: any) {
    const loggedInAccountId = this.currentBusinessAccountId;
    if (audit?.businessAccountId == 1) {
      return 'M';
    }
    if (audit?.businessAccountId == loggedInAccountId) {
      return 'S';
    } else {
      return 'T';
    }
  }

  getOwnerEnhanced(audit: any, productMetaBusinessId: any) {
    const loggedInAccountId = this.currentBusinessAccountId;
  
    if (audit?.businessAccountId == 1) {
      return 'M';
    }
    if (audit?.businessAccountId == loggedInAccountId && audit?.businessAccountId == productMetaBusinessId) {
      return 'S';
    } else {
      return 'T';
    }
  }

  getCustomerStats(noOfDays: any) {
    return this.httpService
      .get(`${userApiModules.getCustomerStats}?noOfDays=${noOfDays}`)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      );
  }

  getVendorStats(noOfDays: any) {
    return this.httpService
      .get(`${userApiModules.getVendorStats}?noOfDays=${noOfDays}`)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      );
  }

  getHomeStats() {
    return this.httpService.get(`${userApiModules.getHomePageStats}`).pipe(
      map((res: any) => {
        return res as any[];
      })
    );
  }
  Get_All_employees() {
    this.httpService
      .get(container.getAllEmployee + '/' + this.currentBusinessAccountId)
      .pipe(
        map((res: any) => {
          return res as any[];
        })
      )
      .subscribe((res: any) => {
        this.employeesList = [];
        this.employeesList = res;
      });
  }
}
