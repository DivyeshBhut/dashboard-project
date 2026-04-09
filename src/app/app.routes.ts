import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardLayoutComponent } from './dashboard/dashboard-layout.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home.component';
import { UsersComponent } from './dashboard/users/users.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: DashboardHomeComponent, pathMatch: 'full' },
      { path: 'users', component: UsersComponent },
      { path: 'groups', component: DashboardHomeComponent },
      { path: 'permissions', component: DashboardHomeComponent },
      { path: 'screenza-matrix', component: DashboardHomeComponent },
      { path: 'test-case-runs', component: DashboardHomeComponent },
      { path: 'audit-logs', component: DashboardHomeComponent },
      { path: 'settings', component: DashboardHomeComponent },
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
