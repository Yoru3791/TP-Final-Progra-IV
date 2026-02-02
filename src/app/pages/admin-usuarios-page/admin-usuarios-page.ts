import { Component, computed, effect, inject, signal } from '@angular/core';
import { UsuarioCard } from '../../components/cards/usuario-card/usuario-card';
import { UsuarioService } from '../../services/usuario-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmprendimientoService } from '../../services/emprendimiento-service';
import { MatDialog } from '@angular/material/dialog';
import { AdminUserCreateModal } from '../../components/modals/admin-user-create-modal/admin-user-create-modal';
import { Paginador } from '../../components/utils/paginador/paginador';

@Component({
  selector: 'app-admin-usuarios-page',
  imports: [UsuarioCard, Paginador],
  templateUrl: './admin-usuarios-page.html',
  styleUrl: './admin-usuarios-page.css',
})
export class AdminUsuariosPage {

  private dialog = inject(MatDialog);
  public usuarioService = inject(UsuarioService);

  usuarios = computed(() => this.usuarioService.usuariosAdmin());
  pageInfo = computed(() => this.usuarioService.adminPageInfo());

  constructor() {
    effect(() => {
      this.usuarioService.adminFiltroNombre();
      this.usuarioService.adminFiltroEmail();
      this.usuarioService.adminSoloEliminados();
      
      this.usuarioService.fetchUsuariosAdmin(0, 10);
    });
  }

  public onNameInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.usuarioService.adminFiltroNombre.set(val.trim());
  }

  public onEmailInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.usuarioService.adminFiltroEmail.set(val.trim());
  }

  onToggleEliminados(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.usuarioService.adminSoloEliminados.set(isChecked);
  }

  onPageChange(page: number) {
      this.usuarioService.fetchUsuariosAdmin(page, 10);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public openUsuarioForm() {
    this.dialog
      .open(AdminUserCreateModal, {
        panelClass: 'form-modal',
        autoFocus: false,
        restoreFocus: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === true) {
          this.usuarioService.fetchUsuariosAdmin(0, 10);
        }
      });
  }
}
