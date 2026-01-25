import { Component, computed, effect, inject, signal } from '@angular/core';
import { UsuarioCard } from '../../components/cards/usuario-card/usuario-card';
import { UsuarioService } from '../../services/usuario-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmprendimientoService } from '../../services/emprendimiento-service';
import { MatDialog } from '@angular/material/dialog';
import { AdminUserCreateModal } from '../../components/modals/admin-user-create-modal/admin-user-create-modal';

@Component({
  selector: 'app-admin-usuarios-page',
  imports: [UsuarioCard],
  templateUrl: './admin-usuarios-page.html',
  styleUrl: './admin-usuarios-page.css',
})
export class AdminUsuariosPage {
  private emprendimientoService = inject(EmprendimientoService);
  private dialog = inject(MatDialog);
  public usuarioService = inject(UsuarioService); // Public para usar en template si es necesario

  // Señales públicas para bindear al [value] del input
  public nameFilter = signal<string>('');
  public emailFilter = signal<string>('');

  usuarios = computed(() => {
    const nameFilter = this.nameFilter().toLowerCase();
    const emailFilter = this.emailFilter().toLowerCase();

    return this.usuarioService.usuariosAdmin().filter((usuario) => {
      if (nameFilter && !usuario.nombreCompleto.toLowerCase().includes(nameFilter)) {
        return false;
      }

      if (emailFilter && !usuario.email.toLowerCase().includes(emailFilter)) {
        return false;
      }

      return true;
    });
  });

  constructor() {
    effect(() => {
      this.usuarioService.readUsuariosAdmin();
      this.emprendimientoService.fetchEmprendimientosAdmin(0, 100);
    });
  }

  public onNameInput(event: Event) {
    this.nameFilter.set((event.target as HTMLInputElement).value.trim());
  }

  public onEmailInput(event: Event) {
    this.emailFilter.set((event.target as HTMLInputElement).value.trim());
  }

  public openUsuarioForm() {
    this.dialog
      .open(AdminUserCreateModal, {
        panelClass: 'form-modal', // Asegúrate que esta clase exista en global styles
        autoFocus: false,
        restoreFocus: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === true) {
          this.usuarioService.readUsuariosAdmin();
        }
      });
  }
}
