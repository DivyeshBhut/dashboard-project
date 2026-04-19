import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { extractObject, pickFirst, toStringArray, toStringValue } from './api-normalizers';

export interface AuthUser {
  username: string;
  token: string;
  permissions: string[];
  email?: string;
  role?: string;
  isTemporaryMockSession?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storageKey = 'currentUser';
  private readonly currentUserSignal = signal<AuthUser | null>(this.readStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSignal()?.token);
  readonly apiUrl = `${environment.apiUrl}/Auth`;

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<unknown>(`${this.apiUrl}/login`, { username, password }).pipe(
      map((response) => this.normalizeAuthUser(response)),
      tap((user) => {
        if (user) {
          localStorage.setItem(this.storageKey, JSON.stringify(user));
          this.currentUserSignal.set(user);
        }
      }),
      map((user) => !!user),
      catchError(() => of(false))
    );
  }

  validateSession(): Observable<boolean> {
    const user = this.currentUserSignal();
    if (!user?.token) {
      this.currentUserSignal.set(null);
      return of(false);
    }

    if (user.isTemporaryMockSession) {
      return of(true);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${user.token}`);
    return this.http.get(`${this.apiUrl}/validate`, { headers }).pipe(
      map(() => true),
      catchError(() => {
        this.clearSession(false);
        return of(false);
      })
    );
  }

  logout(): void {
    const user = this.currentUserSignal();
    if (user?.isTemporaryMockSession) {
      this.clearSession(true);
      return;
    }

    const headers = user?.token
      ? new HttpHeaders().set('Authorization', `Bearer ${user.token}`)
      : undefined;

    this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(catchError(() => of(null))).subscribe({
      complete: () => this.clearSession(true),
    });
  }

  hasPermission(permissionCode: string): boolean {
    return this.currentUserSignal()?.permissions.includes(permissionCode) ?? false;
  }

  isLoggedInSync(): boolean {
    return !!this.currentUserSignal()?.token;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.currentUserSignal()?.token;
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  private clearSession(redirectToLogin: boolean): void {
    localStorage.removeItem(this.storageKey);
    this.currentUserSignal.set(null);

    if (redirectToLogin) {
      void this.router.navigate(['/login']);
    }
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as AuthUser;
      return parsed?.token ? parsed : null;
    } catch {
      return null;
    }
  }

  private normalizeAuthUser(response: unknown): AuthUser | null {
    const payload =
      extractObject<Record<string, unknown>>(response, ['data', 'result']) ??
      extractObject<Record<string, unknown>>(response);
    if (!payload) {
      return null;
    }

    const temporaryMockUser = this.createTemporaryMockLoginUser(payload);
    if (temporaryMockUser) {
      return temporaryMockUser;
    }

    const nestedUser = extractObject<Record<string, unknown>>(payload['user'], ['user']);
    const source = nestedUser ?? payload;
    const token = toStringValue(pickFirst(source, ['token', 'accessToken', 'jwtToken'], ''));

    if (!token) {
      return null;
    }

    const username = toStringValue(
      pickFirst(source, ['username', 'userName', 'name', 'email'], pickFirst(payload, ['username', 'userName'], ''))
    );

    return {
      username: username || 'User',
      token,
      permissions: toStringArray(pickFirst(source, ['permissions', 'claims', 'roles'], [])),
      email: toStringValue(pickFirst(source, ['email', 'mail'], ''), ''),
      role: toStringValue(pickFirst(source, ['role', 'designation', 'title'], ''), ''),
    };
  }

  // TEMPORARY MOCK LOGIN BYPASS:
  // Remove this method once the API starts returning a real auth token.
  // The login flow will then fall back to the original strict token-based parsing above.
  private createTemporaryMockLoginUser(payload: Record<string, unknown>): AuthUser | null {
    const message = toStringValue(pickFirst(payload, ['message', 'status', 'result'], ''));
    const nestedUser = extractObject<Record<string, unknown>>(payload['user'], ['user']);

    if (message.toUpperCase() !== 'OK' || !nestedUser) {
      return null;
    }

    const username = toStringValue(
      pickFirst(nestedUser, ['username', 'userName', 'displayName', 'name', 'email'], '')
    );

    if (!username) {
      return null;
    }

    return {
      username,
      token: `temporary-mock-token-${username}`,
      permissions: toStringArray(pickFirst(nestedUser, ['permissions', 'claims', 'roles'], [])),
      email: toStringValue(pickFirst(nestedUser, ['email', 'mail'], ''), ''),
      role: toStringValue(pickFirst(nestedUser, ['role', 'designation', 'title'], ''), ''),
      isTemporaryMockSession: true,
    };
  }
}
