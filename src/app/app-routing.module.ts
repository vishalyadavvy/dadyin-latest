import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './project/prelogin/landing/landing.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    pathMatch: 'full',
  },
  {
    path: '',
    loadChildren: () =>
      import('./project/prelogin/prelogin.module').then(
        (m) => m.PreloginModule
      ),
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./project/postlogin/postlogin.module').then(
        (m) => m.PostloginModule
      ),
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'subscription',
    loadChildren: () =>
      import('../app/project/prelogin/subscription/subscription.module').then(
        (m) => m.SubscriptionModule
      ),
    // canActivate: [RoleGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
