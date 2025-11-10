import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from './service/auth.service';
import { TokenService } from './service/token.service';
import { HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// register Swiper custom elements

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  currentRoute: string;
  @HostListener('window:beforeunload', ['$event'])
  onWindowClose(event: any): void {
    if (
      window.location.href.includes('edit') ||
      window.location.href.includes('add')
    ) {
      event.preventDefault();
      event.returnValue = false;
    }
  }

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    public http: HttpClient
  ) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        if (
          !this.currentRoute.match('/') &&
          !this.currentRoute.includes('resetpassword') &&
          !this.currentRoute.includes('signin') &&
          !this.currentRoute.includes('signup') &&
          !this.currentRoute.includes('select-business-account') &&
          !this.currentRoute.includes('business-details') &&
          !this.currentRoute.includes('forbidden') &&
          !this.currentRoute.includes('landing')
        ) {
          if (this.tokenService.getAccessToken()) {
            this.authService.getCurrentUser().subscribe(
              (response) => {
                if (!response) {
                  this.router.navigateByUrl('/signin');
                }
              },
              (err) => {
                this.authService.logout();
              }
            );
          } else {
            this.router.navigateByUrl('/signin');
          }
        }
      }
    });

    if (this.tokenService.getAccessToken()) {
      this.authService.getCurrentUser().subscribe(
        (response) => {
          if (!response) {
            this.router.navigateByUrl('/signin');
          }
        },
        (err) => {
          this.authService.logout();
        }
      );
    }
  }

  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
      });
    } else {
   
    }
  }

  getIpAddress() {
    this.http
      .get('https://api.ipify.org?format=jsonp&callback=getIP')
      .subscribe((response: any) => {
      });
  }
}
