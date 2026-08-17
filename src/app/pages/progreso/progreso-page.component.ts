import { Component, OnDestroy, OnInit, inject, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ApiService, Workout } from '../../api.service';
import { AuthService } from '../../services/auth.service';
import { WearableConnectionService } from '../../services/wearable-connection.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { Subscription, firstValueFrom, interval } from 'rxjs';

interface DeviceTokenResponse {
  deviceToken: string;
  userId: string;
  tokenType: string;
  expiresInMs: number;
}

interface WearableBinding {
  id: number;
  wearableId: string;
  deviceToken?: string;
  pairedAt?: string;
  active?: boolean;
  pinConfirmed?: boolean;
  confirmedAt?: string | null;
}

@Component({
  selector: 'app-progreso-page',
  standalone: true,
  imports: [CommonModule, ChartModule, TableModule, CardModule, TagModule, ButtonModule, SkeletonModule, DatePipe, SafeUrlPipe],
  templateUrl: './progreso-page.component.html',
  styleUrl: './progreso-page.component.css'
})
export class ProgresoPageComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly wearableConnection = inject(WearableConnectionService);
  private readonly apiBaseUrl = 'http://localhost:8082/api';
  private readonly deviceTokenStorageKey = 'app.device.token';
  private readonly userIdStorageKey = 'app.user.id';
  @ViewChild('flutterDashboardFrame') private flutterDashboardFrame?: ElementRef<HTMLIFrameElement>;
  private wearableRefreshSub?: Subscription;

  readonly flutterDashboardUrl = '/flutter-dashboard/index.html';

  readonly workouts   = signal<Workout[]>([]);
  readonly wearableBindings = signal<WearableBinding[]>([]);
  readonly isLoading  = signal(true);
  readonly isWearableLoading = signal(true);
  readonly isFlutterTokenReady = signal(false);
  readonly deviceTokenError = signal<string | null>(null);
  readonly wearableError = signal<string | null>(null);
  readonly hasFlutterDashboard = computed(() => this.isFlutterTokenReady());
  readonly activeWearable = computed(() => this.wearableBindings().find(w => w.active) ?? this.wearableBindings()[0] ?? null);
  readonly activeWearableId = computed(() => this.activeWearable()?.wearableId ?? 'Sin ID');
  readonly activeWearableIsActive = computed(() => this.activeWearable()?.active ?? false);
  readonly hasWearableBinding = computed(() => !!this.activeWearable());
  readonly wearableStatusLabel = computed(() => {
    const wearable = this.activeWearable();
    if (!wearable.active) return 'Inactivo';
    return wearable.pinConfirmed ? 'Vinculado' : 'Pendiente PIN';
  });

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
    this.loadWearableBindings();
    this.wearableRefreshSub = interval(5000).subscribe(() => this.loadWearableBindings());

    this.api.getWorkouts().subscribe({
      next: list => {
        this.workouts.set(list.filter(w => w.status === 'COMPLETED'));
        this.isLoading.set(false);
        this.buildChart();
      },
      error: () => this.isLoading.set(false)
    });

    void this.prepareFlutterDashboard();
  }

  ngOnDestroy(): void {
    this.wearableRefreshSub?.unsubscribe();
  }

  private loadWearableBindings(): void {
    this.isWearableLoading.set(true);
    this.wearableError.set(null);
    this.wearableConnection.rehydrateFromStorage();
    this.wearableConnection.loadFromBackend().subscribe({
      next: bindings => {
        this.wearableBindings.set(bindings);
        this.isWearableLoading.set(false);
      },
      error: error => {
        console.error('Error loading wearable bindings from backend:', error);
        const state = this.wearableConnection.connectionState();
        if (state.deviceId) {
          this.wearableBindings.set([{
            id: 0,
            wearableId: state.deviceId,
            active: state.status === 'connected',
            pinConfirmed: state.status === 'connected',
            confirmedAt: state.status === 'connected' ? new Date().toISOString() : null,
          }]);
        } else {
          this.wearableBindings.set([]);
        }
        this.wearableError.set('No fue posible cargar el estado real del wearable desde el backend.');
        this.isWearableLoading.set(false);
      }
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
    this.isWearableLoading.set(true);
    this.ngOnInit();
  }

  openFlutterDashboard(): void {
    void this.prepareFlutterDashboard().finally(() => {
      this.flutterDashboardFrame?.nativeElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  onFlutterDashboardLoad(): void {
    this.dispatchTokenToFlutter();
  }

  private async prepareFlutterDashboard(): Promise<void> {
    const token = this.authService.getToken();

    if (!token) {
      this.deviceTokenError.set('No hay sesión activa para vincular el dashboard Flutter.');
      this.isFlutterTokenReady.set(false);
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<DeviceTokenResponse>(
          `${this.apiBaseUrl}/auth/device-token`,
          {},
          {
            headers: new HttpHeaders({
              Authorization: `Bearer ${token}`
            }),
            withCredentials: true
          }
        )
      );

      const deviceToken = response.deviceToken?.trim();
      if (deviceToken) {
        sessionStorage.setItem(this.deviceTokenStorageKey, deviceToken);
        localStorage.setItem(this.deviceTokenStorageKey, deviceToken);
        window.__calistenicDeviceToken = deviceToken;
      }
      if (response.userId) {
        sessionStorage.setItem(this.userIdStorageKey, response.userId);
        localStorage.setItem(this.userIdStorageKey, response.userId);
      }
      this.isFlutterTokenReady.set(true);
      this.deviceTokenError.set(null);
      this.dispatchTokenToFlutter();
    } catch (error) {
      this.deviceTokenError.set('No se pudo preparar el token derivado para Flutter.');
      this.isFlutterTokenReady.set(false);
    }
  }

  private dispatchTokenToFlutter(): void {
    const token = sessionStorage.getItem(this.deviceTokenStorageKey);
    const userId = sessionStorage.getItem(this.userIdStorageKey);
    const frameWindow = this.flutterDashboardFrame?.nativeElement?.contentWindow;

    if (!token || !frameWindow) {
      return;
    }

    const message = { type: 'calistenic-device-token', token, userId };
    frameWindow.postMessage(message, window.location.origin);
  }
}
