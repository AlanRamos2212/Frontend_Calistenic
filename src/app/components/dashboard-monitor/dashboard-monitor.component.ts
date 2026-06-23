import { Component, Input, OnChanges, SimpleChanges, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { KnobModule } from 'primeng/knob';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { BleService } from '../../ble.service';

@Component({
  selector: 'app-dashboard-monitor',
  standalone: true,
  imports: [CommonModule, ChartModule, KnobModule, TagModule, FormsModule],
  templateUrl: './dashboard-monitor.component.html',
  styleUrl: './dashboard-monitor.component.css'
})
export class DashboardMonitorComponent implements OnChanges {
  public readonly ble = inject(BleService);

  @Input() isWorkoutActive: boolean = false;
  @Input() avgBpm: number = 0;
  @Input() calories: number = 0;
  @Input() zonePercentages: number[] = [18, 22, 41, 20, 9];
  @Input() formattedTime = '00:00:00';

  // Rolling HR history for the live chart (last 30 points)
  private hrHistory: number[] = [];

  chartData: any = {};
  chartOptions: any = {};
  knobBpm: number = 0;

  constructor() {
    effect(() => {
      const bpm = this.ble.heartRate();
      this.knobBpm = bpm;

      if (this.isWorkoutActive && bpm > 0) {
        this.hrHistory.push(bpm);
        if (this.hrHistory.length > 60) this.hrHistory.shift();
        this.updateChart();
      }
    });

    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isWorkoutActive'] && !this.isWorkoutActive) {
      this.hrHistory = [];
      this.initChart();
    }
  }

  getHeartRateZone(bpm: number | null): { name: string; severity: 'success' | 'warn' | 'danger' | 'info' | 'secondary' } {
    if (!bpm || bpm <= 0) return { name: 'Reposo', severity: 'secondary' };
    if (bpm < 100)  return { name: 'Zona 1 — Calentamiento', severity: 'info' };
    if (bpm < 140)  return { name: 'Zona 2 — Quema grasa', severity: 'success' };
    if (bpm < 170)  return { name: 'Zona 3 — Aeróbico', severity: 'warn' };
    if (bpm < 180)  return { name: 'Zona 4 — Umbral', severity: 'danger' };
    return { name: 'Zona 5 — MÁXIMO ⚠️', severity: 'danger' };
  }

  private initChart() {
    const labels = Array.from({ length: 60 }, (_, i) => '');
    const data = Array(60).fill(null);
    this.buildChartConfig(labels, data);
  }

  private updateChart() {
    const len = this.hrHistory.length;
    const labels = Array.from({ length: len }, (_, i) => `${i + 1}s`);
    this.buildChartConfig(labels, [...this.hrHistory]);
  }

  private buildChartConfig(labels: string[], data: (number | null)[]) {
    this.chartData = {
      labels,
      datasets: [
        {
          label: 'BPM',
          data,
          fill: true,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.12)',
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2
        }
      ]
    };

    this.chartOptions = {
      animation: { duration: 250 },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) => `${ctx.parsed.y} BPM`
          }
        }
      },
      scales: {
        x: { display: false },
        y: {
          min: 50,
          max: 200,
          grid: { color: 'rgba(100,116,139,0.1)' },
          ticks: { color: '#94a3b8', font: { size: 11 } }
        }
      }
    };
  }
}
