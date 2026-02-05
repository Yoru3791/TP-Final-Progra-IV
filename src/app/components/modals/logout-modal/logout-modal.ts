import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';
import { UiNotificationService } from '../../../services/ui-notification-service';

@Component({
  selector: 'app-logout-modal',
  imports: [],
  templateUrl: './logout-modal.html',
  styleUrl: './logout-modal.css',
})
export class ConfirmarLogout {
  private dialogRef = inject(MatDialogRef<ConfirmarLogout>);
  private authService = inject(AuthService);
  private router = inject(Router);
  private uiNotificationService = inject(UiNotificationService);

  cancelar() {
    this.dialogRef.close();
  }

  confirmar() {
    this.dialogRef.close();
    this.uiNotificationService.abrirSnackBarExito('Sesión cerrada exitosamente.');

    this.authService.handleLogout();

    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 400);
  }
}
