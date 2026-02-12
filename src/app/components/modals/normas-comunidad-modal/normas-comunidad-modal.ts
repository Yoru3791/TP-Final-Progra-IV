import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-normas-comunidad-modal',
  imports: [],
  templateUrl: './normas-comunidad-modal.html',
  styleUrl: './normas-comunidad-modal.css',
})
export class NormasComunidadModal {
  private dialogRef = inject(MatDialogRef<NormasComunidadModal>);

  aceptar() {
    this.dialogRef.close(true);
  }

  rechazar() {
    this.dialogRef.close(false);
  }
}
