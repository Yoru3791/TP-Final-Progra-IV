import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { LoginResponse } from '../model/login-response.model';
import { AuthService } from '../services/auth-service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(
    null,
  );

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Clonamos la petición original para habilitar el envío de cookies (withCredentials)
    let authReq = request.clone({
      withCredentials: true,
    });

    const token = this.authService.getToken();

    // 2. Si tenemos un JWT en el LocalStorage, lo añadimos al header
    if (token) {
      authReq = this.addToken(authReq, token);
    }

    return next.handle(authReq).pipe(
      catchError((error) => {
        // 3. Si recibimos un 401 y no es login ni refresh, intentamos refrescar el token
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          !request.url.includes('/login') &&
          !request.url.includes('/refresh-token')
        ) {
          return this.handle401Error(authReq, next);
        }

        return throwError(() => error);
      }),
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // 4. Llamamos al servicio de refresh (que ahora enviará la cookie gracias a withCredentials)
      return this.authService.refreshToken().pipe(
        switchMap((tokenResponse: LoginResponse) => {
          this.isRefreshing = false;

          const newToken = tokenResponse.token;
          this.authService.saveToken(newToken);
          this.refreshTokenSubject.next(newToken);

          // Reintentamos la petición original con el nuevo token
          return next.handle(this.addToken(request, newToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.handleLogout();
          return throwError(() => err);
        }),
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((jwt) => {
          return next.handle(this.addToken(request, jwt!));
        }),
      );
    }
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
      // Nos aseguramos de mantener las credenciales habilitadas en el clon con el token
      withCredentials: true,
    });
  }
}
