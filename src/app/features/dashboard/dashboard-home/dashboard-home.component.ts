import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { DynamicFormModalComponent, FormField } from '../../../shared/components/dynamic-form-modal/dynamic-form-modal.component';
import { DataGridComponent, GridColumn } from '../../../shared/components/grid/data-grid/data-grid';
import { BuildOption, DashboardApiService, DashboardTrendPoint, LatestFailureItem, RecentActivityItem } from '../../../core/services/dashboard-api.service';
import { AuthService } from '../../../core/services/auth.service';

type DashboardTrendTab = 'week' | 'month';

interface ChartPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, DataGridComponent, DynamicFormModalComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css',
})
export class DashboardHomeComponent implements OnInit {
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly percentageFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  readonly chartGridLines = [1, 2, 3, 4, 5];
  successfulExecutions = 0;
  failedExecutions = 0;
  skippedExecutions = 0;
  totalRunCount = 0;
  successRateLabel = '0%';
  failedRunsLabel = '0';
  averageDurationLabel = '0s';
  selectedBuildId = '';
  successRateDeltaLabel = '0%';
  successRateDeltaDirection: 'up' | 'down' = 'up';
  failureRateLabel = '0%';
  currentSuccessRateValue = 0;

  readonly trendSeries: Record<DashboardTrendTab, DashboardTrendPoint[]> = {
    week: [],
    month: [],
  };

  readonly recentActivityColumns: GridColumn[] = [
    { field: 'activityName', title: 'Activity', width: 260 },
    { field: 'module', title: 'Module', width: 220 },
    { field: 'actor', title: 'Actor', width: 200 },
    { field: 'loggedAt', title: 'Logged At', type: 'date', format: 'yyyy-MM-dd HH:mm', width: 220 },
  ];

  recentActivities: RecentActivityItem[] = [];

  readonly criticalFailureColumns: GridColumn[] = [
    { field: 'actions', title: 'Actions', type: 'actions', width: 140, allowedActions: ['view'] },
    { field: 'failureName', title: 'Failure', width: 280 },
    { field: 'pipelineName', title: 'Pipeline', width: 240 },
    { field: 'severity', title: 'Severity', width: 160 },
    { field: 'owner', title: 'Owner', width: 200 },
    { field: 'detectedAt', title: 'Detected At', type: 'date', format: 'yyyy-MM-dd HH:mm', width: 220 },
  ];

  criticalFailures: LatestFailureItem[] = [];

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
  tooltip = {
    visible: false,
    x: 0,
    y: 0,
    label: '',
    value: '',
  };
  selectedBuild = '';
  builds: BuildOption[] = [];
  activeTrendTab: DashboardTrendTab = 'week';
  searchQuery = '';
  selectedCriticalFailureDetails: Record<string, string> = {};
  
