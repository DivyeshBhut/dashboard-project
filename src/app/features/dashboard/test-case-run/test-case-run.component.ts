import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DynamicFormModalComponent, FormField } from '../../../shared/components/dynamic-form-modal/dynamic-form-modal.component';
import { DataGridComponent, GridColumn } from '../../../shared/components/grid/data-grid/data-grid';

type TestRunOutcome = 'Passed' | 'Failed' | 'Skipped';

interface TestCaseRunLog {
  id: string;
  testName: string;
  className: string;
  outcome: TestRunOutcome;
  durationSeconds: number;
  durationLabel: string;
  executedAt: Date;
  errorDetails: string;
}

@Component({
  selector: 'app-test-case-run',
  standalone: true,
  imports: [CommonModule, FormsModule, DataGridComponent, DynamicFormModalComponent],
  templateUrl: './test-case-run.component.html',
  styleUrl: './test-case-run.component.css',
})
export class TestCaseRunComponent {
  readonly pageSize = 10;
  readonly outcomeOptions: Array<'All' | TestRunOutcome> = ['All', 'Passed', 'Failed', 'Skipped'];

  readonly gridColumns: GridColumn[] = [
    { field: 'actions', title: 'Actions', width: 140, type: 'actions' },
    { field: 'testName', title: 'Test Name', width: 250 },
    { field: 'className', title: 'Class Name', width: 260 },
    { field: 'outcome', title: 'Outcome', width: 160 },
    { field: 'durationLabel', title: 'Duration', width: 150 },
    { field: 'executedAt', title: 'Executed At', width: 220, type: 'date', format: '{0:MMM d, yyyy h:mm tt}' },
  ];

  readonly detailFields: FormField[] = [
    { key: 'testName', label: 'Test Name', type: 'text' },
    { key: 'className', label: 'Class Name', type: 'text' },
    { key: 'outcome', label: 'Outcome', type: 'text' },
    { key: 'duration', label: 'Duration', type: 'text' },
    { key: 'executedAt', label: 'Executed At', type: 'text' },
    { key: 'errorDetails', label: 'Execution Details', type: 'text' },
  ];

  readonly logs: TestCaseRunLog[] = [
    {
      id: 'run-1001',
      testName: 'Login with valid credentials',
      className: 'auth.LoginSpec',
      outcome: 'Passed',
      durationSeconds: 42,
      durationLabel: '42s',
      executedAt: new Date('2026-04-15T09:18:00'),
      errorDetails: 'Execution completed successfully with all assertions satisfied.',
    },
    {
      id: 'run-1002',
      testName: 'Checkout summary should match order total',
      className: 'checkout.OrderSummarySpec',
      outcome: 'Failed',
      durationSeconds: 88,
      durationLabel: '1m 28s',
      executedAt: new Date('2026-04-15T09:26:00'),
      errorDetails: 'Assertion failed: summary total differed from expected checkout amount.',
    },
    {
      id: 'run-1003',
      testName: 'User can update profile preferences',
      className: 'profile.PreferenceSpec',
      outcome: 'Passed',
      durationSeconds: 51,
      durationLabel: '51s',
      executedAt: new Date('2026-04-15T09:41:00'),
      errorDetails: 'Execution completed successfully with all assertions satisfied.',
    },
    {
      id: 'run-1004',
      testName: 'Pipeline retry should preserve queued jobs',
      className: 'pipeline.QueueRecoverySpec',
      outcome: 'Failed',
      durationSeconds: 124,
      durationLabel: '2m 4s',
      executedAt: new Date('2026-04-15T10:02:00'),
      errorDetails: 'Queue recovery did not restore the final job state after retry initialization.',
    },
    {
      id: 'run-1005',
      testName: 'Permission sync job should skip disabled tenants',
      className: 'security.PermissionSyncSpec',
      outcome: 'Skipped',
      durationSeconds: 19,
      durationLabel: '19s',
      executedAt: new Date('2026-04-15T10:15:00'),
      errorDetails: 'Run skipped because tenant sync was disabled in the current environment.',
    },
    {
      id: 'run-1006',
      testName: 'Audit trail should capture role assignment changes',
      className: 'audit.RoleChangeSpec',
      outcome: 'Passed',
      durationSeconds: 63,
      durationLabel: '1m 3s',
      executedAt: new Date('2026-04-15T10:28:00'),
      errorDetails: 'Execution completed successfully with all assertions satisfied.',
    },
    {
      id: 'run-1007',
      testName: 'Billing export should include amended invoices',
      className: 'billing.ExportSpec',
      outcome: 'Failed',
      durationSeconds: 97,
      durationLabel: '1m 37s',
      executedAt: new Date('2026-04-15T10:43:00'),
      errorDetails: 'Export payload missed amended invoice rows during final aggregation.',
    },
    {
      id: 'run-1008',
      testName: 'Dashboard widget cache should warm on first load',
      className: 'dashboard.WidgetCacheSpec',
      outcome: 'Passed',
      durationSeconds: 37,
      durationLabel: '37s',
      executedAt: new Date('2026-04-15T11:03:00'),
      errorDetails: 'Execution completed successfully with all assertions satisfied.',
    },
  ];

