import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule, PageChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { DateRangeFilterComponent } from '../date-range-filter/date-range-filter';

export interface GridColumn {
  field: string;
  title: string;
  width?: number;
  type?: 'text' | 'date' | 'status' | 'array' | 'actions';
  format?: string;
}

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule, GridModule, DateRangeFilterComponent],
  templateUrl: './data-grid.html',
  styleUrl: './data-grid.css',
})
export class DataGridComponent {
  @Input() data: any[] = [];
  @Input() columns: GridColumn[] = [];
  @Input() pageSize: number = 10;
  @Input() pageable: boolean = true;
  @Input() sortable: boolean = true;
  @Input() filterable: boolean = true;
  @Input() showToolbarActions: boolean = true;
  @Input() showRefreshAction: boolean = true;
  @Input() showAddAction: boolean = true;
  @Input() showExportAction: boolean = true;
  @Input() addActionLabel: string = 'Add';
  @Input() exportActionLabel: string = 'Export Data';
  @Input() totalRecords: number = 0;
  
  @Output() actionClick = new EventEmitter<{action: string, item: any}>();
  @Output() refreshClick = new EventEmitter<void>();
  @Output() addClick = new EventEmitter<void>();
  @Output() exportClick = new EventEmitter<void>();

  public skip = 0;
  public gridData: GridDataResult;
  public dropdownOpen: boolean = false;
  public pageSizes: number[] = [10, 25, 50, 100];

  constructor() {
    this.gridData = {
      data: [],
      total: 0
    };
  }

  ngOnInit() {
    this.updateGridData();
  }

  ngOnChanges() {
    this.updateGridData();
  }

  private updateGridData(): void {
    this.gridData = {
      data: this.data,
      total: this.totalRecords || this.data.length
    };
  }

  public pageChange(event: PageChangeEvent): void {
      this.skip = event.skip;
  }

  public get currentPage(): number {
    return Math.floor(this.skip / this.pageSize) + 1;
  }

  public get totalPages(): number {
    return Math.ceil(this.gridData.total / this.pageSize);
  }

  public get startRecord(): number {
    return this.gridData.total === 0 ? 0 : this.skip + 1;
  }

  public get endRecord(): number {
    const end = this.skip + this.pageSize;
    return end > this.gridData.total ? this.gridData.total : end;
  }

  public get paginationInfo(): string {
    if (this.gridData.total === 0) {
      return 'No records found';
    }
    return `Showing ${this.startRecord}-${this.endRecord} of ${this.gridData.total} records`;
  }

  public goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.skip = Math.max(0, (this.currentPage - 2) * this.pageSize);
    }
  }

  public goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.skip = this.currentPage * this.pageSize;
    }
  }

  public onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value, 10);
    this.skip = 0;
  }

  public toggleDropdown(event: Event, dropdownElement: HTMLElement): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  public selectPageSize(size: number, dropdownElement: HTMLElement): void {
    this.pageSize = size;
    this.skip = 0;
    this.dropdownOpen = false;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.dropdownOpen = false;
    }
  }
}
