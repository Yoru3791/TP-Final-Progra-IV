import { Component, inject, Input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsuarioUpdate } from '../../../model/usuario-update.model';
import { UsuarioService } from '../../../services/usuario-service';
import { UiNotificationService } from '../../../services/ui-notification-service';

@Component({
  selector: 'app-form-user-update',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './form-user-update.html',
  styleUrls: ['./form-user-update.css'],
})
export class FormUserUpdate {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private dialogRef = inject(MatDialogRef<FormUserUpdate>);
  private data = inject(MAT_DIALOG_DATA) as UsuarioUpdate | null;
  private uiNotificationService = inject(UiNotificationService);

  cargando = signal<boolean>(false);

  form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.minLength(1)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
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

  actualizarUsuario() {
    const id = this.data?.id;
    if (this.form.invalid || !id) return;

    this.cargando.set(true);

    const payload: UsuarioUpdate = this.form.value as UsuarioUpdate;

    this.usuarioService.updateUsuario(id, payload).subscribe({
      next: (resp) => {
        this.cargando.set(false);
        this.uiNotificationService.abrirSnackBarExito('Perfil actualizado correctamente.');
        
        const emailCambio = this.data?.email !== payload.email;
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
