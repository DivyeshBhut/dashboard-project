import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Output() sidebarToggled = new EventEmitter<boolean>();
  isSidebarOpen = true;

  uamOpen = false;
  projectHubOpen = false;
  masterDataOpen = false;
  securityOpen = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.sidebarToggled.emit(this.isSidebarOpen);
  }

  toggleUam(): void { this.uamOpen = !this.uamOpen; }
  toggleProjectHub(): void { this.projectHubOpen = !this.projectHubOpen; }
  toggleMasterData(): void { this.masterDataOpen = !this.masterDataOpen; }
  toggleSecurity(): void { this.securityOpen = !this.securityOpen; }
}
