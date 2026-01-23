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
  openEmp = false;

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
    this.pedidoService.fetchNombresEmprendimientos();
  }

  onPageChange(page: number) {
    this.pedidoService.fetchPedidos(page, 10);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Lógica de Filtros ---
  toggleEstado(event: MouseEvent) {
    this.openEstado = !this.openEstado;
    this.openEmp = false;
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const inside = (event.target as HTMLElement).closest('.select-custom');
    if (!inside) {
      this.openEstado = false;
      this.openEmp = false;
    }
  }
}
