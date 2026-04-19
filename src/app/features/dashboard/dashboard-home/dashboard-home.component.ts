import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { DynamicFormModalComponent, FormField } from '../../../shared/components/dynamic-form-modal/dynamic-form-modal.component';
import { DataGridComponent, GridColumn } from '../../../shared/components/grid/data-grid/data-grid';

type DashboardTrendTab = 'week' | 'month';

interface TrendSnapshot {
  label: string;
  totalRuns: number;
  successRate: number;
}

interface ChartPoint {
  x: number;
  y: number;
}

interface RecentActivity {
  activityName: string;
  module: string;
  actor: string;
  loggedAt: Date;
}

interface CriticalFailure {
  id: string;
  failureName: string;
  pipelineName: string;
  severity: string;
  owner: string;
  detectedAt: Date;
  failureDetails: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, DataGridComponent, DynamicFormModalComponent],
  templateUrl: './dashboard-home.component.html',

  styleUrl: './dashboard-home.component.css',
})
export class DashboardHomeComponent {
  readonly chartGridLines = [1, 2, 3, 4, 5];
  readonly successfulExecutions = 74;
  readonly failedExecutions = 16;
  readonly cancelledExecutions = 6;

  readonly trendSeries: Record<DashboardTrendTab, TrendSnapshot[]> = {
    week: [
      { label: 'Mon', totalRuns: 122, successRate: 82 },
      { label: 'Tue', totalRuns: 138, successRate: 86 },
      { label: 'Wed', totalRuns: 109, successRate: 79 },
      { label: 'Thu', totalRuns: 164, successRate: 88 },
      { label: 'Fri', totalRuns: 149, successRate: 84 },
      { label: 'Sat', totalRuns: 118, successRate: 81 },
      { label: 'Sun', totalRuns: 172, successRate: 91 },
    ],
    month: [
      { label: 'W1', totalRuns: 520, successRate: 78 },
      { label: 'W2', totalRuns: 568, successRate: 82 },
      { label: 'W3', totalRuns: 612, successRate: 85 },
      { label: 'W4', totalRuns: 640, successRate: 88 },
    ],
  };

  readonly recentActivityColumns: GridColumn[] = [
    { field: 'activityName', title: 'Activity', width: 260 },
    { field: 'module', title: 'Module', width: 220 },
    { field: 'actor', title: 'Actor', width: 200 },
    { field: 'loggedAt', title: 'Logged At', type: 'date', format: 'yyyy-MM-dd HH:mm', width: 220 },
  ];

  readonly recentActivities: RecentActivity[] = [
    { activityName: 'Nightly regression pipeline completed', module: 'Pipeline Monitoring', actor: 'system.scheduler', loggedAt: new Date('2026-04-15T07:42:00') },
    { activityName: 'Role sync backfill triggered', module: 'Security', actor: 'ops.admin', loggedAt: new Date('2026-04-15T08:05:00') },
    { activityName: 'Release candidate validation started', module: 'Deployments', actor: 'release.manager', loggedAt: new Date('2026-04-15T08:28:00') },
    { activityName: 'Permission matrix export generated', module: 'UAM', actor: 'audit.bot', loggedAt: new Date('2026-04-15T09:11:00') },
    { activityName: 'Billing sync completed successfully', module: 'Finance Automation', actor: 'finance.bot', loggedAt: new Date('2026-04-15T09:46:00') },
  ];

  readonly criticalFailureColumns: GridColumn[] = [
    { field: 'actions', title: 'Actions', type: 'actions', width: 140 },
    { field: 'failureName', title: 'Failure', width: 280 },
    { field: 'pipelineName', title: 'Pipeline', width: 240 },
    { field: 'severity', title: 'Severity', width: 160 },
    { field: 'owner', title: 'Owner', width: 200 },
    { field: 'detectedAt', title: 'Detected At', type: 'date', format: 'yyyy-MM-dd HH:mm', width: 220 },
  ];

  readonly criticalFailures: CriticalFailure[] = [
    {
      id: 'cf-401',
      failureName: 'Verification flow timeout',
      pipelineName: 'Pre-Prod Verification Flow',
      severity: 'Critical',
      owner: 'Platform Reliability',
      detectedAt: new Date('2026-04-15T10:18:00'),
      failureDetails: 'The pre-production verification suite exceeded the response timeout while validating core checkout workflows. Downstream release promotion remains blocked until the service latency stabilizes.',
    },
    {
      id: 'cf-402',
      failureName: 'Post-release smoke checks failed',
      pipelineName: 'Release Candidate Deployment',
      severity: 'High',
      owner: 'Release Operations',
      detectedAt: new Date('2026-04-15T09:12:00'),
      failureDetails: 'Smoke coverage reported environment drift after the latest deployment candidate. The rollback gate is active while release operations verifies application configuration and service health.',
    },
    {
      id: 'cf-403',
      failureName: 'Notification payload rendering error',
      pipelineName: 'Customer Notification Pipeline',
      severity: 'Critical',
      owner: 'Messaging Services',
      detectedAt: new Date('2026-04-15T08:56:00'),
      failureDetails: 'Rendered notification payloads are missing expected template variables for two high-priority events. Alerting is active while the template compilation path is being reviewed.',
    },
    {
      id: 'cf-404',
      failureName: 'Queue recovery mismatch detected',
      pipelineName: 'Recovery Orchestration Pipeline',
      severity: 'High',
      owner: 'Automation QA',
      detectedAt: new Date('2026-04-15T08:21:00'),
      failureDetails: 'Recovery orchestration reported a queue state mismatch during failover validation. The system is stable, but recovery confidence is downgraded until remediation checks complete.',
    },
  ];

