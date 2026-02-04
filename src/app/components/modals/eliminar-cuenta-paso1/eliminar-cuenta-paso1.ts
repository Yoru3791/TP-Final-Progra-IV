import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EliminarCuentaPaso2 } from '../eliminar-cuenta-paso2/eliminar-cuenta-paso2';

@Component({
  selector: 'app-eliminar-cuenta-paso1',
  imports: [],
  templateUrl: './eliminar-cuenta-paso1.html',
  styleUrl: './eliminar-cuenta-paso1.css',
})
export class EliminarCuentaPaso1 {
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<EliminarCuentaPaso1>);

  confirmar() {
    this.dialogRef.close();
    
    this.dialog.open(EliminarCuentaPaso2, {
        width: '40rem',
        maxWidth: '90vw',
        autoFocus: false
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
