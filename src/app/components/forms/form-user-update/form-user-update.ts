import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsuarioUpdate } from '../../../model/usuario-update.model';
import { UsuarioService } from '../../../services/usuario-service';
import { UiNotificationService } from '../../../services/ui-notification-service';
import { AuthService } from '../../../services/auth-service';
import { UsuarioResponse } from '../../../model/usuario-response.model';
import { UsuarioAdminResponse } from '../../../model/usuario-admin-response.model';
import { Observable } from 'rxjs';
import { UsuarioUpdateAdmin } from '../../../model/usuario-update-admin.model';

@Component({
  selector: 'app-form-user-update',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './form-user-update.html',
  styleUrls: ['./form-user-update.css'],
})
export class FormUserUpdate {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private dialogRef = inject(MatDialogRef<FormUserUpdate>);
  private data = inject(MAT_DIALOG_DATA) as UsuarioUpdate | null;
  private uiNotificationService = inject(UiNotificationService);

  cargando = signal<boolean>(false);

  form = this.formBuilder.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(256)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/)]],
  });

  constructor() {
    if (this.data) {
      this.form.patchValue({
        nombreCompleto: this.data.nombreCompleto,
        email: this.data.email,
        telefono: this.data.telefono,
      });
    }
  }

  get formBuilder() {
    return this.fb;
  }

  actualizarUsuario() {
    const id = this.data?.id;
    if (this.form.invalid || !id) return;

    this.cargando.set(true);

    let payload: UsuarioUpdate|UsuarioUpdateAdmin;
    let response: Observable<UsuarioResponse|UsuarioAdminResponse>;

    // El controlador de admin usa la misma ruta para actualizar pero recibe un DTO distinto
    if (this.authService.currentUserRole() === 'ADMIN') {
      payload = {
        nombreCompleto: this.form.value.nombreCompleto!,
        email: this.form.value.email!,
        rolUsuario: 'ADMIN',
        telefono: this.form.value.telefono!
      };

      response = this.usuarioService.updateUsuarioAdmin(id, payload);
    }
    else {
      payload = this.form.value as UsuarioUpdate;

      response = this.usuarioService.updateUsuario(id, payload);
    }

    response.subscribe({
      next: (resp) => {
        this.cargando.set(false);
        
        const emailCambio = this.data?.email !== payload.email;

        if (!emailCambio) {
          this.uiNotificationService.abrirSnackBarExito('Perfil actualizado correctamente.');
        }
        
        this.dialogRef.close({ resp, emailCambio });
      },
      error: (err) => {
        this.cargando.set(false);
        this.uiNotificationService.abrirModalError(err);
      },
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
