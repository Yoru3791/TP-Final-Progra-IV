import { Component, inject, Input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BasesCondicionesModal } from '../../modals/bases-condiciones-modal/bases-condiciones-modal';
import { NormasComunidadModal } from '../../modals/normas-comunidad-modal/normas-comunidad-modal';
import { AuthService } from '../../../services/auth-service';
import { UiNotificationService } from '../../../services/ui-notification-service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-form-registro',
  imports: [ReactiveFormsModule],
  templateUrl: './form-registro.html',
  styleUrl: './form-registro.css',
})
export class FormRegistro {
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private uiNotificationService = inject(UiNotificationService);

  showPassword = false;
  showConfirmPassword = false;

  @Input() rolUsuario: string = '';

  formRegistro = this.fb.group(
    {
      nombreCompleto: [
        '',
        [Validators.required, Validators.maxLength(256)],
      ],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/)]],
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
          this.uiNotificationService.abrirSnackBarExito('¡Casi listo! Validá tu email para empezar a usar la cuenta.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.uiNotificationService.abrirModalError(err);

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
}
