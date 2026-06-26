import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { BleService } from '../../ble.service';
import { ApiService, Workout, HeartRatePoint } from '../../api.service';
import { BlePanelComponent } from '../../components/ble-panel/ble-panel.component';
import { WorkoutFormComponent } from '../../components/workout-form/workout-form.component';
import { DashboardMonitorComponent } from '../../components/dashboard-monitor/dashboard-monitor.component';
import { WorkoutCardComponent } from '../../components/workout-card/workout-card.component';
import { WorkoutDetailsModalComponent } from '../../components/workout-details-modal/workout-details-modal.component';
import { WarningBannerComponent } from '../../components/warning-banner/warning-banner.component';
import { SettingsModalComponent } from '../../components/settings-modal/settings-modal.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    BlePanelComponent,
    WorkoutFormComponent,
    DashboardMonitorComponent,
    WorkoutCardComponent,
    WorkoutDetailsModalComponent,
    WarningBannerComponent,
    SettingsModalComponent,
    EmptyStateComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  readonly ble = inject(BleService);
  readonly api = inject(ApiService);
  readonly messageService = inject(MessageService);

  // UI State
  readonly activeTab = signal<'dashboard' | 'history'>('dashboard');
  readonly isWorkoutActive = signal<boolean>(false);
  readonly currentWorkout = signal<Workout | null>(null);
  readonly workouts = signal<Workout[]>([]);
  readonly selectedWorkout = signal<Workout | null>(null);
  readonly isSettingsOpen = signal<boolean>(false);
  readonly warningBannerVisible = signal<boolean>(false);
  readonly warningMessage = signal<string>('');

  // Analytics
  readonly elapsedSeconds = signal<number>(0);
  readonly formattedTime = computed(() => {
    const s = this.elapsedSeconds();
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return [hrs, mins, secs].map(n => n.toString().padStart(2, '0')).join(':');
  });

  readonly currentAvgBpm = signal<number>(0);
  readonly currentMaxBpm = signal<number>(0);
  readonly estimatedCalories = signal<number>(0);
  readonly zoneSeconds = signal<number[]>([0, 0, 0, 0, 0]);
  readonly zonePercentages = computed(() => {
    const zones = this.zoneSeconds();
    const total = zones.reduce((a, b) => a + b, 0);
    if (total === 0) return [0, 0, 0, 0, 0];
    return zones.map(s => Math.round((s / total) * 100));
  });

  private heartRateHistory: HeartRatePoint[] = [];
  private unsavedHeartRates: HeartRatePoint[] = [];
  private stopwatchIntervalId: any = null;
  private saveIntervalId: any = null;

  constructor() {
    // Reactive heart rate tracking
    effect(() => {
      const bpm = this.ble.heartRate();
      const isActive = this.isWorkoutActive();

      if (isActive && bpm > 0) {
        const point: HeartRatePoint = { timestamp: new Date().toISOString(), bpm };
        this.heartRateHistory.push(point);
        this.unsavedHeartRates.push(point);

        const bpms = this.heartRateHistory.map(p => p.bpm);
        this.currentAvgBpm.set(Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length));
        this.currentMaxBpm.set(Math.max(...bpms));

        this.zoneSeconds.update(zones => {
          const z = [...zones];
          if (bpm >= 180) z[4]++;
          else if (bpm >= 170) z[3]++;
          else if (bpm >= 140) z[2]++;
          else if (bpm >= 100) z[1]++;
          else if (bpm >= 60) z[0]++;
          return z;
        });

        const calMin = (-35.3461 + 0.6309 * bpm) / 4.184;
        this.estimatedCalories.update(c => parseFloat((c + Math.max(0, calMin / 60)).toFixed(3)));

        if (bpm >= 175 && !this.warningBannerVisible()) {
          this.triggerWarning(bpm);
        }
      }
    });
  }

  ngOnInit() {
    this.loadWorkoutsHistory();
    this.requestNotificationPermissions();
  }

  ngOnDestroy() {
    this.stopStopwatch();
    if (this.saveIntervalId) clearInterval(this.saveIntervalId);
  }

  // --- Notifications ---
  requestNotificationPermissions() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  private triggerWarning(bpm: number) {
    const msg = `Tu frecuencia cardíaca ha alcanzado ${bpm} BPM. Reduce la intensidad.`;
    this.warningMessage.set(msg);
    this.warningBannerVisible.set(true);

    this.messageService.add({
      severity: 'error',
      summary: '🚨 Alerta Cardíaca',
      detail: msg,
      life: 8000,
      sticky: false
    });

    try {
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 CalistenicTrack: Alerta Cardíaca', {
          body: `Tu FC de ${bpm} BPM ha superado la zona de seguridad.`,
          icon: '/favicon.ico'
        });
      }
    } catch (e) {}
  }

  simulateHighHRAlert() {
    if (!this.ble.deviceConnected()) this.ble.startSimulation();
    this.ble.exertSimulated('intense');
    this.ble.exertSimulated('intense');
    this.ble.exertSimulated('intense');
    this.ble.heartRate.set(183);
    this.triggerWarning(183);
  }

  dismissWarning() { this.warningBannerVisible.set(false); }

  // --- Workout CRUD ---
  loadWorkoutsHistory() {
    this.api.getWorkouts().subscribe({
      next: list => this.workouts.set(list),
      error: err => console.error('Error loading history:', err)
    });
  }

  startWorkout(event: { name: string; description: string }) {
    if (this.isWorkoutActive()) return;

    this.api.startWorkout(event.name, event.description).subscribe({
      next: workout => {
        this.currentWorkout.set(workout);
        this.isWorkoutActive.set(true);
        this.heartRateHistory = [];
        this.unsavedHeartRates = [];
        this.elapsedSeconds.set(0);
        this.currentAvgBpm.set(0);
        this.currentMaxBpm.set(0);
        this.estimatedCalories.set(0);
        this.zoneSeconds.set([0, 0, 0, 0, 0]);
        this.warningBannerVisible.set(false);
        this.startStopwatch();
        this.startPeriodicSync(workout.id);
        this.messageService.add({ severity: 'success', summary: '¡Sesión iniciada!', detail: event.name, life: 3000 });
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo iniciar la sesión: ' + err.message });
      }
    });
  }

  endWorkout() {
    const workout = this.currentWorkout();
    if (!workout) return;

    this.stopStopwatch();
    if (this.saveIntervalId) { clearInterval(this.saveIntervalId); this.saveIntervalId = null; }

    if (this.unsavedHeartRates.length > 0) {
      this.api.saveHeartRates(workout.id, [...this.unsavedHeartRates]).subscribe();
      this.unsavedHeartRates = [];
    }

    this.api.endWorkout(workout.id).subscribe({
      next: summary => {
        this.isWorkoutActive.set(false);
        this.currentWorkout.set(null);
        this.loadWorkoutsHistory();
        this.viewWorkoutDetails(summary.id);
        this.activeTab.set('history');
        this.messageService.add({ severity: 'success', summary: '¡Sesión guardada!', detail: `Duración: ${this.formatDuration(summary.durationSeconds)}`, life: 5000 });
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cerrar la sesión: ' + err.message });
        this.isWorkoutActive.set(false);
        this.currentWorkout.set(null);
      }
    });
  }

  deleteWorkout(workoutId: number) {
    this.api.deleteWorkout(workoutId).subscribe({
      next: () => {
        this.loadWorkoutsHistory();
        const selected = this.selectedWorkout();
        if (selected?.id === workoutId) this.selectedWorkout.set(null);
        this.messageService.add({ severity: 'info', summary: 'Sesión eliminada', life: 2500 });
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar: ' + err.message });
      }
    });
  }

  viewWorkoutDetails(id: number) {
    this.api.getWorkoutDetails(id).subscribe({
      next: workout => this.selectedWorkout.set(workout),
      error: err => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar: ' + err.message })
    });
  }

  closeWorkoutDetails() { this.selectedWorkout.set(null); }

  // --- Time ---
  private startStopwatch() {
    this.stopStopwatch();
    this.stopwatchIntervalId = setInterval(() => this.elapsedSeconds.update(s => s + 1), 1000);
  }

  private stopStopwatch() {
    if (this.stopwatchIntervalId) { clearInterval(this.stopwatchIntervalId); this.stopwatchIntervalId = null; }
  }

  private startPeriodicSync(workoutId: number) {
    if (this.saveIntervalId) clearInterval(this.saveIntervalId);
    this.saveIntervalId = setInterval(() => {
      if (this.unsavedHeartRates.length > 0) {
        const batch = [...this.unsavedHeartRates];
        this.unsavedHeartRates = [];
        this.api.saveHeartRates(workoutId, batch).subscribe({
          error: err => {
            this.unsavedHeartRates.unshift(...batch);
            console.error('Sync failed, retry next cycle:', err);
          }
        });
      }
    }, 5000);
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getHeartRateZone(bpm: number): { name: string; class: string } {
    if (bpm >= 180) return { name: 'Zona máxima (Z5)', class: 'badge-danger' };
    if (bpm >= 170) return { name: 'Zona umbral (Z4)', class: 'badge-danger' };
    if (bpm >= 140) return { name: 'Zona aeróbica (Z3)', class: 'badge-warning' };
    if (bpm >= 100) return { name: 'Quema grasa (Z2)', class: 'badge-success' };
    if (bpm >= 60)  return { name: 'Calentamiento (Z1)', class: 'badge-info' };
    return { name: 'Reposo', class: 'badge-info' };
  }
}
