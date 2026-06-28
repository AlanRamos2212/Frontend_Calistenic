import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'icon',
  standalone: true
})
export class IconPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(iconName: string, size: string = '1em'): SafeHtml {
    if (!iconName) {
      return '';
    }

    // Font Awesome icons
    if (iconName.startsWith('fa-')) {
      return this.sanitizer.sanitize(1, `<i class="fas ${iconName}" style="font-size: ${size}; display: inline-block;"></i>`) || '';
    }

    // Tabler icons
    if (iconName.startsWith('tb-')) {
      const tabler_name = iconName.replace('tb-', '');
      return this.sanitizer.bypassSecurityTrustHtml(
        `<svg class="icon icon-tabler icon-tabler-${tabler_name}" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block;"><path stroke="none" d="M0 0h24v24H0z" fill="none"/></svg>`
      );
    }

    // Fallback: return the string as-is
    return iconName;
  }
}
