import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmprendimientoService } from '../../../services/emprendimiento-service';
import { EmprendimientoResponse } from '../../../model/emprendimiento-response.model';
import { firstValueFrom } from 'rxjs';
import { UiNotificationService } from '../../../services/ui-notification-service';
import { Router } from '@angular/router';
import { CitySelector } from '../../utils/city-selector/city-selector';

@Component({
  selector: 'app-form-emprendimiento-update',
  imports: [ReactiveFormsModule, CitySelector],
  templateUrl: './form-emprendimiento-update.html',
  styleUrl: './form-emprendimiento-update.css',
})
export class FormUpdateEmprendimiento implements OnInit {
  public emprendimiento: EmprendimientoResponse = inject(MAT_DIALOG_DATA);

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<FormUpdateEmprendimiento>);
  private emprendimientoService = inject(EmprendimientoService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private uiNotificationService = inject(UiNotificationService);

  selectedFileName: string | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  fileInputRef: any;

  maxWidth = 1920;
  maxHeight = 1080;
  newImageFile: File | null = null;

  formEmprendimiento = this.fb.group({
    nombreEmprendimiento: ['', [Validators.required, Validators.maxLength(256)]],
    ciudad: ['', [Validators.required]],
    direccion: ['', [Validators.maxLength(256)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/)]],
    estaDisponible: [true, [Validators.required]]
  });

  ngOnInit() {
    this.formEmprendimiento.patchValue({
      nombreEmprendimiento: this.emprendimiento.nombreEmprendimiento,
      ciudad: this.emprendimiento.ciudad,
      direccion: this.emprendimiento.direccion,
      telefono: this.emprendimiento.telefono,
      estaDisponible: this.emprendimiento.estaDisponible
    });

    if (this.emprendimiento.imagenUrl) {
      this.imagePreviewUrl = this.emprendimiento.imagenUrl;
    }
  }

  onFileInputReady(element: HTMLInputElement) {
    this.fileInputRef = element;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    this.newImageFile = file;
    this.selectedFileName = file.name;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrl = e.target.result;
      this.cdr.detectChanges();

      const img = new Image();
      img.onload = () => {
        if (img.width > this.maxWidth || img.height > this.maxHeight) {
          this.uiNotificationService.abrirModalError(
            null, `La imagen no debe superar ${this.maxWidth}x${this.maxHeight}px`
          );
          this.newImageFile = null;
          this.selectedFileName = null;
          this.imagePreviewUrl = this.emprendimiento.imagenUrl || null;
        }
        this.cdr.detectChanges();
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  async onDelete() {
    const confirmado = await firstValueFrom(
      this.uiNotificationService.abrirModalConfirmacion({
        titulo: 'Eliminar Emprendimiento',
        texto:
          '¿Estás seguro que querés eliminar el emprendimiento? <span>Esta acción es irreversible.</span>',
        textoEsHtml: true,
        critico: true,
      })
    );

    if (!confirmado) return;

    this.emprendimientoService.deleteEmprendimiento(this.emprendimiento.id).subscribe({
      next: () => {
        this.uiNotificationService.abrirSnackBarExito('Emprendimiento eliminado exitosamente.');
        this.dialogRef.close(true);
        this.router.navigateByUrl('home');
      },
      error: (err) => {
        this.uiNotificationService.abrirModalError(err);
      },
    });
  }

  onSubmit() {
    if (this.formEmprendimiento.invalid) return;

    const dto = this.formEmprendimiento.value;

    this.emprendimientoService.updateEmprendimiento(this.emprendimiento.id, dto).subscribe({
      next: () => {
        if (this.newImageFile) {
          const fd = new FormData();
          fd.append('image', this.newImageFile);

          this.emprendimientoService
            .updateImagenEmprendimiento(this.emprendimiento.id, fd)
            .subscribe({
              next: () => this.finishSuccess(),
              error: (err) => this.uiNotificationService.abrirModalError(err, 'Error al actualizar la imagen.'),
            });
        } else {
          this.finishSuccess();
        }
      },
      error: (err) => this.uiNotificationService.abrirModalError(err, 'Error al actualizar los datos.'),
    });
  }

  private finishSuccess() {
    this.uiNotificationService.abrirSnackBarExito('Emprendimiento actualizado exitosamente.');
    this.dialogRef.close(true);
  }

  cerrarModal() {
    this.dialogRef.close();
  }
}
