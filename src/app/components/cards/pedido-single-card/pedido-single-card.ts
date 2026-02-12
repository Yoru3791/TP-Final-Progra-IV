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

  openPedidoModal() {
    this.dialog.open(PedidoExtendedModal, {
      data: this.pedido,
      width: '90rem',
      maxWidth: '95vw',
      autoFocus: false,
      restoreFocus: false,
    });
  }
}
