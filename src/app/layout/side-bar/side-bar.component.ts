import {
  Component,
  Input,
  OnInit,
  ViewChild,
  EventEmitter,
  Output
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { sidebarMenu } from 'src/app/shared/menuconstant';
import { SelectMenuService } from '../select-menu.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { TokenService } from 'src/app/service/token.service';

@Component({
  selector: 'sidebar-layout',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit {
  @Input() isExpanded = true;
  @Input() flyerMode = false;
  @Input() label = true;
  sidebarMenus = sidebarMenu;
  @ViewChild('sidenav') sidenav: MatSidenav;
  @Output() toggleSidebar = new EventEmitter();
  public currentUrl: string = '';
  public sidebarShow: boolean = true;
  onClickwindow: boolean = false;
  isSelected = false;
  isShowing = false;
  reason = '';

  constructor(
    private router: Router,
    private selectMenuService: SelectMenuService,
    private businessAccountService: BusinessAccountService,
    public tokenService: TokenService
  ) {
    this.businessAccountService.$currentBusinessAccount.subscribe(
      (res: any) => {
        if (res?.businessLines?.includes('RETAILER')) {
          this.sidebarMenus = this.sidebarMenus.filter(
            (it) => it.label != 'System Config'
          );
          this.sidebarMenus = this.sidebarMenus.filter(
            (it) => it.label != 'Container management'
          );
          const productIndex = this.sidebarMenus.findIndex(
            (menu) => menu.label == 'Products management'
          );
          this.sidebarMenus[productIndex].childs = this.sidebarMenus[
            productIndex
          ].childs.filter((it) => it.label != 'Products Type');
          this.sidebarMenus[productIndex].childs = this.sidebarMenus[
            productIndex
          ].childs.filter((it) => it.label != 'Products Templates');
        }
        if (res?.id == 1) {
          if (this.sidebarMenus.findIndex((menu) => menu.label == 'Dadyin Users') === -1) {
            this.sidebarMenus.push({
              id: 50,
              label: 'Dadyin Users',
              icon: 'Order management',
              path: '/home/dadyin-users',
              childs: [
                {
                  id: 1,
                  label: 'Users',
                  icon: 'Order management',
                  path: '/home/dadyin-users/users',
                  role: ['ADMIN', 'STAFF', 'MANAGER', 'CRM'],
                },
                {
                  id: 2,
                  label: 'Leads',
                  icon: 'Order management',
                  path: '/home/dadyin-users/leads',
                  role: ['ADMIN', 'STAFF', 'MANAGER'],
                },
              ],
              role: ['ADMIN', 'STAFF', 'MANAGER', 'CRM'],
            })
          }
        }
      }
    );
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.sidebarMenus.forEach((element) => {
      if (element.path == this.currentUrl) {
        this.navigate(element);
      }
      if (element.childs) {
        element.childs.forEach((childs) => {
          if (childs.path == this.currentUrl) {
            this.navigateChild(childs, element);
          }
        });
      }
    });
  }

  navigate(data: any): void {
    console.log("===> Parent Navigation: ", data);
    this.selectMenuService.changeSelectedMenu(data);
    this.router.navigateByUrl(data.path);
    this.toggleSidebar.emit(false);
  }

  navigateChild(data: any, parent: any): void {
    console.log("===> Child Navigation: ", data, parent);
    this.selectMenuService.changeSelectedMenu(parent);
    this.router.navigateByUrl(data.path);
    this.toggleSidebar.emit(false);
  }

  getActiveStatus(link: string) {
    if (link == '/home') {
      return this.router.url == '/home' ? true : false;
    } else {
      return this.router.url.includes(link);
    }
  }
}
