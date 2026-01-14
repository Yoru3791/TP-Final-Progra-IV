import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorDialogModal } from '../../modals/error-dialog-modal/error-dialog-modal';
import { SnackbarData } from '../../../model/snackbar-data.model';
import { Snackbar } from '../../modals/snackbar/snackbar';
import { UsuarioService } from '../../../services/usuario-service';
import { RolUsuario } from '../../../model/rol-usuario.model';

@Component({
  selector: 'app-form-admin-user',
  imports: [ReactiveFormsModule],
  templateUrl: './form-admin-user.html',
  styleUrl: './form-admin-user.css',
})
export class FormAdminUserCreate {
  private dialog = inject(MatDialog);
  private dialogRef = inject<MatDialogRef<unknown>>(MatDialogRef, {
    optional: true,
  });
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
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
          this.snackBar.openFromComponent(Snackbar, {
            duration: 3000,
            verticalPosition: 'bottom',
            panelClass: 'snackbar-panel',
            data: {
              message: 'Usuario creado con éxito.',
              iconName: 'check_circle',
            } as SnackbarData,
          });

          // El form puede existir dentro de un modal
          this.dialogRef?.close(true);
        },
        error: (err) => {
          const backendMsg =
            err.error?.message || err.error?.error || 'Error desconocido en el registro';

          console.error(backendMsg);

          this.dialog.open(ErrorDialogModal, {
            data: {
              message: backendMsg,
            },
            panelClass: 'modal-error',
          });
        },
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
