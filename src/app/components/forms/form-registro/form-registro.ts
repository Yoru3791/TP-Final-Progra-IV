import { Component, inject, Input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDialogModal } from '../../modals/error-dialog-modal/error-dialog-modal';
import { BasesCondicionesModal } from '../../modals/bases-condiciones-modal/bases-condiciones-modal';
import { MatDialog } from '@angular/material/dialog';
import { NormasComunidadModal } from '../../modals/normas-comunidad-modal/normas-comunidad-modal';
import { AuthService } from '../../../services/auth-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Snackbar } from '../../modals/snackbar/snackbar';
import { SnackbarData } from '../../../model/snackbar-data.model';

@Component({
  selector: 'app-form-registro',
  imports: [ReactiveFormsModule],
  templateUrl: './form-registro.html',
  styleUrl: './form-registro.css',
})
export class FormRegistro {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  showPassword = false;
  showConfirmPassword = false;
  private snackBar = inject(MatSnackBar);

  @Input() rolUsuario: string = '';

  formRegistro = this.fb.group(
    {
      nombreCompleto: [
        '',
        [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
      ],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/,
          ),
        ],
      ],
      confirmarPassword: ['', [Validators.required]],
      aceptarTerminos: [false, Validators.requiredTrue],
      aceptarPoliticas: [false, Validators.requiredTrue],
    },
    { validators: this.passwordsCoinciden },
  );

  onSubmit() {
    const usuario = this.formRegistro.value;
    this.authService
      .register({
        nombreCompleto: usuario.nombreCompleto || '',
        email: usuario.email || '',
        password: usuario.password || '',
        telefono: usuario.telefono || '',
        rolUsuario: this.rolUsuario,
      })
      .subscribe({
        next: () => {
          this.showSnackBar('Cuenta creada con exito! Inicia sesion', 'check_circle');
          this.router.navigate(['/login']);
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

          this.formRegistro.get('password')?.reset();
          this.formRegistro.get('confirmarPassword')?.reset();
          this.formRegistro.get('aceptarTerminos')?.setValue(false);
          this.formRegistro.get('aceptarPoliticas')?.setValue(false);
        },
      });
  }

  openBasesCondiciones() {
    const dialogRef = this.dialog.open(BasesCondicionesModal, {
      disableClose: true,
      panelClass: 'modal-scrolleable',
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === true) {
        this.formRegistro.get('aceptarTerminos')?.setValue(true);
      } else {
        this.formRegistro.get('aceptarTerminos')?.setValue(false);
      }
    });
  }

  openNormasComunidad() {
    const dialogRef = this.dialog.open(NormasComunidadModal, {
      disableClose: true,
      panelClass: 'modal-scrolleable',
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === true) {
        this.formRegistro.get('aceptarPoliticas')?.setValue(true);
      } else {
        this.formRegistro.get('aceptarPoliticas')?.setValue(false);
      }
    });
  }

  passwordsCoinciden(form: any) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmarPassword')?.value;
    return pass === confirm ? null : { noCoinciden: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private showSnackBar(message: string, iconName: string) {
    const snackbarData: SnackbarData = {
      message: message,
      iconName: iconName,
    };

    this.snackBar.openFromComponent(Snackbar, {
      duration: 3000,
      verticalPosition: 'bottom',
      panelClass: 'snackbar-panel',
      data: snackbarData,
    });
  }
}
