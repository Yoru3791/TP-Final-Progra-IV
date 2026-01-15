import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  private snackBar = inject(MatSnackBar);

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
        this.snackBar.open('Enlace inválido o incompleto.', 'Cerrar');
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
      this.snackBar.open('Las contraseñas no coinciden.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isSubmitting.set(true);

    this.authService.resetPassword({ token: this.token, newPassword: password! }).subscribe({
      next: (res) => {
        this.snackBar.open('¡Contraseña cambiada con éxito!', 'OK', { duration: 4000 });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.snackBar.open(err.error || 'El enlace ha expirado o es inválido.', 'Cerrar', {
          duration: 5000,
        });
      },
    });
  }
}
