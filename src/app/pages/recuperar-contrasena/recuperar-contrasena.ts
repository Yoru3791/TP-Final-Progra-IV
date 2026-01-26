import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { UiNotificationService } from '../../services/ui-notification-service';

@Component({
  selector: 'app-recuperar-contrasena',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './recuperar-contrasena.html',
  styleUrl: './recuperar-contrasena.css',
})
export class RecuperarContrasena {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private uiNotificationService = inject(UiNotificationService);

  token: string = '';
  showPassword = false;
  isSubmitting = signal(false);

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      if (!this.token) {
        this.uiNotificationService.abrirSnackBarError(null, 'Enlace inválido o incompleto.');
        this.router.navigate(['/login']);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { password, confirmPassword } = this.form.value;

    if (password !== confirmPassword) {
      this.uiNotificationService.abrirSnackBarError(null, 'Las contraseñas no coinciden.');
      return;
    }

    this.isSubmitting.set(true);

    this.authService.resetPassword({ token: this.token, newPassword: password! }).subscribe({
      next: () => {
        this.uiNotificationService.abrirSnackBarExito('Contraseña cambiada exitosamente.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.uiNotificationService.abrirSnackBarError(null, 'El enlace expiró o es inválido.');
      },
    });
  }
}
