import { Component, computed, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IconTacc } from '../../utils/icon-tacc/icon-tacc';
import { IconVegan } from '../../utils/icon-vegan/icon-vegan';
import { IconVeggie } from '../../utils/icon-veggie/icon-veggie';
import { ViandaResponse } from '../../../model/vianda-response.model';
import { PageMode } from '../../../pages/emprendimiento-page/emprendimiento-page';
import { CarritoService } from '../../../services/carrito-service';
import { UiNotificationService } from '../../../services/ui-notification-service';

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
  private uiNotificationService = inject(UiNotificationService);

  vianda: ViandaResponse;
  modo: PageMode;
  
  constructor(
    public dialogRef: MatDialogRef<ViandaExtendedModal>,
    @Inject(MAT_DIALOG_DATA) public data: ModalData
    ) {
      this.vianda = data.vianda;
      this.modo = data.modo;
    }

  cantidad = computed(() => {
    return this.carritoService.cantidadViandaEnCarrito(this.vianda)();
  });

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
    this.uiNotificationService.abrirSnackBarError(null, 'Iniciá sesión para realizar pedidos.');
  }

  cerrarModal() {
    this.dialogRef.close();
  }
}
