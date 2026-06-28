# Instalación de Iconos: Font Awesome + Tabler Icons

## ✅ Cambios Realizados

### 1. **Instalación de Librerías**
```bash
npm install @fortawesome/fontawesome-free tabler-icons --legacy-peer-deps
```

**Paquetes instalados:**
- `@fortawesome/fontawesome-free` - Librería de iconos Font Awesome (2000+ iconos)
- `tabler-icons` - Librería de iconos Tabler (5000+ iconos modernos)

---

### 2. **Configuración en `angular.json`**

Se agregaron los estilos CSS de ambas librerías:
```json
"styles": [
  "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
  "node_modules/tabler-icons/tabler-icons.css",
  "src/styles.css"
]
```

---

### 3. **Servicios Creados**

#### `icon.service.ts`
Servicio que mapea emojis a iconos y permite cambiar entre Font Awesome y Tabler Icons dinámicamente.

**Métodos principales:**
- `getIcon(emoji)` - Obtiene el nombre del icono
- `setLibrary('fontawesome' | 'tabler')` - Cambia la librería activa

---

### 4. **Componentes Creados**

#### `icon.component.ts`
Componente reutilizable para mostrar iconos de ambas librerías.

**Uso:**
```html
<app-icon 
  [iconName]="'fa-dumbbell'" 
  [size]="'1.5em'"
  [customClasses]="'text-blue-500'"
></app-icon>
```

---

### 5. **Pipes Creados**

#### `icon.pipe.ts`
Pipe para renderizar iconos directamente en templates (aunque se recomienda usar el componente).

---

### 6. **Iconos Reemplazados**

#### En `exercises.data.ts`:
```
💪 → fa-dumbbell (Font Awesome)
🏋️ → tb-barbell (Tabler)
⚡ → fa-bolt (Font Awesome)
🔥 → tb-flame (Tabler)
🚀 → fa-rocket (Font Awesome)
🦵 → tb-run (Tabler)
🤸 → fa-person-biking (Font Awesome)
🧘 → tb-yoga (Tabler)
👑 → fa-crown (Font Awesome)
🐉 → tb-dragon (Tabler)
```

#### En `ejercicios-page.component.ts`:
```
🏆 → fa-trophy (Font Awesome)
💪 → fa-dumbbell (Font Awesome)
🔥 → tb-flame (Tabler)
🦵 → tb-run (Tabler)
🚀 → fa-rocket (Font Awesome)
```

#### En `search.service.ts`:
```
📊 → fa-chart-line (Font Awesome)
💪 → fa-dumbbell (Font Awesome)
📈 → tb-trend-up (Tabler)
🌐 → fa-globe (Font Awesome)
👑 → fa-crown (Font Awesome)
```

#### En `theme-toggle.component.ts`:
```html
☀️ → <i class="fas fa-sun"></i> (Font Awesome)
🌙 → <i class="fas fa-moon"></i> (Font Awesome)
```

---

## 🎨 Cómo Usar los Iconos en Componentes

### Opción 1: Componente IconComponent (Recomendado)
```typescript
import { IconComponent } from './components/icon/icon.component';

@Component({
  imports: [IconComponent],
  template: `
    <app-icon [iconName]="'fa-dumbbell'" [size]="'1.5em'"></app-icon>
  `
})
export class MyComponent {}
```

### Opción 2: Directamente con clases
```html
<!-- Font Awesome -->
<i class="fas fa-dumbbell"></i>

<!-- Tabler Icons (SVG) -->
<svg class="icon icon-tabler icon-tabler-dumbbell" ...></svg>
```

### Opción 3: Usando el Pipe (en desarrollo)
```html
<i [innerHTML]="'fa-dumbbell' | icon"></i>
```

---

## 📚 Documentación

### Font Awesome
- **Sitio oficial:** https://fontawesome.com/
- **Búsqueda de iconos:** https://fontawesome.com/search
- **Prefijo para clases:** `fa-`

### Tabler Icons
- **Sitio oficial:** https://tabler-icons.io/
- **Prefijo para identificación:** `tb-`

---

## 🚀 Próximos Pasos (Recomendados)

1. **Actualizar templates** para usar `<app-icon>` en lugar de emojis directamente
2. **Crear un custom theme** para colorear los iconos según el esquema de colores
3. **Optimizar Tabler Icons** - Actualmente usan SVG, considerar usar iconos pre-renderizados
4. **Agregar animaciones** a los iconos para mejorar la interactividad

---

## ✨ Ventajas de esta Mezcla

✅ **Font Awesome** - Iconos profesionales y bien documentados  
✅ **Tabler Icons** - Iconos modernos y minimalistas  
✅ **Flexibilidad** - Fácil cambiar entre librerías  
✅ **Sin dependencias externas** - Funcionan con CSS/SVG puro  
✅ **Escalables** - Se adaptan a cualquier tamaño sin perder calidad  

---

## ⚙️ Configuración Recomendada

Para un resultado óptimo, considera:

1. **Usar principalmente Font Awesome** (más completa y rápida)
2. **Usar Tabler para iconos específicos** (yoga, dragon, trend-up)
3. **Aplicar el mismo color** a todos los iconos del mismo contexto

Ejemplo CSS:
```css
.workout-icon {
  color: #6366f1; /* Color del icono */
  font-size: 1.5rem;
}
```
