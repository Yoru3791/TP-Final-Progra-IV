import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { UsuarioResponse } from '../model/usuario-response.model';
import { UsuarioAdminResponse } from '../model/usuario-admin-response.model';
import { AuthService } from './auth-service';
import { API_URLS } from '../constants/api-urls.const';

@Injectable({
  providedIn: 'root'
})
export class ApiUrlService {
  private authService = inject(AuthService);

  public readonly apiUrl = API_URLS.BASE;
  public readonly apiUrlAdmin = API_URLS.ADMIN;
  public readonly apiUrlDueno = API_URLS.DUENO;
  public readonly apiUrlCliente = API_URLS.CLIENTE;
  public readonly apiUrlLogged = API_URLS.LOGGED;
  public readonly apiUrlPublic = API_URLS.PUBLIC;

  public getApiUrlByRol(rol: string): string {
    return (
        (rol === 'ADMIN')   ? this.apiUrlAdmin
      : (rol === 'DUENO')   ? this.apiUrlDueno
      : (rol === 'CLIENTE') ? this.apiUrlCliente
      :                       this.apiUrlPublic
    );
  }

  public getApiUrlByCurrentRol(): string {
    return this.getApiUrlByRol(this.authService.currentUserRole());
  }

  public getApiUrlByUsuario(usuario: UsuarioAdminResponse|UsuarioResponse): string {
    return this.getApiUrlByRol(usuario.rolUsuario);
  }
}
