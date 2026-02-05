import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UsuarioResponse } from '../../../model/usuario-response.model';
import { FormUserUpdate } from '../../forms/form-user-update/form-user-update';
import { UsuarioService } from '../../../services/usuario-service';
import { AuthService } from '../../../services/auth-service';
import { UiNotificationService } from '../../../services/ui-notification-service';

@Component({
  selector: 'app-datos-usuario-card',
  imports: [],
  templateUrl: './datos-usuario-card.html',
  styleUrl: './datos-usuario-card.css',
})
export class DatosUsuarioCard implements OnInit {
  private usuarioService = inject(UsuarioService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private authService = inject(AuthService);
  private uiNotificationService = inject(UiNotificationService);

  @Input() usuario!: UsuarioResponse;

  public usuarioSignal = signal<UsuarioResponse>(this.usuario);

  ngOnInit(): void {
    if (this.usuario) {
      this.usuarioSignal.set(this.usuario);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file: File = input.files[0];

    const userId = this.usuarioSignal().id; 

    this.usuarioService.updateImagenUsuario(userId, file).subscribe({
      next: (usuarioActualizado: UsuarioResponse) => {
        this.usuarioSignal.set(usuarioActualizado);
        
        this.uiNotificationService.abrirSnackBarExito('Foto de perfil actualizada exitosamente.');
      },
      error: (err) => {
        let mensaje = 'Ocurrió un error al subir la imagen.';

        if (err.status === 400) {
          mensaje = 'Formato de imagen inválido.';
        } else if (err.status === 403) {
          mensaje = 'No tenés permiso para cambiar esto.';
        }

        this.uiNotificationService.abrirModalError(err, mensaje);
      }
    });

    input.value = ''; 
  }

  openUpdateModal() {
    const dialogRef = this.dialog.open(FormUserUpdate, {
      data: this.usuarioSignal(),
      width: '60rem',
      maxWidth: '95vw',
      panelClass: 'form-modal',
      autoFocus: false,
      restoreFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const { resp, emailCambio } = result;

      if (emailCambio) {
        this.authService.handleLogout();

        this.uiNotificationService.abrirModalExito('Tu email fue actualizado. Por favor iniciá sesión nuevamente.');

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1400);

        return;
      }

      this.usuarioService.getPerfilUsuario().subscribe({
        next: (data) => this.usuarioSignal.set(data),
        error: (err) => this.uiNotificationService.abrirModalError(err),
      });
    });
  }
}
