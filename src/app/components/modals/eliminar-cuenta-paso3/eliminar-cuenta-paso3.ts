import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-eliminar-cuenta-paso3',
  imports: [],
  templateUrl: './eliminar-cuenta-paso3.html',
  styleUrl: './eliminar-cuenta-paso3.css',
})
export class EliminarCuentaPaso3 {
  private dialogRef = inject(MatDialogRef<EliminarCuentaPaso3>);
  private router = inject(Router);

  constructor() {
    // Si el usuario clickea fuera del modal (backdrop), redirige a Home
    this.dialogRef.backdropClick().subscribe(() => {
      this.navegarHome();
    });
  }

  cerrar() {
    this.navegarHome();
  }

  private navegarHome() {
    this.dialogRef.close();
    this.router.navigate(['/home']);
  }
}
