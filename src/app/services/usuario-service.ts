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
    return this.http.post<UsuarioResponse>(`${this.getApiUrl()}/register`, body);
  }

  getPerfilUsuario(): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.getApiUrl()}/me`);
  }

  private readonly _usuarios = signal<UsuarioResponse[]>([]);
  readonly usuarios = this._usuarios.asReadonly();

  readUsuarios() {
    this.http
      .get<UsuarioResponse[]>(`${this.getApiUrl()}`)
      .subscribe(data => this._usuarios.set(data));
  }

  cambiarPassword(body: ChangePasswordRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/changePassword/me`, body);
  }

  updatePasswordAdmin(id: number, body: AdminChangePasswordRequest): Observable<any> {
    return this.http.put(`${this.getApiUrl()}/id/${id}/changePassword`, body);
  }

  eliminarCuenta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteUsuarioAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.getApiUrl()}/${id}`);
  }

  updateUsuario(id: number, body: UsuarioUpdate) {
    return this.http.put<UsuarioResponse>(`${this.apiUrl}/${id}`, body);
  }

  updateUsuarioAdmin(id: number, body: UsuarioUpdateAdmin) {
    return this.http.put<UsuarioResponse>(`${this.getApiUrl()}/${id}`, body);
  }

  updateImagenUsuario(id: number, file: File): Observable<UsuarioResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.put<UsuarioResponse>(`${this.getApiUrl()}/${id}/imagen`, formData);
  }
}
