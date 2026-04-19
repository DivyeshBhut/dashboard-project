import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

import { DateRangeFilterComponent } from '../../../shared/components/grid/date-range-filter/date-range-filter';

import { DataGridComponent, GridColumn } from '../../../shared/components/grid/data-grid/data-grid';
import { DynamicFormModalComponent, FormField } from '../../../shared/components/dynamic-form-modal/dynamic-form-modal.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DataGridComponent, DynamicFormModalComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  pageSize = 10;
  globalSearchTerm = '';
  
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

  get filteredUsers(): User[] {
    const term = this.globalSearchTerm.trim().toLowerCase();
    if (!term) {
      return this.users;
    }

    return this.users.filter((user) => {
      const createdDate = user.createdDate instanceof Date ? user.createdDate.toLocaleDateString('en-US') : '';
      const searchableValues = [
        user.username,
        user.email,
        user.status,
        createdDate,
        ...(user.accessGroup ?? [])
      ];

      return searchableValues.some((value) => String(value).toLowerCase().includes(term));
    });
  }

  handleAction(event: {action: string, item: any}): void {
    if (event.action === 'edit') {
      this.openUserModal(event.item, 'edit');
    } else if (event.action === 'view') {
      this.openUserModal(event.item, 'view');
    }
    console.log(`Action: ${event.action}`, event.item);
  }

  onRefreshGrid(): void {
    // Keep this as a hook for API re-fetch in integration.
    this.ngOnInit();
  }

  onExportGrid(): void {
    console.log('Export Users requested');
  }

  isUserModalOpen = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  currentEditUser: any = {};

  userFormFields: FormField[] = [
    { key: 'username', label: 'Username', type: 'text', placeholder: 'e.g. jsmith' },
    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'e.g. john.smith@company.com' },
    { key: 'accessGroup', label: 'Access Group', type: 'dropdown', options: ['System Admin', 'Reviewer', 'Auditor', 'Compliance Officer', 'Data Entry', 'Risk Analyst'], searchable: true, placeholder: 'Select Access Group' },
    { key: 'status', label: 'Status', type: 'dropdown', options: ['Active', 'Inactive', 'Locked'], searchable: false, placeholder: 'Select Status' }
  ];

  openUserModal(user?: any, mode: 'add' | 'edit' | 'view' = 'add') {
    this.isUserModalOpen = true;
    this.modalMode = mode;
    if (user) {
      this.currentEditUser = { 
        id: user.id,
        username: user.username || '', 
        email: user.email || '', 
        accessGroup: user.accessGroup && user.accessGroup.length > 0 ? user.accessGroup[0] : '', 
        status: user.status || 'Active' 
      };
    } else {
      this.currentEditUser = { username: '', email: '', accessGroup: '', status: 'Active' };
    }
  }

  closeUserModal() {
    this.isUserModalOpen = false;
  }

  onSaveUser(formData: any) {
    console.log('Saved user data:', formData);
    this.closeUserModal();
  }
}
