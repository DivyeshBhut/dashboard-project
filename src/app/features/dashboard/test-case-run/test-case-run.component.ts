import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DynamicFormModalComponent, FormField } from '../../../shared/components/dynamic-form-modal/dynamic-form-modal.component';
import { DataGridComponent, GridColumn } from '../../../shared/components/grid/data-grid/data-grid';
import { MasterApiService, TestResultItem } from '../../../core/services/master-api.service';

@Component({
  selector: 'app-test-case-run',
  standalone: true,
  imports: [CommonModule, FormsModule, DataGridComponent, DynamicFormModalComponent],
  templateUrl: './test-case-run.component.html',
  styleUrl: './test-case-run.component.css',
})
export class TestCaseRunComponent implements OnInit {
  private readonly masterApi = inject(MasterApiService);

  readonly pageSize = 10;

  activeTab: 'summary' | 'run-details' = 'summary';

  readonly gridColumns: GridColumn[] = [
    { field: 'actions', title: 'Actions', width: 140, type: 'actions' },
    { field: 'testName', title: 'Test Name', width: 250 },
    { field: 'className', title: 'Class Name', width: 260 },
    { field: 'outcome', title: 'Outcome', width: 160 },
    { field: 'durationLabel', title: 'Duration', width: 150 },
    { field: 'executedAt', title: 'Executed At', width: 220, type: 'date', format: '{0:MMM d, yyyy h:mm tt}' },
  ];

  readonly runDetailsColumns: GridColumn[] = [
    { field: 'pipelineExecutionNumber', title: 'Execution #', width: 150 },
    { field: 'releaseNumber', title: 'Release', width: 150 },
    { field: 'buildNumber', title: 'Build', width: 150 },
    { field: 'actions', title: 'Actions', width: 140, type: 'actions' },
    { field: 'testName', title: 'Test Name', width: 200 },
    { field: 'className', title: 'Class Name', width: 200 },
    { field: 'outcome', title: 'Outcome', width: 140 },
    { field: 'durationLabel', title: 'Duration', width: 140 }
  ];

  readonly detailFields: FormField[] = [
    { key: 'testName', label: 'Test Name', type: 'text' },
    { key: 'className', label: 'Class Name', type: 'text' },
    { key: 'outcome', label: 'Outcome', type: 'text' },
    { key: 'duration', label: 'Duration', type: 'text' },
    { key: 'executedAt', label: 'Executed At', type: 'text' },
    { key: 'errorDetails', label: 'Execution Details', type: 'text' },
  ];

  logs: TestResultItem[] = [];

  // Summary State
  summarySearched = false;
  summaryData: TestResultItem[] = [];
  summaryFilters = {
    buildName: '',
    trxFileName: '',
    featureName: '',
    releaseNumber: ''
  };

  // Run Details State
  runDetailsData: TestResultItem[] = [];
  runDetailsFilters = {
    releaseNumber: '',
    buildNumber: '',
    featureName: '',
    trxFileName: ''
  };

  isDetailsModalOpen = false;
  selectedLogDetails: Record<string, string> = {};

  ngOnInit(): void {
    this.masterApi.getTestResults().subscribe((logs) => {
      this.logs = logs;
      this.applySummaryFilters();
      this.applyRunDetailsFilters();
    });
  }

  setTab(tab: 'summary' | 'run-details'): void {
    this.activeTab = tab;
  }

  searchSummary(): void {
    this.summarySearched = true;
    this.applySummaryFilters();
  }

  resetSummaryFilters(): void {
    this.summarySearched = false;
    this.summaryFilters = {
      buildName: '',
      trxFileName: '',
      featureName: '',
      releaseNumber: ''
    };
    this.applySummaryFilters();
  }

  onSummaryFilterChange(): void {
    // Optionally trigger search live if it has already been searched
    if (this.summarySearched) {
      this.applySummaryFilters();
    }
  }

  onRunDetailsFilterChange(): void {
    this.applyRunDetailsFilters();
  }

  resetRunDetailsFilters(): void {
    this.runDetailsFilters = {
      releaseNumber: '',
      buildNumber: '',
      featureName: '',
      trxFileName: ''
    };
    this.applyRunDetailsFilters();
  }

  generateReport(): void {
    alert('Generating testing report based on current filters...');
  }

  private applySummaryFilters(): void {
    if (!this.summarySearched) {
      this.summaryData = [];
      return;
    }

    this.summaryData = this.logs.filter((log) => {
      const bSearch = this.summaryFilters.buildName.trim().toLowerCase();
      const tSearch = this.summaryFilters.trxFileName.trim().toLowerCase();
      const fSearch = this.summaryFilters.featureName.trim().toLowerCase();
      const rSearch = this.summaryFilters.releaseNumber.trim().toLowerCase();

      return (!bSearch || log.buildNumber?.toLowerCase().includes(bSearch)) &&
        (!tSearch || log.trxFileName?.toLowerCase().includes(tSearch)) &&
        (!fSearch || log.featureName?.toLowerCase().includes(fSearch)) &&
        (!rSearch || log.releaseNumber?.toLowerCase().includes(rSearch));
    });
  }

  private applyRunDetailsFilters(): void {
    const details = this.logs.filter((log) => {
      const bSearch = this.runDetailsFilters.buildNumber.trim().toLowerCase();
      const tSearch = this.runDetailsFilters.trxFileName.trim().toLowerCase();
      const fSearch = this.runDetailsFilters.featureName.trim().toLowerCase();
      const rSearch = this.runDetailsFilters.releaseNumber.trim().toLowerCase();

      return (!bSearch || log.buildNumber?.toLowerCase().includes(bSearch)) &&
        (!tSearch || log.trxFileName?.toLowerCase().includes(tSearch)) &&
        (!fSearch || log.featureName?.toLowerCase().includes(fSearch)) &&
        (!rSearch || log.releaseNumber?.toLowerCase().includes(rSearch));
    });

    this.runDetailsData = details.sort((a, b) => {
      return (b.pipelineExecutionNumber || 0) - (a.pipelineExecutionNumber || 0);
    });
  }

  // Stats driven from summaryData (if wanted on summary page)
  get passedCount(): number {
    return this.summaryData.filter((log) => log.outcome === 'Passed').length;
  }

  get failedCount(): number {
    return this.summaryData.filter((log) => log.outcome === 'Failed').length;
  }

  get averageDuration(): string {
    if (this.summaryData.length === 0) {
      return '0s';
    }

    const totalDuration = this.summaryData.reduce((sum, log) => sum + log.durationSeconds, 0);
    const averageSeconds = Math.round(totalDuration / this.summaryData.length);
    return this.formatDuration(averageSeconds);
  }

  get passRate(): string {
    if (this.summaryData.length === 0) {
      return '0%';
    }

    return `${Math.round((this.passedCount / this.summaryData.length) * 100)}%`;
  }

  handleAction(event: { action: string; item: TestResultItem }): void {
    this.openDetailsModal(event.item);
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedLogDetails = {};
  }

  private openDetailsModal(log: TestResultItem): void {
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