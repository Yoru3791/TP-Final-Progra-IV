import { Component, inject, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorDialogModal } from '../../modals/error-dialog-modal/error-dialog-modal';
import { SnackbarData } from '../../../model/snackbar-data.model';
import { Snackbar } from '../../modals/snackbar/snackbar';
import { UsuarioService } from '../../../services/usuario-service';
import { UsuarioResponse } from '../../../model/usuario-response.model';

@Component({
  selector: 'app-form-admin-user-update-password',
  imports: [ReactiveFormsModule],
  templateUrl: './form-admin-user-update-password.html',
  styleUrl: './form-admin-user-update-password.css',
})
export class FormAdminUserUpdatePassword {
  @Input() usuario!: UsuarioResponse;

  private dialog = inject(MatDialog);
  private dialogRef = inject<MatDialogRef<unknown>>(MatDialogRef, {
    optional: true,
  });
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private usuarioService = inject(UsuarioService);

  showPassword = false;

  form = this.formBuilder.group(
    {
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
    const formValues = this.form.value;

    this.usuarioService
      .updatePasswordAdmin(this.usuario.id, {
        nuevaPassword: formValues.password!
      })
      .subscribe({
        next: () => {
          this.snackBar.openFromComponent(Snackbar, {
            duration: 3000,
            verticalPosition: 'bottom',
            panelClass: 'snackbar-panel',
            data: {
              message: 'Contraseña cambiada con éxito.',
              iconName: 'check_circle',
            } as SnackbarData,
          });

          // El form puede existir dentro de un modal
          this.dialogRef?.close(true);
        },
        error: (err) => {
          const backendMsg =
            err.error?.message || err.error?.error || 'Error desconocido al cambiar contraseña';

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
