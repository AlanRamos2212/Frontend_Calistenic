import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container [ngSwitch]="getLibrary()">
      <!-- Font Awesome Icon -->
      <ng-container *ngSwitchCase="'fontawesome'">
        <i 
          [class]="'fas ' + iconName" 
          [ngClass]="customClasses"
          [attr.aria-hidden]="ariaHidden"
          [attr.style]="style"
        ></i>
      </ng-container>

      <!-- Tabler Icon -->
      <ng-container *ngSwitchCase="'tabler'">
        <svg 
          class="icon icon-tabler"
          [ngClass]="customClasses"
          xmlns="http://www.w3.org/2000/svg" 
          [attr.width]="size"
          [attr.height]="size"
          viewBox="0 0 24 24" 
          stroke-width="1.5" 
          stroke="currentColor" 
          fill="none" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          [attr.aria-hidden]="ariaHidden"
          [attr.style]="style"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <ng-container [ngSwitch]="tabledIconName">
            <!-- Tabler specific icons would go here -->
            <text *ngSwitchDefault>{{ tabledIconName }}</text>
          </ng-container>
        </svg>
      </ng-container>
    </ng-container>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    i, svg {
      vertical-align: middle;
    }
  `]
})
export class IconComponent {
  @Input() iconName: string = '';
  @Input() size: string = '1em';
  @Input() customClasses: string = '';
  @Input() ariaHidden: boolean = true;
  @Input() style: string = '';

  get tabledIconName(): string {
    return this.iconName.replace('tb-', '');
  }

  getLibrary(): 'fontawesome' | 'tabler' {
    return this.iconName.startsWith('tb-') ? 'tabler' : 'fontawesome';
  }
}
