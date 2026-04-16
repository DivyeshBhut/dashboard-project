import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardLayoutComponent } from './dashboard/dashboard-layout.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home.component';
import { UsersComponent } from './dashboard/uam/users/users.component';
import { GroupsComponent } from './dashboard/uam/groups/groups';
import { PermissionsComponent } from './dashboard/uam/permissions/permissions';
import { TestCaseRunComponent } from './dashboard/test-case-run/test-case-run.component';
import { PipelineExecutionsComponent } from './dashboard/pipeline-executions/pipeline-executions.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardLayoutComponent,
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
