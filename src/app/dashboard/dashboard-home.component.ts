import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { DynamicFormModalComponent, FormField } from '../common/dynamic-form-modal/dynamic-form-modal.component';
import { DataGridComponent, GridColumn } from '../common/grid/data-grid/data-grid';

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
  template: `
    <div class="dashboard-content">
      <nav class="breadcrumb">
        <ol>
          <li><a href="#">Dashboard</a></li>
          <li class="separator">/</li>
          <li class="current">Pipeline Intelligence</li>
        </ol>
      </nav>

      <div class="header-card">
        <div class="header-left">
          <h1 class="header-title">Pipeline Intelligence</h1>
          <p class="header-subtitle">Real Time Test Automation Insights</p>
        </div>

        <div class="header-right">
          <div class="build-selector">
            <label>Build</label>
            <div class="custom-select" [class.open]="isBuildDropdownOpen">
              <button class="select-btn" type="button" (click)="toggleBuildDropdown($event)">
                <span class="selected-text">{{ selectedBuild }}</span>
                <svg class="select-icon" [class.rotated]="isBuildDropdownOpen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                </svg>
              </button>

              <div class="dropdown-menu" *ngIf="isBuildDropdownOpen">
                <div class="dropdown-search" (click)="$event.stopPropagation()">
                  <input type="text" placeholder="Search builds..." (input)="onSearch($event)" [value]="searchQuery">
                </div>
                <div class="dropdown-items">
                  <div
                    class="dropdown-item"
                    *ngFor="let build of filteredBuilds"
                    [class.active]="build === selectedBuild"
                    (click)="selectBuild(build)"
                  >
                    <span class="item-text">{{ build }}</span>
                    <svg *ngIf="build === selectedBuild" class="check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="dropdown-item empty-state" *ngIf="filteredBuilds.length === 0">
                    No builds found matching "{{ searchQuery }}"
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button class="btn-refresh" type="button" aria-label="Refresh Data">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="stat-title">Success Rate</h3>
          </div>
          <div class="stat-value">85%</div>
          <div class="stat-footer">
            <span class="trend up">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
              </svg>
              2.1%
            </span>
            <span class="footer-text">vs last build</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            <h3 class="stat-title">Total Runs</h3>
          </div>
          <div class="stat-value">98</div>
          <div class="stat-footer">
            <span class="footer-text">Across 20 builds</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon danger-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="stat-title">Failures</h3>
          </div>
          <div class="stat-value">15</div>
          <div class="stat-footer">
            <span class="trend down">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd" />
              </svg>
              15%
            </span>
            <span class="footer-text">failure rate</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon timer-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="stat-title">Avg Duration</h3>
          </div>
          <div class="stat-value">4m 43s</div>
          <div class="stat-footer">
            <span class="footer-text">per pipeline execution</span>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-card trend-card">
          <div class="card-header trend-header">
            <div>
              <h3 class="card-title">Execution Trends</h3>
              <p class="card-subtitle">Success rate and total run volume across the latest execution windows.</p>
            </div>
            <div class="trend-tabs">
              <button class="trend-tab" type="button" [class.active]="activeTrendTab === 'week'" (click)="setTrendTab('week')">Week</button>
              <button class="trend-tab" type="button" [class.active]="activeTrendTab === 'month'" (click)="setTrendTab('month')">Month</button>
            </div>
          </div>

          <div class="chart-summary">
            <div class="legend-item">
              <span class="legend-swatch runs-swatch"></span>
              <span class="legend-text">Total Runs <strong>{{ totalRunVolume }}</strong></span>
            </div>
            <div class="legend-item">
              <span class="legend-swatch success-swatch"></span>
              <span class="legend-text">Avg Success Rate <strong>{{ averageTrendSuccessRate }}</strong></span>
            </div>
          </div>

          <div class="trend-chart-shell">
            <div class="y-axis y-axis-left">
              <span *ngFor="let label of runsAxisLabels">{{ label }}</span>
            </div>

            <div class="chart-stage">
              <div class="grid-lines-bg">
                <div class="grid-line" *ngFor="let line of chartGridLines"></div>
              </div>

              <svg class="trend-svg" viewBox="0 0 640 240" preserveAspectRatio="none" aria-hidden="true">
                <polyline class="trend-line total-runs-line" [attr.points]="totalRunsPolylinePoints"></polyline>
                <polyline class="trend-line success-rate-line" [attr.points]="successRatePolylinePoints"></polyline>

                <g *ngFor="let point of totalRunsChartPoints">
                  <circle class="trend-point total-runs-point" [attr.cx]="point.x" [attr.cy]="point.y" r="5"></circle>
                </g>

                <g *ngFor="let point of successRateChartPoints">
                  <circle class="trend-point success-rate-point" [attr.cx]="point.x" [attr.cy]="point.y" r="5"></circle>
                </g>
              </svg>

              <div class="x-axis">
                <span *ngFor="let point of activeTrendData">{{ point.label }}</span>
              </div>
            </div>

            <div class="y-axis y-axis-right">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
          </div>
        </div>

        <div class="chart-card distribution-card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Outcome Distribution</h3>
              <p class="card-subtitle">A quick snapshot of the latest execution outcomes across monitored pipelines.</p>
            </div>
          </div>

          <div class="distribution-content">
            <div class="distribution-visual">
              <div class="donut-chart" [style.background]="outcomeDistributionGradient">
                <div class="donut-center">
                  <span class="donut-label">Successful</span>
                  <strong>{{ successfulExecutionRate }}</strong>
                </div>
              </div>
            </div>

            <div class="distribution-breakdown">
              <div class="distribution-item success">
                <span class="distribution-key">Successful</span>
                <span class="distribution-value">{{ successfulExecutions }}</span>
              </div>
              <div class="distribution-item danger">
                <span class="distribution-key">Failed</span>
                <span class="distribution-value">{{ failedExecutions }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section class="accordion-card">
        <button class="accordion-toggle" type="button" (click)="toggleRecentActivities()" [attr.aria-expanded]="isRecentActivitiesOpen">
          <div class="accordion-copy">
            <div class="accordion-heading">
              <h3 class="section-title">Recent Activities</h3>
              <span class="accordion-badge neutral">{{ recentActivities.length }} items</span>
            </div>
            <p class="section-description">
              Review the latest operational signals flowing through test automation, security, and release execution.
            </p>
          </div>

          <svg class="accordion-chevron" [class.open]="isRecentActivitiesOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <div class="accordion-body" *ngIf="isRecentActivitiesOpen">
          <div class="table-responsive">
            <app-data-grid
              [data]="recentActivities"
              [columns]="recentActivityColumns"
              [pageSize]="5"
            >
            </app-data-grid>
          </div>
        </div>
      </section>

      <section class="accordion-card">
        <button class="accordion-toggle" type="button" (click)="toggleCriticalFailures()" [attr.aria-expanded]="isCriticalFailuresOpen">
          <div class="accordion-copy">
            <div class="accordion-heading">
              <h3 class="section-title">Critical Failures</h3>
              <span class="accordion-badge danger">{{ criticalFailures.length }} active</span>
            </div>
            <p class="section-description">
              Focus on the highest-impact failures and open the action panel to inspect each issue in more detail.
            </p>
          </div>

          <svg class="accordion-chevron" [class.open]="isCriticalFailuresOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <div class="accordion-body" *ngIf="isCriticalFailuresOpen">
          <div class="table-responsive">
            <app-data-grid
              [data]="criticalFailures"
              [columns]="criticalFailureColumns"
              [pageSize]="5"
              (actionClick)="handleCriticalFailureAction($event)"
            >
            </app-data-grid>
          </div>
        </div>
      </section>
    </div>

    <app-dynamic-form-modal
      [isVisible]="isCriticalFailureModalOpen"
      [mode]="'view'"
      [titleView]="'Critical Failure Details'"
      [fields]="criticalFailureFields"
      [formData]="selectedCriticalFailureDetails"
      (close)="closeCriticalFailureModal()"
    >
    </app-dynamic-form-modal>
  `,
  styles: [`
    .dashboard-content {
      animation: fadeIn 0.4s ease-out;
    }

    .breadcrumb {
      margin-bottom: 1.5rem;
    }

    .breadcrumb ol {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .breadcrumb a {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .breadcrumb a:hover {
      color: var(--accent-color);
    }

    .breadcrumb .separator {
      color: var(--text-secondary);
      opacity: 0.5;
    }

    .breadcrumb .current {
      color: var(--text-primary);
      font-weight: 500;
    }

    .header-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    }

    .header-left .header-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.25rem;
      color: var(--text-primary);
    }

    .header-left .header-subtitle {
      font-size: 0.95rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.5;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .build-selector {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .build-selector label {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .custom-select {
      position: relative;
      min-width: 200px;
    }

    .select-btn {
      width: 100%;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.6rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
    }

    .select-btn:hover,
    .custom-select.open .select-btn {
      border-color: var(--accent-color);
    }

    .custom-select.open .select-btn {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .select-icon {
      width: 16px;
      height: 16px;
      color: var(--text-secondary);
      transition: transform 0.3s ease;
    }

    .select-icon.rotated {
      transform: rotate(180deg);
      color: var(--accent-color);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      width: 100%;
      background: var(--card-bg, var(--bg-primary, #fff));
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.12);
      z-index: 100;
      overflow: hidden;
      animation: dropdownFade 0.2s ease forwards;
      display: flex;
      flex-direction: column;
    }

    .dropdown-search {
      padding: 0.5rem;
      border-bottom: 1px solid var(--border-color);
      background: inherit;
    }

    .dropdown-search input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }

    .dropdown-search input:focus {
      border-color: var(--accent-color);
    }

    .dropdown-items {
      max-height: 250px;
      overflow-y: auto;
    }

    .dropdown-items::-webkit-scrollbar {
      width: 4px;
    }

    .dropdown-items::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 4px;
    }

    .dropdown-item {
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.2s ease;
    }

    .dropdown-item:hover,
    .dropdown-item.active {
      background: rgba(59, 130, 246, 0.05);
      color: var(--accent-color);
    }

    .dropdown-item.active {
      font-weight: 600;
    }

    .empty-state {
      color: var(--text-secondary);
      font-style: italic;
      justify-content: center;
      cursor: default;
    }

    .empty-state:hover {
      background: inherit;
      color: var(--text-secondary);
    }

    .check-icon {
      width: 16px;
      height: 16px;
      color: var(--accent-color);
    }

    .btn-refresh {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      width: 38px;
      height: 38px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-refresh:hover {
      color: var(--accent-color);
      border-color: var(--accent-color);
      background: rgba(59, 130, 246, 0.05);
    }

    .btn-refresh svg {
      width: 20px;
      height: 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      min-height: 178px;
      box-shadow: 0 4px 15px rgba(15, 23, 42, 0.03);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: transparent;
      transition: background 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
    }

    .stat-card:nth-child(1):hover::before { background: linear-gradient(90deg, #10b981, #34d399); }
    .stat-card:nth-child(2):hover::before { background: linear-gradient(90deg, #2563eb, #60a5fa); }
    .stat-card:nth-child(3):hover::before { background: linear-gradient(90deg, #ef4444, #f87171); }
    .stat-card:nth-child(4):hover::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      margin-bottom: 1rem;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
    }

    .stat-card:hover .stat-icon {
      transform: scale(1.08);
    }

    .stat-icon svg {
      width: 22px;
      height: 22px;
    }

    .success-icon {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.12);
    }

    .info-icon {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(37, 99, 235, 0.05));
      color: #2563eb;
      border: 1px solid rgba(37, 99, 235, 0.12);
    }

    .danger-icon {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.12);
    }

    .timer-icon {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.12);
    }

    .stat-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin: 0;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 0.75rem;
      line-height: 1;
      letter-spacing: -0.02em;
    }

    .stat-footer {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.85rem;
      margin-top: auto;
    }

    .footer-text {
      color: var(--text-secondary);
    }

    .trend {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      font-weight: 600;
    }

    .trend svg {
      width: 14px;
      height: 14px;
    }

    .trend.up {
      color: #10b981;
    }

    .trend.down {
      color: #ef4444;
    }

    @keyframes dropdownFade {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .charts-row {
      display: grid;
      grid-template-columns: 1fr minmax(0, 340px);
      gap: 1.25rem;
      margin-bottom: 1.5rem;
      min-width: 0;
    }

    .chart-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 0.75rem;
      padding: 1.5rem;
      min-width: 0;
      overflow: hidden;
    }

    .distribution-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      padding-top: 0.5rem;
    }

    .distribution-visual {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .donut-chart {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      position: relative;
      flex-shrink: 0;
    }

    .donut-center {
      position: absolute;
      inset: 28px;
      background: var(--card-bg);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }

    .donut-label {
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-secondary);
    }

    .donut-center strong {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
    }

    .distribution-breakdown {
      display: flex;
      flex-direction: row;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
      margin-top: 1rem;
    }

    .distribution-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      border-radius: 999px;
      padding: 0.4rem 1.80rem;
      min-width: 100px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .distribution-item:hover {
      transform: translateY(-2px);
    }

    .distribution-item.success {
      background: rgba(16, 185, 129, 0.08);
      border: 1.5px solid rgba(16, 185, 129, 0.25);
    }

    .distribution-item.success:hover {
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
    }

    .distribution-item.danger {
      background: rgba(239, 68, 68, 0.07);
      border: 1.5px solid rgba(239, 68, 68, 0.22);
    }

    .distribution-item.danger:hover {
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.13);
    }

    .distribution-key {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.68rem;
      color: var(--text-secondary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .distribution-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }

    .distribution-item.success .distribution-value { color: #10b981; }
    .distribution-item.danger  .distribution-value { color: #ef4444; }

    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .charts-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .trend-chart-shell {
        grid-template-columns: 1fr;
      }

      .y-axis {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .header-card {
        flex-direction: column;
        align-items: stretch;
        padding: 1.25rem;
      }

      .header-right {
        width: 100%;
        justify-content: space-between;
        flex-wrap: wrap;
      }

      .build-selector {
        width: 100%;
        justify-content: space-between;
      }

      .custom-select {
        flex: 1;
        min-width: 0;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .chart-card {
        padding: 1.25rem;
      }

      .chart-summary {
        flex-direction: column;
      }

      .accordion-toggle {
        padding: 1rem 1.25rem;
      }

      .accordion-body {
        padding: 0 1.25rem 1.25rem;
      }
    }
  `]
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