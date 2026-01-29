import { Component, Input, inject } from '@angular/core';
import { PedidoResponse } from '../../../model/pedido-response.model';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PedidoExtendedModal } from '../../modals/pedido-extended-modal/pedido-extended-modal';

@Component({
  selector: 'app-pedido-single-card',
  imports: [DatePipe],
  templateUrl: './pedido-single-card.html',
  styleUrl: './pedido-single-card.css',
})
export class PedidoSingleCard {
  @Input() pedido!: PedidoResponse;
  private dialog = inject(MatDialog);

  getFechaFormateada(): string {
    return new Date(this.pedido.fechaEntrega).toLocaleDateString('es-AR');
  }

  getEstadoColor(): string {
    switch (this.pedido.estado) {
      case 'PENDIENTE':
        return '#eab308';
      case 'ACEPTADO':
        return '#22c55e';
      case 'RECHAZADO':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }

  openPedidoModal() {
    this.dialog.open(PedidoExtendedModal, {
      data: this.pedido,
      width: '95%',
      maxWidth: '95rem',
      autoFocus: false,
      restoreFocus: false,
    });
  }
}
