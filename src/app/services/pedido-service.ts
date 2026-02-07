import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService, UserRole } from './auth-service';
import { PedidoResponse } from '../model/pedido-response.model';
import { catchError, of, tap } from 'rxjs';
import { PedidoUpdateRequest } from '../model/pedido-update-request.model';
import { PedidoRequest } from '../model/pedido-request.model';
import { EstadoPedido } from '../enums/estadoPedido.enum';
import { PagedResponse, PageMetadata } from '../model/hateoas-pagination.models';
import { ApiUrlService } from './api-url-service';

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  private http = inject(HttpClient);
  private apiUrlService = inject(ApiUrlService);

  public pedidos = signal<PedidoResponse[]>([]);
  public pageInfo = signal<PageMetadata | null>(null);
  public nombresEmprendimientos = signal<string[]>([]);
  
  public filtroFechas = signal<{ desde: Date; hasta: Date } | null>(null);
  public filtroEstado = signal<EstadoPedido | null>(null);
  public filtroEmprendimiento = signal<string | null>(null);

  private getApiUrl(): string {
    return `${this.apiUrlService.getApiUrlByCurrentRol()}/pedidos`;
  }

  fetchPedidos(page: number = 0, size: number = 10) {
    const url = this.getApiUrl();
    
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    const estado = this.filtroEstado();
    const emp = this.filtroEmprendimiento();
    const fechas = this.filtroFechas();

    if (estado) params = params.set('estado', estado);
    if (emp) params = params.set('emprendimiento', emp);
    if (fechas) {
      params = params.set('desde', fechas.desde.toISOString().split('T')[0]);
      params = params.set('hasta', fechas.hasta.toISOString().split('T')[0]);
    }

    this.http.get<PagedResponse<PedidoResponse>>(url, { params })
      .pipe(
        catchError((err) => {
          console.error('Error al cargar pedidos:', err);
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response && response._embedded) {
          const data = response._embedded['pedidoDTOList'] || [];
          this.pedidos.set(data);
          this.pageInfo.set(response.page);
        } else {
          this.pedidos.set([]);
          this.pageInfo.set(null);
        }
      });
  }

  fetchNombresEmprendimientos() {
    const url = `${this.getApiUrl()}/filtros/emprendimientos`;
    this.http.get<string[]>(url).subscribe({
      next: (nombres) => this.nombresEmprendimientos.set(nombres),
      error: () => this.nombresEmprendimientos.set([])
    });
  }


  // --- CRUD ---

  createPedido(pedido: PedidoRequest) {
    return this.http.post<PedidoResponse>(this.getApiUrl(), pedido).pipe(
      tap(() => {
        this.fetchPedidos(0, 10);
      })
    );
  }

  updatePedido(id: number, pedidoUpdate: PedidoUpdateRequest) {
    const url = `${this.getApiUrl()}/id/${id}`;
    return this.http
      .put<any>(url, pedidoUpdate)
      .pipe(
        tap((actualizado) => {
          this.pedidos.update((list) => 
            list.map((p) => (p.id === id ? { ...p, ...actualizado['Pedido actualizado correctamente:'] || actualizado } : p))
        );
        })
      );
  }
}