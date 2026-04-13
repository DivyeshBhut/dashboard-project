import { Component, Input, ViewChild, ElementRef, HostListener, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterService, BaseFilterCellComponent } from '@progress/kendo-angular-grid';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';

@Component({
  selector: 'app-date-range-filter',
  standalone: true,
  imports: [CommonModule, DateInputsModule],
  styles: [`
    .range-picker-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.4rem 0.75rem;
      background-color: var(--input-bg, #ffffff);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 4px;
      color: var(--text-secondary, #6b7280);
      font-size: 0.8125rem;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    .range-picker-trigger:hover {
      border-color: #9ca3af;
      color: var(--text-primary, #111827);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .range-picker-trigger:focus {
      outline: none;
      border-color: var(--primary-color, #3b82f6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    .range-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }
    .range-icon {
      width: 1.1rem;
      height: 1.1rem;
      flex-shrink: 0;
      margin-left: 0.5rem;
      color: #9ca3af;
      transition: color 0.2s ease;
    }
    .range-picker-trigger:hover .range-icon {
      color: var(--primary-color, #3b82f6);
    }
    .clear-icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.15rem;
      border-radius: 0.25rem;
      transition: background-color 0.2s;
    }
    .clear-icon-container:hover {
      background-color: #fee2e2;
    }
    .clear-icon-container:hover .range-icon {
      color: #ef4444;
    }
  `],
  template: `
    <kendo-daterange>
      <div style="display: none;">
        <kendo-dateinput kendoDateRangeStartInput [(value)]="start" [max]="today" (valueChange)="applyNewFilter()"></kendo-dateinput>
        <kendo-dateinput kendoDateRangeEndInput [(value)]="end" [max]="today" (valueChange)="applyNewFilter(); end && popupRef?.toggle()"></kendo-dateinput>
      </div>
      <button #anchor class="range-picker-trigger" (click)="popupRef?.toggle()" type="button">
          <span class="range-text">{{ formatRange() }}</span>
          
          <div style="display: flex; align-items: center;">
            <svg *ngIf="!start && !end" class="range-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            
            <div *ngIf="start || end" class="clear-icon-container" title="Clear filter" (click)="clearFilter($event, popupRef)">
               <svg class="range-icon" style="margin-left: 0; width: 1.25rem; height: 1.25rem;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
            </div>
          </div>
      </button>
      <kendo-daterange-popup *ngIf="anchorRef" #popup [anchor]="anchorRef">
          <ng-template kendoDateRangePopupTemplate>
              <kendo-multiviewcalendar kendoDateRangeSelection [views]="1" [max]="today"></kendo-multiviewcalendar>
          </ng-template>
      </kendo-daterange-popup>
    </kendo-daterange>
  `
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
