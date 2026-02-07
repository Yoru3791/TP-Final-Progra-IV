import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ViandaAnyResponse, ViandaResponse } from '../model/vianda-response.model';
import { AuthService } from './auth-service';
import { ViandaCreate } from '../model/vianda-create.model';
import { FiltrosViandas } from '../model/filtros-viandas.model';
import { catchError, map, Observable, of } from 'rxjs';
import { ViandaUpdate } from '../model/vianda-update.model';
import { ViandaDeleteResponse } from '../model/vianda-delete-response.model';
import { PagedResponse } from '../model/hateoas-pagination.models';
import { ApiUrlService } from './api-url-service';

@Injectable({
  providedIn: 'root',
})
export class ViandaService {
  private http = inject(HttpClient);
  private apiUrlService = inject(ApiUrlService);
  private authService = inject(AuthService);

  // Selecciona endpoint según el rol
  private getApiUrl(): string {
    return `${this.apiUrlService.getApiUrlByCurrentRol()}/viandas`;
  }

  // ----------------- CRUD -----------------

  createVianda(formData: FormData) {
    const url = this.getApiUrl();

    return this.http.post<ViandaCreate>(url, formData);
  }

  updateVianda(id: number, dto: ViandaUpdate): Observable<any> {
    const baseUrl = this.getApiUrl();
    const url = `${baseUrl}/id/${id}`;

    return this.http.put<any>(url, dto);
  }

  updateImagenVianda(id: number, file: File): Observable<ViandaResponse> {
    const baseUrl = this.getApiUrl();
    const url = `${baseUrl}/id/${id}/imagen`;

    const formData = new FormData();
    formData.append('image', file);

    return this.http.put<ViandaResponse>(url, formData);
  }

  deleteVianda(id: number): Observable<ViandaDeleteResponse> {
    const baseUrl = this.getApiUrl();
    const url = `${baseUrl}/id/${id}`;

    return this.http.delete<ViandaDeleteResponse>(url);
  }

  // ----------------- Consultas Generales -----------------

  getViandaById(id: number) {
    const url = `${this.getApiUrl()}/id/${id}`;
    return this.http.get<ViandaResponse>(url);
  }

  getAllViandasDisponibles(idEmprendimiento: number): Observable<ViandaResponse[]> {
    const url = `${this.getApiUrl()}/all/idEmprendimiento/${idEmprendimiento}`;
    return this.http.get<ViandaResponse[]>(url);
  }

  getViandasPreview(emprendimientoId: number, limit: number = 8): Observable<ViandaResponse[]> {
    const rol = this.authService.currentUserRole();
    let request$: Observable<PagedResponse<ViandaAnyResponse>>;

    switch (rol) {
      case 'DUENO':
        request$ = this.getViandasDueno(emprendimientoId, undefined, 0, limit);
        break;
      case 'CLIENTE':
        request$ = this.getViandasCliente(emprendimientoId, undefined, 0, limit);
        break;
      default:
        request$ = this.getViandasPublico(emprendimientoId, undefined, 0, limit);
        break;
    }

    return request$.pipe(
      map(response => {
        if (response._embedded) {
          if ('viandaDTOList' in response._embedded) return response._embedded['viandaDTOList'] as ViandaResponse[];
        }
        return [];
      }),
      catchError(() => of([] as ViandaResponse[]))
    );
  }

  getCategoriasPublico(idEmprendimiento: number): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.getApiUrl()}/categorias/idEmprendimiento/${idEmprendimiento}`
    );
  }

  getCategoriasCliente(idEmprendimiento: number): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.getApiUrl()}/categorias/idEmprendimiento/${idEmprendimiento}`
    );
  }

  getCategoriasDueno(idEmprendimiento: number): Observable<string[]> {
    const baseUrl = this.getApiUrl();

    return this.http.get<string[]>(
      `${baseUrl}/categorias/idEmprendimiento/${idEmprendimiento}`
    );
  }

  // ----------------- Métodos de Emprendimiento Page -----------------

  getViandasPublico(
    idEmprendimiento: number,
    filtros?: FiltrosViandas,
    page: number = 0,
    size: number = 10
  ): Observable<PagedResponse<ViandaResponse>> {
    const params = this.construirParams(filtros, page, size);
    return this.http.get<PagedResponse<ViandaResponse>>(
      `${this.getApiUrl()}/idEmprendimiento/${idEmprendimiento}`,
      { params }
    );
  }

  getViandasCliente(
    idEmprendimiento: number,
    filtros?: FiltrosViandas,
    page: number = 0,
    size: number = 10
  ): Observable<PagedResponse<ViandaResponse>> {
    const params = this.construirParams(filtros, page, size);

    return this.http.get<PagedResponse<ViandaResponse>>(
      `${this.getApiUrl()}/idEmprendimiento/${idEmprendimiento}`,
      { params }
    );
  }

  getViandasDueno(
    idEmprendimiento: number,
    filtros?: FiltrosViandas,
    page: number = 0,
    size: number = 9
  ): Observable<PagedResponse<ViandaAnyResponse>> {
    const params = this.construirParams(filtros, page, size);
    const baseUrl = this.getApiUrl();

    return this.http.get<PagedResponse<ViandaAnyResponse>>(
      `${baseUrl}/idEmprendimiento/${idEmprendimiento}`,
      { params }
    );
  }

  // Limpia basura del filtro y lo transforma a parámetros HTTP
  private construirParams(filtros?: FiltrosViandas, page: number = 0, size: number = 10): HttpParams {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (filtros) {
      if (filtros.nombreVianda) params = params.set('nombreVianda', filtros.nombreVianda);
      if (filtros.categoria) params = params.set('categoria', filtros.categoria);
      if (filtros.esVegano) params = params.set('esVegano', true);
      if (filtros.esVegetariano) params = params.set('esVegetariano', true);
      if (filtros.esSinTacc) params = params.set('esSinTacc', true);
      if (filtros.precioMin != null) params = params.set('precioMin', filtros.precioMin);
      if (filtros.precioMax != null) params = params.set('precioMax', filtros.precioMax);
      if (filtros.estaDisponible != null)
        params = params.set('estaDisponible', filtros.estaDisponible);
    }

    return params;
  }
}
