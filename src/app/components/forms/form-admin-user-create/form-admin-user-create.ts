import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorDialogModal } from '../../modals/error-dialog-modal/error-dialog-modal';
import { UsuarioService } from '../../../services/usuario-service';
import { RolUsuario } from '../../../model/rol-usuario.model';
import { UiNotificationService } from '../../../services/ui-notification-service';

@Component({
  selector: 'app-form-admin-user-create',
  imports: [ReactiveFormsModule],
  templateUrl: './form-admin-user-create.html',
  styleUrl: './form-admin-user-create.css',
})
export class FormAdminUserCreate {
  private dialog = inject(MatDialog);
  private dialogRef = inject<MatDialogRef<unknown>>(MatDialogRef, {
    optional: true,
  });
  private formBuilder = inject(FormBuilder);
  private uiNotificationService = inject(UiNotificationService);
  private usuarioService = inject(UsuarioService);

  showPassword = false;

  roles = RolUsuario.ROLES_LOGUEADOS;

  form = this.formBuilder.group(
    {
      nombreCompleto: [
        '',
        [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
      ],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(50)]
      ],
      rol: [
        '',
        Validators.required
      ],
      telefono: [
        '',
        [Validators.required, Validators.pattern(/^\d{10,15}$/)]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/
          ),
        ],
      ]
    }
  );

  mostrarError(formControlName: string) {
    return (
      this.form.get(formControlName)?.invalid &&
      (this.form.get(formControlName)?.touched ||
       this.form.get(formControlName)?.dirty)
    );
  }

  onSubmit() {
    const usuario = this.form.value;

    this.usuarioService
      .createUsuario({
        nombreCompleto: usuario.nombreCompleto!,
        email: usuario.email!,
        password: usuario.password!,
        rolUsuario: usuario.rol!,
        telefono: usuario.telefono!,
      })
      .subscribe({
        next: () => {
          this.uiNotificationService.abrirSnackBarExito('Usuario creado exitosamente.')

          // El form puede existir dentro de un modal
          this.dialogRef?.close(true);
        },
        error: (err) => {
          this.uiNotificationService.abrirModalError(err);
        },
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
