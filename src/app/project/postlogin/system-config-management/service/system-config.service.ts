import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { orderConfigModule } from 'src/app/shared/constant';

@Injectable({
  providedIn: 'root',
})
export class SystemConfigService {
  constructor(
    private httpService: HttpService
) { }



saveProductAttributes(data: any) {
  return this.httpService.post(orderConfigModule.saveproductAttributes, data).pipe(
      map((res) => {
          return res as any;
      })
  );
}



}
