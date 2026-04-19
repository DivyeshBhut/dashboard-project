import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { AppLayoutComponent } from './core/layout/app-layout/app-layout.component';
import { DashboardHomeComponent } from './features/dashboard/dashboard-home/dashboard-home.component';
import { UsersComponent } from './features/uam/users/users.component';
import { GroupsComponent } from './features/uam/groups/groups';
import { PermissionsComponent } from './features/uam/permissions/permissions';
import { TestCaseRunComponent } from './features/dashboard/test-case-run/test-case-run.component';
import { PipelineExecutionsComponent } from './features/dashboard/pipeline-executions/pipeline-executions.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: AppLayoutComponent,
    children: [
      { path: '', component: DashboardHomeComponent, pathMatch: 'full' },
      { path: 'users', component: UsersComponent },
      { path: 'groups', component: GroupsComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'screenza-matrix', component: DashboardHomeComponent },
      { path: 'test-case-runs', component: TestCaseRunComponent },
      { path: 'audit-logs', component: DashboardHomeComponent },
      { path: 'settings', component: DashboardHomeComponent },
      { path: 'pipeline-executions', component: PipelineExecutionsComponent },
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
