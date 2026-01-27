import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginResponse } from '../../../model/login-response.model';
import { AuthService } from '../../../services/auth-service';
import { UiNotificationService } from '../../../services/ui-notification-service';

@Component({
  selector: 'app-form-login',
  imports: [ReactiveFormsModule],
  templateUrl: './form-login.html',
  styleUrl: './form-login.css',
})
export class FormLogin {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private uiNotificationService = inject(UiNotificationService);

  unverifiedEmail: string | null = null;
  isResending = false;

  formLogin = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    recordarme: [false],
  });

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.unverifiedEmail = null;
    const usuario = this.formLogin.value;

    this.authService
      .login({
        email: usuario.email || '',
        password: usuario.password || '',
      })
      .subscribe({
        next: (response: LoginResponse) => {
          this.uiNotificationService.abrirSnackBarExito('Sesión iniciada exitosamente.');

          this.authService.handleLoginSuccess(
            response.token,
            response.usuarioID,
            usuario.recordarme!,
          );

          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1000);
        },
        error: (err) => {
          if (err.status === 403) {
            const errorCode: string = err.error.error;

            if (errorCode === 'ACCOUNT_NOT_VERIFIED') {
              this.unverifiedEmail = usuario.email || null;
            } else if (errorCode === 'ACCOUNT_BANNED') {
              this.uiNotificationService.abrirModalError(
                err,
                "Esta cuenta fue bloqueada por un administrador. " +
                "Si creés que esto es un error, contactanos para solucionarlo."
              );
            }
          } else {
            this.uiNotificationService.abrirModalError(err);
          }

          this.formLogin.get('password')?.reset();
          this.formLogin.get('recordarme')?.reset();
        },
      });
  }

  reenviarCorreo() {
    if (!this.unverifiedEmail) return;

    this.isResending = true;
    this.authService.resendToken(this.unverifiedEmail).subscribe({
      next: (res) => {
        this.isResending = false;
        this.unverifiedEmail = null;
        this.uiNotificationService.abrirSnackBarExito('¡Correo enviado! Revisá tu bandeja de entrada.');
      },
      error: (err) => {
        this.isResending = false;
        this.uiNotificationService.abrirSnackBarError(err, 'Error al reenviar el correo.');
      }
    });
  }
}