  selectedOutcome: 'All' | TestRunOutcome = 'All';
  testNameQuery = '';
  classNameQuery = '';

  isDetailsModalOpen = false;
  selectedLogDetails: Record<string, string> = {};

  get filteredLogs(): TestCaseRunLog[] {
    const testNameFilter = this.testNameQuery.trim().toLowerCase();
    const classNameFilter = this.classNameQuery.trim().toLowerCase();

    return this.logs.filter((log) => {
      const matchesOutcome = this.selectedOutcome === 'All' || log.outcome === this.selectedOutcome;
      const matchesTestName = !testNameFilter || log.testName.toLowerCase().includes(testNameFilter);
      const matchesClassName = !classNameFilter || log.className.toLowerCase().includes(classNameFilter);

      return matchesOutcome && matchesTestName && matchesClassName;
    });
  }

  get passedCount(): number {
    return this.filteredLogs.filter((log) => log.outcome === 'Passed').length;
  }

  get failedCount(): number {
    return this.filteredLogs.filter((log) => log.outcome === 'Failed').length;
  }

  get averageDuration(): string {
    if (this.filteredLogs.length === 0) {
      return '0s';
    }

    const totalDuration = this.filteredLogs.reduce((sum, log) => sum + log.durationSeconds, 0);
    const averageSeconds = Math.round(totalDuration / this.filteredLogs.length);
    return this.formatDuration(averageSeconds);
  }

  get passRate(): string {
    if (this.filteredLogs.length === 0) {
      return '0%';
    }

    return `${Math.round((this.passedCount / this.filteredLogs.length) * 100)}%`;
  }

  resetFilters(): void {
    this.selectedOutcome = 'All';
    this.testNameQuery = '';
    this.classNameQuery = '';
  }

  handleAction(event: { action: string; item: TestCaseRunLog }): void {
    this.openDetailsModal(event.item);
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedLogDetails = {};
  }

  private openDetailsModal(log: TestCaseRunLog): void {
    this.selectedLogDetails = {
      testName: log.testName,
      className: log.className,
      outcome: log.outcome,
      duration: log.durationLabel,
      executedAt: this.formatDateTime(log.executedAt),
      errorDetails: log.errorDetails,
    };

    this.isDetailsModalOpen = true;
  }

  private formatDuration(totalSeconds: number): string {
    if (totalSeconds < 60) {
      return `${totalSeconds}s`;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (seconds === 0) {
      return `${minutes}m`;
    }

    return `${minutes}m ${seconds}s`;
  }

  private formatDateTime(value: Date): string {
    return value.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}
