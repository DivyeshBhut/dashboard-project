import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DynamicFormModalComponent, FormField } from '../../common/dynamic-form-modal/dynamic-form-modal.component';
import { DataGridComponent, GridColumn } from '../../common/grid/data-grid/data-grid';

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
  template: `
    <div class="page-header">
      <div class="breadcrumb">
        <span class="breadcrumb-item">Dashboard</span>
        <svg
          class="breadcrumb-separator"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span class="breadcrumb-item active">Test Case Run</span>
      </div>

      <div class="header-card">
        <div class="header-info">
          <h2 class="page-title">Test Case Run</h2>
          <p class="text-muted">
            Monitor execution outcomes, inspect failures, and keep test reliability visible across recent runs.
          </p>
        </div>
      </div>
    </div>

    <section class="stats-grid" aria-label="Execution results summary">
      <article class="stat-card">
        <div class="stat-header">
          <div class="stat-icon info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <h3 class="stat-title">Total Runs</h3>
        </div>
        <div class="stat-value">{{ filteredLogs.length }}</div>
        <div class="stat-footer">
          <span class="footer-text">Visible after current filters</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-header">
          <div class="stat-icon success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="stat-title">Passed</h3>
        </div>
        <div class="stat-value">{{ passedCount }}</div>
        <div class="stat-footer">
          <span class="trend up">{{ passRate }} success rate</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-header">
          <div class="stat-icon danger-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2.25m0 3.75h.008v.008H12v-.008zm9-3.758c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
            </svg>
          </div>
          <h3 class="stat-title">Failed</h3>
        </div>
        <div class="stat-value">{{ failedCount }}</div>
        <div class="stat-footer">
          <span class="trend down">{{ failedCount }} execution issues flagged</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-header">
          <div class="stat-icon timer-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="stat-title">Avg Duration</h3>
        </div>
        <div class="stat-value">{{ averageDuration }}</div>
        <div class="stat-footer">
          <span class="footer-text">Per execution in current view</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-header">
          <div class="stat-icon accent-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.5 4.5L21.75 7.5" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 12V7.5h-4.5" />
            </svg>
          </div>
          <h3 class="stat-title">Pass Rate</h3>
        </div>
        <div class="stat-value">{{ passRate }}</div>
        <div class="stat-footer">
          <span class="footer-text">Based on passed vs total runs</span>
        </div>
      </article>
    </section>

    <section class="filter-card">
      <div class="filter-header">
        <div>
          <h3 class="section-title">Search and Filter</h3>
          <p class="section-description">Refine execution logs by outcome, test name, and class ownership.</p>
        </div>
        <button class="btn btn-outline btn-sm" type="button" (click)="resetFilters()">Clear Filters</button>
      </div>

      <div class="filter-grid">
        <div class="form-group">
          <label for="outcomeFilter">Outcome</label>
          <select id="outcomeFilter" class="form-select" [(ngModel)]="selectedOutcome">
            <option *ngFor="let outcome of outcomeOptions" [ngValue]="outcome">{{ outcome }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="testNameFilter">Test Name</label>
          <input
            id="testNameFilter"
            type="text"
            class="form-input"
            placeholder="Search by test name"
            [(ngModel)]="testNameQuery"
          />
        </div>

        <div class="form-group">
          <label for="classNameFilter">Class Name</label>
          <input
            id="classNameFilter"
            type="text"
            class="form-input"
            placeholder="Search by class name"
            [(ngModel)]="classNameQuery"
          />
        </div>
      </div>
    </section>

    <section class="grid-card">
      <div class="grid-toolbar">
        <div class="toolbar-left">
          <div class="toolbar-copy">
            <h3 class="section-title">Detailed Execution Logs</h3>
            <p class="section-description">{{ filteredLogs.length }} records available in the current view.</p>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <app-data-grid
          [data]="filteredLogs"
          [columns]="gridColumns"
          [pageSize]="pageSize"
          (actionClick)="handleAction($event)"
        >
        </app-data-grid>
      </div>
    </section>

    <app-dynamic-form-modal
      [isVisible]="isDetailsModalOpen"
      [mode]="'view'"
      [titleView]="'Test Run Details'"
      [fields]="detailFields"
      [formData]="selectedLogDetails"
      (close)="closeDetailsModal()"
    >
    </app-dynamic-form-modal>
  `,
  styles: [``],
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
