import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule, PageChangeEvent, GridDataResult, ColumnResizeArgs } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, process, SortDescriptor } from '@progress/kendo-data-query';
import { DateRangeFilterComponent } from '../date-range-filter/date-range-filter';
import * as XLSX from 'xlsx';

export interface GridColumn {
  field: string;
  title: string;
  width?: number;
  type?: 'text' | 'date' | 'status' | 'array' | 'actions' | 'link';
  format?: string;
  allowedActions?: ('view' | 'edit' | 'delete')[];
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
  @Input() globalSearchTerm: string = '';
  @Input() showToolbarActions: boolean = true;
  @Input() showRefreshAction: boolean = true;
  @Input() showAddAction: boolean = true;
  @Input() showExportAction: boolean = true;
  @Input() addActionLabel: string = 'Add';
  @Input() exportActionLabel: string = 'Export Data';
  @Input() loading: boolean = false;
  @Input() loadingMessage: string = 'Loading records...';
  @Input() emptyMessage: string = 'No records found';
  @Input() totalRecords: number = 0;

  @Output() actionClick = new EventEmitter<{ action: string, item: any }>();
  @Output() refreshClick = new EventEmitter<void>();
  @Output() addClick = new EventEmitter<void>();
  @Output() exportClick = new EventEmitter<void>();

  public skip = 0;
  public gridData: GridDataResult;
  public dropdownOpen: boolean = false;
  public pageSizes: number[] = [10, 25, 50, 100];
  public sort: SortDescriptor[] = [];
  public filter: CompositeFilterDescriptor = { logic: 'and', filters: [] };

  constructor() {
    this.gridData = {
      data: [],
      total: 0
    };
  }

  public expandedRows = new Set<string>();

  public toggleArrayExpand(dataItem: any, colField: string, rowIndex: number): void {
    const key = `${dataItem.id || rowIndex}_${colField}`;
    if (this.expandedRows.has(key)) {
      this.expandedRows.delete(key);
    } else {
      this.expandedRows.add(key);
    }
  }

  public isArrayExpanded(dataItem: any, colField: string, rowIndex: number): boolean {
    return this.expandedRows.has(`${dataItem.id || rowIndex}_${colField}`);
  }

  ngOnInit() {
    this.skip = 0;
    this.updateGridData();
  }

  ngOnChanges() {
    this.skip = 0;
    this.updateGridData();
  }

  private updateGridData(): void {
    const filteredData = this.applyGlobalSearch(this.data);
    const processedAll = process(filteredData, {
      sort: this.sort,
      filter: this.filter,
    });
    const total = this.totalRecords || processedAll.total;

    if (this.skip >= total) {
      this.skip = 0;
    }

    const processedPage = process(filteredData, {
      skip: this.skip,
      take: this.pageSize,
      sort: this.sort,
      filter: this.filter,
    });

    this.gridData = {
      data: processedPage.data,
      total
    };
  }

  private applyGlobalSearch(rows: any[]): any[] {
    const term = this.globalSearchTerm.trim().toLowerCase();

    if (!term) {
      return rows;
    }

    const searchableColumns = this.columns.filter((column) => column.type !== 'actions');

    return rows.filter((row) =>
      searchableColumns.some((column) => {
        const value = row?.[column.field];

        if (Array.isArray(value)) {
          return value.join(' ').toLowerCase().includes(term);
        }

        if (value instanceof Date) {
          return value.toLocaleDateString('en-US').toLowerCase().includes(term);
        }

        return String(value ?? '').toLowerCase().includes(term);
      })
    );
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.updateGridData();
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
      this.updateGridData();
    }
  }

  public goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.skip = this.currentPage * this.pageSize;
      this.updateGridData();
    }
  }

  public onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value, 10);
    this.skip = 0;
    this.updateGridData();
  }

  public toggleDropdown(event: Event, dropdownElement: HTMLElement): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  public selectPageSize(size: number, dropdownElement: HTMLElement): void {
    this.pageSize = size;
    this.skip = 0;
    this.dropdownOpen = false;
    this.updateGridData();
  }

  public onSortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.skip = 0;
    this.updateGridData();
  }

  public onFilterChange(filter: CompositeFilterDescriptor): void {
    this.filter = filter;
    this.skip = 0;
    this.updateGridData();
  }

  /**
   * Handles column resize — updates the column width in the columns array
   * so the new size persists across re-renders (e.g. after page change).
   */
  public onColumnResize(resizeArgs: ColumnResizeArgs[]): void {
    resizeArgs.forEach((arg) => {
      const col = this.columns.find((c) => c.field === (arg.column as any).field);
      if (col) {
        col.width = arg.newWidth;
      }
    });
  }

  public onRefreshButtonClick(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement | null;
    const icon = button?.querySelector('svg');

    icon?.animate(
      [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(180deg)' },
        { transform: 'rotate(0deg)' },
      ],
      {
        duration: 460,
        easing: 'ease-in-out',
      }
    );

    this.refreshClick.emit();
  }

  public exportToExcel(): void {
    // Get all filtered+sorted data (not just current page)
    const filteredData = this.applyGlobalSearch(this.data);
    const processedAll = process(filteredData, {
      sort: this.sort,
      filter: this.filter,
    });

    const exportableColumns = this.columns.filter((col) => col.type !== 'actions');

    // Build rows
    const rows = processedAll.data.map((item) => {
      const row: Record<string, any> = {};
      exportableColumns.forEach((col) => {
        const value = item[col.field];
        if (value instanceof Date) {
          row[col.title] = value.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit',
          });
        } else if (Array.isArray(value)) {
          row[col.title] = value.join(', ');
        } else if (typeof value === 'boolean') {
          row[col.title] = value ? 'Active' : 'Inactive';
        } else {
          row[col.title] = value ?? '';
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto column widths
    const colWidths = exportableColumns.map((col) => ({
      wch: Math.max(
        col.title.length,
        ...rows.map((row) => String(row[col.title] ?? '').length)
      ) + 2,
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `export_${timestamp}.xlsx`);

    // Also emit so parent can hook in if needed
    this.exportClick.emit();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.modern-dropdown')) {
      this.dropdownOpen = false;
    }
  }

  public getArrayValue(value: any): string[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map(v => v.trim()).filter(Boolean);
    }
    return [];
  }
  public getStatusTone(value: unknown): 'success' | 'warning' | 'info' | 'danger' | 'neutral' {
    const normalized = String(value ?? '')
      .trim()
      .toUpperCase();

    if (normalized === 'ACTIVE' || normalized === 'DONE / LIVE' || normalized === 'DONE - LIVE') {
      return 'success';
    }

    if (normalized === 'CODE REVIEW' || normalized === 'LOCKED') {
      return 'warning';
    }

    if (normalized === 'IN PROGRESS') {
      return 'info';
    }

    if (normalized === 'BLOCKED' || normalized === 'FAILED' || normalized === 'INACTIVE') {
      return 'danger';
    }

    if (normalized === 'NA' || normalized === 'N/A') {
      return 'neutral';
    }

    return 'neutral';
  }
}