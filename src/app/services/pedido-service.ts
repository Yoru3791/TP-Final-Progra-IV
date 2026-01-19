import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService, UserRole } from './auth-service';
import { PedidoResponse } from '../model/pedido-response.model';
import { catchError, of, tap } from 'rxjs';
import { PedidoUpdateRequest } from '../model/pedido-update-request.model';
import { PedidoRequest } from '../model/pedido-request.model';
import { EstadoPedido } from '../enums/estadoPedido.enum';

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  public allPedidos = signal<PedidoResponse[]>([]);
  public filtroFechas = signal<{ desde: Date; hasta: Date } | null>(null);
  public filtroEstado = signal<EstadoPedido | null>(null);
  public filtroEmprendimiento = signal<string | null>(null);

  // URLs base según rol
  private baseUrls = {
    DUENO: 'http://localhost:8080/api/dueno/pedidos',
    CLIENTE: 'http://localhost:8080/api/cliente/pedidos',
    ADMIN: 'http://localhost:8080/api/admin/pedidos',
  };

  private getApiUrl(): string {
    const rol: UserRole = this.authService.currentUserRole();
    switch (rol) {
      case 'ADMIN':
        return this.baseUrls.ADMIN;
      case 'DUENO':
        return this.baseUrls.DUENO;
      case 'CLIENTE':
      default:
        return this.baseUrls.CLIENTE;
    }
  }

  // --- Lógica de Filtros  ---
  public emprendimientosUnicos = computed(() => {
    const pedidos = this.allPedidos();
    // Verificamos que exista emprendimiento antes de acceder al nombre para evitar errores
    const nombres = pedidos
      .filter(p => p.emprendimiento)
      .map((p) => p.emprendimiento.nombreEmprendimiento);
    return Array.from(new Set(nombres));
  });

  public pedidosFiltrados = computed(() => {
    let list = [...this.allPedidos()];

    // 1. Filtro Fecha
    const filtro = this.filtroFechas();
    if (filtro) {
      const desdeStr = filtro.desde.toISOString().split('T')[0];
      const hastaStr = filtro.hasta.toISOString().split('T')[0];

      list = list.filter((p) => {
        const fechaEntregaStr = p.fechaEntrega.split('T')[0];
        return fechaEntregaStr >= desdeStr && fechaEntregaStr <= hastaStr;
      });
    }

    // 2. Filtro Estado
    const estado = this.filtroEstado();
    if (estado) {
      list = list.filter((p) => p.estado === estado);
    }

    // 3. Filtro Emprendimiento
    const emp = this.filtroEmprendimiento();
    if (emp) {
      list = list.filter((p) => p.emprendimiento?.nombreEmprendimiento === emp);
    }

    // Orden descendente por fecha de entrega
    return list.sort(
      (a, b) => new Date(b.fechaEntrega).getTime() - new Date(a.fechaEntrega).getTime()
    );
  });

  // --- CRUD ---

  createPedido(pedido: PedidoRequest) {
    return this.http.post<PedidoResponse>(this.getApiUrl(), pedido).pipe(
      tap((pedidoResponse) => {
        this.allPedidos.update((pedidos) => [...pedidos, pedidoResponse]);
      })
    );
  }

  fetchPedidos() {
    const url = this.getApiUrl();
    this.http
      .get<PedidoResponse[]>(url)
      .pipe(
        catchError((err) => {
          if (err.status !== 404) {
            console.error('Error al cargar pedidos:', err);
          }
          return of([]);
        })
      )
      .subscribe((result) => {
        this.allPedidos.set(result || []);
      });
  }

  updatePedido(id: number, pedidoUpdate: PedidoUpdateRequest) {
    const url = `${this.getApiUrl()}/id/${id}`;
    return this.http
      .put<PedidoResponse>(url, pedidoUpdate)
      .pipe(
        tap((actualizado) =>
          this.allPedidos.update((list) => list.map((p) => (p.id === id ? { ...actualizado } : p)))
        )
      );
  }
}