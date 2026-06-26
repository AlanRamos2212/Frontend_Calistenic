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
  readonly features = [
    { icon: 'pi-trophy',   title: 'Tablas de Clasificación', desc: 'Compite con otros atletas por el mayor volumen de entrenamiento.' },
    { icon: 'pi-comments', title: 'Feed Social',             desc: 'Comparte tus logros, sesiones y rutinas con la comunidad.' },
    { icon: 'pi-users',    title: 'Grupos de Entrenamiento', desc: 'Únete o crea grupos para entrenar juntos y motivarse.' },
    { icon: 'pi-target',   title: 'Retos Semanales',         desc: 'Participa en retos de la comunidad y gana insignias exclusivas.' },
  ];
}
