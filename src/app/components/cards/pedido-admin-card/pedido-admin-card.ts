import { Component, inject, Input } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { PedidoResponse } from '../../../model/pedido-response.model';
import { PedidoExtendedModal } from '../../modals/pedido-extended-modal/pedido-extended-modal';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-pedido-admin-card',
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './pedido-admin-card.html',
  styleUrl: './pedido-admin-card.css',
})
export class PedidoAdminCard {
  @Input() pedido!: PedidoResponse;
  private dialog = inject(MatDialog);

  // Método auxiliar para determinar la clase CSS según el estado
  getEstadoClass(): string {
    switch (this.pedido.estado) {
      case 'ACEPTADO':
        return 'estado-aceptado';
      case 'PENDIENTE':
        return 'estado-pendiente';
      case 'RECHAZADO':
        return 'estado-rechazado';
      case 'ENTREGADO':
        return 'estado-entregado';
      case 'CANCELADO':
        return 'estado-rechazado';
      default:
        return '';
    }
  }

  openPedidoModal() {
    this.dialog.open(PedidoExtendedModal, {
      data: this.pedido,
      minWidth: '95rem',
      autoFocus: false,
      restoreFocus: false,
    });
  }
}
