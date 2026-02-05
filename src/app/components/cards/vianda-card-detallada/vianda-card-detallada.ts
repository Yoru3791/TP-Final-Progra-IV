import { Component, computed, inject, input, output } from '@angular/core';
import { ViandaAnyResponse, ViandaResponse } from '../../../model/vianda-response.model';
import { PageMode } from '../../../pages/emprendimiento-page/emprendimiento-page';
import { IconTacc } from '../../utils/icon-tacc/icon-tacc';
import { IconVegan } from '../../utils/icon-vegan/icon-vegan';
import { IconVeggie } from '../../utils/icon-veggie/icon-veggie';
import { CarritoService } from '../../../services/carrito-service';
import { MatDialog } from '@angular/material/dialog';
import { ViandaExtendedModal } from '../../modals/vianda-extended-modal/vianda-extended-modal';

@Component({
  selector: 'app-vianda-card-detallada',
  imports: [IconTacc, IconVegan, IconVeggie],
  templateUrl: './vianda-card-detallada.html',
  styleUrl: './vianda-card-detallada.css',
})
export class ViandaCardDetallada {
  vianda = input.required<ViandaAnyResponse>();
  modo = input.required<PageMode>();

  // La cantidad la manda el carrito
  cantidad = input<number>(0);

  // Dueño
  editar = output<void>();
  // Cliente/Invitado
  agregar = output<void>();
  quitar = output<void>();

  private carritoService = inject(CarritoService);
  private dialog = inject(MatDialog);

  esDueno() {
    return this.modo() === 'DUENO';
  }

  public cantidadViandaEnMinimo(vianda: ViandaResponse) {
    return this.carritoService.cantidadViandaEnMinimo(vianda);
  }

  public cantidadViandaEnMaximo(vianda: ViandaResponse) {
    return this.carritoService.cantidadViandaEnMaximo(vianda);
  }

  openViandaModal() {
    this.dialog.open(ViandaExtendedModal, {
      width: '40rem', 
      maxWidth: '95vw', 
      height: 'auto',
      maxHeight: '90vh',
      data: {
        vianda: this.vianda(),
        modo: this.modo()
      },
      panelClass: 'modal-vianda',
      autoFocus: false,
      restoreFocus: false,
    });
  }

  esEliminada = computed(() => {
    const v = this.vianda();
    return 'fechaEliminacion' in v && v.fechaEliminacion !== null;
  });
}
