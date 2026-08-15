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
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  toggleMode(): void {
    this.isLoginMode.update(mode => !mode);
    this.errorMessage.set(null);
    this.authForm.reset();
    
    // El nombre solo es requerido en modo de registro
    if (this.isLoginMode()) {
      this.authForm.get('name')?.clearValidators();
    } else {
      this.authForm.get('name')?.setValidators([Validators.required]);
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

    const { name, email, password } = this.authForm.value;

    const request$ = this.isLoginMode()
      ? this.authService.login(email, password)
      : this.authService.register(name, email, password);

    request$.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.close.emit(); // Cerrar modal al autenticar con éxito
        this.router.navigate(['/dashboard']); // Redirigir al Dashboard
      },
      error: (err) => {
        this.isLoading.set(false);
        const serverError = err?.error || 'Ocurrió un error inesperado. Inténtalo de nuevo.';
        this.errorMessage.set(typeof serverError === 'string' ? serverError : 'Credenciales inválidas.');
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
