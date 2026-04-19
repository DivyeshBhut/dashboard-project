import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { extractArray, pickFirst, toStringValue } from './api-normalizers';

export interface ScreenzaFeature {
  id: number;
  featureName: string;
  team: string;
  status: 'DONE / LIVE' | 'CODE REVIEW' | 'IN PROGRESS' | 'BLOCKED' | 'NA';
  responsible: string;
  month: string;
  links: string;
}

@Injectable({
  providedIn: 'root',
})
export class ScreenzaaApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Screenzaa`;

  getFeatures(): Observable<ScreenzaFeature[]> {
    return this.http.get<unknown>(this.baseUrl).pipe(
      map((response) => {
        const items = extractArray<Record<string, unknown>>(response, ['data', 'items', 'records']);
        return items.map((item, index) => ({
          id: Number(pickFirst(item, ['id', 'featureId'], index + 1)),
          featureName: toStringValue(pickFirst(item, ['featureName', 'name', 'title'], `Feature ${index + 1}`)),
          team: toStringValue(pickFirst(item, ['team', 'squad', 'module'], 'Platform')),
          status: this.normalizeStatus(toStringValue(pickFirst(item, ['status', 'state'], 'NA'))),
          responsible: toStringValue(pickFirst(item, ['responsible', 'owner', 'assignedTo'], 'Unassigned')),
          month: toStringValue(pickFirst(item, ['month', 'plannedMonth', 'releaseMonth'], 'TBD')),
          links: toStringValue(pickFirst(item, ['links', 'link', 'url'], '#')),
        }));
      }),
      catchError(() => of([]))
    );
  }

  private normalizeStatus(value: string): ScreenzaFeature['status'] {
    const normalized = value.trim().toUpperCase();

    if (normalized.includes('DONE') || normalized.includes('LIVE')) {
      return 'DONE / LIVE';
    }

    if (normalized.includes('REVIEW')) {
      return 'CODE REVIEW';
    }

    if (normalized.includes('PROGRESS')) {
      return 'IN PROGRESS';
    }

    if (normalized.includes('BLOCK')) {
      return 'BLOCKED';
    }

    return 'NA';
  }
}
