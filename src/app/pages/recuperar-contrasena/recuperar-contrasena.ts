import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { UiNotificationService } from '../../services/ui-notification-service';

@Component({
  selector: 'app-recuperar-contrasena',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './recuperar-contrasena.html',
  styleUrl: './recuperar-contrasena.css',
})
export class RecuperarContrasena {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private uiNotificationService = inject(UiNotificationService);

  token: string = '';

  showActual = false;
  showNueva = false;
  showRepetirNueva = false;
  isSubmitting = signal<boolean>(false);

  form = this.fb.group(
    {
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
      validators: [this.validarRepetidaIgual],
    }
  );

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

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      if (!this.token) {
        this.uiNotificationService.abrirSnackBarError(null, 'Enlace inválido o incompleto.');
        this.router.navigate(['/login']);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);

    const password = this.form.value.nueva;

    this.authService.resetPassword({ token: this.token, newPassword: password! }).subscribe({
      next: () => {
        this.uiNotificationService.abrirSnackBarExito('Contraseña cambiada exitosamente.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.uiNotificationService.abrirSnackBarError(err, 'El enlace expiró o es inválido.');
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
}
