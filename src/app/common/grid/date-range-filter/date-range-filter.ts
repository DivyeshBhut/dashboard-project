import { Component, Input, ViewChild, ElementRef, HostListener, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterService, BaseFilterCellComponent } from '@progress/kendo-angular-grid';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';

@Component({
  selector: 'app-date-range-filter',
  standalone: true,
  imports: [CommonModule, DateInputsModule],
  templateUrl: './date-range-filter.html',
  styleUrl: './date-range-filter.css'
})
export class DateRangeFilterComponent extends BaseFilterCellComponent implements AfterViewInit {
  public start: Date | null = null;
  public end: Date | null = null;
  public today: Date = new Date();
  @Input() public field!: string;
  @ViewChild('anchor') public anchorRef!: ElementRef;
  @ViewChild('popup') public popupRef!: any;

  constructor(filterService: FilterService, private cd: ChangeDetectorRef) {
    super(filterService);
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  @HostListener('document:click', ['$event.target'])
  public documentClick(target: any): void {
      if (!this.popupRef || !this.anchorRef) return;
      if (typeof target.closest !== 'function') return;

      const clickedInsideButton = this.anchorRef.nativeElement.contains(target);
      const clickedInsidePopup = target.closest('.k-popup') || 
                                 target.closest('.k-calendar-container') || 
                                 target.closest('kendo-popup') || 
                                 target.closest('.k-animation-container');
                                 
      if (!clickedInsideButton && !clickedInsidePopup) {
          try {
              this.popupRef.toggle(false);
          } catch(e) {}
      }
  }

  public clearFilter(event: Event, popupCtrl: any): void {
      event.preventDefault();
      event.stopPropagation();
      this.start = null;
      this.end = null;
      this.applyNewFilter();
      if (popupCtrl) {
          popupCtrl.toggle(false);
      }
  }

  public formatRange(): string {
     if (!this.start && !this.end) return 'Select dates...';
     const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
     if (this.start && this.end) return `${format(this.start)} - ${format(this.end)}`;
     if (this.start) return `${format(this.start)} - ...`;
     return `... - ${format(this.end!)}`;
  }

  public applyNewFilter(): void {
    const filters: any[] = [];
    if (this.start) filters.push({ field: this.field, operator: 'gte', value: this.start });
    if (this.end) {
      const endOfDay = new Date(this.end);
      endOfDay.setHours(23, 59, 59, 999);
      filters.push({ field: this.field, operator: 'lte', value: endOfDay });
    }
    
    const root = this.filter || { logic: 'and', filters: [] };
    root.filters = this.removeFieldFilters(root.filters, this.field);

    if (filters.length > 0) {
      root.filters.push({ logic: 'and', filters: filters });
    }
    this.filterService.filter(root);
  }

  private removeFieldFilters(filters: any[], field: string): any[] {
    return filters.reduce((acc, f) => {
      if (f.filters) {
        f.filters = this.removeFieldFilters(f.filters, field);
        if (f.filters.length > 0) acc.push(f);
      } else if (f.field !== field) {
        acc.push(f);
      }
      return acc;
    }, []);
  }
}