  get userName(): string {
    return this.authService.currentUser()?.username || 'User';
  }
  constructor(
    private eRef: ElementRef,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  get filteredBuilds(): BuildOption[] {
    return this.builds.filter((build) => build.label.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  get activeTrendData(): DashboardTrendPoint[] {
    return this.trendSeries[this.activeTrendTab];
  }

  get totalRunVolume(): number {
    return this.activeTrendData.reduce((sum, item) => sum + item.totalRuns, 0);
  }

  get peakRuns(): number {
    // FIX 1: Guard against empty array — Math.max(...[]) returns -Infinity.
    // Using a conditional spread so we always have at least 1 as the floor.
    if (this.activeTrendData.length === 0) return 1;
    return Math.max(...this.activeTrendData.map((item) => item.totalRuns), 1);
  }

  get runsAxisLabels(): number[] {
    const peak = this.peakRuns;
    return [peak, Math.round(peak * 0.75), Math.round(peak * 0.5), Math.round(peak * 0.25), 0];
  }

  get averageTrendSuccessRate(): string {
    if (this.activeTrendData.length === 0) {
      return '0%';
    }

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
    return this.totalRunCount;
  }

  get successfulExecutionRate(): string {
    return this.formatPercentage(this.successfulExecutions, this.totalExecutions);
  }

  get failedExecutionRate(): string {
    return this.formatPercentage(this.failedExecutions, this.totalExecutions);
  }

  get skippedExecutionRate(): string {
    return this.formatPercentage(this.skippedExecutions, this.totalExecutions);
  }

  get outcomeDistributionGradient(): string {
    // FIX 2: Clamp each segment so stops never exceed 100%, preventing a
    // broken conic-gradient when data sums are inconsistent.
    const total = Math.max(this.totalExecutions, 1);

    const successPct = Math.min((this.successfulExecutions / total) * 100, 100);
    const failedPct = Math.min(((this.successfulExecutions + this.failedExecutions) / total) * 100, 100);
    // Clamp the failed stop so it never goes below successPct (prevents negative segments).
    const failedStop = Math.max(failedPct, successPct);

    return `conic-gradient(#10b981 0 ${successPct}%, #ef4444 ${successPct}% ${failedStop}%, #6366f1 ${failedStop}% 100%)`;
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
    const selected = this.builds.find((item) => item.label === build);
    this.selectedBuild = build;
    this.isBuildDropdownOpen = false;
    this.selectedBuildId = selected?.id ?? '';
    this.loadDashboardData(selected?.id);
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

  handleCriticalFailureAction(event: { action: string; item: LatestFailureItem }): void {
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

  // After closeCriticalFailureModal() method
  showTooltip(event: MouseEvent, series: 'runs' | 'rate', index: number): void {
    const point = this.activeTrendData[index];
    if (!point) return;
    const svgEl = (event.target as SVGCircleElement).closest('svg')!;
    const svgRect = svgEl.getBoundingClientRect();
    const parentRect = (svgEl.parentElement as HTMLElement).getBoundingClientRect();
    const scaleX = svgRect.width / 640;
    const scaleY = svgRect.height / 240;
    const chartPoint = series === 'runs'
      ? this.totalRunsChartPoints[index]
      : this.successRateChartPoints[index];
    this.tooltip = {
      visible: true,
      x: (svgRect.left - parentRect.left) + chartPoint.x * scaleX,
      y: (svgRect.top - parentRect.top) + chartPoint.y * scaleY - 48,
      label: point.label,
      value: series === 'runs' ? `${point.totalRuns} runs` : `${point.successRate}% success`,
    };
  }

  hideTooltip(): void {
    this.tooltip.visible = false;
  }

  private buildChartPoints(values: number[], maxValue: number): ChartPoint[] {
    const startX = 28;
    const endX = 612;
    const topY = 24;
    const bottomY = 210;
    const usableWidth = endX - startX;
    const usableHeight = bottomY - topY;
    // FIX 3: When there is only one data point the divisor was 1 (correct),
    // but when values is empty we would get NaN x-positions. Guard that case.
    if (values.length === 0) return [];
    const divisor = values.length > 1 ? values.length - 1 : 1;

    return values.map((value, index) => ({
      x: startX + (usableWidth / divisor) * index,
      y: bottomY - (value / Math.max(maxValue, 1)) * usableHeight,
    }));
  }

  private toPolylinePoints(points: ChartPoint[]): string {
    return points.map((point) => `${point.x},${point.y}`).join(' ');
  }

  private formatPercentage(value: number, total: number): string {
    // FIX 4: Clamp percentage to [0, 100] so that any data anomaly
    // (e.g. passedRuns > totalRuns) never renders as "105%" in the UI.
    const percentage = Math.min(Math.max((value / Math.max(total, 1)) * 100, 0), 100);
    return `${this.percentageFormatter.format(percentage)}%`;
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

  private loadDashboardData(buildId?: string): void {
    this.dashboardApi.getDashboardHomeData(buildId).subscribe((data) => {
      this.builds = data.builds;
      if (!this.selectedBuild) {
        this.selectedBuild = data.builds[0]?.label ?? 'Latest Build';
      }
      // FIX 7: Prefer the explicitly requested buildId first, then the API's
      // response, then fall back to the first build. The old order allowed a
      // stale this.selectedBuildId to win over a freshly selected build when
      // data.selectedBuildId came back empty from the API.
      this.selectedBuildId = (buildId ?? data.selectedBuildId) || data.builds[0]?.id || '';

      this.currentSuccessRateValue = this.calculateRate(data.stats.passedRuns, data.stats.totalRuns);
      this.successRateLabel = this.formatPercentage(data.stats.passedRuns, data.stats.totalRuns);
      this.totalRunCount = data.stats.totalRuns;
      this.failedRunsLabel = `${data.stats.failedRuns}`;
      this.averageDurationLabel = data.stats.averageDuration;
      this.failedExecutions = data.stats.failedRuns;
      this.successfulExecutions = data.stats.passedRuns;
      this.skippedExecutions = data.stats.skippedRuns;
      this.failureRateLabel = this.formatPercentage(data.stats.failedRuns, data.stats.totalRuns);
      this.trendSeries.week = data.trends.week;
      this.trendSeries.month = data.trends.month;
      this.recentActivities = data.recentActivities;
      this.criticalFailures = data.latestFailures;
      this.updateBuildComparisons();
    });
  }

  private updateBuildComparisons(): void {
    // FIX 5 (primary bug): The original code used array index proximity
    // (selectedIndex - 1) to find the "previous" build, which is only correct
    // if the builds array is guaranteed to be sorted oldest-to-newest — an
    // assumption that is nowhere enforced. Instead we now:
    //   1. Sort a copy of builds by buildNumber descending (newest first).
    //   2. Find the current build in that sorted list.
    //   3. The "previous" build is the next item in the sorted list (older).
    // This is correct regardless of the original array order.
    const current = this.builds.find((b) => b.id === this.selectedBuildId);

    if (!current) {
      this.successRateDeltaLabel = '0%';
      this.successRateDeltaDirection = 'up';
      return;
    }

    // Sort descending by buildNumber so index 0 = newest build.
    // buildNumber is a string on BuildOption, so parse to number first.
    // If the value is non-numeric (e.g. a name), fall back to lexicographic order.
    const sorted = [...this.builds].sort((a, b) => {
      const aNum = Number(a.buildNumber);
      const bNum = Number(b.buildNumber);
      if (!isNaN(aNum) && !isNaN(bNum)) return bNum - aNum;
      return b.buildNumber.localeCompare(a.buildNumber);
    });
    const currentIdx = sorted.findIndex((b) => b.id === this.selectedBuildId);

    // Walk backwards from the current position to find the nearest older build
    // that has actual test data. This skips "Running" or incomplete builds
    // (totalTests === 0) which would otherwise trigger the zero-guard and
    // silently blank out the delta footer for every build above them in the list.
    const previous = sorted.slice(currentIdx + 1).find((b) => b.totalTests > 0) ?? null;

    if (!previous) {
      this.successRateDeltaLabel = '0%';
      this.successRateDeltaDirection = 'up';
      return;
    }

    const previousSuccessRate = this.calculateRate(previous.passed, previous.totalTests);
    const delta = this.currentSuccessRateValue - previousSuccessRate;
    this.successRateDeltaLabel = `${this.percentageFormatter.format(Math.abs(delta))}%`;
    this.successRateDeltaDirection = delta >= 0 ? 'up' : 'down';
  }

  private calculateRate(value: number, total: number): number {
    // FIX 6: Clamp to [0, 100] so downstream consumers always receive a
    // well-formed percentage, even when the API returns inconsistent data.
    if (!total) return 0;
    return Math.min(Math.max((value / total) * 100, 0), 100);
  }
}
