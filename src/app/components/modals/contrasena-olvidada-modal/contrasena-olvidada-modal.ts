import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
// Importamos los componentes del Snackbar personalizado
import { Snackbar } from '../../modals/snackbar/snackbar';
import { SnackbarData } from '../../../model/snackbar-data.model';

@Component({
  selector: 'app-contrasena-olvidada-modal',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contrasena-olvidada-modal.html',
  styleUrl: './contrasena-olvidada-modal.css',
})
export class ContrasenaOlvidadaModal {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<ContrasenaOlvidadaModal>);
  private snackBar = inject(MatSnackBar);

  isLoading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  enviar() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const email = this.form.value.email!;

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.dialogRef.close();
        this.showSnackBar('Si el correo existe, te hemos enviado instrucciones.', 'check_circle');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.showSnackBar('Ocurrió un error al procesar la solicitud.', 'error');
      },
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  private showSnackBar(message: string, iconName: string) {
    const snackbarData: SnackbarData = {
      message: message,
      iconName: iconName,
    };

    this.snackBar.openFromComponent(Snackbar, {
      duration: 5000,
      verticalPosition: 'bottom',
      panelClass: 'snackbar-panel',
      data: snackbarData,
    });
  }
}
