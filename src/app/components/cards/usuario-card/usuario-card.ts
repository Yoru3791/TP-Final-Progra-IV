import { Component, computed, inject, Input, Signal } from '@angular/core';
import { UsuarioResponse } from '../../../model/usuario-response.model';
import { EmprendimientoService } from '../../../services/emprendimiento-service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { MatDialog } from '@angular/material/dialog';
import { AdminUserUpdateModal } from '../../modals/admin-user-update-modal/admin-user-update-modal';
import { UsuarioService } from '../../../services/usuario-service';
import { ConfirmarModalService } from '../../../services/confirmar-modal-service';
import { SnackbarData } from '../../../model/snackbar-data.model';
import { Snackbar } from '../../modals/snackbar/snackbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorDialogModal } from '../../modals/error-dialog-modal/error-dialog-modal';
import { firstValueFrom } from 'rxjs';
import { AdminUserUpdatePasswordModal } from '../../modals/admin-user-update-password-modal/admin-user-update-password-modal';

@Component({
  selector: 'app-usuario-card',
  imports: [RouterLink],
  templateUrl: './usuario-card.html',
  styleUrl: './usuario-card.css',
})
export class UsuarioCard {
  @Input() usuario!: UsuarioResponse;

  private authService = inject(AuthService);
  private confirmarModalService = inject(ConfirmarModalService);
  private dialog = inject(MatDialog);
  private emprendimientoService = inject(EmprendimientoService);
  private snackBar = inject(MatSnackBar);
  private usuarioService = inject(UsuarioService);

  isEditable = computed(() => this.usuario.id !== 1 && this.usuario.id !== this.authService.usuarioId());

  emprendimientos = computed(() =>
    this.emprendimientoService.allEmprendimientosAdmin().filter(datum => datum.dueno.id === this.usuario.id)
  );

  changePassword() {
      this.dialog
        .open(AdminUserUpdatePasswordModal, {
          panelClass: 'form-modal',
          autoFocus: false,
          restoreFocus: false,
          data: this.usuario,
        })
        .afterClosed()
        .subscribe();
  }

  edit() {
      this.dialog
        .open(AdminUserUpdateModal, {
          panelClass: 'form-modal',
          autoFocus: false,
          restoreFocus: false,
          data: this.usuario,
        })
        .afterClosed()
        .subscribe((result) => {
            if (result === true) {
              this.usuarioService.readUsuarios();
            }
          }
        );
  }

  ban() {

  }

  async delete() {
    const confirmado = await firstValueFrom(
      this.confirmarModalService.confirmar({
          titulo: 'Eliminar usuario',
          texto:
            '¿Seguro de que querés eliminar este usuario? <span>Esta acción es irreversible.</span>',
          textoEsHtml: true,
          critico: true,
      })
    );

    if (!confirmado) return;

    this.usuarioService
      .deleteUsuarioAdmin(this.usuario.id)
      .subscribe({
        next: () => {
          this.abrirSnackBar("Usuario eliminado con éxito");
          this.usuarioService.readUsuarios();
        },
        error: (error) => {
          this.abrirModalError(error);
        },
      });
  }

  private abrirSnackBar(mensaje: string) {
    const snackbarData: SnackbarData = {
      message: mensaje,
      iconName: 'check_circle',
    };

    this.snackBar.openFromComponent(Snackbar, {
      duration: 4000,
      verticalPosition: 'bottom',
      panelClass: 'snackbar-panel',
      data: snackbarData,
    });
  }
  
  private abrirModalError(error: any) {
    const backendMsg =
      error?.message || 'Error al eliminar el usuario. Es posible que tenga datos asociados.';

    this.dialog.open(ErrorDialogModal, {
      data: { message: backendMsg },
      panelClass: 'modal-error',
      autoFocus: false,
      restoreFocus: false,
    });
  }
}
