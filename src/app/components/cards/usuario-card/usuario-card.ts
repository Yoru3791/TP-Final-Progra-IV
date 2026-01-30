import { Component, computed, inject, input, Input, signal, Signal } from '@angular/core';
import { AuthService } from '../../../services/auth-service';
import { MatDialog } from '@angular/material/dialog';
import { AdminUserUpdateModal } from '../../modals/admin-user-update-modal/admin-user-update-modal';
import { UsuarioService } from '../../../services/usuario-service';
import { UiNotificationService } from '../../../services/ui-notification-service';
import { firstValueFrom } from 'rxjs';
import { AdminUserUpdatePasswordModal } from '../../modals/admin-user-update-password-modal/admin-user-update-password-modal';
import { UsuarioAdminResponse } from '../../../model/usuario-admin-response.model';

@Component({
  selector: 'app-usuario-card',
  imports: [],
  templateUrl: './usuario-card.html',
  styleUrl: './usuario-card.css',
})
export class UsuarioCard {
  usuario = input.required<UsuarioAdminResponse>();

  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private uiNotificationService = inject(UiNotificationService);
  private usuarioService = inject(UsuarioService);

  isDeleted = computed(() => !!this.usuario().deletedAt);

  deletionDate = computed(() => 
    this.usuario().deletedAt ? this.usuario().deletedAt.split('T')[0] : ''
  );

  isBanned = computed(() => !!this.usuario().bannedAt);

  banDate = computed(() => 
    this.usuario().bannedAt ? this.usuario().bannedAt.split('T')[0] : ''
  );

  isEditable = computed(() => {
    const u = this.usuario();
    return u.id !== 1 && u.id !== this.authService.usuarioId() && !u.deletedAt;
  });

  private refreshList() {
    const currentPage = this.usuarioService.adminPageInfo()?.number || 0;
    this.usuarioService.fetchUsuariosAdmin(currentPage);
  }

  changePassword() {
      this.dialog
        .open(AdminUserUpdatePasswordModal, {
          panelClass: 'form-modal',
          autoFocus: false,
          restoreFocus: false,
          data: this.usuario(),
        })
        .afterClosed()
        .subscribe({
          error: (err) => this.uiNotificationService.abrirModalError(err)
        });
  }

  async enable() {
    const confirmado = await firstValueFrom(
      this.uiNotificationService.abrirModalConfirmacion({
          titulo: 'Activar usuario',
          texto: '¿Seguro de que querés activar este usuario manualmente?',
      })
    );

    if (!confirmado) return;

    this.usuarioService
      .enableUsuario(this.usuario().id)
      .subscribe({
        next: () => {
          this.uiNotificationService.abrirSnackBarExito("Usuario activado exitosamente.");
          this.refreshList();
        },
        error: (err) => this.uiNotificationService.abrirModalError(err),
      });
  }

  edit() {
      this.dialog
        .open(AdminUserUpdateModal, {
          panelClass: 'form-modal',
          autoFocus: false,
          restoreFocus: false,
          data: this.usuario(),
        })
        .afterClosed()
        .subscribe((result) => {
            if (result === true) {
              this.refreshList();
            }
          }
        );
  }

  async toggleBan() {
    const banned = this.isBanned();

    const confirmado = await firstValueFrom(
      this.uiNotificationService.abrirModalConfirmacion({
          titulo: `${banned ? 'Desbloquear' : 'Bloquear'} usuario`,
          texto: `¿Seguro de que querés ${banned ? 'desbloquear' : 'bloquear'} a este usuario?`,
          critico: !banned,
      })
    );

    if (!confirmado) return;

    const action$ = banned 
        ? this.usuarioService.unbanUsuario(this.usuario().id) 
        : this.usuarioService.banUsuario(this.usuario().id);

    action$.subscribe({
        next: () => {
          this.uiNotificationService.abrirSnackBarExito(`Usuario ${banned ? 'desbloqueado' : 'bloqueado'} exitosamente.`);
          this.refreshList();
        },
        error: (err) => this.uiNotificationService.abrirModalError(err),
      });
  }

  async delete() {
    const confirmado = await firstValueFrom(
      this.uiNotificationService.abrirModalConfirmacion({
          titulo: 'Eliminar usuario',
          texto: '¿Seguro de que querés eliminar este usuario? <span>Esta acción es irreversible.</span>',
          textoEsHtml: true,
          critico: true,
      })
    );

    if (!confirmado) return;

    this.usuarioService
      .deleteUsuarioAdmin(this.usuario().id)
      .subscribe({
        next: () => {
          this.uiNotificationService.abrirSnackBarExito("Usuario eliminado exitosamente.");
          this.refreshList();
        },
        error: (error) => this.uiNotificationService.abrirModalError(error),
      });
  }
}
