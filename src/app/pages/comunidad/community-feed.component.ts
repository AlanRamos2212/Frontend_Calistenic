import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post, PostsService } from '../../services/posts.service';

/**
 * Minimal read-only feed for the web. The full interactive experience
 * (publish, photo upload, comments) lives in the Flutter mobile app;
 * this component surfaces real community activity on the dashboard.
 */
@Component({
  selector: 'app-community-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community-feed.component.html',
  styleUrl: './community-feed.component.css'
})
export class CommunityFeedComponent implements OnInit {
  private readonly postsService = inject(PostsService);

  readonly posts = signal<Post[]>([]);
  readonly loading = signal(true);
  readonly failed = signal(false);

  /** Web shows only a small preview of the latest activity. */
  readonly visiblePosts = computed(() => this.posts().slice(0, 5));

  ngOnInit(): void {
    this.loadFeed();
  }

  loadFeed(): void {
    this.loading.set(true);
    this.failed.set(false);
    this.postsService.feed().subscribe({
      next: (page) => {
        this.posts.set(page.content ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.loading.set(false);
      }
    });
  }

  relativeTime(iso: string | null): string {
    if (!iso) return '';
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'hace un momento';
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `hace ${days} d`;
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  }

  mediaUrl(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleaned = path.startsWith('/api') ? path.slice(4) : path;
    return `http://localhost:8082/api${cleaned}`;
  }

  initials(name: string): string {
    return name?.trim() ? name.trim()[0].toUpperCase() : 'A';
  }
}
