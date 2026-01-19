import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginResponse } from '../../../model/login-response.model';
import { AuthService } from '../../../services/auth-service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarData } from '../../../model/snackbar-data.model';
import { Snackbar } from '../../modals/snackbar/snackbar';
import { ErrorDialogModal } from '../../modals/error-dialog-modal/error-dialog-modal';
import { CommonModule } from '@angular/common';

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
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

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
          const snackbarData: SnackbarData = {
            message: 'Sesión iniciada correctamente',
            iconName: 'check_circle',
          };

          this.snackBar.openFromComponent(Snackbar, {
            duration: 3000,
            verticalPosition: 'bottom',
            panelClass: 'snackbar-panel',
            data: snackbarData,
          });

          this.authService.handleLoginSuccess(
            response.token,
            response.usuarioID,
            usuario.recordarme!
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
              this.dialog.open(ErrorDialogModal, {
                data: {
                  message:
                    "Esta cuenta fue bloqueada por un administrador. " +
                    "Si creés que esto es un error, contactanos para solucionarlo."
                },
                panelClass: 'modal-error',
                autoFocus: false,
                restoreFocus: false,
              });
            }
          } else {
            const backendMsg =
              err.error?.message || err.error?.error || 'Error desconocido en el login';
  
            this.dialog.open(ErrorDialogModal, {
              data: { message: backendMsg },
              panelClass: 'modal-error',
              autoFocus: false,
              restoreFocus: false,
            });
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
        this.mostrarSnackBar('¡Correo enviado! Revisa tu bandeja de entrada.', 'check_circle');
      },
      error: (err) => {
        this.isResending = false;
        this.mostrarSnackBar('Error al reenviar el correo.', 'error');
      }
    });
  }

  private mostrarSnackBar(msg: string, icon: string) {
     this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
  }
}
