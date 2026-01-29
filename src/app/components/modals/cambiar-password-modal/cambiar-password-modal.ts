import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario-service';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordRequest } from '../../../model/change-password-request.model';
import { SuccessDialogModal } from '../success-dialog-modal/success-dialog-modal'; 
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';
import { UiNotificationService } from '../../../services/ui-notification-service';

@Component({
  selector: 'app-cambiar-password-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './cambiar-password-modal.html',
  styleUrl: './cambiar-password-modal.css',
})
export class CambiarPasswordModal {
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CambiarPasswordModal>);
  private dialog = inject(MatDialog);
  private uiNotificationService = inject(UiNotificationService);

  showActual = false;
  showNueva = false;
  showRepetirNueva = false;

  form = this.fb.group(
    {
      actual: ['', Validators.required],
      nueva: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/
          ),
        ],
      ],
      repetir: ['', Validators.required],
    },
    {
      validators: [this.validarContraseñasDistintas, this.validarRepetidaIgual],
    }
  );

  // La nueva contraseña no puede ser igual a la actual
  validarContraseñasDistintas(form: any) {
    const actual = form.get('actual')?.value;
    const nueva = form.get('nueva')?.value;

    if (actual && nueva && actual === nueva) {
      form.get('nueva')?.setErrors({ mismaQueActual: true });
    } else {
      const errores = form.get('nueva')?.errors;
      if (errores) {
        delete errores['mismaQueActual'];
        if (Object.keys(errores).length === 0) form.get('nueva')?.setErrors(null);
      }
    }

    return null;
  }

  // La contraseña repetida debe coincidir
  validarRepetidaIgual(form: any) {
    const nueva = form.get('nueva')?.value;
    const repetir = form.get('repetir')?.value;

    if (nueva && repetir && nueva !== repetir) {
      form.get('repetir')?.setErrors({ noCoincide: true });
    } else {
      const errores = form.get('repetir')?.errors;
      if (errores) {
        delete errores['noCoincide'];
        if (Object.keys(errores).length === 0) form.get('repetir')?.setErrors(null);
      }
    }

    return null;
  }

  actualizar() {
    if (this.form.invalid) return;

    const body: ChangePasswordRequest = {
      passwordActual: this.form.value.actual!,
      passwordNueva: this.form.value.nueva!,
    };

    this.usuarioService.cambiarPassword(body).subscribe({
      next: () => {
        this.dialog.open(SuccessDialogModal, {
          data: { message: 'Tu contraseña fue actualizada. Volvé a iniciar sesión.' },
          panelClass: 'modal-exito',
          autoFocus: false,
          restoreFocus: false,
        });

        this.dialogRef.close();

        this.authService.handleLogout();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.uiNotificationService.abrirModalError(err);
      },
    });
  }

  toggleActual() {
    this.showActual = !this.showActual;
  }

  toggleNueva() {
    this.showNueva = !this.showNueva;
  }

  toggleRepetirNueva() {
    this.showRepetirNueva = !this.showRepetirNueva;
  }

  cancelar() {
    this.dialogRef.close();
  }
}
