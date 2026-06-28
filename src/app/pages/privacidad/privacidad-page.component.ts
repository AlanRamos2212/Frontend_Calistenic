import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacidad-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrapper page-wrapper--narrow page-wrapper--centered animate-fade-in">
      <div class="w-full flex flex-col gap-10">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100 m-0">Aviso de Privacidad</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">Como manejamos y protegemos tus datos.</p>
        </div>

        <div class="glass-card p-8 flex flex-col gap-6 text-slate-600 dark:text-slate-400 text-sm leading-[1.8]">
          <section>
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Recopilacion de Datos</h2>
            <p>Recopilamos informacion personal (nombre, email) y metricas de salud (frecuencia cardiaca, calorias, duracion) generadas durante tus entrenamientos para proporcionar y mejorar nuestro servicio.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Uso de la Informacion</h2>
            <p>Tus datos de salud se procesan localmente y, si esta configurado, se sincronizan de forma segura para generar tu historial. No vendemos tus datos personales ni tus metricas a terceros.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Seguridad</h2>
            <p>Implementamos medidas de seguridad estandar de la industria para proteger tu informacion personal y los datos de tu wearable contra acceso no autorizado.</p>
          </section>
        </div>
      </div>
    </div>
  `,
})
export class PrivacidadPageComponent {}
