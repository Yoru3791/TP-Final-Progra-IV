import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ViandaService } from '../../../services/vianda-service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CategoriaVianda } from '../../../enums/categoriaVianda.enum';
import { ChangeDetectorRef } from '@angular/core';
import { IconTacc } from '../../utils/icon-tacc/icon-tacc';
import { IconVegan } from '../../utils/icon-vegan/icon-vegan';
import { IconVeggie } from '../../utils/icon-veggie/icon-veggie';
import { UiNotificationService } from '../../../services/ui-notification-service';

@Component({
  selector: 'app-form-vianda',
  imports: [
    ReactiveFormsModule,
    IconTacc,
    IconVegan,
    IconVeggie],
  templateUrl: './form-vianda.html',
  styleUrl: './form-vianda.css',
})
export class FormVianda {
  private fb = inject(FormBuilder);
  private viandaService = inject(ViandaService);
  private dialogRef = inject(MatDialogRef);
  private cdr = inject(ChangeDetectorRef); // Ayuda a forzar render
  private uiNotificationService = inject(UiNotificationService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { idEmprendimiento: number }) {}

  public categorias = Object.entries(CategoriaVianda).map(([key, label]) => ({
    key,
    label,
  }));

  loading = false;
  selectedFileName: string | null = null;
  public imagePreviewUrl: string | ArrayBuffer | null = null;

  fileInputRef: any;

  maxWidth = 1920;
  maxHeight = 1080;

  formVianda = this.fb.group({
    nombreVianda: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    categoria: [null, Validators.required],
    descripcion: ['', [Validators.required, Validators.maxLength(250)]],
    image: [null, Validators.required],
    precio: ['', [Validators.required, Validators.min(0)]],
    esVegano: [false, Validators.required],
    esVegetariano: [false, Validators.required],
    esSinTacc: [false, Validators.required],
  });

  onFileInputReady(element: HTMLInputElement) {
    this.fileInputRef = element;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (!file) {
      this.selectedFileName = null;
      this.imagePreviewUrl = null;
      this.formVianda.get('image')?.setValue(null);
      this.formVianda.get('image')?.markAsTouched();
      this.cdr.detectChanges(); // Asegura que se vea el cambio
      return;
    }

    this.selectedFileName = file.name;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrl = e.target.result;

      this.cdr.detectChanges();

      const img = new Image();
      img.onload = () => {
        if (img.width <= this.maxWidth && img.height <= this.maxHeight) {
          this.formVianda.patchValue({ image: file });
          this.formVianda.get('image')?.markAsPristine();
          this.formVianda.get('image')?.markAsUntouched();
        } else {
          this.formVianda.patchValue({ image: null });
          this.imagePreviewUrl = null;
          this.selectedFileName = null;

          this.uiNotificationService.abrirModalError(
            null, `La imagen no debe superar ${this.maxWidth}x${this.maxHeight}px`
          );
        }

        this.formVianda.get('image')?.markAsTouched();
        this.cdr.detectChanges(); // Actualización final
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedFileName = null;
    this.imagePreviewUrl = null;
    this.formVianda.get('image')?.setValue(null);
    this.formVianda.get('image')?.markAsDirty();

    if (this.fileInputRef) {
      this.fileInputRef.value = '';
    }

    this.cdr.detectChanges(); // Asegura desaparición inmediata
  }

  onSubmit() {
    if (this.formVianda.invalid) return;

    if (!this.data?.idEmprendimiento) {
      this.uiNotificationService.abrirModalError(null, 'No se recibió el emprendimiento.');
      return;
    }

    this.loading = true;
    const formData = new FormData();
    const formValues = this.formVianda.value;

    formData.append('nombreVianda', formValues.nombreVianda!);
    formData.append('categoria', String(formValues.categoria!));
    formData.append('descripcion', formValues.descripcion!);
    formData.append('image', formValues.image!);
    formData.append('precio', String(formValues.precio!));
    formData.append('esVegano', String(formValues.esVegano!));
    formData.append('esVegetariano', String(formValues.esVegetariano!));
    formData.append('esSinTacc', String(formValues.esSinTacc!));
    formData.append('emprendimientoId', String(this.data.idEmprendimiento));

    this.viandaService.createVianda(formData).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.uiNotificationService.abrirModalError(err);
      },
    });
  }

  cerrarModal() {
    this.dialogRef.close();
  }
}
