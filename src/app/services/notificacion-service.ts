import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal, computed, inject } from '@angular/core';
import { Notificacion } from '../model/notificacion.model';
import { catchError, of } from 'rxjs';
import { AuthService, UserRole } from './auth-service';
import { PagedResponse, PageMetadata } from '../model/hateoas-pagination.models';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private baseUrls = {
    DUENO: 'http://localhost:8080/api/dueno/notificaciones',
    CLIENTE: 'http://localhost:8080/api/cliente/notificaciones',
  };

  private getApiUrl(): string {
    const rol: UserRole = this.authService.currentUserRole();
    return rol === 'DUENO' ? this.baseUrls.DUENO : this.baseUrls.CLIENTE;
  }

  public notificaciones = signal<Notificacion[]>([]);
  public pageInfo = signal<PageMetadata | null>(null);
  public cantidadNoLeidas = signal<number>(0);

  public filtroDesde = signal<string | null>(null);
  public filtroHasta = signal<string | null>(null);
  public filtroLeida = signal<boolean | null>(null);  //  null = todas

  
  fetchNotificaciones(page: number = 0, size: number = 10) {
    const url = this.getApiUrl();
    
    let params = new HttpParams()
        .set('page', page)
        .set('size', size);

    const leida = this.filtroLeida();
    const desde = this.filtroDesde();
    const hasta = this.filtroHasta();

    if (leida !== null) params = params.set('leida', leida);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    this.http.get<PagedResponse<Notificacion>>(url, { params })
      .pipe(
        catchError((err) => {
          console.error('Error cargando notificaciones:', err);
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response && response._embedded) {
          const data = response._embedded['notificacionDTOList'] || []; 
          this.notificaciones.set(data);
          this.pageInfo.set(response.page);
        } else {
          this.notificaciones.set([]);
          this.pageInfo.set(null);
        }
      });
  }

  fetchCantidadNoLeidas() {
    const url = `${this.getApiUrl()}/no-leidas/cantidad`;
    this.http.get<{cantidad: number}>(url).subscribe({
        next: (res) => this.cantidadNoLeidas.set(res.cantidad),
        error: () => this.cantidadNoLeidas.set(0)
    });
  }

  marcarComoLeida(id: number) {
    const url = `${this.getApiUrl()}/${id}/leida`;

    this.http.patch<Notificacion>(url, {})
      .subscribe({
        next: () => {
          this.notificaciones.update(lista =>
            lista.map(n => n.id === id ? { ...n, leida: true } : n)
          );
          this.cantidadNoLeidas.update(cant => Math.max(0, cant - 1));
        },
        error: (err) => console.error('Error al marcar notificación como leída:', err)
      });
  }

  resetFiltros() {
      this.filtroDesde.set(null);
      this.filtroHasta.set(null);
      this.filtroLeida.set(null);
  }
  
}
