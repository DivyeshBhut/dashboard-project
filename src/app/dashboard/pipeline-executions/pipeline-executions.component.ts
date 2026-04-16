import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DynamicFormModalComponent, FormField } from '../../common/dynamic-form-modal/dynamic-form-modal.component';
import { DataGridComponent, GridColumn } from '../../common/grid/data-grid/data-grid';

type PipelineExecutionOutcome = 'Successful' | 'Failed' | 'Cancelled';

interface PipelineExecutionLog {
  id: string;
  pipelineName: string;
  triggeredBy: string;
  outcome: PipelineExecutionOutcome;
  durationSeconds: number;
  durationLabel: string;
  startedAt: Date;
  executionDetails: string;
}

@Component({
  selector: 'app-pipeline-executions',
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
        <span class="breadcrumb-item active">Pipeline Executions</span>
      </div>

      <div class="header-card">
        <div class="header-info">
          <h2 class="page-title">Pipeline Executions</h2>
          <p class="text-muted">
            Track orchestration health, validate run outcomes, and review recent execution activity across pipelines.
          </p>
        </div>
      </div>
    </div>

    <section class="stats-grid" aria-label="Pipeline execution summary">
      <article class="stat-card">
        <div class="stat-header">
          <div class="stat-icon info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <h3 class="stat-title">Total Executions</h3>
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
          <h3 class="stat-title">Successful</h3>
        </div>
        <div class="stat-value">{{ successfulCount }}</div>
        <div class="stat-footer">
          <span class="trend up">{{ successRate }} success rate</span>
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
          <span class="trend down">{{ failedCount }} execution failures detected</span>
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
          <h3 class="stat-title">Success Rate</h3>
        </div>
        <div class="stat-value">{{ successRate }}</div>
        <div class="stat-footer">
          <span class="footer-text">Based on successful vs total executions</span>
        </div>
      </article>
    </section>

    <section class="filter-card">
      <div class="filter-header">
        <div>
          <h3 class="section-title">Search and Filter</h3>
          <p class="section-description">Refine pipeline logs by outcome, pipeline name, and trigger ownership.</p>
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
          <label for="pipelineNameFilter">Pipeline Name</label>
          <input
            id="pipelineNameFilter"
            type="text"
            class="form-input"
            placeholder="Search by pipeline name"
            [(ngModel)]="pipelineNameQuery"
          />
        </div>

        <div class="form-group">
          <label for="triggeredByFilter">Triggered By</label>
          <input
            id="triggeredByFilter"
            type="text"
            class="form-input"
            placeholder="Search by trigger owner"
            [(ngModel)]="triggeredByQuery"
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
      [titleView]="'Pipeline Execution Details'"
      [fields]="detailFields"
      [formData]="selectedLogDetails"
      (close)="closeDetailsModal()"
    >
    </app-dynamic-form-modal>
  `,
  styles: [``],
})
export class PipelineExecutionsComponent {
  readonly pageSize = 10;
  readonly outcomeOptions: Array<'All' | PipelineExecutionOutcome> = ['All', 'Successful', 'Failed', 'Cancelled'];

  readonly gridColumns: GridColumn[] = [
    { field: 'actions', title: 'Actions', width: 140, type: 'actions' },
    { field: 'pipelineName', title: 'Pipeline Name', width: 260 },
    { field: 'triggeredBy', title: 'Triggered By', width: 220 },
    { field: 'outcome', title: 'Outcome', width: 160 },
    { field: 'durationLabel', title: 'Duration', width: 150 },
    { field: 'startedAt', title: 'Started At', width: 220, type: 'date', format: '{0:MMM d, yyyy h:mm tt}' },
  ];

  readonly detailFields: FormField[] = [
    { key: 'pipelineName', label: 'Pipeline Name', type: 'text' },
    { key: 'triggeredBy', label: 'Triggered By', type: 'text' },
    { key: 'outcome', label: 'Outcome', type: 'text' },
    { key: 'duration', label: 'Duration', type: 'text' },
    { key: 'startedAt', label: 'Started At', type: 'text' },
    { key: 'executionDetails', label: 'Execution Details', type: 'text' },
  ];

  readonly logs: PipelineExecutionLog[] = [
    {
      id: 'pipe-2001',
      pipelineName: 'Nightly Regression Pipeline',
      triggeredBy: 'system.scheduler',
      outcome: 'Successful',
      durationSeconds: 312,
      durationLabel: '5m 12s',
      startedAt: new Date('2026-04-15T01:00:00'),
      executionDetails: 'Pipeline completed successfully after validating all scheduled quality gates.',
    },
    {
      id: 'pipe-2002',
      pipelineName: 'Release Candidate Deployment',
      triggeredBy: 'ananya.shah',
      outcome: 'Failed',
      durationSeconds: 428,
      durationLabel: '7m 8s',
      startedAt: new Date('2026-04-15T08:14:00'),
      executionDetails: 'Deployment validation failed during post-release smoke tests in the staging environment.',
    },
    {
      id: 'pipe-2003',
      pipelineName: 'Billing Data Sync',
      triggeredBy: 'finance.bot',
      outcome: 'Successful',
      durationSeconds: 186,
      durationLabel: '3m 6s',
      startedAt: new Date('2026-04-15T08:42:00'),
      executionDetails: 'Billing synchronization finished successfully and archived the transfer report.',
    },
    {
      id: 'pipe-2004',
      pipelineName: 'Permission Matrix Refresh',
      triggeredBy: 'ops.admin',
      outcome: 'Cancelled',
      durationSeconds: 94,
      durationLabel: '1m 34s',
      startedAt: new Date('2026-04-15T09:05:00'),
      executionDetails: 'Execution was cancelled manually before the final authorization sync step completed.',
    },
    {
      id: 'pipe-2005',
      pipelineName: 'Analytics Warehouse Load',
      triggeredBy: 'warehouse.service',
      outcome: 'Successful',
      durationSeconds: 274,
      durationLabel: '4m 34s',
      startedAt: new Date('2026-04-15T09:28:00'),
      executionDetails: 'Warehouse load completed successfully with all partitions validated.',
    },
    {
      id: 'pipe-2006',
      pipelineName: 'Customer Notification Pipeline',
      triggeredBy: 'marketing.queue',
      outcome: 'Failed',
      durationSeconds: 221,
      durationLabel: '3m 41s',
      startedAt: new Date('2026-04-15T10:07:00'),
      executionDetails: 'Notification batch failed because template rendering returned incomplete payload metadata.',
    },
    {
      id: 'pipe-2007',
      pipelineName: 'Role Sync Backfill',
      triggeredBy: 'security.scheduler',
      outcome: 'Successful',
      durationSeconds: 198,
      durationLabel: '3m 18s',
      startedAt: new Date('2026-04-15T10:36:00'),
      executionDetails: 'Backfill finished successfully and reconciled all outstanding role assignment records.',
    },
    {
      id: 'pipe-2008',
      pipelineName: 'Pre-Prod Verification Flow',
      triggeredBy: 'release.manager',
      outcome: 'Failed',
      durationSeconds: 356,
      durationLabel: '5m 56s',
      startedAt: new Date('2026-04-15T11:02:00'),
      executionDetails: 'Verification flow failed when the final environment health probe timed out.',
    },
  ];

  selectedOutcome: 'All' | PipelineExecutionOutcome = 'All';
  pipelineNameQuery = '';
  triggeredByQuery = '';

  isDetailsModalOpen = false;
  selectedLogDetails: Record<string, string> = {};

  get filteredLogs(): PipelineExecutionLog[] {
    const pipelineNameFilter = this.pipelineNameQuery.trim().toLowerCase();
    const triggeredByFilter = this.triggeredByQuery.trim().toLowerCase();

    return this.logs.filter((log) => {
      const matchesOutcome = this.selectedOutcome === 'All' || log.outcome === this.selectedOutcome;
      const matchesPipelineName = !pipelineNameFilter || log.pipelineName.toLowerCase().includes(pipelineNameFilter);
      const matchesTriggeredBy = !triggeredByFilter || log.triggeredBy.toLowerCase().includes(triggeredByFilter);

      return matchesOutcome && matchesPipelineName && matchesTriggeredBy;
    });
  }

  get successfulCount(): number {
    return this.filteredLogs.filter((log) => log.outcome === 'Successful').length;
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

  get successRate(): string {
    if (this.filteredLogs.length === 0) {
      return '0%';
    }

    return `${Math.round((this.successfulCount / this.filteredLogs.length) * 100)}%`;
  }

  resetFilters(): void {
    this.selectedOutcome = 'All';
    this.pipelineNameQuery = '';
    this.triggeredByQuery = '';
  }

  handleAction(event: { action: string; item: PipelineExecutionLog }): void {
    this.openDetailsModal(event.item);
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedLogDetails = {};
  }

  private openDetailsModal(log: PipelineExecutionLog): void {
    this.selectedLogDetails = {
      pipelineName: log.pipelineName,
      triggeredBy: log.triggeredBy,
      outcome: log.outcome,
      duration: log.durationLabel,
      startedAt: this.formatDateTime(log.startedAt),
      executionDetails: log.executionDetails,
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
