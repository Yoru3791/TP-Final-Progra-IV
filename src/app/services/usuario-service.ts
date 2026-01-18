import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioResponse } from '../model/usuario-response.model';
import { Observable } from 'rxjs';
import { ChangePasswordRequest } from '../model/change-password-request.model';
import { UsuarioUpdate } from '../model/usuario-update.model';
import { AuthService, UserRole } from './auth-service';
import { UsuarioCreateAdmin } from '../model/usuario-create-admin.model';
import { UsuarioUpdateAdmin } from '../model/usuario-update-admin.model';
import { AdminChangePasswordRequest } from '../model/admin-change-password-request.model';
import { UsuarioAdminResponse } from '../model/usuario-admin-response.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private authService = inject(AuthService);

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

  constructor(private http: HttpClient) {}

  createUsuario(body: UsuarioCreateAdmin) {
    return this.http.post<UsuarioAdminResponse>(`${this.getApiUrl()}/register`, body);
  }

  getPerfilUsuario(): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.getApiUrl()}/me`);
  }

  private readonly _usuariosAdmin = signal<UsuarioAdminResponse[]>([]);
  readonly usuariosAdmin = this._usuariosAdmin.asReadonly();

  readUsuariosAdmin() {
    this.http
      .get<UsuarioAdminResponse[]>(`${this.getApiUrl()}`)
      .subscribe(data => this._usuariosAdmin.set(data));
  }

  cambiarPassword(body: ChangePasswordRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/changePassword/me`, body);
  }

  updatePasswordAdmin(id: number, body: AdminChangePasswordRequest) {
    return this.http.put<boolean>(`${this.getApiUrl()}/id/${id}/changePassword`, body);
  }

  eliminarCuenta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteUsuarioAdmin(id: number) {
    return this.http.delete<boolean>(`${this.getApiUrl()}/${id}`);
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
}
