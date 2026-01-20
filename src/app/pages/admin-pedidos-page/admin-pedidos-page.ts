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

  // Control de dropdowns personalizados
  openEstado = false;
  openEmp = false;

  ngOnInit() {
    // Al cargar la página, traemos los pedidos
    this.pedidoService.fetchPedidos();
  }

  // --- Lógica de Filtros UI ---
  toggleEstado(event: MouseEvent) {
    this.openEstado = !this.openEstado;
    this.openEmp = false; // Cierra el otro si está abierto
    event.stopPropagation();
  }

  toggleEmp(event: MouseEvent) {
    this.openEmp = !this.openEmp;
    this.openEstado = false;
    event.stopPropagation();
  }

  setEstado(value: EstadoPedido | null) {
    this.pedidoService.filtroEstado.set(value);
    this.openEstado = false;
  }

  setEmp(value: string | null) {
    this.pedidoService.filtroEmprendimiento.set(value);
    this.openEmp = false;
  }

  // Cerrar dropdowns al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const inside = (event.target as HTMLElement).closest('.select-custom');
    if (!inside) {
      this.openEstado = false;
      this.openEmp = false;
    }
  }
}
