import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataGridComponent, GridColumn } from '../../../shared/components/grid/data-grid/data-grid';
import { DynamicFormModalComponent, FormField } from '../../../shared/components/dynamic-form-modal/dynamic-form-modal.component';
import { UamApiService, UamUser } from '../../../core/services/uam-api.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DataGridComponent, DynamicFormModalComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: UamUser[] = [];
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

  constructor(private readonly uamApi: UamApiService) {}

  ngOnInit(): void {
    this.uamApi.getUsers().subscribe((users) => {
      this.users = users;
    });
  }

  get filteredUsers(): UamUser[] {
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
    this.uamApi.getUsers().subscribe((users) => {
      this.users = users;
    });
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
