import { Component, Input, Output, EventEmitter, signal, effect, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchResult {
  title: string;
  category: 'Acción' | 'Ayuda' | 'Sesión';
  description: string;
  action: () => void;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent implements OnChanges {
  @Input() searchResults: SearchResult[] = [];
  @Input() isOpen: boolean = false;
  @Output() queryChange = new EventEmitter<string>();
  @Output() onSelect = new EventEmitter<SearchResult>();
  @Output() onClose = new EventEmitter<void>();
  @Output() onOpenRequest = new EventEmitter<void>();

  searchQuery = signal<string>('');

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      setTimeout(() => {
        const input = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (input) input.focus();
      }, 0);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Ctrl+K o Cmd+K para abrir
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.onOpenRequest.emit();
    }
    // ESC para cerrar
    if (event.key === 'Escape' && this.isOpen) {
      this.closeSearch();
    }
  }

  onQueryChange(query: string) {
    this.searchQuery.set(query);
    this.queryChange.emit(query);
  }

  selectResult(item: SearchResult) {
    item.action();
    this.onSelect.emit(item);
    this.closeSearch();
  }

  closeSearch() {
    this.searchQuery.set('');
    this.onClose.emit();
  }

  onBackdropClick() {
    this.closeSearch();
  }
}
