import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule, FilterService, BaseFilterCellComponent } from '@progress/kendo-angular-grid';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';

export interface User {
  id: string;
  username: string;
  email: string;
  accessGroup: string[];
  status: 'Active' | 'Inactive' | 'Locked';
  createdDate: Date;
}

import { DateRangeFilterComponent } from '../../../common/grid/date-range-filter/date-range-filter';

import { DataGridComponent, GridColumn } from '../../../common/grid/data-grid/data-grid';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, DataGridComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  pageSize = 10;
  
  gridColumns: GridColumn[] = [
    { field: 'actions', title: 'Actions', width: 150, type: 'actions' },
    { field: 'username', title: 'Username', width: 200 },
    { field: 'email', title: 'Email', width: 250 },
    { field: 'accessGroup', title: 'Access Group', width: 280, type: 'array' },
    { field: 'status', title: 'Status', width: 150, type: 'status' },
    { field: 'createdDate', title: 'Created Date', width: 200, type: 'date', format: '{0:MMM d, yyyy}' }
  ];

  ngOnInit(): void {
    const rawData = [
      { id: '1', username: 'jsmith', email: 'john.smith@trackwizz.com', accessGroup: ['System Admin', 'Reviewer'], status: 'Active', createdDate: '2023-11-10' },
      { id: '2', username: 'mroberts', email: 'mary.roberts@trackwizz.com', accessGroup: ['Auditor'], status: 'Active', createdDate: '2023-11-12' },
      { id: '3', username: 'djones', email: 'david.jones@trackwizz.com', accessGroup: ['Compliance Officer', 'Data Entry'], status: 'Inactive', createdDate: '2023-12-05' },
      { id: '4', username: 'swilliams', email: 's.williams@trackwizz.com', accessGroup: ['Risk Analyst'], status: 'Active', createdDate: '2024-01-18' },
      { id: '5', username: 'pchen', email: 'peter.chen@trackwizz.com', accessGroup: ['Reviewer', 'Auditor'], status: 'Locked', createdDate: '2024-01-20' },
      { id: '6', username: 'lgarcia', email: 'laura.garcia@trackwizz.com', accessGroup: ['Compliance Officer'], status: 'Active', createdDate: '2024-02-14' },
      { id: '7', username: 'rlee', email: 'robert.lee@trackwizz.com', accessGroup: ['Data Entry'], status: 'Active', createdDate: '2024-02-28' },
      { id: '8', username: 'kbrown', email: 'karen.brown@trackwizz.com', accessGroup: ['System Admin', 'Risk Analyst', 'Compliance Officer'], status: 'Active', createdDate: '2024-03-05' },
    ];
    this.users = rawData.map(u => ({ ...u, createdDate: new Date(u.createdDate), status: u.status as 'Active' | 'Inactive' | 'Locked' }));
  }

  handleAction(event: {action: string, item: any}): void {
    console.log(`Action: ${event.action}`, event.item);
  }
}

