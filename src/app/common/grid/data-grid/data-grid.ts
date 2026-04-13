import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule, PageChangeEvent } from '@progress/kendo-angular-grid';
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
  
  @Output() actionClick = new EventEmitter<{action: string, item: any}>();

  public skip = 0;

  public pageChange(event: PageChangeEvent): void {
      this.skip = event.skip;
  }
}
