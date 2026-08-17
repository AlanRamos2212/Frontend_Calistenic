import { Component, OnDestroy, OnInit, inject, signal, computed, HostListener } from '@angular/core';
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
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ApiService, WearableBinding } from '../../api.service';
import { WearableConnectionService } from '../../services/wearable-connection.service';

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
export class HeaderComponent implements OnInit, OnDestroy {
  readonly searchService = inject(SearchService);
  readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly api = inject(ApiService);
  readonly wearableConnection = inject(WearableConnectionService);

  readonly searchOpen = signal(false);
  readonly isWearableLoading = signal(true);
  readonly connectionState = this.wearableConnection.connectionState;
  readonly activeWearable = computed<WearableBinding | null>(() => {
    const state = this.connectionState();
    if (!state.deviceId || state.status === 'disconnected') {
      return null;
    }

    return {
      id: 0,
      wearableId: state.deviceId,
      active: state.status === 'connected',
      pinConfirmed: state.status === 'connected',
      confirmedAt: state.status === 'connected' ? new Date().toISOString() : null
    };
  });
  readonly wearableStatusLabel = computed(() => {
    const state = this.connectionState();
    if (state.status === 'connected') return 'Wearable conectado';
    if (state.status === 'pairing') return 'Pendiente PIN';
    return 'Sin wearable';
  });

  searchQuery = '';
  searchSuggestions: SearchResult[] = [];
  selectedResult: SearchResult | null = null;
  private wearableRefreshSub?: Subscription;

  readonly navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-chart-line' },
    { label: 'Ejercicios', path: '/ejercicios', icon: 'pi pi-star' },
    { label: 'Progreso', path: '/progreso', icon: 'pi pi-chart-bar' },
    { label: 'Comunidad', path: '/comunidad', icon: 'pi pi-users' }
  ];

  ngOnInit(): void {
    this.refreshWearableState();
    this.wearableRefreshSub = interval(5000).subscribe(() => this.refreshWearableState());
  }

  ngOnDestroy(): void {
    this.wearableRefreshSub?.unsubscribe();
  }

  private refreshWearableState(): void {
    this.isWearableLoading.set(true);
    this.wearableConnection.loadFromBackend().subscribe({
      next: () => {
        this.isWearableLoading.set(false);
      },
      error: error => {
        console.error('Error loading wearable bindings from backend:', error);
        this.wearableConnection.rehydrateFromStorage();
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
