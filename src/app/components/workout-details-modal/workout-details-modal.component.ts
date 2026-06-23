import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { Workout } from '../../api.service';

@Component({
  selector: 'app-workout-details-modal',
  standalone: true,
  imports: [CommonModule, ChartModule, ButtonModule, DialogModule, TagModule],
  templateUrl: './workout-details-modal.component.html',
  styleUrl: './workout-details-modal.component.css'
})
export class WorkoutDetailsModalComponent implements OnChanges {
  @Input() workout: Workout | null = null;
  @Output() onClose = new EventEmitter<void>();

  chartData: any = {};
  chartOptions: any = {};

  get isVisible(): boolean { return !!this.workout; }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['workout'] && this.workout?.heartRateData?.length) {
      this.buildChart();
    }
  }

  private buildChart() {
    const data = this.workout!.heartRateData!;
    const step = Math.max(1, Math.floor(data.length / 60));
    const sampled = data.filter((_, i) => i % step === 0);

    this.chartData = {
      labels: sampled.map((_, i) => `${i * step}s`),
      datasets: [{
        label: 'BPM',
        data: sampled.map(d => d.bpm),
        fill: true,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2
      }]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: {
          min: 50, max: 200,
          grid: { color: 'rgba(100,116,139,0.1)' },
          ticks: { color: '#94a3b8', font: { size: 10 } }
        }
      }
    };
  }

  close() { this.onClose.emit(); }

  formatDuration(seconds?: number): string {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  }
}
