import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DynamicFormModalComponent, FormField } from '../../../shared/components/dynamic-form-modal/dynamic-form-modal.component';
import { DataGridComponent, GridColumn } from '../../../shared/components/grid/data-grid/data-grid';
import { MasterApiService, TestResultItem } from '../../../core/services/master-api.service';

type TestRunOutcome = 'Passed' | 'Failed' | 'Skipped';

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

  logs: TestResultItem[] = [];

  // Cached filtered result — avoids new array reference on every change detection cycle
  cachedFilteredLogs: TestResultItem[] = [];

  private _selectedOutcome: 'All' | TestRunOutcome = 'All';
  private _globalSearchTerm = '';

  get selectedOutcome(): 'All' | TestRunOutcome {
    return this._selectedOutcome;
  }

  set selectedOutcome(value: 'All' | TestRunOutcome) {
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

  isDetailsModalOpen = false;
  selectedLogDetails: Record<string, string> = {};

  ngOnInit(): void {
    this.masterApi.getTestResults().subscribe((logs) => {
      this.logs = logs;
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    const searchTerm = this._globalSearchTerm.trim().toLowerCase();

    this.cachedFilteredLogs = this.logs.filter((log) => {
      const matchesOutcome = this._selectedOutcome === 'All' || log.outcome === this._selectedOutcome;
      const matchesGlobalSearch =
        !searchTerm ||
        log.testName.toLowerCase().includes(searchTerm) ||
        log.className.toLowerCase().includes(searchTerm);

      return matchesOutcome && matchesGlobalSearch;
    });
  }

  get filteredLogs(): TestResultItem[] {
    return this.cachedFilteredLogs;
  }

  get passedCount(): number {
    return this.cachedFilteredLogs.filter((log) => log.outcome === 'Passed').length;
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

  get passRate(): string {
    if (this.cachedFilteredLogs.length === 0) {
      return '0%';
    }

    return `${Math.round((this.passedCount / this.cachedFilteredLogs.length) * 100)}%`;
  }

  resetFilters(): void {
    this._selectedOutcome = 'All';
    this._globalSearchTerm = '';
    this.applyFilters();
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