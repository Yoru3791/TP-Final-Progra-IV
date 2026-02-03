import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-bases-condiciones-modal',
  imports: [],
  templateUrl: './bases-condiciones-modal.html',
  styleUrl: './bases-condiciones-modal.css',
})
export class BasesCondicionesModal {
  private dialogRef = inject(MatDialogRef<BasesCondicionesModal>);

  aceptar() {
    this.dialogRef.close(true);
  }

  rechazar() {
    this.dialogRef.close(false);
  }
}
