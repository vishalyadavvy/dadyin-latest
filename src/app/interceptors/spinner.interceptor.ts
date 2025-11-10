import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { finalize, Observable, Subscription } from 'rxjs';
import { SpinnerOverlayService } from '../service/spinner-overlay.service';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
  
  constructor(private readonly spinnerOverlayService: SpinnerOverlayService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Exclude specific API calls that should not show global loading spinner
    if(req.url.includes('/last-sales-invoices') || req.url.includes('/last-purchase-bills')){ 
     return next.handle(req)
    }
    const spinnerSubscription: Subscription = this.spinnerOverlayService.spinner$.subscribe();
  
    return next
      .handle(req)
      .pipe(finalize(() => spinnerSubscription.unsubscribe()));
  }
}