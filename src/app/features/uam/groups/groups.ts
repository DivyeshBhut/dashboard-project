import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataGridComponent, GridColumn } from '../../../shared/components/grid/data-grid/data-grid';
import { UamApiService, UamGroup } from '../../../core/services/uam-api.service';
import { DynamicFormModalComponent, FormField } from '../../../shared/components/dynamic-form-modal/dynamic-form-modal.component';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, DataGridComponent, DynamicFormModalComponent],
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
      this.extractAllPermissions(groups);
    });
  }

  private extractAllPermissions(groups: UamGroup[]): void {
    const permField = this.groupFormFields.find(f => f.key === 'permissions');
    if (!permField) return;

    // Start with predefined options, use Set to remove duplicates
    const allPerms = new Set<string>(permField.options || []);
    
    // Add any permissions found in the actual data
    groups.forEach(group => {
      if (group.permissions && Array.isArray(group.permissions)) {
        group.permissions.forEach(p => allPerms.add(p));
      }
    });

    permField.options = Array.from(allPerms).sort();
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
    if (event.action === 'edit') {
      this.openGroupModal(event.item, 'edit');
    } else if (event.action === 'view') {
      this.openGroupModal(event.item, 'view');
    }
    console.log(`Groups Action Triggered: ${event.action}`, event.item);
  }

  onRefreshGrid(): void {
    this.uamApi.getGroups().subscribe((groups) => {
      this.groupsData = groups;
    });
  }

  onAddGroup(): void {
    this.openGroupModal();
  }

  onExportGrid(): void {
    console.log('Export Groups requested');
  }

  isGroupModalOpen = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  currentEditGroup: any = {};

  groupFormFields: FormField[] = [
    { key: 'groupName', label: 'Group Name', type: 'text', placeholder: 'e.g. Administrators' },
    { key: 'description', label: 'Description', type: 'text', placeholder: 'e.g. Full system access' },
    { key: 'permissions', label: 'Permissions', type: 'multiselect', options: ['Read Users', 'Write Users', 'Read Groups', 'Write Groups', 'System Setup', 'Full Access'], searchable: true, placeholder: 'Select Permissions' },
    { key: 'status', label: 'Status', type: 'dropdown', options: ['Active', 'Inactive', 'Locked'], searchable: false, placeholder: 'Select Status' }
  ];

  openGroupModal(group?: any, mode: 'add' | 'edit' | 'view' = 'add') {
    this.isGroupModalOpen = true;
    this.modalMode = mode;
    if (group) {
      this.currentEditGroup = { 
        id: group.id,
        groupName: group.groupName || '', 
        description: group.description || '', 
        permissions: group.permissions ? [...group.permissions] : [], 
        status: group.status || 'Active' 
      };
    } else {
      this.currentEditGroup = { groupName: '', description: '', permissions: [], status: 'Active' };
    }
  }

  closeGroupModal() {
    this.isGroupModalOpen = false;
  }

  onSaveGroup(formData: any) {
    console.log('Saved group data:', formData);
    this.closeGroupModal();
  }
}
