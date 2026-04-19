import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { AppLayoutComponent } from './core/layout/app-layout/app-layout.component';
import { DashboardHomeComponent } from './features/dashboard/dashboard-home/dashboard-home.component';
import { UsersComponent } from './features/uam/users/users.component';
import { GroupsComponent } from './features/uam/groups/groups';
import { PermissionsComponent } from './features/uam/permissions/permissions';
import { TestCaseRunComponent } from './features/dashboard/test-case-run/test-case-run.component';
import { PipelineExecutionsComponent } from './features/dashboard/pipeline-executions/pipeline-executions.component';
import { ScreenzaMatrixComponent } from './features/dashboard/screenza-matrix/screenza-matrix.component';
import { authGuard } from './core/services/auth.guard';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardHomeComponent, pathMatch: 'full' },
      { path: 'users', component: UsersComponent },
      { path: 'groups', component: GroupsComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'screenza-matrix', component: ScreenzaMatrixComponent },
      { path: 'test-case-runs', component: TestCaseRunComponent },
      { path: 'audit-logs', component: DashboardHomeComponent },
      { path: 'settings', component: DashboardHomeComponent },
      { path: 'pipeline-executions', component: PipelineExecutionsComponent },
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
