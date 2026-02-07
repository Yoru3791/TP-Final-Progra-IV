import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { UsuarioLogin } from '../model/usuario-login.model';
import { LoginResponse } from '../model/login-response.model';
import { UsuarioResponse } from '../model/usuario-response.model';
import { UsuarioRegistro } from '../model/usuario-registro.model';
import { PasswordResetChange } from '../model/password-reset-change.model';
import { Router } from '@angular/router';
import { ApiUrlService } from './api-url-service';
import { API_URLS } from '../constants/api-urls.const';

export type UserRole = 'ADMIN' | 'DUENO' | 'CLIENTE' | 'INVITADO';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private TOKEN_KEY = 'authToken';

  public currentUserRole = signal<UserRole>('INVITADO');
  public usuarioId = signal<number | null>(this.getUsuarioIdFromStorage());

  private apiUrl = API_URLS.PUBLIC;

  private apiUrlLogin = `${this.apiUrl}/login`;
  private apiUrlRegister = `${this.apiUrl}/register`;
  private apiUrlConfirm = `${this.apiUrl}/confirm`;
  private apiUrlResend = `${this.apiUrl}/resend-token`;
  private apiUrlForgot = `${this.apiUrl}/forgot-password`;
  private apiUrlReset = `${this.apiUrl}/reset-password`;
  private apiUrlRefresh = `${this.apiUrl}/refresh-token`;
  private apiUrlLogout = `${this.apiUrl}/logout`;
  private apiUrlLogoutAll = `${this.apiUrl}/logout-all`;
  private apiUrlGoogle = `${this.apiUrl}/google`;

  constructor(private http: HttpClient, private router: Router) {
    this.init();
    console.log('AuthService inicializado. Rol actual:', this.currentUserRole());
  }

  init(): void {
    const token = this.getToken();

    if (token) {
      this.currentUserRole.set(this.decodeRolFrom(token));
      this.usuarioId.set(this.getUsuarioIdFromStorage());
    }
  }

  // Lee el TOKEN actual y extrae el rol (si no hay TOKEN, el rol es invitado)
  private getRolFromToken(): UserRole {
    const tokenLocal = localStorage.getItem(this.TOKEN_KEY);
    const tokenSession = sessionStorage.getItem(this.TOKEN_KEY);

    if (!tokenLocal && !tokenSession) {
      return 'INVITADO';
    }

    if (tokenLocal) {
      return this.decodeRolFrom(tokenLocal);
    } else {
      return this.decodeRolFrom(tokenSession!);
    }
  }

  private getUsuarioIdFromStorage(): number | null {
    const id = localStorage.getItem('usuarioID') || sessionStorage.getItem('usuarioID');
    return id ? Number(id) : null;
  }

  register(usuario: UsuarioRegistro) {
    return this.http.post<UsuarioResponse>(this.apiUrlRegister, usuario);
  }

  login(usuario: UsuarioLogin) {
  return this.http.post<LoginResponse>(this.apiUrlLogin, usuario, {
    withCredentials: true
  });
}

  loginGoogle(token: string) {
    return this.http.post<LoginResponse>(this.apiUrlGoogle, { token }, {
    withCredentials: true
  });
  }

  refreshToken() {
    return this.http.post<LoginResponse>(this.apiUrlRefresh, {}, { withCredentials: true });
  }

  saveToken(newToken: string) {
    if (localStorage.getItem(this.TOKEN_KEY)) {
      localStorage.setItem(this.TOKEN_KEY, newToken);
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, newToken);
    }
    this.currentUserRole.set(this.decodeRolFrom(newToken));
  }

  public handleLoginSuccess(token: string, usuarioID: number, recordarme: boolean): void {
    if (recordarme) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem('usuarioID', usuarioID.toString());
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem('usuarioID', usuarioID.toString());
    }

    this.currentUserRole.set(this.decodeRolFrom(token));
    this.usuarioId.set(usuarioID);

    console.log('Login exitoso. Rol:', this.currentUserRole(), '- ID de usuario:', this.usuarioId());
  }

  // Cierre de sesion y elimina la persistencia del refreshToken
  public handleLogout(): void {
    this.http
      .post(this.apiUrlLogout, {}, { withCredentials: true, responseType: 'text' })
      .subscribe({
        //aca se borra el refreshToken
        next: () => console.log('Logout en servidor exitoso.'),
        error: (err) => console.error('Error de logout en servidor:', err),
        complete: () => this.clearLocalData(),
      });
  }

  public handleLogoutAll(): void {
    this.http
      .post(this.apiUrlLogoutAll, {}, { withCredentials: true, responseType: 'text' })
      .subscribe({
        next: () => console.log('Se cerraron todas las sesiones correctamente'),
        error: (err) => {
          console.error('Error al cerrar sesiones globales', err);
        },
        complete: () => this.clearLocalData(),
      });
  }

  private clearLocalData() {
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('usuarioID');
    sessionStorage.removeItem('usuarioID');

    this.currentUserRole.set('INVITADO');
    this.usuarioId.set(null);

    this.router.navigate(['/login']);
  }

  private decodeRolFrom(token: string): UserRole {
    try {
      const payloadBase64Url = token.split('.')[1];
      const payloadJson = this.decodeBase64Url(payloadBase64Url);
      const payload = JSON.parse(payloadJson);

      const rawRole: string = payload.role; // <-- AQUÍ

      if (!rawRole) {
        return 'CLIENTE'; // logueado sin rol -> cliente por defecto
      }

      // rawRole llega como "ROLE_DUENO"
      const cleanRole = rawRole.replace('ROLE_', '');

      const upperRole = cleanRole.toUpperCase();

      if (upperRole === 'ADMIN') return 'ADMIN';
      if (upperRole === 'DUENO') return 'DUENO';
      if (upperRole === 'CLIENTE') return 'CLIENTE';

      return 'CLIENTE';
    } catch (e) {
      console.error('Error al decodificar el token, volviendo a INVITADO', e);
      this.handleLogout();
      return 'INVITADO';
    }
  }

  // Decodificador para decodificar Base64Url (el formato que tiene JWT)
  private decodeBase64Url(base64Url: string): string {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding) {
      base64 += '===='.substring(padding);
    }
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  verifyAccount(token: string) {
    return this.http.get(this.apiUrlConfirm, {
      params: { token: token },
      responseType: 'text',
    });
  }

  resendToken(email: string) {
    return this.http.post(this.apiUrlResend, null, {
      params: { email: email },
      responseType: 'text',
    });
  }

  // Solicitar el mail de recuperación
  forgotPassword(email: string) {
    return this.http.post(this.apiUrlForgot, { email }, { responseType: 'text' });
  }

  // Enviar la nueva contraseña con el token
  resetPassword(data: PasswordResetChange) {
    return this.http.post(this.apiUrlReset, data, { responseType: 'text' });
  }
}
