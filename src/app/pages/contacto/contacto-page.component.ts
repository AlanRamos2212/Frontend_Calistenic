import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacto-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrapper page-wrapper--narrow page-wrapper--centered animate-fade-in">
      <div class="w-full flex flex-col gap-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100 m-0">Contactanos</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-2">Estamos aqui para ayudarte a mejorar tus entrenamientos.</p>
        </div>

        <div class="glass-card p-8">
          <form class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Nombre completo</label>
              <input type="text" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors" placeholder="Juan Perez">
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Correo electronico</label>
              <input type="email" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors" placeholder="juan@ejemplo.com">
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Mensaje</label>
              <textarea rows="4" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors resize-none" placeholder="En que te podemos ayudar?"></textarea>
            </div>

            <button type="button" class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0">
              Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class ContactoPageComponent {}
