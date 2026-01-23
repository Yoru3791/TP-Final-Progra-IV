import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedido-service';
import { EstadoPedido } from '../../enums/estadoPedido.enum';
import { DateRangePickerComponent } from '../../components/utils/date-range-picker/date-range-picker';
import { PedidoAdminCard } from '../../components/cards/pedido-admin-card/pedido-admin-card';

@Component({
  selector: 'app-admin-pedidos-page',
  imports: [DateRangePickerComponent, PedidoAdminCard],
  templateUrl: './admin-pedidos-page.html',
  styleUrl: './admin-pedidos-page.css',
})
export class AdminPedidosPage implements OnInit {
  pedidoService = inject(PedidosService);
  estados = Object.values(EstadoPedido);

  // Control de dropdown de Estado (el único que queda como dropdown custom)
  openEstado = false;

  ngOnInit() {
    this.pedidoService.fetchPedidos();
  }

  // --- Lógica de Filtros UI ---

  // 1. Input de Texto para Emprendimiento
  onEmprendimientoInput(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.pedidoService.filtroEmprendimiento.set(valor);
  }

  // 2. Dropdown de Estado
  toggleEstado(event: MouseEvent) {
    this.openEstado = !this.openEstado;
    event.stopPropagation();
  }

  setEstado(value: EstadoPedido | null) {
    this.pedidoService.filtroEstado.set(value);
    this.openEstado = false;
  }

  // Cerrar dropdown al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const inside = (event.target as HTMLElement).closest('.select-custom-wrapper');
    if (!inside) {
      this.openEstado = false;
    }
  }
}
