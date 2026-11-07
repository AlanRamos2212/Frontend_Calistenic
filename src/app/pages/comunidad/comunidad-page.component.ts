import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-comunidad-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, TagModule],
  templateUrl: './comunidad-page.component.html',
  styleUrl: './comunidad-page.component.css'
})
export class ComunidadPageComponent {
  readonly appFeatures = [
    { icon: 'pi-mobile',     title: 'Feed Social en vivo',  desc: 'Publica con foto, comenta y reacciona a los entrenamientos de la comunidad.' },
    { icon: 'pi-database',   title: 'Rutinas y ejercicios', desc: 'Explora el catálogo con media y detalle técnico de cada ejercicio.' },
    { icon: 'pi-star',       title: 'Logros y rachas',      desc: 'Desbloquea insignias y mantén tu constancia al día.' },
    { icon: 'pi-chart-line', title: 'Estadísticas reales',  desc: 'Tus sesiones, minutos y ritmo cardíaco promedio sincronizados.' },
  ];

  readonly testSteps = [
    'Descarga el APK v1.0.0 con el botón (descarga directa, sin pasar por GitHub).',
    'Habilita "Instalar de fuentes desconocidas" en tu Android.',
    'Inicia sesión con tu cuenta de CalistenicTrack (backend Render en producción).',
  ];
}
