import { Component, computed, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { IconTacc } from '../../utils/icon-tacc/icon-tacc';
import { IconVegan } from '../../utils/icon-vegan/icon-vegan';
import { IconVeggie } from '../../utils/icon-veggie/icon-veggie';
import { ViandaResponse } from '../../../model/vianda-response.model';
import { PageMode } from '../../../pages/emprendimiento-page/emprendimiento-page';
import { CarritoService } from '../../../services/carrito-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarData } from '../../../model/snackbar-data.model';
import { Snackbar } from '../snackbar/snackbar';

interface ModalData {
  vianda: ViandaResponse;
  modo: PageMode;
}

@Component({
  selector: 'app-vianda-extended-modal',
  imports: [MatButtonModule, MatIconModule, IconTacc, IconVegan, IconVeggie],
  templateUrl: './vianda-extended-modal.html',
  styleUrl: './vianda-extended-modal.css',
})
export class ViandaExtendedModal {

  private carritoService = inject(CarritoService);
  private snackBar = inject(MatSnackBar);

  vianda: ViandaResponse;
  modo: PageMode;
  
  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<ViandaExtendedModal>,
    @Inject(MAT_DIALOG_DATA) public data: ModalData
    ) {
      this.vianda = data.vianda;
      this.modo = data.modo;
    }

  cantidad = computed(() => {
    return this.carritoService.cantidadViandaEnCarrito(this.vianda)();
  });

  abrirCarrito() {
    if (this.modo === 'INVITADO') {
      this.abrirSnackbarLoginRequerido();
      return;
    }
    this.cerrarModal();
    this.carritoService.abrirCarrito(this.vianda.emprendimiento);
  }

  agregar() {
    if (this.modo === 'INVITADO') {
      this.abrirSnackbarLoginRequerido();
      return;
    }
    this.carritoService.agregarVianda(this.vianda);
  }

  quitar() {
    if (this.modo === 'INVITADO') {
      this.abrirSnackbarLoginRequerido(); 
      return;
    }
    this.carritoService.quitarVianda(this.vianda);
  }

  enMinimo() {
    return this.carritoService.cantidadViandaEnMinimo(this.vianda);
  }

  enMaximo() {
    return this.carritoService.cantidadViandaEnMaximo(this.vianda);
  }

  abrirSnackbarLoginRequerido() {
      const snackbarData: SnackbarData = {
        message: 'Inicie sesión para realizar pedidos',
        iconName: 'error'
      }
  
      this.snackBar.openFromComponent(Snackbar, {
        duration: 3000,
        verticalPosition: 'bottom',
        panelClass: 'snackbar-panel',
        data: snackbarData
      });
    }

  cerrarModal() {
    this.dialogRef.close();
  }
}
