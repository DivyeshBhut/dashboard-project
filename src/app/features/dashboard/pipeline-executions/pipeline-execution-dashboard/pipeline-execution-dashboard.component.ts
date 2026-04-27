import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DynamicFormModalComponent, FormField } from '../../../../shared/components/dynamic-form-modal/dynamic-form-modal.component';
import { DataGridComponent, GridColumn } from '../../../../shared/components/grid/data-grid/data-grid';
import { MasterApiService, PipelineExecutionItem } from '../../../../core/services/master-api.service';

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

@Component({
  selector: 'app-pipeline-execution-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DataGridComponent, DynamicFormModalComponent],
  templateUrl: './pipeline-execution-dashboard.component.html',
  styleUrl: './pipeline-execution-dashboard.component.css',
})
export class PipelineExecutionDashboardComponent implements OnInit {
  private readonly masterApi = inject(MasterApiService);

  readonly pageSize = 10;
  readonly outcomeOptions: Array<'All' | PipelineExecutionOutcome> = ['All', 'Successful', 'Failed', 'Cancelled'];
  readonly chartGridLines = [1, 2, 3, 4, 5];

  trendSeries: TrendSnapshot[] = [
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

  logs: PipelineExecutionItem[] = [];

  // Cached filtered result — avoids new array reference on every change detection cycle
  cachedFilteredLogs: PipelineExecutionItem[] = [];

  private _selectedOutcome: 'All' | PipelineExecutionOutcome = 'All';
  private _globalSearchTerm = '';

  get selectedOutcome(): 'All' | PipelineExecutionOutcome {
    return this._selectedOutcome;
  }

  set selectedOutcome(value: 'All' | PipelineExecutionOutcome) {
    this._selectedOutcome = value;
    this.applyFilters();
  }

  get globalSearchTerm(): string {
    return this._globalSearchTerm;
  }

  set globalSearchTerm(value: string) {
    this._globalSearchTerm = value;
    this.applyFilters();
  }

  activeTrendTab: 'week' | 'month' = 'week';

  isDetailsModalOpen = false;
  selectedLogDetails: Record<string, string> = {};

  tooltip = {
    visible: false,
    x: 0,
    y: 0,
    label: '',
    value: '',
  };

  ngOnInit(): void {
    this.masterApi.getPipelineDetails().subscribe((logs) => {
      this.logs = logs;
      this.trendSeries = this.buildTrendSeries(logs);
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    const searchTerm = this._globalSearchTerm.trim().toLowerCase();

    this.cachedFilteredLogs = this.logs.filter((log) => {
      const matchesOutcome = this._selectedOutcome === 'All' || log.outcome === this._selectedOutcome;
      const matchesGlobalSearch =
        !searchTerm ||
        log.pipelineName.toLowerCase().includes(searchTerm) ||
        log.triggeredBy.toLowerCase().includes(searchTerm);

      return matchesOutcome && matchesGlobalSearch;
    });
  }

  get filteredLogs(): PipelineExecutionItem[] {
    return this.cachedFilteredLogs;
  }

  get successfulCount(): number {
    return this.cachedFilteredLogs.filter((log) => log.outcome === 'Successful').length;
  }

  get failedCount(): number {
    return this.cachedFilteredLogs.filter((log) => log.outcome === 'Failed').length;
  }

  get averageDuration(): string {
    if (this.cachedFilteredLogs.length === 0) {
      return '0s';
    }

    const totalDuration = this.cachedFilteredLogs.reduce((sum, log) => sum + log.durationSeconds, 0);
    const averageSeconds = Math.round(totalDuration / this.cachedFilteredLogs.length);
    return this.formatDuration(averageSeconds);
  }

  get successRate(): string {
    if (this.cachedFilteredLogs.length === 0) {
      return '0%';
    }

    return `${Math.round((this.successfulCount / this.cachedFilteredLogs.length) * 100)}%`;
  }

  get peakExecutions(): number {
    return Math.max(...this.trendSeries.map((item) => item.successCount + item.failureCount), 10);
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

  get outcomeDistributionGradient(): string {
    const total = this.totalTrendExecutions || 1;
    const successStop = (this.successfulCount / total) * 100;
    const failureStop = ((this.successfulCount + this.failedCount) / total) * 100;
    return `conic-gradient(#10b981 0 ${successStop}%, #ef4444 ${successStop}% ${failureStop}%, #6366f1 ${failureStop}% 100%)`;
  }

  setTrendTab(tab: 'week' | 'month'): void {
    this.activeTrendTab = tab;
  }

  resetFilters(): void {
    this._selectedOutcome = 'All';
    this._globalSearchTerm = '';
    this.applyFilters();
  }

  handleAction(event: { action: string; item: PipelineExecutionItem }): void {
    this.openDetailsModal(event.item);
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedLogDetails = {};
  }

  showTooltip(event: MouseEvent, series: 'success' | 'failure', index: number): void {
    const point = this.trendSeries[index];
    if (!point) return;

    const svgEl = (event.target as SVGCircleElement).closest('svg')!;
    const svgRect = svgEl.getBoundingClientRect();
    const parentRect = (svgEl.parentElement as HTMLElement).getBoundingClientRect();

    const scaleX = svgRect.width / 640;
    const scaleY = svgRect.height / 240;

    const chartPoint = series === 'success'
      ? this.successChartPoints[index]
      : this.failureChartPoints[index];

    this.tooltip = {
      visible: true,
      x: (svgRect.left - parentRect.left) + chartPoint.x * scaleX,
      y: (svgRect.top - parentRect.top) + chartPoint.y * scaleY - 48,
      label: point.label,
      value: series === 'success'
        ? `${point.successCount} successful`
        : `${point.failureCount} failed`,
    };
  }

  hideTooltip(): void {
    this.tooltip.visible = false;
  }

  private openDetailsModal(log: PipelineExecutionItem): void {
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

  private buildTrendSeries(logs: PipelineExecutionItem[]): TrendSnapshot[] {
    const grouped = new Map<string, TrendSnapshot>();

    for (const log of logs) {
      const label = log.startedAt.toLocaleDateString('en-US', { weekday: 'short' });
      if (!grouped.has(label)) {
        grouped.set(label, { label, successCount: 0, failureCount: 0 });
      }

      const item = grouped.get(label)!;
      if (log.outcome === 'Successful') {
        item.successCount += 1;
      } else if (log.outcome === 'Failed') {
        item.failureCount += 1;
      }
    }

    return grouped.size ? Array.from(grouped.values()) : this.chartGridLines.map((_, index) => ({
      label: `P${index + 1}`,
      successCount: 0,
      failureCount: 0,
    }));
  }
}