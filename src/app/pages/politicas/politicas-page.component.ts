import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-politicas-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-[800px] mx-auto px-6 py-12 flex flex-col gap-8 animate-fade-in">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100 m-0">Términos y Políticas</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-2">Condiciones de uso de nuestra plataforma.</p>
      </div>
      
      <div class="glass-card p-8 flex flex-col gap-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
        <section>
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">1. Aceptación de los Términos</h2>
          <p>Al acceder y utilizar CalistenicTrack, aceptas estar sujeto a estos Términos y Condiciones. Si no estás de acuerdo con alguna parte, no podrás acceder al servicio.</p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">2. Uso de la Plataforma</h2>
          <p>La plataforma está diseñada para el seguimiento de entrenamientos y métricas físicas. Eres responsable de utilizar la app de manera segura y de consultar a un médico antes de iniciar cualquier programa de ejercicio intenso.</p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">3. Cuentas de Usuario</h2>
          <p>Debes mantener la confidencialidad de tu cuenta y contraseña. Nos reservamos el derecho de rechazar el servicio, cancelar cuentas o eliminar contenido a nuestra discreción.</p>
        </section>
      </div>
    </div>
  `,
})
export class PoliticasPageComponent {}
