import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'dropdown';
  options?: string[]; // Array of strings for options
  searchable?: boolean;
  placeholder?: string;
}

@Component({
  selector: 'app-dynamic-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dynamic-form-modal.component.html',
  styleUrl: './dynamic-form-modal.component.css'
})
export class DynamicFormModalComponent {
  @Input() isVisible = false;
  @Input() mode: 'add' | 'edit' | 'view' = 'add';
  @Input() titleAdd = 'Add New';
  @Input() titleEdit = 'Edit Item';
  @Input() titleView = 'View Details';
  @Input() fields: FormField[] = [];
  @Input() formData: any = {};
  @Input() saveBtnTextAdd = 'Save';
  @Input() saveBtnTextEdit = 'Update';

  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  openDropdownKey: string | null = null;
  searchQueries: { [key: string]: string } = {};

  get title() {
    if (this.mode === 'view') return this.titleView;
    return this.mode === 'edit' ? this.titleEdit : this.titleAdd;
  }

  get saveBtnText() {
    return this.mode === 'edit' ? this.saveBtnTextEdit : this.saveBtnTextAdd;
  }

  onClose() {
    this.close.emit();
    this.openDropdownKey = null;
  }

  onSave() {
    this.save.emit({ ...this.formData });
    this.openDropdownKey = null;
  }

  // Dropdown Logic
  toggleDropdown(event: Event, key: string) {
    event.stopPropagation();
    if (this.openDropdownKey === key) {
      this.openDropdownKey = null;
    } else {
      this.openDropdownKey = key;
      this.searchQueries[key] = ''; // reset search query on open
    }
  }

  selectOption(key: string, option: string) {
    this.formData[key] = option;
    this.openDropdownKey = null;
  }

  onSearch(event: Event, key: string) {
    this.searchQueries[key] = (event.target as HTMLInputElement).value;
  }

  getFilteredOptions(field: FormField): string[] {
    const query = (this.searchQueries[field.key] || '').toLowerCase();
    const opts = field.options || [];
    if (!query) return opts;
    return opts.filter(opt => opt.toLowerCase().includes(query));
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    this.openDropdownKey = null;
  }
}
