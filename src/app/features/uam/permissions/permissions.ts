import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataGridComponent, GridColumn } from '../../../shared/components/grid/data-grid/data-grid';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, DataGridComponent],
  templateUrl: './permissions.html',
  styleUrl: './permissions.css',
})
export class PermissionsComponent implements OnInit {
  permissionsData: any[] = [];
  pageSize = 10;
  globalSearchTerm = '';
  
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

  get filteredPermissionsData(): any[] {
    const term = this.globalSearchTerm.trim().toLowerCase();
    if (!term) {
      return this.permissionsData;
    }

    return this.permissionsData.filter((permission) => {
      const addedOn = permission.addedOn instanceof Date ? permission.addedOn.toLocaleDateString('en-US') : '';
      const updatedOn = permission.updatedOn instanceof Date ? permission.updatedOn.toLocaleDateString('en-US') : '';
      const searchableValues = [
        permission.permissionName,
        permission.addedBy,
        permission.updatedBy,
        addedOn,
        updatedOn
      ];

      return searchableValues.some((value) => String(value).toLowerCase().includes(term));
    });
  }

  handleAction(event: {action: string, item: any}): void {
    console.log(`Permissions Action Triggered: ${event.action}`, event.item);
  }

  onRefreshGrid(): void {
    this.ngOnInit();
  }

  onAddPermission(): void {
    console.log('Add Permission requested');
  }

  onExportGrid(): void {
    console.log('Export Permissions requested');
  }
}
