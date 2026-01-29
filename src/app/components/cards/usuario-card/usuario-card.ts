import { Component, computed, inject, Input, signal, Signal } from '@angular/core';
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
  @Input({ required: true }) usuario!: UsuarioAdminResponse;
  usuarioSignal = signal<UsuarioAdminResponse|null>(null);

  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private uiNotificationService = inject(UiNotificationService);
  private usuarioService = inject(UsuarioService);

  isDeleted = computed(() =>
    this.usuarioSignal()?.deletedAt !== null
  );

  deletionDate = "";

  isBanned = computed(() =>
    this.usuarioSignal()?.bannedAt !== null
  );

  banDate = "";

  isEditable = computed(() =>
    this.usuarioSignal()?.id !== 1 && this.usuarioSignal()?.id !== this.authService.usuarioId()
    && !this.isDeleted()
  );

  ngOnChanges() {
    this.usuarioSignal.set(this.usuario);

    if (this.isDeleted()) {
      this.deletionDate = this.usuario.deletedAt.split('T')[0];
    }

    if (this.isBanned()) {
      this.banDate = this.usuario.bannedAt.split('T')[0];
    }
  }

  changePassword() {
      this.dialog
        .open(AdminUserUpdatePasswordModal, {
          panelClass: 'form-modal',
          autoFocus: false,
          restoreFocus: false,
          data: this.usuario,
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
          texto: '¿Seguro de que querés activar este usuario?',
      })
    );

    if (!confirmado) return;

    this.usuarioService
      .enableUsuario(this.usuario.id)
      .subscribe({
        next: () => {
          this.uiNotificationService.abrirSnackBarExito("Usuario activado exitosamente.");
          this.usuarioService.readUsuariosAdmin();
        },
        error: (err) => {
          this.uiNotificationService.abrirModalError(err);
        },
      });
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
              this.usuarioService.readUsuariosAdmin();
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
          critico: banned ? false : true,
      })
    );

    if (!confirmado) return;

    (banned ? this.usuarioService.unbanUsuario(this.usuario.id) : this.usuarioService.banUsuario(this.usuario.id))
      .subscribe({
        next: () => {
          this.uiNotificationService.abrirSnackBarExito(`Usuario ${banned ? 'desbloqueado' : 'bloqueado'} exitosamente.`);
          this.usuarioService.readUsuariosAdmin();
        },
        error: (err) => {
          this.uiNotificationService.abrirModalError(err);
        },
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
      .deleteUsuarioAdmin(this.usuario.id)
      .subscribe({
        next: () => {
          this.uiNotificationService.abrirSnackBarExito("Usuario eliminado exitosamente.");
          this.usuarioService.readUsuariosAdmin();
        },
        error: (error) => {
          this.uiNotificationService.abrirModalError(error);
        },
      });
  }
}
