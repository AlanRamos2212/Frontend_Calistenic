import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, CommonModule, AuthModalComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements OnInit, OnDestroy {
  private readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private intervalId: any;

  readonly showAuthModal = signal(false);

  openAuth(): void {
    this.showAuthModal.set(true);
  }

  closeAuth(): void {
    this.showAuthModal.set(false);
  }

  handleOpenApp(event: Event): void {
    event.preventDefault();
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.openAuth();
    }
  }

  currentBpm = signal<number>(142);
  currentZone = signal<number>(3);
  liveActive = signal<boolean>(true);

  readonly features = [
    {
      icon: 'pi pi-mobile',
      color: 'indigo',
      title: 'Vinculación por Código',
      desc: 'Genera un código de 6 dígitos y confirma la conexión desde tu wearable en segundos.'
    },
    {
      icon: 'pi pi-heart-fill',
      color: 'red',
      title: '5 Zonas de FC',
      desc: 'Monitoriza y distribuye tu esfuerzo en las 5 zonas de frecuencia cardíaca científicamente definidas.'
    },
    {
      icon: 'pi pi-chart-line',
      color: 'cyan',
      title: 'Dashboard Inteligente',
      desc: 'Visualiza tu rendimiento en tiempo real con gráficas interactivas y métricas avanzadas.'
    },
    {
      icon: 'pi pi-list',
      color: 'emerald',
      title: 'Librería de Ejercicios',
      desc: 'Más de 20 rutinas de calistenia con duración, calorías y zona HR objetivo para cada una.'
    },
    {
      icon: 'pi pi-chart-bar',
      color: 'amber',
      title: 'Seguimiento de Progreso',
      desc: 'Historial completo de sesiones, estadísticas acumuladas y evolución de tu rendimiento.'
    },
    {
      icon: 'pi pi-users',
      color: 'purple',
      title: 'Comunidad (Próximo)',
      desc: 'Comparte tus logros, compite con otros atletas y descubre nuevas rutinas de la comunidad.'
    }
  ];

  readonly stats = [
    { value: '5', label: 'Zonas HR', suffix: '' },
    { value: '20+', label: 'Ejercicios', suffix: '' },
    { value: '100%', label: 'Open Source', suffix: '' },
    { value: '6D', label: 'Código', suffix: '' },
  ];

  readonly currentYear = new Date().getFullYear();

  readonly testimonials = [
    {
      name: 'Carlos M.',
      role: 'Atleta de calistenia · 3 años',
      text: 'La vinculación por código es rápida y me permite seguir mi entrenamiento sin interrupciones. El monitor es increíble.',
      avatar: '🏋️'
    },
    {
      name: 'Laura G.',
      role: 'Entrenadora personal',
      text: 'Uso CalistenicTrack con mis clientes para monitorizar zonas de FC durante las sesiones. Cambió mi forma de entrenar.',
      avatar: '💪'
    },
    {
      name: 'Diego R.',
      role: 'CrossFit & Calistenia',
      text: 'La visualización de zonas cardíacas me ayudó a optimizar mi recuperación. Resultado: 15% más de rendimiento.',
      avatar: '⚡'
    }
  ];

  featureToneClasses(color: string): string {
    const tones: Record<string, string> = {
      indigo: 'bg-indigo-500/15 text-indigo-300',
      red: 'bg-red-500/15 text-red-300',
      cyan: 'bg-cyan-500/15 text-cyan-300',
      emerald: 'bg-emerald-500/15 text-emerald-300',
      amber: 'bg-amber-500/15 text-amber-300',
      purple: 'bg-purple-500/15 text-purple-300',
    };
    return tones[color] ?? 'bg-indigo-500/15 text-indigo-300';
  }

  ngOnInit() {
    // Simulación del pulso cardíaco para el mockup del Hero
    let bpm = 142;
    let dir = 1;
    this.intervalId = setInterval(() => {
      bpm += dir * ((Math.random() * 3) | 0);
      if (bpm > 158) dir = -1;
      if (bpm < 130) dir = 1;
      
      this.currentBpm.set(bpm);
      this.currentZone.set(bpm < 130 ? 2 : bpm < 145 ? 3 : bpm < 160 ? 4 : 5);
    }, 900);
  }

  ngOnDestroy() {
    // Evita memory leaks destruyendo el intervalo al salir de la ruta
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getZoneLabel(zone: number): string {
    const labels: Record<number, string> = { 
      1: 'Reposo', 
      2: 'Aeróbico ligero', 
      3: 'Aeróbico', 
      4: 'Anaeróbico', 
      5: 'Máximo' 
    };
    return labels[zone] ?? 'Zona ' + zone;
  }

  getZoneColor(zone: number): string {
    const colors: Record<number, string> = { 
      1: '#3b82f6', 
      2: '#10b981', 
      3: '#f59e0b', 
      4: '#ef4444', 
      5: '#b91c1c' 
    };
    return colors[zone] ?? '#6366f1';
  }
}