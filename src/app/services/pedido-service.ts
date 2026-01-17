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
  public allPedidos = signal<PedidoResponse[]>([]);
  public filtroFechas = signal<{ desde: Date; hasta: Date } | null>(null);
  public filtroEstado = signal<EstadoPedido | null>(null);
  public filtroEmprendimiento = signal<string | null>(null);

  public emprendimientosUnicos = computed(() => {
    const pedidos = this.allPedidos();

    const nombres = pedidos.map((p) => p.emprendimiento.nombreEmprendimiento);

    return Array.from(new Set(nombres));
  });

  // Pedidos ordenados DESC por fechaEntrega (más reciente primero)
  public pedidosFiltrados = computed(() => {
    let list = [...this.allPedidos()];

    const filtro = this.filtroFechas();
    if (filtro) {
      // Formatear fechas del filtro a YYYY-MM-DD
      const desdeStr = filtro.desde.toISOString().split('T')[0];
      const hastaStr = filtro.hasta.toISOString().split('T')[0];

      list = list.filter((p) => {
        const fechaEntregaStr = p.fechaEntrega.split('T')[0]; // extrae solo YYYY-MM-DD
        return fechaEntregaStr >= desdeStr && fechaEntregaStr <= hastaStr;
      });
    }

    // Filtro por el estado
    const estado = this.filtroEstado();
    if (estado) {
      list = list.filter((p) => p.estado === estado);
    }

    // Filtro por emprendimiento
    const emp = this.filtroEmprendimiento();
    if (emp) {
      list = list.filter((p) => p.emprendimiento.nombreEmprendimiento === emp);
    }

    // Orden descendente
    return list.sort(
      (a, b) => new Date(b.fechaEntrega).getTime() - new Date(a.fechaEntrega).getTime()
    );
  });

  // URLs base según rol
  private baseUrls = {
    DUENO: 'http://localhost:8080/api/dueno/pedidos',
    CLIENTE: 'http://localhost:8080/api/cliente/pedidos',
  };

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getApiUrl(): string {
    const rol: UserRole = this.authService.currentUserRole();
    return rol === 'DUENO' ? this.baseUrls.DUENO : this.baseUrls.CLIENTE;
  }

  createPedido(pedido: PedidoRequest) {
    return this.http.post<PedidoResponse>(this.getApiUrl(), pedido).pipe(
      tap((pedidoResponse) => {
        this.allPedidos.update((pedidos) => [...pedidos, pedidoResponse]);
      })
  );
  }

  //Obtiene los pedidos desde el backend y lo guarda en un signal
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
        this.allPedidos.set(result);
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
