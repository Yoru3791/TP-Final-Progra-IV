import { Component, AfterViewInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginResponse } from '../../../model/login-response.model';
import { environment } from '../../../environments/environment';
import { Snackbar } from '../../modals/snackbar/snackbar';
import { SnackbarData } from '../../../model/snackbar-data.model';

declare var google: any;

@Component({
  selector: 'app-google-login-button',
  imports: [],
  templateUrl: './google-login-button.html',
  styleUrl: './google-login-button.css',
})
export class GoogleLoginButton implements AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.handleGoogleCredential(response),
    });

    google.accounts.id.renderButton(document.getElementById('google-btn'), {
      theme: 'outline',
      size: 'large',
      width: '350',
      text: 'signin_with',
      logo_alignment: 'left',
    });
  }

  handleGoogleCredential(response: any) {
    if (response.credential) {
      console.log(' Token recibido de Google');

      this.authService.loginGoogle(response.credential).subscribe({
        next: (res: LoginResponse) => {
          console.log('Backend respondió OK. Token recibido.');

          this.authService.handleLoginSuccess(res.token, res.usuarioID, true);

          this.showSnackBar('¡Bienvenido! Sesión iniciada con Google.', 'check_circle');

          setTimeout(() => {
            this.router.navigate(['/home']).then((success) => {
              if (success) {
                console.log('4. Navegación exitosa.');
              } else {
                console.error('4. ERROR: La navegación fue bloqueada.');
              }
            });
          }, 200);
        },
        error: (err) => {
          console.error('Error en login Google:', err);
          let msg = 'Error al iniciar sesión con Google';

          if (err.status === 403)
            msg = 'El correo no está registrado. Por favor regístrese primero.';
          else if (err.status === 401) msg = 'Cuenta deshabilitada.';

          this.showSnackBar(msg, 'error');
        },
      });
    }
  }

  private showSnackBar(message: string, iconName: string) {
    const snackbarData: SnackbarData = {
      message: message,
      iconName: iconName,
    };

    this.snackBar.openFromComponent(Snackbar, {
      duration: 3000,
      verticalPosition: 'bottom',
      panelClass: 'snackbar-panel',
      data: snackbarData,
    });
  }
}
