import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { DadyInUsersModule } from 'src/app/shared/constant';

@Injectable({
  providedIn: 'root'
})
export class DadyinUsersService {

  constructor(private httpService: HttpService) { }

  getAllBusinessAccount(
    pageNumber: any,
    pageS: any,
    sort: any,
    filter?: any
  ): Observable<any> {
    return this.httpService
      .get(
        DadyInUsersModule.getAllbusinessAccount +
        `?page=${pageNumber}&size=${pageS}`
      )
      .pipe(
        map((res: any) => {
          return res as any;
        })
      );
  }
}
