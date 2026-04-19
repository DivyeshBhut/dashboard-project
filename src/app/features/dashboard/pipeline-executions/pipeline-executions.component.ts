import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DynamicFormModalComponent, FormField } from '../../../shared/components/dynamic-form-modal/dynamic-form-modal.component';
import { DataGridComponent, GridColumn } from '../../../shared/components/grid/data-grid/data-grid';

type PipelineExecutionOutcome = 'Successful' | 'Failed' | 'Cancelled';

interface TrendSnapshot {
  label: string;
  successCount: number;
  failureCount: number;
}

interface ChartPoint {
  x: number;
  y: number;
}

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
  readonly chartGridLines = [1, 2, 3, 4, 5];

  readonly trendSeries: TrendSnapshot[] = [
    { label: 'Mon', successCount: 5, failureCount: 1 },
    { label: 'Tue', successCount: 6, failureCount: 2 },
    { label: 'Wed', successCount: 4, failureCount: 3 },
    { label: 'Thu', successCount: 7, failureCount: 1 },
    { label: 'Fri', successCount: 5, failureCount: 2 },
    { label: 'Sat', successCount: 3, failureCount: 1 },
    { label: 'Sun', successCount: 8, failureCount: 2 },
  ];

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
  activeTrendTab: 'week' | 'month' = 'week';

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

  get peakExecutions(): number {
    const totalSuccesses = this.trendSeries.reduce((sum, item) => sum + item.successCount, 0);
    const totalFailures = this.trendSeries.reduce((sum, item) => sum + item.failureCount, 0);
    return Math.max(...this.trendSeries.map((item) => item.successCount + item.failureCount), 10); // Minimum 10 to make chart visible
  }

  get executionsAxisLabels(): number[] {
    const peak = this.peakExecutions;
    return [peak, Math.round(peak * 0.75), Math.round(peak * 0.5), Math.round(peak * 0.25), 0];
  }

  get totalSuccessfulTrend(): number {
    return this.trendSeries.reduce((sum, item) => sum + item.successCount, 0);
  }

  get totalFailureTrend(): number {
    return this.trendSeries.reduce((sum, item) => sum + item.failureCount, 0);
  }

  get successChartPoints(): ChartPoint[] {
    return this.buildChartPoints(this.trendSeries.map((item) => item.successCount), this.peakExecutions);
  }

  get failureChartPoints(): ChartPoint[] {
    return this.buildChartPoints(this.trendSeries.map((item) => item.failureCount), this.peakExecutions);
  }

  get successPolylinePoints(): string {
    return this.toPolylinePoints(this.successChartPoints);
  }

  get failurePolylinePoints(): string {
    return this.toPolylinePoints(this.failureChartPoints);
  }

  get totalTrendExecutions(): number {
    return this.totalSuccessfulTrend + this.totalFailureTrend;
  }

  setTrendTab(tab: 'week' | 'month'): void {
    this.activeTrendTab = tab;
  }

  get outcomeDistributionGradient(): string {
    const totalCancelled = this.logs.filter((log) => log.outcome === 'Cancelled').length;
    const total = this.totalTrendExecutions || 1;
    const successStop = (this.successfulCount / total) * 100;
    const failureStop = ((this.successfulCount + this.failedCount) / total) * 100;
    return `conic-gradient(#10b981 0 ${successStop}%, #ef4444 ${successStop}% ${failureStop}%, #6366f1 ${failureStop}% 100%)`;
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

  private buildChartPoints(values: number[], maxValue: number): ChartPoint[] {
    const startX = 28;
    const endX = 612;
    const topY = 24;
    const bottomY = 210;
    const usableWidth = endX - startX;
    const usableHeight = bottomY - topY;
    const divisor = values.length > 1 ? values.length - 1 : 1;

    return values.map((value, index) => ({
      x: startX + (usableWidth / divisor) * index,
      y: bottomY - (value / Math.max(maxValue, 1)) * usableHeight,
    }));
  }

  private toPolylinePoints(points: ChartPoint[]): string {
    return points.map((point) => `${point.x},${point.y}`).join(' ');
  }
}
