import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'users'
  },
  {
    path: 'users', loadChildren: () =>
    import('./users/users.module').then((m) => m.UsersModule)
  },
  {
    path: 'leads', loadChildren: () =>
    import('./leads/leads.module').then((m) => m.LeadsModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DadyinUsersRoutingModule {}
