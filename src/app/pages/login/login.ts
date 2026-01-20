import { Component, inject } from '@angular/core';
import { FormLogin } from '../../components/forms/form-login/form-login';
import { RouterLink } from '@angular/router';
import { GoogleLoginButton } from '../../components/utils/google-login-button/google-login-button';
import { MatDialog } from '@angular/material/dialog';
import { ContrasenaOlvidadaModal } from '../../components/modals/contrasena-olvidada-modal/contrasena-olvidada-modal';

@Component({
  selector: 'app-login',
  imports: [FormLogin, GoogleLoginButton, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private dialog = inject(MatDialog);

  openForgotPassword() {
    this.dialog.open(ContrasenaOlvidadaModal, {
      width: '90%',
      maxWidth: '45rem',
      autoFocus: false,
      panelClass: 'custom-modal-panel' //REVISAR, preguintar a EMI
    });
  }
}
