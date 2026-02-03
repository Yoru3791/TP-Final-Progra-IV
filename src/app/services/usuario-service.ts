import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UsuarioResponse } from '../model/usuario-response.model';
import { catchError, Observable, of, tap } from 'rxjs';
import { ChangePasswordRequest } from '../model/change-password-request.model';
import { UsuarioUpdate } from '../model/usuario-update.model';
import { AuthService, UserRole } from './auth-service';
import { UsuarioCreateAdmin } from '../model/usuario-create-admin.model';
import { UsuarioUpdateAdmin } from '../model/usuario-update-admin.model';
import { AdminChangePasswordRequest } from '../model/admin-change-password-request.model';
import { UsuarioAdminResponse } from '../model/usuario-admin-response.model';
import { PagedResponse, PageMetadata } from '../model/hateoas-pagination.models';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private authService = inject(AuthService);
  private http = inject(HttpClient);

  public usuariosAdmin = signal<UsuarioAdminResponse[]>([]);
  public adminPageInfo = signal<PageMetadata | null>(null);
  
  public adminFiltroNombre = signal<string>('');
  public adminFiltroEmail = signal<string>('');
  public adminSoloEliminados = signal<boolean>(false);

  private apiUrl = 'http://localhost:8080/api/usuarios';

  private getApiUrl(): string {
    const rol: UserRole = this.authService.currentUserRole();

    switch (rol) {
      case 'ADMIN':
        return 'http://localhost:8080/api/admin/usuarios';

      default:
        return 'http://localhost:8080/api/usuarios';
    }
  }

  
  fetchUsuariosAdmin(page: number = 0, size: number = 10) {
    let params = new HttpParams().set('page', page).set('size', size);
    
    const nombre = this.adminFiltroNombre();
    const email = this.adminFiltroEmail();
    const soloEliminados = this.adminSoloEliminados();

    if (nombre) params = params.set('nombre', nombre);
    if (email) params = params.set('email', email);
    if (soloEliminados) params = params.set('soloEliminados', 'true');

    this.http.get<PagedResponse<UsuarioAdminResponse>>(this.getApiUrl(), { params })
      .pipe(
        catchError((err) => {
          console.error('Error al cargar usuarios:', err);
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response && response._embedded) {
          const data = response._embedded['usuarioAdminDTOList'] || [];
          this.usuariosAdmin.set(data);
          this.adminPageInfo.set(response.page);
        } else {
          this.usuariosAdmin.set([]);
          this.adminPageInfo.set(null);
        }
      });
  }


  createUsuario(body: UsuarioCreateAdmin) {
    return this.http.post<UsuarioAdminResponse>(`${this.getApiUrl()}/register`, body);
  }

  getPerfilUsuario(): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.getApiUrl()}/me`);
  }

  cambiarPassword(body: ChangePasswordRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/changePassword/me`, body);
  }

  updatePasswordAdmin(id: number, body: AdminChangePasswordRequest) {
    return this.http.put<boolean>(`${this.getApiUrl()}/id/${id}/changePassword`, body);
  }

  eliminarCuenta(id: number): Observable<any> {
    return this.http.delete(`${this.getApiUrl()}/${id}`);
  }

  deleteUsuarioAdmin(id: number) {
    return this.http.delete<any>(`${this.getApiUrl()}/${id}`).pipe(
        tap(() => {
            this.fetchUsuariosAdmin(this.adminPageInfo()?.number || 0, 10);
        })
    );
  }

  updateUsuario(id: number, body: UsuarioUpdate) {
    return this.http.put<UsuarioResponse>(`${this.apiUrl}/${id}`, body);
  }

  updateUsuarioAdmin(id: number, body: UsuarioUpdateAdmin) {
    return this.http.put<UsuarioAdminResponse>(`${this.getApiUrl()}/${id}`, body);
  }

  updateImagenUsuario(id: number, file: File): Observable<UsuarioResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.put<UsuarioResponse>(`${this.getApiUrl()}/${id}/imagen`, formData);
  }

  updateImagenUsuarioAdmin(id: number, file: File) {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.put<UsuarioAdminResponse>(`${this.getApiUrl()}/${id}/imagen`, formData);
  }

  enableUsuario(id: number) {
    return this.http.put<UsuarioAdminResponse>(`${this.getApiUrl()}/${id}/enable`, null);
  }

  banUsuario(id: number) {
    return this.http.put<UsuarioAdminResponse>(`${this.getApiUrl()}/${id}/ban`, null);
  }

  unbanUsuario(id: number) {
    return this.http.put<UsuarioAdminResponse>(`${this.getApiUrl()}/${id}/unban`, null);
  }
}
