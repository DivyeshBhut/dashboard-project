import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGridComponent, GridColumn } from '../../../common/grid/data-grid/data-grid';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, DataGridComponent],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class GroupsComponent implements OnInit {
  groupsData: any[] = [];
  pageSize = 10;
  
  gridColumns: GridColumn[] = [
    { field: 'actions', title: 'Actions', width: 120, type: 'actions' },
    { field: 'groupName', title: 'Group Name', width: 220 },
    { field: 'description', title: 'Description', width: 300 },
    { field: 'permissions', title: 'Permissions', width: 350, type: 'array' },
    { field: 'status', title: 'Status', width: 150, type: 'status' }
  ];

  ngOnInit(): void {
    this.groupsData = [
      { id: 1, groupName: 'System Administrators', description: 'Full access to all system features', permissions: ['Manage Users', 'Manage Rules', 'System Config'], status: 'Active' },
      { id: 2, groupName: 'Compliance Officers', description: 'Access to audit logs and alerts', permissions: ['View Audit', 'Action Alerts'], status: 'Active' },
      { id: 3, groupName: 'Data Entry Specialists', description: 'Restricted input-only access', permissions: ['Create Records', 'View Queue'], status: 'Locked' },
      { id: 4, groupName: 'Read-Only Auditors', description: 'External audit access', permissions: ['View Reports', 'Export Data'], status: 'Active' },
      { id: 5, groupName: 'Legacy API Clients', description: 'Decommissioned integration group', permissions: ['API Access'], status: 'Inactive' }
    ];
  }

  handleAction(event: {action: string, item: any}): void {
    console.log(`Groups Action Triggered: ${event.action}`, event.item);
  }
}
