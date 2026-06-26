import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacidad-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-[800px] mx-auto px-6 py-12 flex flex-col gap-8 animate-fade-in">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100 m-0">Aviso de Privacidad</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-2">Cómo manejamos y protegemos tus datos.</p>
      </div>
      
      <div class="glass-card p-8 flex flex-col gap-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
        <section>
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Recopilación de Datos</h2>
          <p>Recopilamos información personal (nombre, email) y métricas de salud (frecuencia cardíaca, calorías, duración) generadas durante tus entrenamientos para proporcionar y mejorar nuestro servicio.</p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Uso de la Información</h2>
          <p>Tus datos de salud se procesan localmente y, si está configurado, se sincronizan de forma segura para generar tu historial. No vendemos tus datos personales ni tus métricas a terceros.</p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Seguridad</h2>
          <p>Implementamos medidas de seguridad estándar de la industria para proteger tu información personal y los datos de tu wearable contra acceso no autorizado.</p>
        </section>
      </div>
    </div>
  `,
})
export class PrivacidadPageComponent {}
