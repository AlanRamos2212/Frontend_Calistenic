import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BleService } from '../../ble.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { SearchService, SearchResult } from '../../services/search.service';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    ThemeToggleComponent,
    ButtonModule,
    TagModule,
    DialogModule,
    AutoCompleteModule,
    TooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  readonly ble = inject(BleService);
  readonly searchService = inject(SearchService);
  readonly router = inject(Router);

  readonly searchOpen = signal(false);
  searchQuery = '';
  searchSuggestions: SearchResult[] = [];
  selectedResult: SearchResult | null = null;

  readonly navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-chart-line' },
    { label: 'Ejercicios', path: '/ejercicios', icon: 'pi pi-star' },
    { label: 'Progreso', path: '/progreso', icon: 'pi pi-chart-bar' },
    { label: 'Comunidad', path: '/comunidad', icon: 'pi pi-users' }
  ];

  @HostListener('document:keydown', ['$event'])
  handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      this.openSearch();
    }
    if (e.key === 'Escape' && this.searchOpen()) {
      this.closeSearch();
    }
  }

  openSearch() {
    this.searchOpen.set(true);
    this.searchQuery = '';
    this.searchSuggestions = [];
  }

  closeSearch() {
    this.searchOpen.set(false);
  }

  onSearchInput(event: any) {
    const q = event.query || '';
    if (q.trim().length < 2) {
      this.searchSuggestions = [];
      return;
    }
    this.searchService.search(q).subscribe(results => {
      this.searchSuggestions = results;
    });
  }

  onResultSelect(event: any) {
    const result: SearchResult = event.value;
    if (result?.routerLink) {
      this.router.navigate(result.routerLink);
    } else if (result?.action) {
      result.action();
    }
    this.closeSearch();
    this.searchQuery = '';
    this.selectedResult = null;
  }
}
