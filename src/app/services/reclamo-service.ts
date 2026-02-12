import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ReclamoRequest } from '../model/reclamo-request.model';
import { catchError, of, tap } from 'rxjs';
import { Reclamo } from '../model/reclamo-response.model';
import { EstadoReclamo } from '../enums/estadoReclamo.enum';
import { PagedResponse, PageMetadata } from '../model/hateoas-pagination.models';
import { ApiUrlService } from './api-url-service';

@Injectable({
  providedIn: 'root',
})
export class ReclamoService {

  private http = inject(HttpClient);
  private apiUrlService = inject(ApiUrlService);

  private apiUrlPublic = `${this.apiUrlService.apiUrlPublic}/reclamos`;
  private apiUrlLogged = `${this.apiUrlService.apiUrlLogged}/reclamos`;
  private apiUrlAdmin = `${this.apiUrlService.apiUrlAdmin}/reclamos`;

  // --- CLIENTE (Mis Reclamos) ---
  public misReclamos = signal<Reclamo[]>([]);
  public misReclamosPageInfo = signal<PageMetadata | null>(null);
  public filtroEstadoCliente = signal<EstadoReclamo | 'TODOS'>('TODOS');

  // --- ADMIN (Gestión) ---
  public adminReclamos = signal<Reclamo[]>([]);
  public adminPageInfo = signal<PageMetadata | null>(null);
  public filtroEstadoAdmin = signal<EstadoReclamo | 'TODOS'>('TODOS');

  // --- CLIENTE / DUEÑO ---
  fetchMisReclamos(page: number = 0, size: number = 10) {
    let params = new HttpParams().set('page', page).set('size', size);
    
    const estado = this.filtroEstadoCliente();
    if (estado && estado !== 'TODOS') {
      params = params.set('estado', estado);
    }

    this.http.get<PagedResponse<Reclamo>>(this.apiUrlLogged, { params })
      .pipe(catchError(err => {
        console.error('Error cargando mis reclamos', err);
        return of(null);
      }))
      .subscribe(response => {
        if (response && response._embedded) {
          const data = response._embedded['reclamoDTOList'] || []; 
          this.misReclamos.set(data);
          this.misReclamosPageInfo.set(response.page);
        } else {
          this.misReclamos.set([]);
          this.misReclamosPageInfo.set(null);
        }
      });
  }

  // --- ADMIN ---
  fetchAdminReclamos(page: number = 0, size: number = 10) {
    let params = new HttpParams().set('page', page).set('size', size);

    const estado = this.filtroEstadoAdmin();
    if (estado && estado !== 'TODOS') {
      params = params.set('estado', estado);
    }

    this.http.get<PagedResponse<Reclamo>>(this.apiUrlAdmin, { params })
      .pipe(catchError(err => {
        console.error('Error cargando reclamos admin', err);
        return of(null);
      }))
      .subscribe(response => {
        if (response && response._embedded) {
          const data = response._embedded['reclamoDTOList'] || [];
          this.adminReclamos.set(data);
          this.adminPageInfo.set(response.page);
        } else {
          this.adminReclamos.set([]);
          this.adminPageInfo.set(null);
        }
      });
  }


  enviarReclamo(reclamo: ReclamoRequest) {
    return this.http.post(this.apiUrlPublic, reclamo, { responseType: 'text' });
  }

  actualizarEstado(id: number, nuevoEstado: EstadoReclamo, respuestaAdmin: string) {
    const body = { nuevoEstado, respuestaAdmin };
    return this.http.put(`${this.apiUrlAdmin}/id/${id}/estado`, body).pipe(
      tap(() => {
        const currentPage = this.adminPageInfo()?.number || 0;
        this.fetchAdminReclamos(currentPage);
      })
    );
  }
}
