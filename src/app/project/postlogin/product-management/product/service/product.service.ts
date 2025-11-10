import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { productTemplate } from 'src/app/shared/constant';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  additionalCostValues: any = [];
  productSubTypes: any = [];
  clonePayload: any = null;

  constructor(private httpClient: HttpClient) {}

  getRawMaterialPricing(productId: string | number, prompt: string) {
    const url = `${environment.apiUrl}${
      productTemplate.rawMaterialPrice
    }?productId=${encodeURIComponent(productId)}&prompt=${prompt ?? ''}`;
    return this.httpClient.get(url, { responseType: 'text' }).toPromise();
  }




  
}
