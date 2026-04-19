import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataGridComponent, GridColumn } from '../../../shared/components/grid/data-grid/data-grid';
import { UamApiService, UamPermission } from '../../../core/services/uam-api.service';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, DataGridComponent],
  templateUrl: './permissions.html',
  styleUrl: './permissions.css',
})
export class PermissionsComponent implements OnInit {
  permissionsData: UamPermission[] = [];
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

  constructor(private readonly uamApi: UamApiService) {}

  ngOnInit(): void {
    this.uamApi.getPermissions().subscribe((permissions) => {
      this.permissionsData = permissions;
    });
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
    this.uamApi.getPermissions().subscribe((permissions) => {
      this.permissionsData = permissions;
    });
  }

  onAddPermission(): void {
    console.log('Add Permission requested');
  }

  onExportGrid(): void {
    console.log('Export Permissions requested');
  }
}
