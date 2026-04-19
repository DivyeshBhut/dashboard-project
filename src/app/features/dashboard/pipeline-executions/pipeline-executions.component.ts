import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DynamicFormModalComponent, FormField } from '../../../shared/components/dynamic-form-modal/dynamic-form-modal.component';
import { DataGridComponent, GridColumn } from '../../../shared/components/grid/data-grid/data-grid';

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
  templateUrl: './pipeline-executions.component.html',
  styleUrl: './pipeline-executions.component.css',
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
