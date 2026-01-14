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
  private usuarioService = inject(UsuarioService);

  private nameFilter = signal<string>("");
  private emailFilter = signal<string>("");

  usuarios = computed(() => {
    const nameFilter = this.nameFilter();
    const emailFilter = this.emailFilter();

    return this.usuarioService.usuarios().filter(
      usuario => {
        if (nameFilter && !usuario.nombreCompleto.toLowerCase().includes(nameFilter.toLowerCase())) {
          return false;
        }

        if (emailFilter && !usuario.email.toLowerCase().includes(emailFilter.toLowerCase())) {
          return false;
        }

        return true;
      }
    );
  });

  constructor() {
    // TO-DO: Usar ruta que devuelva emprendimientos por ID de dueño
    effect(() => {
      this.usuarioService.readUsuarios();
      this.emprendimientoService.fetchEmprendimientos(0, 100, true);
    });
  }

  public onNameInput(event: any) {
    this.nameFilter.set((event.target.value as string).trim());
  }

  public onEmailInput(event: any) {
    this.emailFilter.set((event.target.value as string).trim());
  }

  public openUsuarioForm() {
    this.dialog
      .open(AdminUserCreateModal, {
        panelClass: 'form-modal',
        autoFocus: false,
        restoreFocus: false,
      })
      .afterClosed()
      .subscribe(result => {
        if (result === true) {
          this.usuarioService.readUsuarios();
        }
      });
  }
}
