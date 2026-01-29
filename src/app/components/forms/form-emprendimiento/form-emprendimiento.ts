import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmprendimientoService } from '../../../services/emprendimiento-service';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth-service';
import { ChangeDetectorRef } from '@angular/core';
import { CitySelector } from '../../utils/city-selector/city-selector';
import { UiNotificationService } from '../../../services/ui-notification-service';

@Component({
  selector: 'app-form-emprendimiento',
  imports: [ReactiveFormsModule, CitySelector],
  templateUrl: './form-emprendimiento.html',
  styleUrl: './form-emprendimiento.css',
})
export class FormEmprendimiento {
  private fb = inject(FormBuilder);
  private emprendimientoService = inject(EmprendimientoService);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<FormEmprendimiento>);
  private cdr = inject(ChangeDetectorRef); // Necesario para forzar render
  private uiNotificationService = inject(UiNotificationService);

  selectedFileName: string | null = null;
  public imagePreviewUrl: string | ArrayBuffer | null = null;

  fileInputRef: any;
  maxWidth = 1920;
  maxHeight = 1080;

  formEmprendimiento = this.fb.group({
    nombreEmprendimiento: ['', [Validators.required, Validators.maxLength(256)]],
    image: [null, Validators.required],
    ciudad: ['', [Validators.required]],
    direccion: ['', Validators.maxLength(256)],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/)]],
  });

  onFileInputReady(element: HTMLInputElement) {
    this.fileInputRef = element;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (!file) {
      this.selectedFileName = null;
      this.imagePreviewUrl = null;
      this.formEmprendimiento.get('image')?.setValue(null);
      this.formEmprendimiento.get('image')?.markAsTouched();
      this.cdr.detectChanges(); //asegura actualización al limpiar
      return;
    }

    this.selectedFileName = file.name;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.imagePreviewUrl = e.target.result;

      // Esto evita la necesidad de "hacer click afuera" para ver el preview
      this.cdr.detectChanges();

      // Validar dimensiones
      const img = new Image();
      img.onload = () => {
        if (img.width <= this.maxWidth && img.height <= this.maxHeight) {
          this.formEmprendimiento.patchValue({ image: file });
          this.formEmprendimiento.get('image')?.markAsPristine();
          this.formEmprendimiento.get('image')?.markAsUntouched();
        } else {
          this.formEmprendimiento.patchValue({ image: null });
          this.imagePreviewUrl = null;
          this.selectedFileName = null;

          this.uiNotificationService.abrirModalError(
            null, `La imagen no debe superar ${this.maxWidth}x${this.maxHeight}px`
          );
        }

        this.formEmprendimiento.get('image')?.markAsTouched();
        this.cdr.detectChanges(); // Asegura actualización final
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedFileName = null;
    this.imagePreviewUrl = null;
    this.formEmprendimiento.get('image')?.setValue(null);
    this.formEmprendimiento.get('image')?.markAsDirty();

    if (this.fileInputRef) {
      this.fileInputRef.value = '';
    }

    this.cdr.detectChanges(); // Asegura que desaparezca el preview inmediatamente
  }

  onSubmit() {
    if (this.formEmprendimiento.invalid) return;

    const formData = new FormData();
    const formValues = this.formEmprendimiento.value;

    formData.append('nombreEmprendimiento', formValues.nombreEmprendimiento!);
    formData.append('image', formValues.image!);
    formData.append('ciudad', formValues.ciudad!);
    formData.append('direccion', formValues.direccion || '');
    formData.append('telefono', formValues.telefono!);

    const userId = this.authService.usuarioId();

    if (!userId) {
      this.uiNotificationService.abrirModalError(null, 'No se pudo obtener el usuario logueado.');
      return;
    }

    formData.append('idUsuario', String(userId));

    this.emprendimientoService.createEmprendimiento(formData).subscribe({
      next: () => {
        this.uiNotificationService.abrirSnackBarExito('Emprendimiento creado exitosamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.uiNotificationService.abrirModalError(err);
      },
    });
  }

  cerrarModal() {
    this.dialogRef.close();
  }
}
