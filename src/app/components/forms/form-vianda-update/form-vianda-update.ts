import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ViandaService } from '../../../services/vianda-service';
import { ViandaResponse } from '../../../model/vianda-response.model';
import { CategoriaVianda } from '../../../enums/categoriaVianda.enum';
import { ViandaUpdate } from '../../../model/vianda-update.model';
import { UiNotificationService } from '../../../services/ui-notification-service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { IconTacc } from '../../utils/icon-tacc/icon-tacc';
import { IconVegan } from '../../utils/icon-vegan/icon-vegan';
import { IconVeggie } from '../../utils/icon-veggie/icon-veggie';

@Component({
  selector: 'app-form-vianda-update',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    IconTacc,
    IconVegan,
    IconVeggie],
  templateUrl: './form-vianda-update.html',
  styleUrl: './form-vianda-update.css',
})
export class FormViandaUpdate implements OnInit {
  private fb = inject(FormBuilder);
  private viandaService = inject(ViandaService);
  private dialogRef = inject(MatDialogRef);
  private cdr = inject(ChangeDetectorRef);
  private uiNotificationService = inject(UiNotificationService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { vianda: ViandaResponse }) {}

  public readonly categorias = Object.entries(CategoriaVianda).map(([key, label]) => ({
    key,
    label,
  }));

  private categoriaMap: Map<string, string> = new Map(
    Object.entries(CategoriaVianda).map(([key, label]) => [label, key])
  );

  loading = false;

  selectedFile: File | null = null;
  selectedFileName: string | null = null;

  newImagePreviewUrl: string | ArrayBuffer | null = null;
  currentImageUrl: string | null = null;

  fileInputRef: any;
  maxWidth = 1920;
  maxHeight = 1080;

  formVianda = this.fb.group({
    nombreVianda: ['', [Validators.required, Validators.maxLength(256)]],
    categoria: [null as string | null, Validators.required],
    descripcion: ['', [Validators.required, Validators.maxLength(256)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    esVegano: [false, Validators.required],
    esVegetariano: [false, Validators.required],
    esSinTacc: [false, Validators.required],
    estaDisponible: [true, Validators.required],
    image: [null],
  });

  ngOnInit(): void {
    if (this.data?.vianda) {
      setTimeout(() => {
        this.cargarDatos(this.data.vianda);
      });
    }
  }

  cargarDatos(vianda: ViandaResponse) {
    this.formVianda.patchValue({
      nombreVianda: vianda.nombreVianda,
      categoria: String(vianda.categoria),
      descripcion: vianda.descripcion,
      precio: vianda.precio,
      esVegano: vianda.esVegano,
      esVegetariano: vianda.esVegetariano,
      esSinTacc: vianda.esSinTacc,
      estaDisponible: vianda.estaDisponible,
    });

    this.currentImageUrl = vianda.imagenUrl || null;
  }

  onFileInputReady(element: HTMLInputElement) {
    this.fileInputRef = element;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (!file) {
      this.resetImageSelection();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const tempUrl = e.target.result;

      const img = new Image();
      img.onload = () => {
        if (img.width <= this.maxWidth && img.height <= this.maxHeight) {
          this.selectedFile = file;
          this.selectedFileName = file.name;
          this.newImagePreviewUrl = tempUrl;
          this.formVianda.patchValue({ image: null });
          this.formVianda.get('image')?.markAsTouched();
        } else {
          this.resetImageSelection();

          this.uiNotificationService.abrirModalError(
            null, `La imagen no debe superar ${this.maxWidth}x${this.maxHeight}px`
          );
        }
        this.cdr.detectChanges();
      };
      img.src = tempUrl;
    };
    reader.readAsDataURL(file);
  }

  resetImageSelection() {
    this.selectedFile = null;
    this.selectedFileName = null;
    this.newImagePreviewUrl = null;
    this.formVianda.get('image')?.setValue(null);
    if (this.fileInputRef) this.fileInputRef.value = '';
    this.cdr.detectChanges();
  }

  removeNewImage() {
    this.resetImageSelection();
  }

  async onDelete() {
    const confirmado = await firstValueFrom(
      this.uiNotificationService.abrirModalConfirmacion({
        titulo: 'Eliminar Vianda',
        texto:
          '¿Seguro de que querés eliminar la vianda? <span>Esta acción es irreversible.</span>',
        textoEsHtml: true,
        critico: true,
      })
    );

    if (!confirmado) return;

    this.viandaService.deleteVianda(this.data.vianda.id).subscribe({
      next: () => {
        this.uiNotificationService.abrirSnackBarExito('Vianda eliminada exitosamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.uiNotificationService.abrirModalError(err);
      },
    });
  }

  onSubmit() {
    if (this.formVianda.invalid) return;

    this.loading = true;
    const formValues = this.formVianda.value;
    const viandaId = this.data.vianda.id;

    const updateDTO: ViandaUpdate = {
      nombreVianda: formValues.nombreVianda!,
      categoria: formValues.categoria as any,
      descripcion: formValues.descripcion!,
      precio: Number(formValues.precio),
      esVegano: !!formValues.esVegano,
      esVegetariano: !!formValues.esVegetariano,
      esSinTacc: !!formValues.esSinTacc,
      estaDisponible: !!formValues.estaDisponible,
    };

    this.viandaService.updateVianda(viandaId, updateDTO).subscribe({
      next: () => {
        if (this.selectedFile) {
          this.uploadImage(viandaId);
        } else {
          this.updateSuccess();
        }
      },
      error: (err) => {
        this.loading = false;
        this.uiNotificationService.abrirModalError(err);
      },
    });
  }

  uploadImage(id: number) {
    this.viandaService.updateImagenVianda(id, this.selectedFile!).subscribe({
      next: () => {
        this.updateSuccess();
      },
      error: (err) => {
        this.loading = false;
        this.uiNotificationService.abrirModalError(err, 'Vianda actualizada, pero error al subir la imagen.');
      },
    });
  }

  private updateSuccess() {
    this.loading = false;
    this.uiNotificationService.abrirSnackBarExito('Vianda actualizada exitosamente.');
    this.dialogRef.close(true);
  }

  cerrarModal() {
    this.dialogRef.close();
  }
}
