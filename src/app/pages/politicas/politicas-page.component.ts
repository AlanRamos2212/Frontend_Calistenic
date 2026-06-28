import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-politicas-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrapper page-wrapper--narrow page-wrapper--centered animate-fade-in">
      <div class="w-full flex flex-col gap-10">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100 m-0">Terminos y Politicas</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">Condiciones de uso de nuestra plataforma.</p>
        </div>

        <div class="glass-card p-8 flex flex-col gap-6 text-slate-600 dark:text-slate-400 text-sm leading-[1.8]">
          <section>
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">1. Aceptacion de los Terminos</h2>
            <p>Al acceder y utilizar CalistenicTrack, aceptas estar sujeto a estos Terminos y Condiciones. Si no estas de acuerdo con alguna parte, no podras acceder al servicio.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">2. Uso de la Plataforma</h2>
            <p>La plataforma esta disenada para el seguimiento de entrenamientos y metricas fisicas. Eres responsable de utilizar la app de manera segura y de consultar a un medico antes de iniciar cualquier programa de ejercicio intenso.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">3. Cuentas de Usuario</h2>
            <p>Debes mantener la confidencialidad de tu cuenta y contrasena. Nos reservamos el derecho de rechazar el servicio, cancelar cuentas o eliminar contenido a nuestra discrecion.</p>
          </section>
        </div>
      </div>
    </div>
  `,
})
export class PoliticasPageComponent {}