  readonly criticalFailureFields: FormField[] = [
    { key: 'failureName', label: 'Failure', type: 'text' },
    { key: 'pipelineName', label: 'Pipeline', type: 'text' },
    { key: 'severity', label: 'Severity', type: 'text' },
    { key: 'owner', label: 'Owner', type: 'text' },
    { key: 'detectedAt', label: 'Detected At', type: 'text' },
    { key: 'failureDetails', label: 'Failure Details', type: 'text' },
  ];

  isBuildDropdownOpen = false;
  isRecentActivitiesOpen = true;
  isCriticalFailuresOpen = true;
  isCriticalFailureModalOpen = false;
  selectedBuild = 'Latest Build (#4192)';
  builds = ['Latest Build (#4192)', 'Build #4191', 'Build #4190'];
  activeTrendTab: DashboardTrendTab = 'week';
  searchQuery = '';
  selectedCriticalFailureDetails: Record<string, string> = {};

  constructor(private eRef: ElementRef) {}

  get filteredBuilds(): string[] {
    return this.builds.filter((build) => build.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  get activeTrendData(): TrendSnapshot[] {
    return this.trendSeries[this.activeTrendTab];
  }

  get totalRunVolume(): number {
    return this.activeTrendData.reduce((sum, item) => sum + item.totalRuns, 0);
  }

  get peakRuns(): number {
    return Math.max(...this.activeTrendData.map((item) => item.totalRuns), 1);
  }

  get runsAxisLabels(): number[] {
    const peak = this.peakRuns;
    return [peak, Math.round(peak * 0.75), Math.round(peak * 0.5), Math.round(peak * 0.25), 0];
  }

  get averageTrendSuccessRate(): string {
    const total = this.activeTrendData.reduce((sum, item) => sum + item.successRate, 0);
    return `${Math.round(total / this.activeTrendData.length)}%`;
  }

  get totalRunsChartPoints(): ChartPoint[] {
    return this.buildChartPoints(this.activeTrendData.map((item) => item.totalRuns), this.peakRuns);
  }

  get successRateChartPoints(): ChartPoint[] {
    return this.buildChartPoints(this.activeTrendData.map((item) => item.successRate), 100);
  }

  get totalRunsPolylinePoints(): string {
    return this.toPolylinePoints(this.totalRunsChartPoints);
  }

  get successRatePolylinePoints(): string {
    return this.toPolylinePoints(this.successRateChartPoints);
  }

  get totalExecutions(): number {
    return this.successfulExecutions + this.failedExecutions;
  }

  get successfulExecutionRate(): string {
    return this.toPercentage(this.successfulExecutions, this.totalExecutions);
  }

  get outcomeDistributionGradient(): string {
    const total = this.totalExecutions || 1;
    const successStop = (this.successfulExecutions / total) * 100;
    return `conic-gradient(#10b981 0 ${successStop}%, #ef4444 ${successStop}% 100%)`;
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  toggleBuildDropdown(event: Event): void {
    event.stopPropagation();
    this.isBuildDropdownOpen = !this.isBuildDropdownOpen;
    if (this.isBuildDropdownOpen) {
      this.searchQuery = '';
    }
  }

  selectBuild(build: string): void {
    this.selectedBuild = build;
    this.isBuildDropdownOpen = false;
  }

  setTrendTab(tab: DashboardTrendTab): void {
    this.activeTrendTab = tab;
  }

  toggleRecentActivities(): void {
    this.isRecentActivitiesOpen = !this.isRecentActivitiesOpen;
  }

  toggleCriticalFailures(): void {
    this.isCriticalFailuresOpen = !this.isCriticalFailuresOpen;
  }

  handleCriticalFailureAction(event: { action: string; item: CriticalFailure }): void {
    const failure = event.item;
    this.selectedCriticalFailureDetails = {
      failureName: failure.failureName,
      pipelineName: failure.pipelineName,
      severity: failure.severity,
      owner: failure.owner,
      detectedAt: this.formatDateTime(failure.detectedAt),
      failureDetails: failure.failureDetails,
    };
    this.isCriticalFailureModalOpen = true;
  }

  closeCriticalFailureModal(): void {
    this.isCriticalFailureModalOpen = false;
    this.selectedCriticalFailureDetails = {};
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

  private toPercentage(value: number, total: number): string {
    return `${Math.round((value / Math.max(total, 1)) * 100)}%`;
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

  @HostListener('document:click', ['$event'])
  clickout(event: Event): void {
    const select = this.eRef.nativeElement.querySelector('.custom-select');
    if (this.isBuildDropdownOpen && select && !select.contains(event.target as Node)) {
      this.isBuildDropdownOpen = false;
    }
  }
}