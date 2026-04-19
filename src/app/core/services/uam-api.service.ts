import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  extractArray,
  extractObject,
  pickFirst,
  toBooleanValue,
  toDateValue,
  toStringArray,
  toStringValue,
} from './api-normalizers';

export interface UamUser {
  id: string;
  username: string;
  email: string;
  accessGroup: string[];
  status: 'Active' | 'Inactive' | 'Locked';
  createdDate: Date;
}

export interface UamGroup {
  id: string;
  groupName: string;
  description: string;
  permissions: string[];
  status: 'Active' | 'Inactive' | 'Locked';
}

export interface UamPermission {
  id: string;
  permissionName: string;
  addedBy: string;
  addedOn: Date;
  updatedBy: string;
  updatedOn: Date;
}

@Injectable({
  providedIn: 'root',
})
export class UamApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getUsers(): Observable<UamUser[]> {
    return this.http.get<unknown>(`${this.baseUrl}/Users`, { params: { page: 1, limit: 100 } }).pipe(
      map((response) => {
        const payload = extractObject<Record<string, unknown>>(response, ['data', 'result']);
        const items = extractArray<Record<string, unknown>>(payload ?? response, ['items', 'users', 'data']);
        return items.map((item, index) => ({
          id: toStringValue(pickFirst(item, ['id', 'userId'], `${index + 1}`)),
          username: toStringValue(pickFirst(item, ['username', 'userName', 'name'], `user-${index + 1}`)),
          email: toStringValue(pickFirst(item, ['email', 'mail'], '')),
          accessGroup: toStringArray(pickFirst(item, ['accessGroup', 'groups', 'roles'], [])),
          status: this.normalizeUserStatus(item),
          createdDate: toDateValue(pickFirst(item, ['createdDate', 'createdAt', 'createdOn'], new Date())),
        }));
      }),
      catchError(() => of([]))
    );
  }

  getGroups(): Observable<UamGroup[]> {
    return this.http.get<unknown>(`${this.baseUrl}/Groups`).pipe(
      map((response) => {
        const items = extractArray<Record<string, unknown>>(response, ['data', 'items', 'groups']);
        return items.map((item, index) => ({
          id: toStringValue(pickFirst(item, ['id', 'groupId'], `${index + 1}`)),
          groupName: toStringValue(pickFirst(item, ['groupName', 'name', 'title'], `Group ${index + 1}`)),
          description: toStringValue(pickFirst(item, ['description', 'details'], '')),
          permissions: toStringArray(pickFirst(item, ['permissions', 'permissionNames'], [])),
          status: this.normalizeStatus(toStringValue(pickFirst(item, ['status', 'state'], 'Active'))),
        }));
      }),
      catchError(() => of([]))
    );
  }

  getPermissions(): Observable<UamPermission[]> {
    return this.http.get<unknown>(`${this.baseUrl}/Permissions`).pipe(
      map((response) => {
        const items = extractArray<Record<string, unknown>>(response, ['data', 'items', 'permissions']);
        return items.map((item, index) => ({
          id: toStringValue(pickFirst(item, ['id', 'permissionId'], `${index + 1}`)),
          permissionName: toStringValue(pickFirst(item, ['permissionName', 'name', 'title'], `Permission ${index + 1}`)),
          addedBy: toStringValue(pickFirst(item, ['addedBy', 'createdBy'], 'System')),
          addedOn: toDateValue(pickFirst(item, ['addedOn', 'createdAt', 'createdOn'], new Date())),
          updatedBy: toStringValue(pickFirst(item, ['updatedBy', 'modifiedBy', 'createdBy'], 'System')),
          updatedOn: toDateValue(pickFirst(item, ['updatedOn', 'updatedAt', 'modifiedOn'], new Date())),
        }));
      }),
      catchError(() => of([]))
    );
  }

  private normalizeUserStatus(item: Record<string, unknown>): UamUser['status'] {
    const explicit = toStringValue(pickFirst(item, ['status', 'state'], ''));
    if (explicit) {
      return this.normalizeStatus(explicit);
    }

    const isActive = toBooleanValue(pickFirst(item, ['isActive', 'active'], true), true);
    return isActive ? 'Active' : 'Inactive';
  }

  private normalizeStatus(value: string): 'Active' | 'Inactive' | 'Locked' {
    const normalized = value.trim().toUpperCase();
    if (normalized.includes('LOCK')) {
      return 'Locked';
    }
    if (normalized.includes('INACTIVE')) {
      return 'Inactive';
    }
    return 'Active';
  }
}
