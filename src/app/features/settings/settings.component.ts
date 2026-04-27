import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  // AI Models Form
  selectedModel = 'gpt-4-turbo';
  apiKey = 'sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  temperature = 0.7;

  // Configuration Toggles
  strictMode = true;
  autoSave = true;
  enableBetaFeatures = false;
  verboseLogging = false;

  // Embedding Syncing
  lastSyncTime = new Date();
  isSyncing = false;
  syncProgress = 0;
  syncInterval: any;

  availableModels = [
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo (OpenAI)' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (OpenAI)' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus (Anthropic)' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet (Anthropic)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Google)' }
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialize mock data
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    this.lastSyncTime = twoHoursAgo;
  }

  saveModelSettings(): void {
    // Mock save
    console.log('Saved Model Settings:', {
      model: this.selectedModel,
      key: this.apiKey ? '***' : null,
      temp: this.temperature
    });
    // Normally you'd show a toast here
  }

  toggleConfig(key: 'strictMode' | 'autoSave' | 'enableBetaFeatures' | 'verboseLogging'): void {
    this[key] = !this[key];
  }

  startSync(): void {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    this.syncProgress = 0;
    
    this.syncInterval = setInterval(() => {
      this.syncProgress += Math.floor(Math.random() * 15) + 5;
      
      if (this.syncProgress >= 100) {
        this.syncProgress = 100;
        clearInterval(this.syncInterval);
        
        setTimeout(() => {
          this.isSyncing = false;
          this.lastSyncTime = new Date();
          this.syncProgress = 0;
        }, 500);
      }
    }, 300);
  }
}
