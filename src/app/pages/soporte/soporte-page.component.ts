import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SupportReportsService, SupportReport } from '../../services/support-reports.service';

@Component({
  selector: 'app-soporte-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './soporte-page.component.html',
  styleUrl: './soporte-page.component.css',
})
export class SoportePageComponent implements OnInit {
  private readonly reports = inject(SupportReportsService);
  private readonly auth = inject(AuthService);

  title = '';
  description = '';
  category = 'OTRO';
  loading = signal(false);
  message = signal<string | null>(null);
  error = signal<string | null>(null);
  mine = signal<SupportReport[]>([]);
  all = signal<SupportReport[]>([]);
  filter = '';

  get isAdmin(): boolean {
    return this.auth.currentUser()?.role === 'ADMIN';
  }

  ngOnInit(): void {
    this.refreshMine();
    if (this.isAdmin) this.refreshAll();
  }

  refreshMine(): void {
    if (!this.auth.isAuthenticated()) return;
    this.reports.mine().subscribe({ next: r => this.mine.set(r), error: () => {} });
  }

  refreshAll(): void {
    this.reports.list(this.filter || undefined).subscribe({ next: r => this.all.set(r), error: () => {} });
  }

  submit(): void {
    this.message.set(null);
    this.error.set(null);
    if (!this.auth.isAuthenticated()) {
      this.error.set('Inicia sesión para reportar un bug.');
      return;
    }
    if (!this.title.trim() || !this.description.trim()) {
      this.error.set('Completa título y descripción.');
      return;
    }
    this.loading.set(true);
    this.reports.create(this.title.trim(), this.description.trim(), this.category).subscribe({
      next: created => {
        this.loading.set(false);
        this.title = '';
        this.description = '';
        this.message.set(`Caso #${created.id} registrado (OPEN).`);
        this.refreshMine();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo enviar el reporte. Revisa tu conexión y reintenta.');
      },
    });
  }

  changeStatus(r: SupportReport, status: string): void {
    this.reports.update(r.id, status).subscribe({
      next: () => this.refreshAll(),
      error: () => this.error.set('No se pudo actualizar el caso.'),
    });
  }
}
