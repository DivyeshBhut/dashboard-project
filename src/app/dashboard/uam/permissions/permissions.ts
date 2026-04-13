import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGridComponent, GridColumn } from '../../../common/grid/data-grid/data-grid';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, DataGridComponent],
  templateUrl: './permissions.html',
  styleUrl: './permissions.css',
})
export class PermissionsComponent implements OnInit {
  permissionsData: any[] = [];
  pageSize = 10;
  
  gridColumns: GridColumn[] = [
    { field: 'actions', title: 'Actions', width: 120, type: 'actions' },
    { field: 'permissionName', title: 'Permission Name', width: 250 },
    { field: 'addedBy', title: 'Added By', width: 200 },
    { field: 'addedOn', title: 'Added On', width: 200, type: 'date', format: '{0:MMM d, yyyy}' },
    { field: 'updatedBy', title: 'Updated By', width: 200 },
    { field: 'updatedOn', title: 'Updated On', width: 200, type: 'date', format: '{0:MMM d, yyyy}' }
  ];

  ngOnInit(): void {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    this.permissionsData = [
      { id: 1, permissionName: 'View Dashboard', addedBy: 'Admin', addedOn: lastWeek, updatedBy: 'Admin', updatedOn: today },
      { id: 2, permissionName: 'Manage Users', addedBy: 'System', addedOn: lastWeek, updatedBy: 'John Doe', updatedOn: today },
      { id: 3, permissionName: 'Edit Groups', addedBy: 'Admin', addedOn: new Date(2023, 1, 15), updatedBy: 'Admin', updatedOn: new Date(2023, 5, 20) },
      { id: 4, permissionName: 'Delete Records', addedBy: 'Jane Smith', addedOn: new Date(2023, 2, 10), updatedBy: 'System', updatedOn: new Date(2023, 8, 5) },
      { id: 5, permissionName: 'Export Data', addedBy: 'Admin', addedOn: new Date(2023, 0, 5), updatedBy: 'Admin', updatedOn: today }
    ];
  }

  handleAction(event: {action: string, item: any}): void {
    console.log(`Permissions Action Triggered: ${event.action}`, event.item);
  }
}
