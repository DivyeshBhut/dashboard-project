import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-content">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <ol>
          <li><a href="#">Dashboard</a></li>
          <li class="separator">/</li>
          <li class="current">Pipeline Intelligence</li>
        </ol>
      </nav>

      <!-- Intelligence Header Card -->
      <div class="header-card">
        <div class="header-left">
          <h1 class="header-title">Pipeline Intelligence</h1>
          <p class="header-subtitle">Real Time Test Automation Insights</p>
        </div>
        
        <div class="header-right">
          <div class="build-selector">
            <label>Build</label>
            <div class="custom-select" [class.open]="isBuildDropdownOpen">
              <button class="select-btn" (click)="toggleBuildDropdown($event)">
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
                  <div class="dropdown-item" 
                       *ngFor="let build of filteredBuilds" 
                       [class.active]="build === selectedBuild"
                       (click)="selectBuild(build)">
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
          
          <button class="btn-refresh" aria-label="Refresh Data">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- KPI Stats Grid -->
      <div class="stats-grid">
        <!-- 1st Card: Success Rate -->
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

        <!-- 2nd Card: Total Runs -->
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

        <!-- 3rd Card: Failure -->
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

        <!-- 4th Card: Avg Duration -->
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

      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Execution Trends Line Chart -->
        <div class="chart-card trend-card">
          <div class="card-header trend-header">
            <div>
              <h3 class="card-title">Execution Trends</h3>
              <p class="card-subtitle">Daily pipeline performance overview</p>
            </div>
            <div class="trend-tabs">
              <button class="trend-tab" [class.active]="activeTrendTab === 'week'" (click)="setTrendTab('week')">Week</button>
              <button class="trend-tab" [class.active]="activeTrendTab === 'month'" (click)="setTrendTab('month')">Month</button>
            </div>
          </div>
          <div class="trend-container html-chart">
            <!-- Subtle Grid lines -->
            <div class="grid-lines-bg">
              <div class="grid-line"></div>
              <div class="grid-line"></div>
              <div class="grid-line"></div>
              <div class="grid-line"></div>
            </div>
            
            <div class="html-bars-row">
              <div class="html-bar-group">
                <div class="html-bar-track">
                  <div class="html-bar" style="height: 45%;">
                    <div class="html-tooltip">100</div>
                  </div>
                </div>
                <div class="html-date">04/01</div>
              </div>
              <div class="html-bar-group">
                <div class="html-bar-track">
                  <div class="html-bar" style="height: 63%;">
                    <div class="html-tooltip">140</div>
                  </div>
                </div>
                <div class="html-date">04/02</div>
              </div>
              <div class="html-bar-group">
                <div class="html-bar-track">
                  <div class="html-bar" style="height: 31%;">
                    <div class="html-tooltip">70</div>
                  </div>
                </div>
                <div class="html-date">04/03</div>
              </div>
              <div class="html-bar-group">
                <div class="html-bar-track">
                  <div class="html-bar" style="height: 77%;">
                    <div class="html-tooltip">170</div>
                  </div>
                </div>
                <div class="html-date">04/04</div>
              </div>
              <div class="html-bar-group">
                <div class="html-bar-track">
                  <div class="html-bar" style="height: 54%;">
                    <div class="html-tooltip">120</div>
                  </div>
                </div>
                <div class="html-date">04/05</div>
              </div>
              <div class="html-bar-group">
                <div class="html-bar-track">
                  <div class="html-bar" style="height: 40%;">
                    <div class="html-tooltip">90</div>
                  </div>
                </div>
                <div class="html-date">04/06</div>
              </div>
              <div class="html-bar-group">
                <div class="html-bar-track">
                  <div class="html-bar active-bar" style="height: 81%;">
                    <div class="html-tooltip">180</div>
                  </div>
                </div>
                <div class="html-date active-day">04/07</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modern Build Status Gauge Chart -->
        <div class="chart-card gauge-card">
          <div class="card-header gauge-header">
            <div>
              <h3 class="card-title">Success Target</h3>
              <p class="card-subtitle">Target metrics set for this week</p>
            </div>
            <button class="options-btn">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </button>
          </div>
          
          <div class="gauge-container">
            <svg viewBox="0 0 120 120" class="gauge-svg">
              <!-- Bright Red Base Track (Failed Portion) -->
              <circle cx="60" cy="60" r="50" fill="none" stroke="#ef4444" stroke-width="10" />
              <!-- Bright Green Value Track (Passed Portion) -->
              <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" stroke-width="10" stroke-linecap="round" pathLength="100" stroke-dasharray="85 100" transform="rotate(-90 60 60)" />
            </svg>
            <div class="gauge-center">
              <span class="gauge-value">85%</span>
            </div>
          </div>
          
          <div class="gauge-context">
            <p><strong>Great job!</strong> Execution success rate is tracking <span class="text-success">+2.1%</span> better than last week.</p>
          </div>
          
          <div class="gauge-footer-modern">
            <div class="gauge-stat">
              <span class="stat-label">Target</span>
              <span class="stat-val">90% <span class="trend down text-danger">↓</span></span>
            </div>
            <div class="gauge-divider"></div>
            <div class="gauge-stat">
              <span class="stat-label">Passed</span>
              <span class="stat-val">83 <span class="trend up text-success">↑</span></span>
            </div>
            <div class="gauge-divider"></div>
            <div class="gauge-stat">
              <span class="stat-label">Failed</span>
              <span class="stat-val">15 <span class="trend down text-danger">↓</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-content {
      animation: fadeIn 0.4s ease-out;
    }
    
    /* Breadcrumb */
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
      transition: color 0.2s;
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

    /* Header Card */
    .header-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .header-left .header-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
      color: var(--text-primary);
    }
    .header-left .header-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
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
    
    /* Custom Modern Dropdown */
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
      transition: all 0.2s;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    .select-btn:hover, .custom-select.open .select-btn {
      border-color: var(--accent-color);
      background: var(--bg-primary);
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
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
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
      z-index: 2;
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
      transition: border-color 0.2s;
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
    .dropdown-item {
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .dropdown-item:hover {
      background: rgba(59, 130, 246, 0.05);
      color: var(--accent-color);
    }
    .dropdown-item.active {
      color: var(--accent-color);
      background: rgba(59, 130, 246, 0.05);
      font-weight: 600;
    }
    .check-icon {
      width: 16px;
      height: 16px;
      color: var(--accent-color);
    }

    @keyframes dropdownFade {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .btn-refresh {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      width: 38px;
      height: 38px;
      border-radius: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-refresh:hover {
      color: var(--accent-color);
      border-color: var(--accent-color);
      background: rgba(59, 130, 246, 0.05);
    }
    .btn-refresh:active svg {
      transform: rotate(180deg);
      transition: transform 0.3s;
    }
    .btn-refresh svg {
      width: 20px;
      height: 20px;
      transition: transform 0.3s;
    }

    /* KPI Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 1.25rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 15px rgba(0,0,0,0.02);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 3px;
      background: transparent;
      transition: background 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08), 0 8px 10px rgba(0, 0, 0, 0.04);
      border-color: rgba(0, 0, 0, 0.08);
    }
    
    .stat-card:nth-child(1):hover::before { background: linear-gradient(90deg, #10b981, #34d399); }
    .stat-card:nth-child(2):hover::before { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
    .stat-card:nth-child(3):hover::before { background: linear-gradient(90deg, #ef4444, #f87171); }
    .stat-card:nth-child(4):hover::before { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .stat-card:hover .stat-icon {
      transform: scale(1.15) rotate(5deg);
    }

    .stat-icon svg {
      width: 24px;
      height: 24px;
    }
    .success-icon {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.1);
    }
    .info-icon {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05));
      color: #3b82f6;
      border: 1px solid rgba(59, 130, 246, 0.1);
    }
    .danger-icon {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.1);
    }
    .timer-icon {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05));
      color: #8b5cf6;
      border: 1px solid rgba(139, 92, 246, 0.1);
    }

    .stat-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin: 0;
      letter-spacing: -0.01em;
    }

    .stat-value {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 0.75rem 0;
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
      display: flex;
      align-items: center;
      gap: 0.15rem;
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

    /* Charts Row */
    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1.2fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .chart-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      padding: 1.5rem 1.75rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02);
      display: flex;
      flex-direction: column;
    }
    .card-header {
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .card-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 0.4rem 0;
      letter-spacing: -0.02em;
    }
    .card-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin: 0;
    }
    .options-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.35rem;
      border-radius: 0.25rem;
      transition: background 0.2s;
    }
    .options-btn:hover {
      background: rgba(0,0,0,0.05);
    }
    .options-btn svg {
      width: 20px;
      height: 20px;
    }

    /* Trend Chart Top Filters */
    .trend-tabs {
      display: flex;
      background: var(--bg-secondary);
      padding: 0.25rem;
      border-radius: 0.5rem;
    }
    .trend-tab {
      background: transparent;
      border: none;
      padding: 0.4rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .trend-tab.active {
      background: var(--bg-primary);
      color: var(--accent-color);
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .trend-container.html-chart {
      width: 100%;
      flex-grow: 1;
      min-height: 260px;
      position: relative;
      margin-top: auto;
    }
    .grid-lines-bg {
      position: absolute;
      top: 5%; bottom: 40px; left: 0; right: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      pointer-events: none;
      z-index: 0;
    }
    .grid-line {
      height: 1px;
      background: var(--border-color);
      opacity: 0.4;
      width: 100%;
    }
    .html-bars-row {
      position: absolute;
      top: 0; bottom: 0; left: 0; right: 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      z-index: 1;
      padding: 0 4%;
    }
    .html-bar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      cursor: pointer;
    }
    .html-bar-track {
      flex-grow: 1;
      display: flex;
      align-items: flex-end;
      margin-bottom: 12px;
      width: 30px;
    }
    .html-bar {
      position: relative;
      width: 100%;
      background-color: var(--accent-color);
      border-radius: 4px;
      opacity: 0.5;
      transition: opacity 0.2s;
    }
    .html-tooltip {
      position: absolute;
      top: -28px;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      color: var(--text-primary);
      font-size: 15px;
      font-weight: 800;
      transition: opacity 0.2s;
      pointer-events: none;
    }
    .html-bar-group:hover .html-bar {
      opacity: 0.9 !important;
    }
    .html-bar-group:hover .html-tooltip {
      opacity: 1;
    }
    .html-bar.active-bar {
      opacity: 0.8 !important;
    }
    .html-date {
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .html-date.active-day {
      color: var(--accent-color);
      font-weight: 700;
    }

    /* Gauge Chart SCSS */
    .gauge-container {
      flex-grow: 1;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1.5rem 0 0;
    }
    .gauge-svg {
      width: 100%;
      max-width: 180px;
      overflow: visible;
    }
    .gauge-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 0.75rem;
    }
    .gauge-center .gauge-value {
      display: block;
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
      letter-spacing: -0.02em;
    }
    
    .gauge-context {
      text-align: center;
      font-size: 0.95rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin: 1.5rem 1rem;
    }



    .gauge-footer-modern {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding: 1.25rem 1.5rem;
      background: var(--bg-secondary);
      border-radius: 0.75rem;
    }
    .gauge-stat {
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .gauge-stat .stat-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }
    .gauge-stat .stat-val {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .gauge-divider {
      width: 1px;
      height: 40px;
      background: var(--border-color);
      opacity: 0.6;
    }
    .text-success { color: #10b981; }
    .text-danger { color: #ef4444; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Responsive tweaks */
    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .charts-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .header-card {
        flex-direction: column;
        align-items: flex-start;
      }
      .header-right {
        width: 100%;
        justify-content: space-between;
      }
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardHomeComponent {
  isBuildDropdownOpen = false;
  selectedBuild = 'Latest Build (#4192)';
  builds = ['Latest Build (#4192)', 'Build #4191', 'Build #4190'];
  activeTrendTab = 'week';
  searchQuery = '';

  constructor(private eRef: ElementRef) {}

  get filteredBuilds() {
    return this.builds.filter(build => build.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  onSearch(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  toggleBuildDropdown(event: Event) {
    event.stopPropagation();
    this.isBuildDropdownOpen = !this.isBuildDropdownOpen;
    if (this.isBuildDropdownOpen) {
      this.searchQuery = '';
    }
  }

  selectBuild(build: string) {
    this.selectedBuild = build;
    this.isBuildDropdownOpen = false;
  }

  setTrendTab(tab: string) {
    this.activeTrendTab = tab;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if(this.isBuildDropdownOpen && !this.eRef.nativeElement.querySelector('.custom-select').contains(event.target)) {
      this.isBuildDropdownOpen = false;
    }
  }
}
