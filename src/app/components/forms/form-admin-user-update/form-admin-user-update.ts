import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorDialogModal } from '../../modals/error-dialog-modal/error-dialog-modal';
import { UsuarioService } from '../../../services/usuario-service';
import { UsuarioResponse } from '../../../model/usuario-response.model';
import { UiNotificationService } from '../../../services/ui-notification-service';

@Component({
  selector: 'app-form-admin-user-update',
  imports: [ReactiveFormsModule],
  templateUrl: './form-admin-user-update.html',
  styleUrl: './form-admin-user-update.css',
})
export class FormAdminUserUpdate {
  @Input() usuario!: UsuarioResponse;

  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private dialogRef = inject<MatDialogRef<unknown>>(MatDialogRef, {
    optional: true,
  });
  private formBuilder = inject(FormBuilder);
  private uiNotificationService = inject(UiNotificationService);
  private usuarioService = inject(UsuarioService);

  selectedFileName: string | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  fileInputRef: any;

  maxImageWidth = 1920;
  maxImageHeight = 1080;
  newImageFile: File | null = null;

  form = this.formBuilder.group(
    {
      nombreCompleto: [
        '',
        [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
      ],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(50)]
      ],
      telefono: [
        '',
        [Validators.required, Validators.pattern(/^\d{10,15}$/)]
      ]
    }
  );

  ngOnInit() {
    this.form.patchValue({
      nombreCompleto: this.usuario.nombreCompleto,
      email: this.usuario.email,
      telefono: this.usuario.telefono
    });

    this.imagePreviewUrl = this.usuario.imagenUrl;
  }

  onFileInputReady(element: HTMLInputElement) {
    this.fileInputRef = element;
  }

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    
    if (!input.files || input.files.length === 0) {
      this.clearImage();
      return;
    }

    const file: File = input.files[0];

    if (!file) {
      this.clearImage();
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
        this.cdr.detectChanges();
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
    this.cdr.detectChanges();
  }

  private clearImage() {
    this.newImageFile = null;
    this.selectedFileName = null;
    this.imagePreviewUrl = this.usuario.imagenUrl || null;
    this.cdr.detectChanges();
  }

  mostrarError(formControlName: string) {
    return (
      this.form.get(formControlName)?.invalid &&
      (this.form.get(formControlName)?.touched ||
       this.form.get(formControlName)?.dirty)
    );
  }

  onSubmit() {
    const formValues = this.form.value;

    this.usuarioService
      .updateUsuarioAdmin(this.usuario.id, {
        nombreCompleto: formValues.nombreCompleto!,
        email: formValues.email!,
        rolUsuario: this.usuario.rolUsuario,
        telefono: formValues.telefono!,
      })
      .subscribe({
        next: () => {
          if (this.newImageFile) {
            this.usuarioService
              .updateImagenUsuarioAdmin(this.usuario.id, this.newImageFile)
              .subscribe({
                next: () => this.updateSuccess(),
                error: (err) => this.uiNotificationService.abrirModalError(err)
              });
          }
          else {
            this.updateSuccess();
          }
        },
        error: (err) => this.uiNotificationService.abrirModalError(err)
      });
  }

  private updateSuccess() {
    this.uiNotificationService.abrirSnackBarExito('Usuario actualizado exitosamente.')

    // El form puede existir dentro de un modal
    this.dialogRef?.close(true);
  }
}
