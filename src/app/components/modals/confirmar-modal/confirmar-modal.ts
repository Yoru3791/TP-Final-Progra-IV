import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmarModalData } from '../../../model/confirmar-modal-data.model';

@Component({
  selector: 'app-confirmar-modal',
  imports: [],
  templateUrl: './confirmar-modal.html',
  styleUrl: './confirmar-modal.css',
})
export class ConfirmarModal {
  public data: ConfirmarModalData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ConfirmarModal>);

  public esCritico() {
    return this.data.critico === true;
  }

  public procesar(valor: boolean) {
    this.dialogRef.close(valor);
  }
}
