import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';

export interface User {
  id: string;
  username: string;
  email: string;
  accessGroup: string;
  status: 'Active' | 'Inactive' | 'Locked';
  createdDate: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, GridModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  totalRecords = 142;
  currentPage = 1;
  pageSize = 10;
  totalPages = Math.ceil(this.totalRecords / this.pageSize);

  ngOnInit(): void {
    // Scaffold initial mock data
    this.users = [
      { id: '1', username: 'jsmith', email: 'john.smith@trackwizz.com', accessGroup: 'System Admin', status: 'Active', createdDate: '2023-11-10' },
      { id: '2', username: 'mroberts', email: 'mary.roberts@trackwizz.com', accessGroup: 'Auditor', status: 'Active', createdDate: '2023-11-12' },
      { id: '3', username: 'djones', email: 'david.jones@trackwizz.com', accessGroup: 'Compliance Officer', status: 'Inactive', createdDate: '2023-12-05' },
      { id: '4', username: 'swilliams', email: 's.williams@trackwizz.com', accessGroup: 'Risk Analyst', status: 'Active', createdDate: '2024-01-18' },
      { id: '5', username: 'pchen', email: 'peter.chen@trackwizz.com', accessGroup: 'Reviewer', status: 'Locked', createdDate: '2024-01-20' },
      { id: '6', username: 'lgarcia', email: 'laura.garcia@trackwizz.com', accessGroup: 'Compliance Officer', status: 'Active', createdDate: '2024-02-14' },
      { id: '7', username: 'rlee', email: 'robert.lee@trackwizz.com', accessGroup: 'Data Entry', status: 'Active', createdDate: '2024-02-28' },
      { id: '8', username: 'kbrown', email: 'karen.brown@trackwizz.com', accessGroup: 'System Admin', status: 'Active', createdDate: '2024-03-05' },
    ];
  }
}
