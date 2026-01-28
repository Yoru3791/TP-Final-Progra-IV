import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';
import { MatDialogRef } from '@angular/material/dialog';
import { UiNotificationService } from '../../../services/ui-notification-service';

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
  private uiNotificationService = inject(UiNotificationService);

  isLoading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
  });

  enviar() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const email = this.form.value.email!;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogRef.close();
        
        this.uiNotificationService.abrirSnackBarExito('Instrucciones enviadas, revisá tu correo.');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.uiNotificationService.abrirSnackBarError(err, 'Hubo un error al procesar tu solicitud.');
      }
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
