import { Component, EventEmitter, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css'
})
export class AuthModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @Output() close = new EventEmitter<void>();

  readonly isLoginMode = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly authForm: FormGroup = this.fb.group({
    name: ['', [Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]]
  });

  toggleMode(): void {
    this.isLoginMode.update(mode => !mode);
    this.errorMessage.set(null);
    this.authForm.reset();
    
    // El nombre solo es requerido en modo de registro
    if (this.isLoginMode()) {
      this.authForm.get('name')?.clearValidators();
    } else {
      this.authForm.get('name')?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(80)]);
    }
    this.authForm.get('name')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const name = String(this.authForm.value.name ?? '').trim();
    const email = String(this.authForm.value.email ?? '').trim().toLowerCase();
    const password = String(this.authForm.value.password ?? '');

    const request$ = this.isLoginMode()
      ? this.authService.login(email, password)
      : this.authService.register(name, email, password);

    request$.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.close.emit(); // Cerrar modal al autenticar con éxito
        this.router.navigate(['/dashboard']); // Redirigir al Dashboard
      },
      error: () => {
        this.isLoading.set(false);
        // Never expose backend details or distinguish an unknown email from a bad password.
        this.errorMessage.set('No se pudo completar la autenticación. Inténtalo nuevamente.');
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
