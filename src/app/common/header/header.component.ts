import { Component, ElementRef, HostListener, Inject, Input, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() pageTitle: string = 'Enterprise Overview';
  isDarkMode = false;
  isProfileMenuOpen = false;
  readonly userName = 'Admin';
  readonly userEmail = 'admin@trackwizz.com';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        this.isDarkMode = true;
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.add('light-theme');
      }
    }
  }

  setTheme(theme: 'light' | 'dark'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isDarkMode = theme === 'dark';
    document.body.classList.toggle('dark-theme', this.isDarkMode);
    document.body.classList.toggle('light-theme', !this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  toggleProfileMenu(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  logout(): void {
    this.closeProfileMenu();
    void this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isProfileMenuOpen) {
      return;
    }

    const target = event.target as Node | null;
    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.closeProfileMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeProfileMenu();
  }
}
