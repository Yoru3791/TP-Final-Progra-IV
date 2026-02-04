import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UsuarioService } from '../../../services/usuario-service';
import { AuthService } from '../../../services/auth-service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EliminarCuentaPaso3 } from '../eliminar-cuenta-paso3/eliminar-cuenta-paso3';
import { UiNotificationService } from '../../../services/ui-notification-service';
@Component({
  selector: 'app-eliminar-cuenta-paso2',
  imports: [ReactiveFormsModule],
  templateUrl: './eliminar-cuenta-paso2.html',
  styleUrl: './eliminar-cuenta-paso2.css',
})
export class EliminarCuentaPaso2 {
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<EliminarCuentaPaso2>);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private uiNotificationService = inject(UiNotificationService);

  form = this.fb.group({
    confirm: ['', [Validators.required]],
  });

  eliminar() {
    if (this.form.invalid) return;

    const value = this.form.get('confirm')?.value?.trim().toLowerCase();

    if (value !== 'eliminar') {
      this.uiNotificationService.abrirModalError(null, "Tenés que escribir exactamente la palabra 'eliminar'.");
      return;
    }

    const id = this.authService.usuarioId();

    if (!id) {
      this.uiNotificationService.abrirModalError(null, 'No se encontró el usuario logueado.');
      return;
    }

    this.usuarioService.eliminarCuenta(id).subscribe({
      next: () => {
        this.dialogRef.close();
        this.authService.handleLogout();
        this.dialog.open(EliminarCuentaPaso3, {
            width: '40rem',
            maxWidth: '90vw',
            autoFocus: false
        });
      },
      error: (err) => {
        this.uiNotificationService.abrirModalError(err);
      },
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
