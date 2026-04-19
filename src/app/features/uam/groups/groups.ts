import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataGridComponent, GridColumn } from '../../../shared/components/grid/data-grid/data-grid';
import { UamApiService, UamGroup } from '../../../core/services/uam-api.service';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, DataGridComponent],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class GroupsComponent implements OnInit {
  groupsData: UamGroup[] = [];
  pageSize = 10;
  globalSearchTerm = '';
  
  gridColumns: GridColumn[] = [
    { field: 'actions', title: 'Actions', width: 120, type: 'actions'},
    { field: 'groupName', title: 'Group Name', width: 220 },
    { field: 'description', title: 'Description', width: 300 },
    { field: 'permissions', title: 'Permissions', width: 350, type: 'array' },
    { field: 'status', title: 'Status', width: 150, type: 'status' }
  ];

  constructor(private readonly uamApi: UamApiService) {}

  ngOnInit(): void {
    this.uamApi.getGroups().subscribe((groups) => {
      this.groupsData = groups;
    });
  }

  get filteredGroupsData(): any[] {
    const term = this.globalSearchTerm.trim().toLowerCase();
    if (!term) {
      return this.groupsData;
    }

    return this.groupsData.filter((group) => {
      const searchableValues = [
        group.groupName,
        group.description,
        group.status,
        ...(group.permissions ?? [])
      ];

      return searchableValues.some((value) => String(value).toLowerCase().includes(term));
    });
  }

  handleAction(event: {action: string, item: any}): void {
    console.log(`Groups Action Triggered: ${event.action}`, event.item);
  }

  onRefreshGrid(): void {
    this.uamApi.getGroups().subscribe((groups) => {
      this.groupsData = groups;
    });
  }

  onAddGroup(): void {
    console.log('Add Group requested');
  }

  onExportGrid(): void {
    console.log('Export Groups requested');
  }
}
