import { Component, AfterViewInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { LoginResponse } from '../../../model/login-response.model';
import { environment } from '../../../environments/environment';
import { UiNotificationService } from '../../../services/ui-notification-service';

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
  private uiNotificationService = inject(UiNotificationService);

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.handleGoogleCredential(response),
    });

    google.accounts.id.renderButton(document.getElementById('google-btn'), {
      theme: 'outline',
      size: 'large',
      width: '340',
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

          this.uiNotificationService.abrirSnackBarExito('Sesión iniciada con Google exitosamente.');
          
          setTimeout(() => {
            this.router.navigate(['/home']).then((success) => {
                if (success) {
                    console.log('Navegación exitosa.');
                } else {
                    console.error('Navegación bloqueada.');
                }
            });
          }, 200);
        },
        error: (err) => {
          let msg = 'Error al iniciar sesión con Google.';
          
          if (err.status === 403) {
            msg = 'El correo no está registrado. Por favor registrate primero.';
          } else if (err.status === 401) {
            msg = 'Cuenta deshabilitada.';
          }

          this.uiNotificationService.abrirSnackBarError(err, msg);
        }
      });
    }
  }
}
