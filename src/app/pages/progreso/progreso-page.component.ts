import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ApiService, Workout } from '../../api.service';

@Component({
  selector: 'app-progreso-page',
  standalone: true,
  imports: [CommonModule, ChartModule, TableModule, CardModule, TagModule, ButtonModule, SkeletonModule, DatePipe],
  templateUrl: './progreso-page.component.html',
  styleUrl: './progreso-page.component.css'
})
export class ProgresoPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly workouts   = signal<Workout[]>([]);
  readonly isLoading  = signal(true);

  // Global stats
  readonly totalSessions = computed(() => this.workouts().length);
  readonly totalCalories = computed(() => {
    // Estimate from avg BPM and duration
    return this.workouts().reduce((sum, w) => {
      if (!w.avgBpm || !w.durationSeconds) return sum;
      const calMin = Math.max(0, (-35.3461 + 0.6309 * w.avgBpm) / 4.184);
      return sum + calMin * (w.durationSeconds / 60);
    }, 0);
  });
  readonly totalMinutes = computed(() =>
    this.workouts().reduce((sum, w) => sum + (w.durationSeconds || 0) / 60, 0)
  );
  readonly avgBpmAll = computed(() => {
    const w = this.workouts().filter(x => x.avgBpm);
    if (!w.length) return 0;
    return Math.round(w.reduce((s, x) => s + (x.avgBpm || 0), 0) / w.length);
  });

  // Chart
  bpmChartData: any = {};
  bpmChartOptions: any = {};

  ngOnInit() {
    this.api.getWorkouts().subscribe({
      next: list => {
        this.workouts.set(list.filter(w => w.status === 'COMPLETED'));
        this.isLoading.set(false);
        this.buildChart();
      },
      error: () => this.isLoading.set(false)
    });
  }

  private buildChart() {
    const completed = this.workouts().slice().reverse().slice(-10);
    const labels    = completed.map(w => w.name.length > 12 ? w.name.slice(0, 12) + '…' : w.name);
    const avgData   = completed.map(w => w.avgBpm ?? 0);
    const maxData   = completed.map(w => w.maxBpm ?? 0);

    this.bpmChartData = {
      labels,
      datasets: [
        {
          label: 'FC Promedio',
          data: avgData,
          fill: true,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.12)',
          tension: 0.4,
          pointRadius: 4,
          borderWidth: 2
        },
        {
          label: 'FC Máxima',
          data: maxData,
          fill: false,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.08)',
          tension: 0.4,
          pointRadius: 4,
          borderDash: [4, 4],
          borderWidth: 2
        }
      ]
    };

    this.bpmChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 12 } } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(100,116,139,0.08)' } },
        y: {
          min: 50, max: 200,
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(100,116,139,0.08)' }
        }
      }
    };
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  reload() {
    this.isLoading.set(true);
    this.ngOnInit();
  }
}
