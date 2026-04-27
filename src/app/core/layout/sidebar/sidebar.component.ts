import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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
  pipelineExecutionsOpen = false;
  constructor(private readonly router: Router) {}


  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.sidebarToggled.emit(this.isSidebarOpen);
  }

  private closeAllMenus(): void {
    this.uamOpen = false;
    this.projectHubOpen = false;
    this.masterDataOpen = false;
    this.securityOpen = false;
    this.pipelineExecutionsOpen = false;
  }

  private toggleMenu(menu: 'uam' | 'projectHub' | 'masterData' | 'security' | 'pipelineExecutions'): void {
    const wasOpen = this[`${menu}Open`];
    this.closeAllMenus();
    this[`${menu}Open`] = !wasOpen;
  }

  onGroupClick(
    menu: 'uam' | 'projectHub' | 'masterData' | 'security' | 'pipelineExecutions',
    defaultRoute: string
  ): void {
    if (!this.isSidebarOpen) {
      this.closeAllMenus();
      void this.router.navigate([defaultRoute]);
      return;
    }

    this.toggleMenu(menu);
  }

  onNestedGroupClick(
    event: Event,
    menu: 'pipelineExecutions',
    defaultRoute: string
  ): void {
    event.stopPropagation();
    if (!this.isSidebarOpen) {
      void this.router.navigate([defaultRoute]);
      return;
    }

    this[`${menu}Open`] = !this[`${menu}Open`];
  }

  navigateTo(path: string): void {
    void this.router.navigate([path]);
  }
}
