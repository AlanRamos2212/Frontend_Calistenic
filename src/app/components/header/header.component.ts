import { Component, inject, signal, computed, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { SearchService, SearchResult } from '../../services/search.service';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService, WearableBinding } from '../../api.service';

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
export class HeaderComponent implements OnInit {
  readonly api = inject(ApiService);
  readonly searchService = inject(SearchService);
  readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly searchOpen = signal(false);
  readonly wearableBindings = signal<WearableBinding[]>([]);
  readonly isWearableLoading = signal(true);
  readonly activeWearable = computed(() =>
    this.wearableBindings().find(w => w.active) ?? this.wearableBindings()[0] ?? null
  );
  readonly wearableStatusLabel = computed(() => {
    const wearable = this.activeWearable();
    if (!wearable) return 'Sin wearable';
    if (!wearable.active) return 'Wearable inactivo';
    return wearable.pinConfirmed ? 'Wearable vinculado' : 'Pendiente PIN';
  });

  searchQuery = '';
  searchSuggestions: SearchResult[] = [];
  selectedResult: SearchResult | null = null;

  readonly navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-chart-line' },
    { label: 'Ejercicios', path: '/ejercicios', icon: 'pi pi-star' },
    { label: 'Progreso', path: '/progreso', icon: 'pi pi-chart-bar' },
    { label: 'Comunidad', path: '/comunidad', icon: 'pi pi-users' }
  ];

  ngOnInit(): void {
    this.loadWearableStatus();
  }

  private loadWearableStatus(): void {
    this.isWearableLoading.set(true);
    this.api.getWearables().subscribe({
      next: bindings => {
        this.wearableBindings.set(bindings ?? []);
        this.isWearableLoading.set(false);
      },
      error: () => {
        this.wearableBindings.set([]);
        this.isWearableLoading.set(false);
      }
    });
  }

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
