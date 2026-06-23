import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, SliderModule, InputNumberModule, ButtonModule, DividerModule, TagModule],
  templateUrl: './settings-modal.component.html',
  styleUrl: './settings-modal.component.css'
})
export class SettingsModalComponent {
  @Input() isVisible: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSettingChange = new EventEmitter<{ key: string; value: any }>();

  maxHrThreshold = 175;
  targetZoneMin  = 130;
  targetZoneMax  = 160;

  close() { this.onClose.emit(); }

  save() {
    this.onSettingChange.emit({ key: 'maxHr',       value: this.maxHrThreshold });
    this.onSettingChange.emit({ key: 'targetZoneMin', value: this.targetZoneMin });
    this.onSettingChange.emit({ key: 'targetZoneMax', value: this.targetZoneMax });
    this.close();
  }
}
