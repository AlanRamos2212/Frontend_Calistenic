import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';

interface HelpItem {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-help-panel',
  standalone: true,
  imports: [CommonModule, AccordionModule],
  templateUrl: './help-panel.component.html',
  styleUrl: './help-panel.component.css'
})
export class HelpPanelComponent {
  helpItems: HelpItem[] = [
    {
      icon: '📱',
      title: 'Dispositivos Móviles (Android / iOS)',
      description: 'En Android, es compatible 100% en Chrome. En iOS (iPhone/iPad), Safari bloquea Web Bluetooth. Usa navegadores especializados como Bluefy o WebBLE desde el App Store para emparejar tu wearable BLE.'
    },
    {
      icon: '📺',
      title: 'Smart TVs y Televisores Inteligentes',
      description: 'La mayoría de Smart TVs (Samsung Tizen, LG webOS, Android TV) tienen navegadores simplificados sin APIs de Bluetooth. Utiliza el Simulador Virtual o vincula desde un PC y proyecta la pantalla.'
    },
    {
      icon: '🔔',
      title: 'Notificaciones del Sistema y PWA',
      description: 'Recibe alertas cuando tu ritmo cardíaco supere los límites de seguridad. En PC funciona de forma nativa. En iOS, guarda el sitio como PWA (Agregar a inicio) para recibir notificaciones push.'
    },
    {
      icon: '💙',
      title: 'Zonas de Frecuencia Cardíaca',
      description: 'Z1 (Calentamiento): 60–100 BPM · Z2 (Quema grasa): 100–140 BPM · Z3 (Aeróbico): 140–170 BPM · Z4 (Umbral): 170–180 BPM · Z5 (Máximo): >180 BPM'
    }
  ];
}
