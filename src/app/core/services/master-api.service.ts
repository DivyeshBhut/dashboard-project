import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  extractArray,
  extractObject,
  formatDurationFromSeconds,
  pickFirst,
  toDateValue,
  toNumberValue,
  toStringValue,
} from './api-normalizers';

export interface TestResultItem {
  id: string;
  testName: string;
  className: string;
  outcome: 'Passed' | 'Failed' | 'Skipped';
  durationSeconds: number;
  durationLabel: string;
  executedAt: Date;
  errorDetails: string;
  releaseNumber: string;
  buildNumber: string;
  featureName: string;
  trxFileName: string;
  pipelineExecutionNumber: number;
}

export interface PipelineExecutionItem {
  id: string;
  pipelineName: string;
  triggeredBy: string;
  outcome: 'Successful' | 'Failed' | 'Cancelled';
  durationSeconds: number;
  durationLabel: string;
  startedAt: Date;
  executionDetails: string;
}

@Injectable({
  providedIn: 'root',
})
export class MasterApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Master`;

  getTestResults(buildId?: string, outcome?: string): Observable<TestResultItem[]> {
    const params: Record<string, string> = {};
    if (buildId) {
      params['buildId'] = buildId;
    }
    if (outcome && outcome !== 'All') {
      params['outcome'] = outcome;
    }

    return this.http.get<unknown>(`${this.baseUrl}/test-results`, { params }).pipe(
      map((response) => this.normalizeTestResults(response)),
      catchError(() => of([]))
    );
  }

  getPipelineDetails(status?: string): Observable<PipelineExecutionItem[]> {
    const params: Record<string, string> = {};
    if (status) {
      params['status'] = status;
    }
    return this.http.get<unknown>(`${this.baseUrl}/pipeline-details`, { params }).pipe(
      map((response) => this.normalizePipelineExecutions(response)),
      catchError(() => of([]))
    );
  }

  private normalizeTestResults(response: unknown): TestResultItem[] {
    const items = extractArray<Record<string, unknown>>(response, ['data', 'items', 'results', 'testResults']);
    return items.map((item, index) => {
      const durationSeconds = toNumberValue(pickFirst(item, ['durationSeconds', 'duration', 'elapsedSeconds'], 0));
      const outcome = toStringValue(pickFirst(item, ['outcome', 'status', 'result'], 'Passed')).toLowerCase();
      return {
        id: toStringValue(pickFirst(item, ['id', 'testId', 'resultId'], `test-${index + 1}`)),
        testName: toStringValue(pickFirst(item, ['testName', 'name', 'title'], 'Unnamed Test')),
        className: toStringValue(pickFirst(item, ['className', 'suiteName', 'class', 'module'], 'Unknown Class')),
        outcome: outcome.startsWith('fail') ? 'Failed' : outcome.startsWith('skip') ? 'Skipped' : 'Passed',
        durationSeconds,
        durationLabel: formatDurationFromSeconds(durationSeconds),
        executedAt: toDateValue(pickFirst(item, ['executedAt', 'runAt', 'startedAt', 'createdAt'], new Date())),
        errorDetails: toStringValue(
          pickFirst(item, ['errorDetails', 'errorMessage', 'details', 'message'], 'Execution completed successfully.')
        ),
        releaseNumber: toStringValue(pickFirst(item, ['releaseNumber', 'release'], 'Rel-1.0')),
        buildNumber: toStringValue(pickFirst(item, ['buildNumber', 'buildName', 'build'], `Build-${100 + index}`)),
        featureName: toStringValue(pickFirst(item, ['featureName', 'feature'], 'Core Feature')),
        trxFileName: toStringValue(pickFirst(item, ['trxFileName', 'trxFile'], 'results.trx')),
        pipelineExecutionNumber: toNumberValue(pickFirst(item, ['pipelineExecutionNumber', 'pipelineId'], Math.floor(Math.random() * 1000) + 1000))
      };
    });
  }

  private normalizePipelineExecutions(response: unknown): PipelineExecutionItem[] {
    const items = extractArray<Record<string, unknown>>(response, ['data', 'items', 'results', 'pipelines']);
    return items.map((item, index) => {
      const durationSeconds = toNumberValue(pickFirst(item, ['durationSeconds', 'duration', 'elapsedSeconds'], 0));
      const rawOutcome = toStringValue(pickFirst(item, ['outcome', 'status', 'result'], 'Successful')).toLowerCase();
      const outcome = rawOutcome.startsWith('fail')
        ? 'Failed'
        : rawOutcome.startsWith('cancel')
          ? 'Cancelled'
          : 'Successful';

      return {
        id: toStringValue(pickFirst(item, ['id', 'pipelineId', 'executionId'], `pipeline-${index + 1}`)),
        pipelineName: toStringValue(pickFirst(item, ['pipelineName', 'name', 'title'], 'Unnamed Pipeline')),
        triggeredBy: toStringValue(pickFirst(item, ['triggeredBy', 'createdBy', 'owner', 'actor'], 'system')),
        outcome,
        durationSeconds,
        durationLabel: formatDurationFromSeconds(durationSeconds),
        startedAt: toDateValue(pickFirst(item, ['startedAt', 'executedAt', 'createdAt', 'runAt'], new Date())),
        executionDetails: toStringValue(
          pickFirst(item, ['executionDetails', 'details', 'message', 'description'], 'No execution details available.')
        ),
      };
    });
  }
}
