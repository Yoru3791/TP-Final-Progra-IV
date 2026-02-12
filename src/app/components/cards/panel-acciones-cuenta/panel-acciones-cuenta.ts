import { Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EliminarCuentaPaso1 } from '../../modals/eliminar-cuenta-paso1/eliminar-cuenta-paso1';
import { ConfirmarLogout } from '../../modals/logout-modal/logout-modal';
import { CambiarPasswordModal } from '../../modals/cambiar-password-modal/cambiar-password-modal';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-panel-acciones-cuenta',
  imports: [RouterLink],
  templateUrl: './panel-acciones-cuenta.html',
  styleUrl: './panel-acciones-cuenta.css',
})
export class PanelAccionesCuenta {
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  esAdmin = computed(() => this.authService.currentUserRole() === 'ADMIN');

  esAdminOriginal = computed(() =>
    this.esAdmin() && this.authService.usuarioId() === 1
  );

  cambiarPassword() {
    this.dialog.open(CambiarPasswordModal, {
      panelClass: 'form-modal',
      width: '55rem',
      maxWidth: '95vw',
    });
  }

  cerrarSesion() {
    this.dialog.open(ConfirmarLogout);
  }

  eliminarCuenta() {
    this.dialog.open(EliminarCuentaPaso1);
  }
}
