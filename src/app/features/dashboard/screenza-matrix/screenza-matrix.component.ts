import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataGridComponent, GridColumn } from '../../../shared/components/grid/data-grid/data-grid';
import { ScreenzaFeature, ScreenzaaApiService } from '../../../core/services/screenzaa-api.service';

type FeatureLifecycleStatus = 'DONE / LIVE' | 'CODE REVIEW' | 'IN PROGRESS' | 'BLOCKED' | 'NA';
type MatrixFilter = 'ALL' | FeatureLifecycleStatus;

@Component({
  selector: 'app-screenza-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule, DataGridComponent],
  templateUrl: './screenza-matrix.component.html',
  styleUrl: './screenza-matrix.component.css',
})
export class ScreenzaMatrixComponent implements OnInit {
  private readonly screenzaaApi = inject(ScreenzaaApiService);

  readonly statusOptions: MatrixFilter[] = ['ALL', 'DONE / LIVE', 'CODE REVIEW', 'IN PROGRESS', 'BLOCKED', 'NA'];

  readonly gridColumns: GridColumn[] = [
    { field: 'actions', title: 'Actions', width: 120, type: 'actions' },
    { field: 'links', title: 'Links', width: 140, type: 'link' },
    { field: 'id', title: 'ID', width: 95 },
    { field: 'featureName', title: 'Feature Name', width: 320 },
    { field: 'team', title: 'Team', width: 180 },
    { field: 'status', title: 'Status', width: 165, type: 'status' },
    { field: 'responsible', title: 'Responsible', width: 185 },
    { field: 'month', title: 'Month', width: 130 },
  ];
  readonly pageSize = 10;

  records: ScreenzaFeature[] = [];

  searchTerm = '';
  selectedFilter: MatrixFilter = 'ALL';
  displayedRecords: ScreenzaFeature[] = [];

  ngOnInit(): void {
    this.refreshData();
  }

  get totalFeatures(): number {
    return this.records.length;
  }

  get liveAndDoneCount(): number {
    return this.records.filter((record) => record.status === 'DONE / LIVE').length;
  }

  get inProgressCount(): number {
    return this.records.filter((record) => record.status === 'IN PROGRESS' || record.status === 'CODE REVIEW').length;
  }

  get blockedFailedCount(): number {
    return this.records.filter((record) => record.status === 'BLOCKED').length;
  }

  get isStatusFilterActive(): boolean {
    return this.selectedFilter !== 'ALL';
  }

  get liveDoneRate(): number {
    return this.toPercent(this.liveAndDoneCount);
  }

  get progressRate(): number {
    return this.toPercent(this.inProgressCount);
  }

  get blockedRate(): number {
    return this.toPercent(this.blockedFailedCount);
  }

  get otherCount(): number {
    return Math.max(this.totalFeatures - this.liveAndDoneCount - this.inProgressCount - this.blockedFailedCount, 0);
  }

  refreshData(): void {
    this.screenzaaApi.getFeatures().subscribe((records) => {
      this.records = records;
      this.applyStatusFilter();
    });
  }

  onStatusFilterChange(): void {
    this.applyStatusFilter();
  }

  handleGridAction(event: { action: string; item: ScreenzaFeature }): void {
    console.log(`Feature grid action: ${event.action}`, event.item);
  }

  importData(): void {
    // Reserved for backend import integration.
    console.log('Import Data action clicked.');
  }

  addFeature(): void {
    // Reserved for feature create flow integration.
    console.log('Add Feature action clicked.');
  }

  openAnalytics(): void {
    // Reserved for analytics drilldown integration.
    console.log('Analytics action clicked.');
  }

  toggleBlockedFilter(): void {
    this.selectedFilter = this.selectedFilter === 'BLOCKED' ? 'ALL' : 'BLOCKED';
    this.applyStatusFilter();
  }

  private toPercent(value: number): number {
    if (this.totalFeatures === 0) {
      return 0;
    }
    return Math.round((value / this.totalFeatures) * 100);
  }

  private applyStatusFilter(): void {
    this.displayedRecords = this.records.filter(
      (record) => this.selectedFilter === 'ALL' || record.status === this.selectedFilter
    );
  }
}
