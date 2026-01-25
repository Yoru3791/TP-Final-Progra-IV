import { Component, computed, effect, HostListener, inject, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedido-service';
import { EstadoPedido } from '../../enums/estadoPedido.enum';
import { DateRangePickerComponent } from '../../components/utils/date-range-picker/date-range-picker';
import { PedidoAdminCard } from '../../components/cards/pedido-admin-card/pedido-admin-card';
import { Paginador } from '../../components/utils/paginador/paginador';

@Component({
  selector: 'app-admin-pedidos-page',
  imports: [
    DateRangePickerComponent,
    PedidoAdminCard,
    Paginador],
  templateUrl: './admin-pedidos-page.html',
  styleUrl: './admin-pedidos-page.css',
})
export class AdminPedidosPage implements OnInit {
  pedidoService = inject(PedidosService);

  estados = Object.values(EstadoPedido);
  pageInfo = computed(() => this.pedidoService.pageInfo());

  openEstado = false;

  constructor() {
    effect(() => {
        this.pedidoService.filtroEstado();
        this.pedidoService.filtroEmprendimiento();
        this.pedidoService.filtroFechas();
        
        this.pedidoService.fetchPedidos(0, 10);
    });
  }

  ngOnInit() {
    this.pedidoService.fetchPedidos(0, 10);
  }

  onPageChange(page: number) {
    this.pedidoService.fetchPedidos(page, 10);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Lógica de Filtros ---

  onEmprendimientoInput(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.pedidoService.filtroEmprendimiento.set(valor);
  }

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
