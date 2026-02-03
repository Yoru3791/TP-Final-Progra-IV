import { Component, inject, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UsuarioService } from '../../../services/usuario-service';
import { UsuarioResponse } from '../../../model/usuario-response.model';
import { UiNotificationService } from '../../../services/ui-notification-service';

@Component({
  selector: 'app-form-admin-user-update-password',
  imports: [ReactiveFormsModule],
  templateUrl: './form-admin-user-update-password.html',
  styleUrl: './form-admin-user-update-password.css',
})
export class FormAdminUserUpdatePassword {
  @Input() usuario!: UsuarioResponse;

  private dialogRef = inject<MatDialogRef<unknown>>(MatDialogRef, {
    optional: true,
  });
  private formBuilder = inject(FormBuilder);
  private uiNotificationService = inject(UiNotificationService);
  private usuarioService = inject(UsuarioService);

  showPassword = false;

  form = this.formBuilder.group({
    password: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/
        ),
      ],
    ],
  });

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
          this.uiNotificationService.abrirSnackBarExito(
            'Contraseña cambiada exitosamente.'
          );
          this.dialogRef?.close(true);
        },
        error: (err) => this.uiNotificationService.abrirModalError(err)
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  cerrarModal() {
    this.dialogRef?.close();
  }
}
