import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  extractArray,
  extractObject,
  formatDurationFromSeconds,
  pickFirst,
  toDateValue,
  toNumberValue,
  toStringArray,
  toStringValue,
} from './api-normalizers';

export interface BuildOption {
  id: string;
  label: string;
  status: string;
  buildNumber: string;
  totalTests: number;
  passed: number;
  failed: number;
  durationSeconds: number;
}

export interface DashboardStats {
  successRate: string;
  successRateValue: number;
  totalRuns: number;
  passedRuns: number;
  failedRuns: number;
  skippedRuns: number;
  averageDuration: string;
  averageDurationSeconds: number;
}

export interface DashboardTrendPoint {
  label: string;
  totalRuns: number;
  successRate: number;
}

export interface RecentActivityItem {
  activityName: string;
  module: string;
  actor: string;
  loggedAt: Date;
}

export interface LatestFailureItem {
  id: string;
  failureName: string;
  pipelineName: string;
  severity: string;
  owner: string;
  detectedAt: Date;
  failureDetails: string;
}

export interface DashboardHomeData {
  builds: BuildOption[];
  stats: DashboardStats;
  selectedBuildId: string;
  trends: Record<'week' | 'month', DashboardTrendPoint[]>;
  recentActivities: RecentActivityItem[];
  latestFailures: LatestFailureItem[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Dashboard`;

  getDashboardHomeData(buildId?: string): Observable<DashboardHomeData> {
    return forkJoin({
      builds: this.getBuilds(),
      stats: this.http.get<unknown>(`${this.baseUrl}/stats`, { params: buildId ? { buildId } : {} }).pipe(catchError(() => of(null))),
      trends: this.http.get<unknown>(`${this.baseUrl}/trends`, { params: buildId ? { buildId } : {} }).pipe(catchError(() => of(null))),
      recentRuns: this.http.get<unknown>(`${this.baseUrl}/recent-runs`, { params: buildId ? { buildId } : {} }).pipe(catchError(() => of([]))),
      latestFailures: this.http.get<unknown>(`${this.baseUrl}/latest-failures`, { params: buildId ? { buildId } : {} }).pipe(catchError(() => of([]))),
    }).pipe(
      map(({ builds, stats, trends, recentRuns, latestFailures }) => ({
        builds,
        stats: this.normalizeStats(stats),
        selectedBuildId: toStringValue(
          pickFirst((extractObject<Record<string, unknown>>(stats, ['data', 'result']) ?? {}), ['buildId', 'id'], buildId ?? builds[0]?.id ?? '')
        ),
        trends: this.normalizeTrends(trends),
        recentActivities: this.normalizeRecentRuns(recentRuns),
        latestFailures: this.normalizeLatestFailures(latestFailures),
      }))
    );
  }

  getBuilds(): Observable<BuildOption[]> {
    return this.http.get<unknown>(`${this.baseUrl}/builds`).pipe(
      map((response) => {
        const builds = extractArray<Record<string, unknown>>(response, ['value', 'data', 'items', 'builds']);
        return builds.map((item, index) => ({
          id: toStringValue(pickFirst(item, ['id', 'buildId', 'value'], `build-${index + 1}`)),
          label: toStringValue(
            pickFirst(item, ['label', 'buildNumber', 'name', 'buildName', 'displayName'], `Build ${index + 1}`)
          ),
          status: toStringValue(pickFirst(item, ['status', 'outcome', 'result'], 'Unknown')),
          buildNumber: toStringValue(pickFirst(item, ['buildNumber', 'label', 'name'], `${index + 1}`)),
          totalTests: toNumberValue(pickFirst(item, ['totalTests', 'totalRuns', 'runs'], 0)),
          passed: toNumberValue(pickFirst(item, ['passed', 'successful', 'success'], 0)),
          failed: toNumberValue(pickFirst(item, ['failed', 'failures'], 0)),
          durationSeconds: toNumberValue(pickFirst(item, ['duration', 'averageDurationSeconds'], 0)),
        }));
      }),
      catchError(() => of([]))
    );
  }

  private normalizeStats(response: unknown): DashboardStats {
    const payload = extractObject<Record<string, unknown>>(response, ['data', 'result']) ?? {};
    const averageSeconds = toNumberValue(
      pickFirst(payload, ['averageDurationSeconds', 'avgDurationSeconds', 'averageDuration', 'duration'], 0)
    );
    const successRateValue = toNumberValue(pickFirst(payload, ['successRate', 'passRate'], 0));

    return {
      successRate: `${successRateValue}%`,
      successRateValue,
      totalRuns: toNumberValue(pickFirst(payload, ['totalRuns', 'totalExecutions', 'runs', 'totalTests'], 0)),
      passedRuns: toNumberValue(pickFirst(payload, ['passedRuns', 'passed', 'successfulRuns'], 0)),
      failedRuns: toNumberValue(pickFirst(payload, ['failedRuns', 'failures', 'failedExecutions', 'failed'], 0)),
      skippedRuns: toNumberValue(pickFirst(payload, ['skippedRuns', 'skipped'], 0)),
      averageDuration:
        averageSeconds > 0
          ? formatDurationFromSeconds(averageSeconds)
          : toStringValue(pickFirst(payload, ['averageDurationLabel'], '0s')),
      averageDurationSeconds: averageSeconds,
    };
  }

  private normalizeTrends(response: unknown): Record<'week' | 'month', DashboardTrendPoint[]> {
    const payload = extractObject<Record<string, unknown>>(response, ['data', 'result']) ?? {};
    const weekSource = extractArray<Record<string, unknown>>(
      payload['week'] ?? payload['weekly'] ?? payload['trend'] ?? payload,
      ['week', 'weekly', 'trend', 'data', 'items']
    );
    const monthSource = extractArray<Record<string, unknown>>(
      payload['month'] ?? payload['monthly'] ?? payload['trend'] ?? payload,
      ['month', 'monthly', 'trend', 'data', 'items']
    );
    const fallbackSource = extractArray<Record<string, unknown>>(response, ['trend', 'value', 'data', 'items', 'trends']);

    return {
      week: this.mapTrendSeries(weekSource.length ? weekSource : fallbackSource),
      month: this.mapTrendSeries(monthSource.length ? monthSource : fallbackSource),
    };
  }

  private mapTrendSeries(items: Record<string, unknown>[]): DashboardTrendPoint[] {
    return items.map((item, index) => ({
      label: toStringValue(pickFirst(item, ['label', 'buildNumber', 'name', 'period', 'day', 'week'], `P${index + 1}`)),
      totalRuns: toNumberValue(pickFirst(item, ['totalRuns', 'runs', 'executionCount', 'total'], 0)),
      successRate: toNumberValue(pickFirst(item, ['successRate', 'passRate'], 0)),
    }));
  }

  private normalizeRecentRuns(response: unknown): RecentActivityItem[] {
    const items = extractArray<Record<string, unknown>>(response, ['value', 'data', 'items', 'recentRuns', 'runs']);
    return items.map((item, index) => ({
      activityName: toStringValue(
        pickFirst(item, ['activityName', 'name', 'runName', 'title', 'commitMessage'], `Recent Activity ${index + 1}`)
      ),
      module: toStringValue(pickFirst(item, ['module', 'area', 'pipelineName', 'branch'], 'Dashboard')),
      actor: toStringValue(pickFirst(item, ['actor', 'triggeredBy', 'createdBy', 'owner'], 'system')),
      loggedAt: toDateValue(pickFirst(item, ['loggedAt', 'startedAt', 'createdAt', 'executedAt'], new Date())),
    }));
  }

  private normalizeLatestFailures(response: unknown): LatestFailureItem[] {
    const items = extractArray<Record<string, unknown>>(response, ['value', 'data', 'items', 'failures']);
    return items.map((item, index) => ({
      id: toStringValue(pickFirst(item, ['id', 'failureId', 'runId'], `failure-${index + 1}`)),
      failureName: toStringValue(pickFirst(item, ['failureName', 'testName', 'name', 'title'], 'Unknown failure')),
      pipelineName: toStringValue(pickFirst(item, ['pipelineName', 'buildName', 'suiteName', 'className'], 'Pipeline')),
      severity: toStringValue(pickFirst(item, ['severity', 'priority', 'status', 'outcome'], 'High')),
      owner: toStringValue(pickFirst(item, ['owner', 'responsible', 'assignedTo', 'triggeredBy', 'buildId'], 'Unassigned')),
      detectedAt: toDateValue(pickFirst(item, ['detectedAt', 'createdAt', 'startedAt', 'timestamp', 'runAt'], new Date())),
      failureDetails: toStringValue(
        pickFirst(item, ['failureDetails', 'errorMessage', 'stackTrace', 'details', 'description'], 'No additional details available.')
      ),
    }));
  }
}
