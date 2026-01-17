import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EmprendimientoResponse } from '../model/emprendimiento-response.model';
import { catchError, forkJoin, map, of, tap } from 'rxjs';
import { AuthService, UserRole } from './auth-service';
import { CityFilterService } from './city-filter-service';
import { ViandaService } from './vianda-service';
import { PagedResponse, PageMetadata } from '../model/hateoas-pagination.models';
import { EmprendimientoAdminResponse } from '../model/emprendimiento-admin-response.model';

@Injectable({ providedIn: 'root' })
export class EmprendimientoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private cityFilter = inject(CityFilterService);
  private viandaService = inject(ViandaService);

  public allEmprendimientos = signal<EmprendimientoResponse[]>([]);
  public allEmprendimientosAdmin = signal<EmprendimientoAdminResponse[]>([]);
  public adminPageInfo = signal<PageMetadata | null>(null);
  public pageInfo = signal<PageMetadata | null>(null);

  //Siempre refleja los emprendimientos filtrados por ciudad
  public emprendimientos = computed(() => this.allEmprendimientos());

  private baseUrls = {
    PUBLIC: 'http://localhost:8080/api/public/emprendimientos',
    DUENO: 'http://localhost:8080/api/dueno/emprendimientos',
    CLIENTE: 'http://localhost:8080/api/cliente/emprendimientos',
    ADMIN: 'http://localhost:8080/api/admin/emprendimientos',
  };

  private getApiUrl(): string {
    const rol: UserRole = this.authService.currentUserRole();

    switch (rol) {
      case 'ADMIN':
        return this.baseUrls.ADMIN;

      case 'DUENO':
        return this.baseUrls.DUENO;

      case 'CLIENTE':
        return this.baseUrls.CLIENTE;

      default:
        return this.baseUrls.PUBLIC;
    }
  }

  //obtiene los emprendimientos desde el backend y lo guarda en un signal
  fetchEmprendimientos(page: number = 0, size: number = 10, ignorarCiudad: boolean = false) {
    const rol = this.authService.currentUserRole();
    const ciudad = ignorarCiudad ? null : this.cityFilter.city();
    const baseUrl = this.getApiUrl();

    let url = baseUrl;
    let params = new HttpParams().set('page', page).set('size', size);

    if (rol === 'DUENO') {
      if (ciudad) {
        params = params.set('ciudad', ciudad);
      }
    } else {
      if (ciudad) {
        url = `${baseUrl}/ciudad/${ciudad}`;
      } else {
        url = baseUrl;
      }
    }

    this.http
      .get<PagedResponse<EmprendimientoResponse>>(url, { params })
      .pipe(
        catchError((err) => {
          console.error('Error al cargar emprendimientos', err);
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response && response._embedded) {
          const data = (response._embedded['emprendimientoDTOList'] || []).map((item: any) => ({
            ...item,
            viandas: [],
          }));

          this.allEmprendimientos.set(data);
          this.pageInfo.set(response.page);
        } else {
          this.allEmprendimientos.set([]);
          this.pageInfo.set(null);
        }
      });
  }

  fetchEmprendimientosAdmin(page: number = 0, size: number = 20) {
    const params = new HttpParams().set('page', page).set('size', size);

    this.http
      .get<any>(this.baseUrls.ADMIN, { params })
      .pipe(
        catchError((err) => {
          console.error('Error al cargar emprendimientos (ADMIN)', err);
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response && response._embedded) {
          const data = response._embedded['emprendimientoAdminDTOList'] ?? [];

          this.allEmprendimientosAdmin.set(data);
          this.adminPageInfo.set(response.page);
        } else {
          this.allEmprendimientosAdmin.set([]);
          this.adminPageInfo.set(null);
        }
      });
  }

  public emprendimientosConViandas = computed(() => this.emprendimientos());

  loadEmprendimientosConViandas() {
    const emps = this.emprendimientos();
    if (emps.length === 0) {
      return of([]);
    }

    const requests = emps.map((e) =>
      this.viandaService.getViandasByEmprendimientoId(e.id).pipe(
        catchError(() => of([])),
        map((viandas) => ({ ...e, viandas }))
      )
    );

    return forkJoin(requests);
  }

  getEmprendimientoById(id: number) {
    const url = this.getApiUrl();
    return this.http.get<EmprendimientoResponse>(`${url}/id/${id}`);
  }

  // ----------------------- CRUD (ACTUALIZADO PARA ADMIN) -----------------------

  createEmprendimiento(formData: FormData) {
    const rol = this.authService.currentUserRole();

    if (rol !== 'DUENO' && rol !== 'ADMIN') {
      throw new Error('No tienes permisos para crear emprendimientos');
    }

    const url = rol === 'ADMIN' ? this.baseUrls.ADMIN : this.baseUrls.DUENO;

    return this.http.post<EmprendimientoResponse>(url, formData).pipe(
      tap(() => {
        // Recargamos la lista que corresponda según el rol
        if (rol === 'DUENO') {
          this.fetchEmprendimientos(0, 10);
        } else {
          this.fetchEmprendimientosAdmin(0, 10);
        }
      })
    );
  }

  deleteEmprendimiento(id: number) {
    const rol = this.authService.currentUserRole();

    if (rol !== 'DUENO' && rol !== 'ADMIN') {
      throw new Error('No tienes permisos para eliminar emprendimientos');
    }

    const baseUrl = rol === 'ADMIN' ? this.baseUrls.ADMIN : this.baseUrls.DUENO;
    const url = `${baseUrl}/id/${id}`;

    return this.http.delete<void>(url).pipe(
      tap(() => {
        // Actualizamos localmente las listas para que la UI responda rápido
        this.allEmprendimientos.update((list) => list.filter((e) => e.id !== id));
        // Si tienes una lista de admin local, podrías filtrarla también si los tipos coinciden,
        // o simplemente esperar a que el componente recargue.
      })
    );
  }

  // Verificar que un emprendimiento le corresponde a un dueño (para guards)
  esDuenoDelEmprendimiento(emprendimientoId: number, usuarioId: number): boolean {
    const emprendimiento = this.emprendimientos().find((e) => e.id === emprendimientoId);
    return emprendimiento ? emprendimiento.dueno.id === usuarioId : false;
  }

  // Actualizar los campos del emprendimiento
  updateEmprendimiento(id: number, dto: any) {
    const rol = this.authService.currentUserRole();

    if (rol !== 'DUENO' && rol !== 'ADMIN') {
      throw new Error('No tienes permisos para actualizar emprendimientos');
    }

    const baseUrl = rol === 'ADMIN' ? this.baseUrls.ADMIN : this.baseUrls.DUENO;
    const url = `${baseUrl}/id/${id}`;

    return this.http
      .put<EmprendimientoResponse>(url, dto)
      .pipe(
        tap((actualizado) =>
          this.allEmprendimientos.update((list) => list.map((e) => (e.id === id ? actualizado : e)))
        )
      );
  }

  // Actualizar la imagen del emprendimiento
  updateImagenEmprendimiento(id: number, formData: FormData) {
    const rol = this.authService.currentUserRole();

    if (rol !== 'DUENO' && rol !== 'ADMIN') {
      throw new Error('No tienes permisos para actualizar imágenes');
    }

    const baseUrl = rol === 'ADMIN' ? this.baseUrls.ADMIN : this.baseUrls.DUENO;
    const url = `${baseUrl}/id/${id}/imagen`;

    return this.http
      .put<EmprendimientoResponse>(url, formData)
      .pipe(
        tap((actualizado) =>
          this.allEmprendimientos.update((list) => list.map((e) => (e.id === id ? actualizado : e)))
        )
      );
  }
}
